import { useAppDispatch } from "../../hooks";
import Button from "../../ui/Button";
import { decreaseItemQuantity, increaseItemQuantity } from "./cartSlice";

export default function UpdateItemQuantity({
  pizzaId,
  currentQuantity,
  name,
}: {
  pizzaId: number;
  currentQuantity: number;
  name: string;
}) {
  const dispatch = useAppDispatch();

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <Button
        type="round"
        aria-label={`Decrease ${name} quantity`}
        onClick={() => dispatch(decreaseItemQuantity(pizzaId))}
      >
        -
      </Button>
      <output aria-label={`${name} quantity`} className="text-sm font-medium">
        {currentQuantity}
      </output>
      <Button
        type="round"
        aria-label={`Increase ${name} quantity`}
        disabled={currentQuantity >= 99}
        onClick={() => dispatch(increaseItemQuantity(pizzaId))}
      >
        +
      </Button>
    </div>
  );
}
