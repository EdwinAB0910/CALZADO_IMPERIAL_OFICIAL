import type { Cart, CartItem, Product } from '../../../shared/types';

export function createCart(): Cart {
  return {
    items: [],
    total: 0,
  };
}

export function addToCart(
  cart: Cart,
  product: Product,
  quantity: number = 1,
  size: string = '',
  color: string = ''
): Cart {
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.id === product.id &&
      item.size === size &&
      item.color === color
  );

  let newItems: CartItem[];

  if (existingItemIndex >= 0) {
    newItems = cart.items.map((item, index) =>
      index === existingItemIndex
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  } else {
    newItems = [
      ...cart.items,
      {
        product,
        quantity,
        size,
        color,
      },
    ];
  }

  return {
    items: newItems,
    total: calculateTotal(newItems),
  };
}

export function removeFromCart(cart: Cart, itemId: string): Cart {
  const newItems = cart.items.filter(
    (item) => `${item.product.id}-${item.size}-${item.color}` !== itemId
  );

  return {
    items: newItems,
    total: calculateTotal(newItems),
  };
}

export function updateCartItemQuantity(
  cart: Cart,
  itemId: string,
  quantity: number
): Cart {
  const newItems = cart.items.map((item) =>
    `${item.product.id}-${item.size}-${item.color}` === itemId
      ? { ...item, quantity: Math.max(0, quantity) }
      : item
  ).filter((item) => item.quantity > 0);

  return {
    items: newItems,
    total: calculateTotal(newItems),
  };
}

function calculateTotal(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
}

export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce((count, item) => count + item.quantity, 0);
}

