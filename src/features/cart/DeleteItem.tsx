import { useAppDispatch } from "../../hooks";
import Button from "../../ui/Button";
import { deleteItem } from "./cartSlice";

export default function DeleteItem({
  pizzaId,
  name,
}: {
  pizzaId: number;
  name: string;
}) {
  const dispatch = useAppDispatch();

  return (
    <Button
      type="secondary"
      aria-label={`Remove ${name}`}
      onClick={() => dispatch(deleteItem(pizzaId))}
    >
      Remove
    </Button>
  );
}
