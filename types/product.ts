export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string; // URL of the uploaded image
  category: string;
  flavors: string[];
  featured: boolean;
}

export type ProductCategory =
  | "cookie"
  | "brownie"
  | "dry cake"
  | "chocolate-cake"
  | "cheesecake"
  | "tart"
  | "jar-cake"
  | "mousse"
  | "muffin"
  | "millet-magic"
  | "other";

export type ProductFlavor =
  | "chocolate"
  | "hazelnut"
  | "oatmeal"
  | "jeera"
  | "saffron"
  | "pistachio"
  | "coconut"
  | "red-velvet"
  | "ajwain"
  | "mango"
  | "strawberry"
  | "blueberry"
  | "pineapple"
  | "almonds"
  | "ragi"
  | "foxtail-millet"
  | "nutella"
  | "oreo"
  | "lotus-biscoff"
  | "lemon"
  | "coffee"
  | "caramel"
  | "rasmalai"
  | "cherry"
  | "cranberry"
  | "butterscotch"
  | "tiramisu"
  | "pina-colada"
  | "litchi"
  | "fruit"
  | "nuts"
  | "dates"
  | "cinnamon"
  | "banana"
  | "quinoa"
  | "oat"
  | "barnyard-millet"
  | "kodo-millet"
  | "browntop-millet"
  | "little-millet"
  | "vanilla"
  | "other";