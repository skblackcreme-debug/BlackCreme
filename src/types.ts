export enum Category {
  BASQUE = 'Basque Cake',
  TIRAMISU = 'Tiramisu Cake',
  PARTY_SIZE = 'Party Size',
  ADDONS = 'Add-ons',
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  stock_qty: number;
}

export interface CartItem extends Product {
  quantity: number;
}
