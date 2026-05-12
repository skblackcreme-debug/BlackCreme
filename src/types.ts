export enum Category {
  BASQUE = 'Basque Cake',
  TIRAMISU = 'Tiramisu Cake',
  ADDONS = 'Add-ons',
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
