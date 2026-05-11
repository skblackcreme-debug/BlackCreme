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
    code: 'B01',
    name: 'Mango Luxe Basque Creamy',
    description: 'Creamy basque cheesecake topped with fresh, juicy mango chunks.',
    price: 36.90,
    category: Category.BASQUE,
    image: '/images/Mango Luxe Basque Creamy.jpeg',
  },
  {
    id: 'b02',
    code: 'B02',
    name: 'Blueberry Basque Cheesecake',
    description: 'Silky smooth basque with a vibrant blueberry compote layer.',
    price: 37.90,
    category: Category.BASQUE,
    image: '/images/Blueberry Basque Cheesecake.jpeg',
  },
  {
    id: 'b03',
    code: 'B03',
    name: 'Ferrero Rocher Hazelnut Basque',
    description: 'Decadent chocolate hazelnut basque inspired by Ferrero Rocher.',
    price: 32.90,
    category: Category.BASQUE,
    image: '/images/Ferrero Rocher Hazelnut Basque.jpeg',
  },
  // Tiramisu Cake Series
  {
    id: 't01',
    code: 'T01',
    name: 'Classic Tiramisu',
    description: 'Our signature espresso-soaked ladyfingers with rich mascarpone.',
    price: 22.90,
    category: Category.TIRAMISU,
    image: '/images/Classic Tiramisu.jpeg',
  },
  {
    id: 't02',
    code: 'T02',
    name: 'Velvet Biscoff Tiramisu',
    description: 'A buttery caramel fusion with Lotus Biscoff crunch and cream.',
    price: 25.90,
    category: Category.TIRAMISU,
    image: '/images/Velvet Biscoff Tiramisu.jpeg',
  },
  {
    id: 't03',
    code: 'T03',
    name: 'Snow White Apple Tiramisu',
    description: 'A charming twist with sweet spiced apples and light cream.',
    price: 28.90,
    category: Category.TIRAMISU,
    image: '/images/Snow White Apple Tiramisu.jpeg',
  },
  {
    id: 't04',
    code: 'T04',
    name: 'Longan Cloud Tiramisu',
    description: 'Refreshing floral delight featuring sweet longan berries.',
    price: 27.90,
    category: Category.TIRAMISU,
    image: '/images/Longan Cloud Tiramisu.jpeg',
  },
];
