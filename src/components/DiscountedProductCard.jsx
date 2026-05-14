// DiscountedProductCard - Componente de producto con descuento (reciclado del compañero)
// Module Pattern: Exporta como módulo reutilizable
import React from 'react';
import './DiscountedProductCard.css';

const DiscountedProductCard = ({
  product,
  onReserve,
  isLoading = false,
}) => {
  const {
    name,
    originalPrice,
    price,
    discountedPrice,
    discountPrice,
    stock,
    quantity,
    expiresAt,
    imageUrl,
    images,
    restaurantName,
  } = product;

  const displayPrice = originalPrice || price || 0;
  const displayDiscountPrice = discountedPrice || discountPrice || 0;
  const displayStock = stock || quantity || 0;

  const discountPct = Math.round(((displayPrice - displayDiscountPrice) / displayPrice) * 100);
  const isLowStock = displayStock <= 5;
  const isExpiringSoon = expiresAt && (new Date(expiresAt) - new Date() < 3_600_000);

  return (
    <article className={`eco-card ${isLowStock ? 'eco-card--low-stock' : ''}`}>
      <div className="eco-card__badge">-{discountPct}%</div>
      {imageUrl && <img src={imageUrl} alt={name} className="eco-card__image" loading="lazy" />}
      <div className="eco-card__body">
        <h3 className="eco-card__name">{name}</h3>
        {restaurantName && (
          <p className="eco-card__restaurant">
            🏪 {restaurantName}
          </p>
        )}
        <div className="eco-card__pricing">
          <span className="eco-card__original">${displayPrice.toFixed(2)}</span>
          <span className="eco-card__discounted">${displayDiscountPrice.toFixed(2)}</span>
        </div>
        <div className="eco-card__meta">
          <span className={`eco-card__stock ${isLowStock ? 'eco-card__stock--critical' : ''}`}>
            {isLowStock ? `⚠ Solo ${displayStock} restantes` : `${displayStock} disponibles`}
          </span>
          {isExpiringSoon && <span className="eco-card__expires">Expira pronto!</span>}
        </div>
      </div>
      <button
        className="eco-card__cta"
        onClick={() => onReserve?.(product)}
        disabled={isLoading || displayStock === 0}
        aria-label={`Reservar ${name}`}
      >
        {isLoading ? 'Reservando...' : displayStock === 0 ? 'Agotado' : 'Reservar ahora'}
      </button>
    </article>
  );
};

export default DiscountedProductCard;
