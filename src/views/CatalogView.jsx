// CatalogView - View Layer (MVVM Pattern)
// - Buyers/Invitados: Ven TODOS los productos
// - Restaurants: Ven SOLO sus propios productos
import React, { useEffect, useState } from 'react';
import { useProductsViewModel } from '../viewmodels/useProductsViewModel';
import { useGuestCartViewModel } from '../viewmodels/useGuestCartViewModel';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import DiscountedProductCard from '../components/DiscountedProductCard';

export function CatalogView({ onNavigate }) {
  const { products, loadProducts, loadMyProducts, loading, error } = useProductsViewModel();
  const { addToCart, cartItems, itemCount } = useGuestCartViewModel();
  const { isAuthenticated, user } = useAuthViewModel();
  const [filter, setFilter] = useState('');

  // Cargar productos según el rol del usuario
  useEffect(() => {
    if (isAuthenticated && user?.role === 'restaurant') {
      // Restaurant: solo ve SUS productos
      loadMyProducts();
    } else {
      // Buyer/Invitado: ve TODOS los productos
      loadProducts();
    }
  }, [loadProducts, loadMyProducts, isAuthenticated, user?.role]);

  const handleReserve = (product) => {
    const availableStock = product.stock || product.quantity || 0;
    
    // Verificar si ya hay productos en el carrito
    const existingItem = cartItems?.find(
      (item) => item._id === product._id || item.id === product._id
    );
    const currentQty = existingItem?.quantity || 0;
    
    // Validar stock antes de agregar
    if (currentQty + 1 > availableStock) {
      alert(`⚠️ Solo hay ${availableStock} unidades disponibles. No podés agregar más.`);
      return;
    }
    
    if (!isAuthenticated) {
      // Invitado: agregar al carrito local
      const result = addToCart(product);
      if (result.success) {
        alert('✅ Producto agregado al carrito. Iniciá sesión para finalizar la compra.');
      } else {
        alert(`⚠️ ${result.error}`);
      }
    } else {
      // Usuario logueado: podría crear orden directa o también usar carrito
      const result = addToCart(product);
      if (result.success) {
        alert('✅ Producto agregado al carrito');
      } else {
        alert(`⚠️ ${result.error}`);
      }
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1>{isAuthenticated && user?.role === 'restaurant' ? 'Mis Productos' : 'Catálogo de Productos'}</h1>
        {itemCount > 0 && (
          <button
            onClick={() => onNavigate?.('cart')}
            className="btn-cart"
          >
            🛒 Ver Carrito ({itemCount})
          </button>
        )}
      </div>
      
      {!isAuthenticated && (
        <div className="guest-notice">
          <span>👋 Estás explorando como invitado. <button onClick={() => onNavigate?.('login')}>Iniciá sesión</button> para reservar.</span>
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {loading && <div className="loading">Cargando productos...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <DiscountedProductCard
            key={product._id || product.id}
            product={product}
            onReserve={handleReserve}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <p className="no-products">
          {isAuthenticated && user?.role === 'restaurant' 
            ? 'No tenés productos cargados. ¡Creá tu primer producto!' 
            : 'No hay productos disponibles'}
        </p>
      )}
    </div>
  );
}
