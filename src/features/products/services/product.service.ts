import type { Product } from '../../../shared/types';
import { getSupabaseClient } from '../../../shared/db/supabase';

// Interfaz para los datos de Supabase (con nombres de columnas en snake_case)
interface SupabaseProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  original_price: number | null;
  image: string;
  description: string | null;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number | null;
  reviews: number;
  featured: boolean;
}

// Función para convertir productos de Supabase al formato de la aplicación
function mapSupabaseToProduct(dbProduct: SupabaseProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    brand: dbProduct.brand,
    price: Number(dbProduct.price),
    originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
    image: dbProduct.image,
    description: dbProduct.description || '',
    category: dbProduct.category,
    sizes: dbProduct.sizes || [],
    colors: dbProduct.colors || [],
    stock: dbProduct.stock,
    rating: dbProduct.rating ? Number(dbProduct.rating) : undefined,
    reviews: dbProduct.reviews || 0,
    featured: dbProduct.featured || false,
  };
}

// Cache de productos para evitar múltiples llamadas
let productsCache: Product[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function getProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  
  // Si Supabase no está configurado, usar datos estáticos
  if (!supabase) {
    return getStaticProducts();
  }

  // Verificar si hay cache válido
  const now = Date.now();
  if (productsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return productsCache;
  }

  try {
    // Obtener productos con sus relaciones de tallas y colores
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        brand,
        price,
        original_price,
        image,
        description,
        category,
        category_id,
        stock,
        rating,
        reviews,
        featured,
        sizes,
        colors
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error al cargar productos desde Supabase:', error);
      // Fallback a datos estáticos si hay error
      return getStaticProducts();
    }

    if (!data || data.length === 0) {
      console.warn('No se encontraron productos en Supabase, usando datos estáticos');
      return getStaticProducts();
    }

    // Para cada producto, obtener tallas y colores de las tablas separadas
    const productsWithRelations = await Promise.all(
      data.map(async (product: any) => {
        // Obtener tallas - consulta directa
        const { data: productSizes } = await supabase
          .from('product_sizes')
          .select('size_id')
          .eq('product_id', product.id);

        // Obtener colores - consulta directa
        const { data: productColors } = await supabase
          .from('product_colors')
          .select('color_id')
          .eq('product_id', product.id);

        // Obtener valores de tallas
        let sizes: string[] = [];
        if (productSizes && productSizes.length > 0) {
          const sizeIds = productSizes.map(ps => ps.size_id);
          const { data: sizesData } = await supabase
            .from('sizes')
            .select('value')
            .in('id', sizeIds);
          sizes = sizesData?.map(s => s.value).filter(Boolean) || [];
        }

        // Obtener valores de colores
        let colors: string[] = [];
        if (productColors && productColors.length > 0) {
          const colorIds = productColors.map(pc => pc.color_id);
          const { data: colorsData } = await supabase
            .from('colors')
            .select('name')
            .in('id', colorIds);
          colors = colorsData?.map(c => c.name).filter(Boolean) || [];
        }

        // Fallback a arrays si existen
        if (sizes.length === 0 && product.sizes) {
          sizes.push(...(Array.isArray(product.sizes) ? product.sizes : []));
        }
        if (colors.length === 0 && product.colors) {
          colors.push(...(Array.isArray(product.colors) ? product.colors : []));
        }

        return {
          ...product,
          sizes,
          colors
        };
      })
    );

    // @ts-ignore
    // Mapear y guardar en cache
    productsCache = productsWithRelations.map(mapSupabaseToProduct);
    cacheTimestamp = now;
    return productsCache;
  } catch (error) {
    console.error('Error al conectar con Supabase:', error);
    // Fallback a datos estáticos
    return getStaticProducts();
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const supabase = getSupabaseClient();
  
  // Si Supabase no está configurado, usar datos estáticos
  if (!supabase) {
    return getStaticProducts().find((p) => p.id === id);
  }

  try {
    // Primero obtener el producto
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('id, name, brand, price, original_price, image, description, category, stock, rating, reviews, featured')
      .eq('id', id)
      .single();

    if (productError || !productData) {
      console.error(`Error al cargar producto ${id} desde Supabase:`, productError);
      // Fallback a datos estáticos
      return getStaticProducts().find((p) => p.id === id);
    }

    // Obtener tallas relacionadas - consulta directa
    const { data: productSizes } = await supabase
      .from('product_sizes')
      .select('size_id')
      .eq('product_id', id);

    // Obtener colores relacionados - consulta directa
    const { data: productColors } = await supabase
      .from('product_colors')
      .select('color_id')
      .eq('product_id', id);

    // Obtener valores de tallas
    let sizes: string[] = [];
    if (productSizes && productSizes.length > 0) {
      const sizeIds = productSizes.map(ps => ps.size_id);
      const { data: sizesData } = await supabase
        .from('sizes')
        .select('value')
        .in('id', sizeIds);
      sizes = sizesData?.map(s => s.value).filter(Boolean) || [];
    }

    // Obtener valores de colores
    let colors: string[] = [];
    if (productColors && productColors.length > 0) {
      const colorIds = productColors.map(pc => pc.color_id);
      const { data: colorsData } = await supabase
        .from('colors')
        .select('name')
        .in('id', colorIds);
      colors = colorsData?.map(c => c.name).filter(Boolean) || [];
    }
    
    // Fallback: si no hay datos en tablas separadas, intentar usar arrays
    if (sizes.length === 0 && productData.sizes) {
      sizes.push(...(Array.isArray(productData.sizes) ? productData.sizes : []));
    }
    if (colors.length === 0 && productData.colors) {
      colors.push(...(Array.isArray(productData.colors) ? productData.colors : []));
    }

    // Combinar datos
    const productWithRelations = {
      ...productData,
      sizes,
      colors
    };

    // @ts-ignore
    return mapSupabaseToProduct(productWithRelations);
  } catch (error) {
    console.error(`Error al conectar con Supabase para producto ${id}:`, error);
    // Fallback a datos estáticos
    return getStaticProducts().find((p) => p.id === id);
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = getSupabaseClient();
  
  // Si Supabase no está configurado, usar datos estáticos
  if (!supabase) {
    return getStaticProducts().filter((p) => p.featured);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar productos destacados desde Supabase:', error);
      return getStaticProducts().filter((p) => p.featured);
    }

    if (!data) {
      return [];
    }

    return data.map(mapSupabaseToProduct);
  } catch (error) {
    console.error('Error al conectar con Supabase para productos destacados:', error);
    return getStaticProducts().filter((p) => p.featured);
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = getSupabaseClient();
  const lowerQuery = query.toLowerCase();

  // Si Supabase no está configurado, usar búsqueda estática
  if (!supabase) {
    return getStaticProducts().filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.brand.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery)
    );
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,description.ilike.%${query}%`);

    if (error) {
      console.error('Error al buscar productos en Supabase:', error);
      // Fallback a búsqueda estática
      return getStaticProducts().filter(
        (product) =>
          product.name.toLowerCase().includes(lowerQuery) ||
          product.brand.toLowerCase().includes(lowerQuery) ||
          product.description.toLowerCase().includes(lowerQuery)
      );
    }

    if (!data) {
      return [];
    }

    return data.map(mapSupabaseToProduct);
  } catch (error) {
    console.error('Error al conectar con Supabase para búsqueda:', error);
    // Fallback a búsqueda estática
    return getStaticProducts().filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.brand.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery)
    );
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = getSupabaseClient();
  
  // Si Supabase no está configurado, usar datos estáticos
  if (!supabase) {
    return getStaticProducts().filter((p) => p.category === category);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error al cargar productos de categoría ${category} desde Supabase:`, error);
      return getStaticProducts().filter((p) => p.category === category);
    }

    if (!data) {
      return [];
    }

    return data.map(mapSupabaseToProduct);
  } catch (error) {
    console.error(`Error al conectar con Supabase para categoría ${category}:`, error);
    return getStaticProducts().filter((p) => p.category === category);
  }
}

// Función de fallback con datos estáticos
function getStaticProducts(): Product[] {
  return [
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
}

