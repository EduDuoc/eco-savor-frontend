// DiscountedProductCard - Componente de producto con descuento (reciclado del compañero)
// Module Pattern: Exporta como módulo reutilizable
import React from 'react';
import './DiscountedProductCard.css';

const DiscountedProductCard = ({
  name,
  originalPrice,
  discountedPrice,
  stock,
  expiresAt,
  imageUrl,
  onReserve,
  isLoading = false,
}) => {
  const discountPct = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  const isLowStock = stock <= 5;
  const isExpiringSoon = new Date(expiresAt) - new Date() < 3_600_000;

  return (
    <article className={`eco-card ${isLowStock ? 'eco-card--low-stock' : ''}`}>
      <div className="eco-card__badge">-{discountPct}%</div>
      {imageUrl && <img src={imageUrl} alt={name} className="eco-card__image" loading="lazy" />}
      <div className="eco-card__body">
        <h3 className="eco-card__name">{name}</h3>
        <div className="eco-card__pricing">
          <span className="eco-card__original">${originalPrice.toFixed(2)}</span>
          <span className="eco-card__discounted">${discountedPrice.toFixed(2)}</span>
        </div>
        <div className="eco-card__meta">
          <span className={`eco-card__stock ${isLowStock ? 'eco-card__stock--critical' : ''}`}>
            {isLowStock ? `⚠ Solo ${stock} restantes` : `${stock} disponibles`}
          </span>
          {isExpiringSoon && <span className="eco-card__expires">Expira pronto!</span>}
        </div>
      </div>
      <button
        className="eco-card__cta"
        onClick={() => onReserve?.({ name, discountedPrice, stock })}
        disabled={isLoading || stock === 0}
        aria-label={`Reservar ${name}`}
      >
        {isLoading ? 'Reservando...' : stock === 0 ? 'Agotado' : 'Reservar ahora'}
      </button>
    </article>
  );
};

export default DiscountedProductCard;
