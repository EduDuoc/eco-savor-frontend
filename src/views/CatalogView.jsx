// CatalogView - View Layer (MVVM Pattern) - Vista pública (invitados y usuarios)
import React, { useEffect, useState } from 'react';
import { useProductsViewModel } from '../viewmodels/useProductsViewModel';
import { useGuestCartViewModel } from '../viewmodels/useGuestCartViewModel';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import DiscountedProductCard from '../components/DiscountedProductCard';

export function CatalogView({ onNavigate }) {
  const { products, loadProducts, loading, error } = useProductsViewModel();
  const { addToCart, itemCount } = useGuestCartViewModel();
  const { isAuthenticated } = useAuthViewModel();
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleReserve = (product) => {
    if (!isAuthenticated) {
      // Invitado: agregar al carrito local
      addToCart(product);
      alert('Producto agregado al carrito. Iniciá sesión para finalizar la compra.');
    } else {
      // Usuario logueado: podría crear orden directa o también usar carrito
      addToCart(product);
      alert('Producto agregado al carrito');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1>Catálogo de Productos</h1>
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
            name={product.name}
            originalPrice={product.originalPrice || product.price}
            discountedPrice={product.discountedPrice || product.discountPrice}
            stock={product.stock || product.quantity}
            expiresAt={product.expiresAt}
            imageUrl={product.imageUrl || product.images?.[0]}
            onReserve={handleReserve}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <p className="no-products">No hay productos disponibles</p>
      )}
    </div>
  );
}
