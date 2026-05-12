import { Category, Product } from './types';

export const WHATSAPP_NUMBER = '60122064355';
export const BANK_INFO = {
  name: 'Maybank',
  accNo: '123456789',
  holder: 'Black Crème Bakery'
};

export const PRODUCTS: Product[] = [
  // Basque Cake Series
  {
    id: 'b01',
    name: 'Mango Luxe Basque Creamy',
    description: 'Creamy basque cheesecake topped with fresh, juicy mango chunks.',
    price: 36.90,
    category: Category.BASQUE,
    image: '/images/Mango Luxe Basque Creamy.jpeg',
  },
  {
    id: 'b02',
    name: 'Blueberry Basque Cheesecake',
    description: 'Silky smooth basque with a vibrant blueberry compote layer.',
    price: 37.90,
    category: Category.BASQUE,
    image: '/images/Blueberry Basque Cheesecake.jpeg',
  },
  {
    id: 'b03',
    name: 'Ferrero Rocher Hazelnut Basque',
    description: 'Decadent chocolate hazelnut basque inspired by Ferrero Rocher.',
    price: 32.90,
    category: Category.BASQUE,
    image: '/images/Ferrero Rocher Hazelnut Basque.jpeg',
  },
  {
    id: 'b04',
    name: 'Signature Creamy Classic Basque (No Flour)',
    description: 'Our signature flourless basque cheesecake — ultra-creamy, dense and velvety smooth.',
    price: 29.90,
    category: Category.BASQUE,
    image: '/images/Signature Creamy Classic Basque (No Flour).jpeg',
  },
  {
    id: 'b05',
    name: 'Emerald Pistachio Basque',
    description: 'Luxurious basque cheesecake infused with rich pistachio for a nutty, elegant finish.',
    price: 38.90,
    category: Category.BASQUE,
    image: '/images/Emerald Pistachio Basque.jpeg',
  },
  // Tiramisu Cake Series
  {
    id: 't01',
    name: 'Classic Tiramisu',
    description: 'Our signature espresso-soaked ladyfingers with rich mascarpone.',
    price: 22.90,
    category: Category.TIRAMISU,
    image: '/images/Classic Tiramisu.jpeg',
  },
  {
    id: 't02',
    name: 'Velvet Biscoff Tiramisu',
    description: 'A buttery caramel fusion with Lotus Biscoff crunch and cream.',
    price: 25.90,
    category: Category.TIRAMISU,
    image: '/images/Velvet Biscoff Tiramisu.jpeg',
  },
  {
    id: 't03',
    name: 'Snow White Apple Tiramisu',
    description: 'A charming twist with sweet spiced apples and light cream.',
    price: 28.90,
    category: Category.TIRAMISU,
    image: '/images/Snow White Apple Tiramisu.jpeg',
  },
  {
    id: 't04',
    name: 'Longan Cloud Tiramisu',
    description: 'Refreshing floral delight featuring sweet longan berries.',
    price: 27.90,
    category: Category.TIRAMISU,
    image: '/images/Longan Cloud Tiramisu.jpeg',
  },
  // Add-ons
  {
    id: 'a01',
    name: 'Small Love You Topper',
    description: 'A sweet "Love You" cake topper to personalise your order.',
    price: 1.50,
    category: Category.ADDONS,
  },
  {
    id: 'a02',
    name: 'Small Birthday Topper',
    description: 'Cute birthday cake topper to make every celebration special.',
    price: 1.50,
    category: Category.ADDONS,
  },
  {
    id: 'a03',
    name: 'Rose Gold Candle 1pc',
    description: 'Elegant rose gold birthday candle for a glamorous touch.',
    price: 1.00,
    category: Category.ADDONS,
  },
  {
    id: 'a04',
    name: 'Gold Candle 1pc',
    description: 'Classic gold birthday candle to light up your celebration.',
    price: 1.00,
    category: Category.ADDONS,
  },
  {
    id: 'a05',
    name: 'Cutlery Set For 5pax',
    description: 'Convenient disposable cutlery set for 5 people.',
    price: 8.00,
    category: Category.ADDONS,
  },
];
