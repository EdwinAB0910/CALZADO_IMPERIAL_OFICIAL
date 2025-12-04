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
      console.warn('Carrito parseado no es un objeto válido');
      return { items: [], total: 0 };
    }

    if (!Array.isArray(parsed.items)) {
      console.warn('Items del carrito no es un array válido');
      return { items: [], total: 0 };
    }

    // Filtrar items inválidos pero mantener los válidos
    const validItems = parsed.items.filter((item) => {
      if (!item || typeof item !== 'object') {
        console.warn('Item inválido encontrado (no es objeto):', item);
        return false;
      }
      if (!item.product || typeof item.product !== 'object') {
        console.warn('Item inválido encontrado (sin producto):', item);
        return false;
      }
      if (!item.product.id) {
        console.warn('Item inválido encontrado (producto sin id):', item);
        return false;
      }
      // Validar que quantity sea un número válido
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        console.warn('Item inválido encontrado (cantidad inválida):', item);
        return false;
      }
      return true;
    });
    
    console.log(`getCart: ${parsed.items.length} items total, ${validItems.length} items válidos`);

    // Si había items pero todos eran inválidos, devolver vacío
    if (parsed.items.length > 0 && validItems.length === 0) {
      console.warn('Todos los items del carrito eran inválidos, limpiando...');
      // Limpiar el carrito corrupto
      localStorage.removeItem(CART_STORAGE_KEY);
      return { items: [], total: 0 };
    }

    // Si se filtraron algunos items, guardar el carrito limpio
    if (validItems.length !== parsed.items.length) {
      console.warn(`Se filtraron ${parsed.items.length - validItems.length} items inválidos del carrito`);
      const cleanedCart = {
        items: validItems,
        total: 0
      };
      // Recalcular total
      cleanedCart.total = validItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
        0
      );
      // Guardar el carrito limpio
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cleanedCart));
      } catch (e) {
        console.error('Error al guardar carrito limpio:', e);
      }
      return cleanedCart;
    }

    const calculatedTotal = validItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
      0
    );

    return {
      items: validItems,
      total: parsed.total !== undefined && parsed.total === calculatedTotal ? parsed.total : calculatedTotal,
    };
  } catch (error) {
    console.error('Error al leer el carrito:', error);
    // Intentar limpiar el carrito corrupto
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error('Error al limpiar carrito corrupto:', e);
    }
    return { items: [], total: 0 };
  }
}

export function saveCart(cart) {
  if (typeof window === 'undefined') return;
  
  try {
    if (!cart || !Array.isArray(cart.items)) {
      console.error('Error: Carrito inválido para guardar', cart);
      return;
    }

    // Validar y limpiar items antes de guardar
    const validItems = cart.items.filter((item) => {
      if (!item || typeof item !== 'object') {
        console.warn('Item inválido al guardar (no es objeto):', item);
        return false;
      }
      if (!item.product || typeof item.product !== 'object') {
        console.warn('Item inválido al guardar (sin producto):', item);
        return false;
      }
      if (!item.product.id) {
        console.warn('Item inválido al guardar (producto sin id):', item);
        return false;
      }
      // Asegurar que quantity sea un número válido
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        console.warn('Item inválido al guardar (cantidad inválida):', item);
        return false;
      }
      return true;
    });

    if (validItems.length === 0 && cart.items.length > 0) {
      console.error('Error: Todos los items del carrito son inválidos');
      return;
    }

    const calculatedTotal = validItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
      0
    );

    const cartToSave = {
      items: validItems,
      total: cart.total !== undefined && Math.abs(cart.total - calculatedTotal) < 0.01 ? cart.total : calculatedTotal,
    };

    const cartJson = JSON.stringify(cartToSave);
    localStorage.setItem(CART_STORAGE_KEY, cartJson);
    
    // Verificar que se guardó correctamente
    const verification = localStorage.getItem(CART_STORAGE_KEY);
    if (verification !== cartJson) {
      console.error('Error: El carrito no se guardó correctamente. Verificación falló.');
      return;
    }
    
    console.log('Carrito guardado correctamente:', {
      itemsCount: cartToSave.items.length,
      total: cartToSave.total,
      items: cartToSave.items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity
      }))
    });
    
    updateCartBadge();
    dispatchCartUpdate();
  } catch (error) {
    console.error('Error al guardar el carrito:', error);
    // Intentar guardar un carrito vacío como fallback
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: [], total: 0 }));
    } catch (e) {
      console.error('Error crítico: No se pudo guardar ni siquiera un carrito vacío:', e);
    }
  }
}

