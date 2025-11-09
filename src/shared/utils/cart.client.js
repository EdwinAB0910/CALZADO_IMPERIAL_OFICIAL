// Versión JavaScript pura para uso en el cliente
const CART_STORAGE_KEY = 'sneakerstore_cart';

export function getCart() {
  if (typeof window === 'undefined') {
    return { items: [], total: 0 };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return { items: [], total: 0 };
    }

    const parsed = JSON.parse(stored);
    
    if (!parsed || typeof parsed !== 'object') {
      return { items: [], total: 0 };
    }

    if (!Array.isArray(parsed.items)) {
      return { items: [], total: 0 };
    }

    const calculatedTotal = parsed.items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
      0
    );

    return {
      items: parsed.items,
      total: parsed.total !== undefined ? parsed.total : calculatedTotal,
    };
  } catch (error) {
    console.error('Error al leer el carrito:', error);
    return { items: [], total: 0 };
  }
}

export function saveCart(cart) {
  if (typeof window === 'undefined') return;
  
  try {
    if (!cart || !Array.isArray(cart.items)) {
      console.error('Error: Carrito inválido para guardar');
      return;
    }

    const calculatedTotal = cart.items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
      0
    );

    const cartToSave = {
      items: cart.items,
      total: cart.total !== undefined ? cart.total : calculatedTotal,
    };

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartToSave));
    console.log('Carrito guardado correctamente:', cartToSave);
    
    updateCartBadge();
    dispatchCartUpdate();
  } catch (error) {
    console.error('Error al guardar el carrito:', error);
  }
}

export function addToCart(product, quantity = 1, size = '', color = '') {
  const cart = getCart();
  
  const completeProduct = {
    id: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.image,
    description: product.description || '',
    category: product.category,
    sizes: product.sizes || [],
    colors: product.colors || [],
    stock: product.stock || 0,
    originalPrice: product.originalPrice,
    rating: product.rating,
    reviews: product.reviews,
    featured: product.featured,
  };

  const finalSize = size || completeProduct.sizes[0] || '';
  const finalColor = color || completeProduct.colors[0] || '';

  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.id === completeProduct.id &&
      item.size === finalSize &&
      item.color === finalColor
  );

  let newItems;

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
        product: completeProduct,
        quantity,
        size: finalSize,
        color: finalColor,
      },
    ];
  }

  const total = newItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const newCart = { items: newItems, total };
  console.log('Guardando carrito:', newCart);
  saveCart(newCart);
  return newCart;
}

export function removeFromCart(itemId) {
  const cart = getCart();
  const newItems = cart.items.filter(
    (item) => `${item.product.id}-${item.size}-${item.color}` !== itemId
  );

  const total = newItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const newCart = { items: newItems, total };
  saveCart(newCart);
  return newCart;
}

export function updateCartItemQuantity(itemId, quantity) {
  const cart = getCart();
  const newItems = cart.items
    .map((item) =>
      `${item.product.id}-${item.size}-${item.color}` === itemId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    )
    .filter((item) => item.quantity > 0);

  const total = newItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const newCart = { items: newItems, total };
  saveCart(newCart);
  return newCart;
}

export function getCartItemCount() {
  const cart = getCart();
  return cart.items.reduce((count, item) => count + item.quantity, 0);
}

export function updateCartBadge() {
  if (typeof window === 'undefined') return;
  const count = getCartItemCount();
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = count > 0 ? count.toString() : '';
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

export function dispatchCartUpdate() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

export function clearCart() {
  saveCart({ items: [], total: 0 });
}

export function formatPrice(price) {
  return `S/ ${price.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

