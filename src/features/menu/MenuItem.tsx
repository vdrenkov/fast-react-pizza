import { useAppDispatch, useAppSelector } from "../../hooks";
import Button from "../../ui/Button";
import { formatCurrency } from "../../utils/helpers";
import { getPizzaImage } from "../../utils/pizzaImages";
import { addItem, getCurrentQuantityById } from "../cart/cartSlice";
import DeleteItem from "../cart/DeleteItem";
import UpdateItemQuantity from "../cart/UpdateItemQuantity";

import type { Pizza } from "../../types";

export default function MenuItem({ pizza }: { pizza: Pizza }) {
  const dispatch = useAppDispatch();
  const { id, name, unitPrice, ingredients, soldOut, imageUrl } = pizza;
  const currentQuantity = useAppSelector(getCurrentQuantityById(id));
  const isInCart = currentQuantity > 0;

  function handleAddToCart() {
    const newItem = {
      pizzaId: id,
      name,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice * 1,
    };
    dispatch(addItem(newItem));
  }

  return (
    <li className={`pizza-card ${soldOut ? "pizza-card--sold-out" : ""}`}>
      <img
        {...getPizzaImage(name, imageUrl)}
        sizes="(max-width: 640px) calc(100vw - 42px), (max-width: 1000px) calc((100vw - 84px) / 2), (max-width: 1280px) calc((100vw - 150px) / 3), 377px"
        alt={name}
        width={1254}
        height={1254}
        loading="lazy"
        className="pizza-image"
      />
      <div className="pizza-content">
        <h2>{name}</h2>
        <p className="pizza-ingredients">{ingredients.join(", ")}</p>
        <div className="pizza-actions">
          {soldOut ? (
            <p className="text-sm font-medium text-stone-500 uppercase">
              Sold out
            </p>
          ) : (
            <p className="text-sm">{formatCurrency(unitPrice)}</p>
          )}

          {isInCart && (
            <div className="flex items-center gap-3 sm:gap-8">
              <UpdateItemQuantity
                pizzaId={id}
                currentQuantity={currentQuantity}
                name={name}
              />
              <DeleteItem pizzaId={id} name={name} />
            </div>
          )}

          {!soldOut && !isInCart && (
            <Button
              type="small"
              aria-label={`Add ${name} to cart`}
              onClick={handleAddToCart}
            >
              Add to cart
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}