export function addToCart(product, quantity = 1, size = '', color = '') {
  // Validar que el producto tenga los campos mínimos necesarios
  if (!product) {
    console.error('Error: Producto no definido');
    return getCart();
  }

  if (!product.id) {
    console.error('Error: Producto sin ID', product);
    return getCart();
  }

  if (!product.name) {
    console.error('Error: Producto sin nombre', product);
    return getCart();
  }

  if (typeof product.price !== 'number' || product.price <= 0) {
    console.error('Error: Producto sin precio válido', product);
    return getCart();
  }

  // Validar cantidad
  const validQuantity = typeof quantity === 'number' && quantity > 0 ? quantity : 1;

  const cart = getCart();
  
  // Asegurar que el producto tenga todos los campos necesarios
  const completeProduct = {
    id: String(product.id), // Asegurar que sea string
    name: String(product.name || 'Producto sin nombre'),
    brand: String(product.brand || ''),
    price: Number(product.price) || 0,
    image: String(product.image || ''),
    description: String(product.description || ''),
    category: String(product.category || ''),
    sizes: Array.isArray(product.sizes) ? product.sizes : [],
    colors: Array.isArray(product.colors) ? product.colors : [],
    stock: typeof product.stock === 'number' ? product.stock : 0,
    originalPrice: typeof product.originalPrice === 'number' ? product.originalPrice : undefined,
    rating: typeof product.rating === 'number' ? product.rating : undefined,
    reviews: typeof product.reviews === 'number' ? product.reviews : undefined,
    featured: Boolean(product.featured),
  };

  // Validar que el producto completo tenga los campos mínimos
  if (!completeProduct.id || !completeProduct.name || completeProduct.price <= 0) {
    console.error('Error: Producto incompleto después de procesamiento', completeProduct);
    return cart;
  }

  const finalSize = size || (completeProduct.sizes && completeProduct.sizes.length > 0 ? completeProduct.sizes[0] : '') || '';
  const finalColor = color || (completeProduct.colors && completeProduct.colors.length > 0 ? completeProduct.colors[0] : '') || '';

  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product &&
      item.product.id === completeProduct.id &&
      item.size === finalSize &&
      item.color === finalColor
  );

  let newItems;

  if (existingItemIndex >= 0) {
    newItems = cart.items.map((item, index) =>
      index === existingItemIndex
        ? { ...item, quantity: (item.quantity || 0) + validQuantity }
        : item
    );
  } else {
    newItems = [
      ...cart.items,
      {
        product: completeProduct,
        quantity: validQuantity,
        size: finalSize,
        color: finalColor,
      },
    ];
  }

  // Validar que todos los items tengan la estructura correcta
  const validatedItems = newItems.filter((item) => {
    return item && 
           item.product && 
           item.product.id && 
           typeof item.quantity === 'number' && 
           item.quantity > 0;
  });

  if (validatedItems.length !== newItems.length) {
    console.warn(`Se filtraron ${newItems.length - validatedItems.length} items inválidos al agregar producto`);
  }

  const total = validatedItems.reduce(
    (sum, item) => sum + (item.product.price || 0) * (item.quantity || 0),
    0
  );

  const newCart = { items: validatedItems, total };
  console.log('Agregando producto al carrito:', {
    productId: completeProduct.id,
    productName: completeProduct.name,
    quantity: validQuantity,
    size: finalSize,
    color: finalColor,
    itemsCount: newCart.items.length,
    total: newCart.total
  });
  
  saveCart(newCart);
  
  // Verificar que se guardó correctamente
  const savedCart = getCart();
  if (savedCart.items.length !== newCart.items.length) {
    console.error('Error: El carrito no se guardó correctamente. Items esperados:', newCart.items.length, 'Items guardados:', savedCart.items.length);
  }
  
  return savedCart;
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

