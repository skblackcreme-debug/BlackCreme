export enum Category {
  BASQUE = 'Basque Cake',
  TIRAMISU = 'Tiramisu Cake',
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}
