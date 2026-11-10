import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getPizzaImage } from "../../../utils/pizzaImages";

const menuNames = [
  "Margherita",
  "Capricciosa",
  "Romana",
  "Prosciutto e Rucola",
  "Diavola",
  "Vegetale",
  "Napoli",
  "Siciliana",
  "Pepperoni",
  "Hawaiian",
  "Spinach and Mushroom",
  "Mediterranean",
  "Greek",
  "Abruzzese",
  "Pesto Chicken",
  "Eggplant Parmesan",
  "Roasted Veggie",
  "Tofu and Mushroom",
];

describe("pizza images", () => {
  it.each(menuNames)(
    "getPizzaImage_knownPizza_returnsExistingResponsiveSources (%s)",
    (name) => {
      const image = getPizzaImage(name, "https://example.com/pizza.jpg");
      const sources = image.srcSet.split(", ");

      expect(image.src).toMatch(/^\/images\/pizzas\/[a-z-]+-960\.webp$/);
      expect(sources).toHaveLength(4);

      for (const [index, width] of [320, 640, 960, 1254].entries()) {
        const [path, descriptor] = sources[index].split(" ");
        expect(descriptor).toBe(`${width}w`);
        expect(path).toBe(image.src.replace("-960.webp", `-${width}.webp`));
        expect(existsSync(resolve(`public${path}`))).toBe(true);
      }
    },
  );

  it.each(["Unknown pizza", "constructor", "toString", "__proto__"])(
    "getPizzaImage_unknownPizza_preservesApiImage (%s)",
    (name) => {
      expect(getPizzaImage(name, "https://example.com/pizza.jpg")).toEqual({
        src: "https://example.com/pizza.jpg",
      });
    },
  );
});
