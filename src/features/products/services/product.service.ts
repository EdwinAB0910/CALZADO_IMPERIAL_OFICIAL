import type { Product } from '../../../shared/types';

// Datos de ejemplo de productos (zapatillas) - Precios en Soles Peruanos (PEN)
export const products: Product[] = [
  {
    id: '1',
    name: 'Air Max 90',
    brand: 'Nike',
    price: 480.00,
    originalPrice: 590.00,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    description: 'Zapatillas clásicas con tecnología Air Max para máximo confort. Perfectas para running y uso diario.',
    category: 'Running',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['Negro', 'Blanco', 'Rojo'],
    stock: 15,
    rating: 4.5,
    reviews: 120,
    featured: true,
  },
  {
    id: '2',
    name: 'Ultraboost 22',
    brand: 'Adidas',
    price: 665.00,
    image: 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=400&h=400&fit=crop',
    description: 'Zapatillas de running con tecnología Boost para máxima energía y amortiguación.',
    category: 'Running',
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['Negro', 'Blanco', 'Azul'],
    stock: 20,
    rating: 4.8,
    reviews: 85,
    featured: true,
  },
  {
    id: '3',
    name: 'Chuck Taylor All Star',
    brand: 'Converse',
    price: 220.00,
    originalPrice: 260.00,
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop',
    description: 'Zapatillas clásicas y versátiles, perfectas para el día a día. Diseño icónico que nunca pasa de moda.',
    category: 'Casual',
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    colors: ['Negro', 'Blanco', 'Rojo', 'Azul'],
    stock: 30,
    rating: 4.3,
    reviews: 200,
  },
  {
    id: '4',
    name: 'Old Skool',
    brand: 'Vans',
    price: 260.00,
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop',
    description: 'Zapatillas skate icónicas con estilo atemporal. Ideal para skateboarding y estilo urbano.',
    category: 'Skate',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['Negro', 'Blanco', 'Azul'],
    stock: 25,
    rating: 4.6,
    reviews: 150,
  },
  {
    id: '5',
    name: 'Classic Leather',
    brand: 'Reebok',
    price: 295.00,
    originalPrice: 370.00,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
    description: 'Zapatillas retro con diseño clásico y materiales premium. Comodidad y estilo en cada paso.',
    category: 'Casual',
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['Negro', 'Blanco', 'Beige'],
    stock: 18,
    rating: 4.4,
    reviews: 95,
  },
  {
    id: '6',
    name: 'New Balance 550',
    brand: 'New Balance',
    price: 330.00,
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=400&fit=crop',
    description: 'Zapatillas con estilo vintage y máximo confort. Perfectas para caminar y uso casual.',
    category: 'Casual',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['Blanco', 'Gris', 'Negro'],
    stock: 22,
    rating: 4.7,
    reviews: 110,
    featured: true,
  },
  {
    id: '7',
    name: 'Air Force 1',
    brand: 'Nike',
    price: 420.00,
    originalPrice: 480.00,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
    description: 'Las clásicas Air Force 1, el modelo más icónico de Nike. Estilo urbano y comodidad.',
    category: 'Casual',
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['Blanco', 'Negro', 'Gris'],
    stock: 28,
    rating: 4.6,
    reviews: 180,
    featured: true,
  },
  {
    id: '8',
    name: 'Stan Smith',
    brand: 'Adidas',
    price: 280.00,
    image: 'https://images.unsplash.com/photo-1544966503-7d97ce18f71a?w=400&h=400&fit=crop',
    description: 'Zapatillas minimalistas y elegantes. Diseño clásico que combina con todo.',
    category: 'Casual',
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    colors: ['Blanco', 'Verde', 'Negro'],
    stock: 35,
    rating: 4.5,
    reviews: 145,
  },
];

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.brand.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
  );
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category === category);
}

