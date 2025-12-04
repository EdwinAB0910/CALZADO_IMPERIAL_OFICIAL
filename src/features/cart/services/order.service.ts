import { getSupabaseClient } from '../../../shared/db/supabase';
import type { Cart } from '../../../shared/types';

export interface OrderData {
  personalInfo: {
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
  };
  shippingAddress: {
    direccion: string;
    distrito: string;
    ciudad: string;
    departamento: string;
    codigoPostal?: string;
  };
  notas?: string;
  cart: Cart;
}

export interface Order {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  distrito: string;
  ciudad: string;
  departamento: string;
  codigo_postal?: string;
  notas?: string;
  total: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

/**
 * Guarda un pedido en la base de datos junto con sus items
 */
export async function createOrder(orderData: OrderData): Promise<{ order: Order; items: OrderItem[] } | null> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('Supabase no está configurado');
    return null;
  }

  try {
    const { personalInfo, shippingAddress, notas, cart } = orderData;
    
    // Calcular total
    const total = cart.total || 0;

    // Crear el pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        nombre: personalInfo.nombre,
        apellidos: personalInfo.apellidos,
        email: personalInfo.email,
        telefono: personalInfo.telefono,
        direccion: shippingAddress.direccion,
        distrito: shippingAddress.distrito,
        ciudad: shippingAddress.ciudad,
        departamento: shippingAddress.departamento,
        codigo_postal: shippingAddress.codigoPostal || null,
        notas: notas || null,
        total: total,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error al crear el pedido:', orderError);
      return null;
    }

    if (!order) {
      console.error('No se pudo crear el pedido');
      return null;
    }

    // Crear los items del pedido en order_items
    const orderItemsPayload = cart.items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsPayload)
      .select();

    if (itemsError) {
      console.error('Error al crear los items del pedido:', itemsError);
      // No cancelamos el pedido, pero devolvemos items vacíos
      return {
        order: order as Order,
        items: [],
      };
    }

    return {
      order: order as Order,
      items: (items || []) as OrderItem[],
    };
  } catch (error) {
    console.error('Error inesperado al crear el pedido:', error);
    return null;
  }
}

/**
 * Obtiene los pedidos de un usuario por email
 */
export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    console.error('Supabase no está configurado');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al obtener los pedidos:', error);
      return [];
    }

    return (data || []) as Order[];
  } catch (error) {
    console.error('Error inesperado al obtener los pedidos:', error);
    return [];
  }
}


