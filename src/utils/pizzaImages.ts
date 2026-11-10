const pizzaPhotos: Record<string, string> = {
  Margherita: "margherita",
  Capricciosa: "capricciosa",
  Romana: "romana",
  "Prosciutto e Rucola": "prosciutto-rucola",
  Diavola: "diavola",
  Vegetale: "vegetale",
  Napoli: "napoli",
  Siciliana: "siciliana",
  Pepperoni: "pepperoni",
  Hawaiian: "hawaiian",
  "Spinach and Mushroom": "spinach-mushroom",
  Mediterranean: "mediterranean",
  Greek: "greek",
  Abruzzese: "prosciutto-rucola",
  "Pesto Chicken": "pesto-chicken",
  "Eggplant Parmesan": "eggplant-parmesan",
  "Roasted Veggie": "roasted-veggie",
  "Tofu and Mushroom": "tofu-mushroom",
};

export function getPizzaImage(name: string, fallbackUrl: string) {
  const photo = pizzaPhotos[name];

  if (!Object.hasOwn(pizzaPhotos, name) || !photo) {
    return { src: fallbackUrl };
  }

  const path = `/images/pizzas/${photo}`;
  return {
    src: `${path}-960.webp`,
    srcSet: [320, 640, 960, 1254]
      .map((width) => `${path}-${width}.webp ${width}w`)
      .join(", "),
  };
}
