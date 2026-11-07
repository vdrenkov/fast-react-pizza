import { useState } from "react";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import { useAppDispatch, useAppSelector } from "../../hooks";
import { createOrder } from "../../services/apiRestaurant";
import store from "../../store";
import { cartItemSchema } from "../../types";
import Button from "../../ui/Button";
import LinkButton from "../../ui/LinkButton";
import { formatCurrency } from "../../utils/helpers";
import { clearCart, getCart, getTotalCartPrice } from "../cart/cartSlice";
import EmptyCart from "../cart/EmptyCart";
import { fetchAddress } from "../user/userSlice";

import type { ActionFunctionArgs } from "react-router";

type FormErrors = {
  customer?: string;
  phone?: string;
  address?: string;
  form?: string;
};

export default function CreateOrder() {
  const [withPriority, setWithPriority] = useState(false);
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [address, setAddress] = useState(user.address);
  const cart = useAppSelector(getCart);
  const totalCartPrice = useAppSelector(getTotalCartPrice);
  const formErrors = useActionData<FormErrors>();
  const isSubmitting = navigation.state === "submitting";
  const isLoadingAddress = user.status === "loading";
  const totalPrice = totalCartPrice * (withPriority ? 1.2 : 1);

  async function locateAddress() {
    const result = await dispatch(fetchAddress());

    if (fetchAddress.fulfilled.match(result)) {
      setAddress(result.payload.address);
    }
  }

  if (!cart.length) {
    return <EmptyCart />;
  }

  return (
    <section className="page-section checkout">
      <LinkButton to="/cart">← Back to cart</LinkButton>
      <p className="eyebrow">One last thing</p>
      <h1>Where’s pizza going?</h1>
      <p className="section-description">
        This is a portfolio demo using a public teaching API. Use fictional
        contact details; no payment is collected or pizza delivered.
      </p>
      <Form method="post" className="checkout-form">
        <div className="field">
          <label htmlFor="customer">First name</label>
          <input
            id="customer"
            className="input"
            name="customer"
            autoComplete="given-name"
            maxLength={60}
            defaultValue={user.username}
            required
            aria-invalid={!!formErrors?.customer}
            aria-describedby={
              formErrors?.customer ? "customer-error" : undefined
            }
          />
          {formErrors?.customer && (
            <p id="customer-error" className="field-error">
              {formErrors.customer}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <input
            id="phone"
            className="input"
            type="tel"
            name="phone"
            autoComplete="tel"
            maxLength={30}
            placeholder="+359 888 123 456"
            required
            aria-invalid={!!formErrors?.phone}
            aria-describedby={formErrors?.phone ? "phone-error" : undefined}
          />
          {formErrors?.phone && (
            <p id="phone-error" className="field-error">
              {formErrors.phone}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="address">Delivery address</label>
          <input
            id="address"
            className="input"
            name="address"
            autoComplete="street-address"
            maxLength={200}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            required
            aria-invalid={!!formErrors?.address}
            aria-describedby="address-help"
          />
          <p id="address-help" className="field-hint">
            Include a street, building number and city. Location lookup only
            suggests your area.
          </p>
          <Button
            type="secondary"
            disabled={isLoadingAddress || isSubmitting}
            onClick={() => void locateAddress()}
          >
            {isLoadingAddress ? "Finding your area…" : "Use my location"}
          </Button>
          {formErrors?.address && (
            <p className="field-error">{formErrors.address}</p>
          )}
          {user.status === "error" && (
            <p className="field-error" role="status">
              {user.error}
            </p>
          )}
        </div>
        <label className="priority-option">
          <input
            type="checkbox"
            name="priority"
            value="true"
            checked={withPriority}
            onChange={(event) => setWithPriority(event.target.checked)}
          />
          <span>
            <strong>Make it a priority</strong>
            <span>
              Add 20% ({formatCurrency(totalCartPrice * 0.2)}) to move up the
              queue.
            </span>
          </span>
        </label>
        <input type="hidden" name="cart" value={JSON.stringify(cart)} />
        <input
          type="hidden"
          name="position"
          value={
            user.position && address === user.address
              ? `${user.position.latitude},${user.position.longitude}`
              : ""
          }
        />
        {formErrors?.form && (
          <p className="field-error" role="alert">
            {formErrors.form}
          </p>
        )}
        {(formErrors?.customer || formErrors?.phone || formErrors?.address) && (
          <p role="alert" className="field-error">
            Please check the highlighted details.
          </p>
        )}
        <div className="checkout-total">
          <span>Total · pay on delivery</span>
          <strong>{formatCurrency(totalPrice)}</strong>
        </div>
        <Button
          type="primary"
          submit
          disabled={isSubmitting || isLoadingAddress}
        >
          {isSubmitting
            ? "Placing order…"
            : `Place demo order · ${formatCurrency(totalPrice)}`}
        </Button>
      </Form>
    </section>
  );
}

export async function action({ request }: Pick<ActionFunctionArgs, "request">) {
  const formData = await request.formData();
  const customer = String(formData.get("customer") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const errors: FormErrors = {};

  if (!customer || customer.length > 60) {
    errors.customer = "Enter a name between 1 and 60 characters.";
  }

  if (
    !/^[+\d\s().-]+$/.test(phone) ||
    phone.replace(/\D/g, "").length < 7 ||
    phone.replace(/\D/g, "").length > 15
  ) {
    errors.phone = "Enter a phone number with 7 to 15 digits.";
  }

  if (!address || address.length > 200) {
    errors.address = "Enter a delivery address between 1 and 200 characters.";
  }

  if (Object.keys(errors).length) {
    return errors;
  }

  let cart;

  try {
    cart = z
      .array(cartItemSchema)
      .min(1)
      .parse(JSON.parse(String(formData.get("cart") ?? "")));
  } catch {
    return {
      form: "Your cart is invalid. Return to the menu and add your pizzas again.",
    };
  }

  try {
    const newOrder = await createOrder({
      customer,
      phone,
      address,
      cart,
      priority: formData.get("priority") === "true",
      position: String(formData.get("position") ?? ""),
    });
    store.dispatch(clearCart());
    return redirect(`/order/${encodeURIComponent(newOrder.id)}`);
  } catch (exception) {
    return {
      form:
        exception instanceof Error
          ? exception.message
          : "We couldn’t place your order. Please try again.",
    };
  }
}
