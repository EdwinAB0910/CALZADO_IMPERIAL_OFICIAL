export const prerender = false;

import type { APIRoute } from 'astro';
import { createOrder } from '../../features/cart/services/order.service';

// Función para validar email
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Función para validar teléfono
function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\+\-\(\)]{8,20}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const orderData = await request.json();

    // Validar datos básicos
    if (!orderData.personalInfo || !orderData.shippingAddress || !orderData.cart) {
      return new Response(
        JSON.stringify({ error: 'Datos incompletos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar que el carrito tenga items
    if (!orderData.cart.items || orderData.cart.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'El carrito está vacío' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validar campos de información personal
    const { nombre, apellidos, email, telefono } = orderData.personalInfo;
    const errors: string[] = [];

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }

    if (!apellidos || typeof apellidos !== 'string' || apellidos.trim().length < 2) {
      errors.push('Los apellidos deben tener al menos 2 caracteres');
    }

    if (!email || typeof email !== 'string' || !validateEmail(email.trim())) {
      errors.push('El correo electrónico no es válido');
    }

    if (!telefono || typeof telefono !== 'string' || !validatePhone(telefono.trim())) {
      errors.push('El teléfono debe tener entre 8 y 20 dígitos');
    }

    // Validar campos de dirección de envío
    const { direccion, distrito, ciudad, departamento } = orderData.shippingAddress;

    if (!direccion || typeof direccion !== 'string' || direccion.trim().length < 5) {
      errors.push('La dirección debe tener al menos 5 caracteres');
    }

    if (!distrito || typeof distrito !== 'string' || distrito.trim().length < 2) {
      errors.push('El distrito es obligatorio');
    }

    if (!ciudad || typeof ciudad !== 'string' || ciudad.trim().length < 2) {
      errors.push('La ciudad es obligatoria');
    }

    if (!departamento || typeof departamento !== 'string' || departamento.trim().length < 2) {
      errors.push('El departamento/región es obligatorio');
    }

    // Si hay errores de validación, retornarlos
    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ error: 'Errores de validación', details: errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear el pedido (y sus items asociados)
    const result = await createOrder(orderData);

    if (!result) {
      return new Response(
        JSON.stringify({ error: 'Error al crear el pedido' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        order: result.order,
        items: result.items,
      }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error en API de pedidos:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

