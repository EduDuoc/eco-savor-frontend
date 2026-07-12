// DiscountedProductCard - Componente de producto con descuento - Diseño actualizado 2026
import React from 'react';
import './DiscountedProductCard.css';
import { getEmojiForProduct } from '../utils/productDisplay';

const DiscountedProductCard = ({
  product,
  onReserve,
  isLoading = false,
  hideReserveButton = false,
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
    category,
  } = product;

  const displayPrice = originalPrice || price || 0;
  const displayDiscountPrice = discountedPrice || discountPrice || 0;
  const displayStock = stock || quantity || 0;
  const displayImageUrl = images?.[0] || imageUrl;

  const discountPct = Math.round(((displayPrice - displayDiscountPrice) / displayPrice) * 100);
  const isLowStock = displayStock <= 5;
  
  // Formatear fecha de vencimiento
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };
  
  const expiresDate = formatDate(expiresAt);
  const isExpiringSoon = expiresAt && (new Date(expiresAt) - new Date() < 3_600_000 * 24 * 2);

  const productEmoji = getEmojiForProduct(name, category);

  return (
    <article className={`eco-card ${isLowStock ? 'eco-card--low-stock' : ''}`}>
      <div className="eco-card__badge">-{discountPct}%</div>
      
      <div className="eco-card__image-wrapper">
        {displayImageUrl ? (
          <img src={displayImageUrl} alt={name} className="eco-card__image" loading="lazy" />
        ) : (
          <span className="eco-card__emoji">{productEmoji}</span>
        )}
      </div>
      
      <div className="eco-card__body">
        <h3 className="eco-card__name">{name}</h3>
        
        <div className="eco-card__pricing">
          <span className="eco-card__original">${displayPrice.toLocaleString('es-CL')}</span>
          <span className="eco-card__discounted">${displayDiscountPrice.toLocaleString('es-CL')}</span>
        </div>
        
        {restaurantName && (
          <span className="eco-card__store">
            {restaurantName}
          </span>
        )}
        
        <div className="eco-card__meta">
          <span className={`eco-card__stock ${isLowStock ? 'eco-card__stock--critical' : ''}`}>
            Stock: {displayStock}
          </span>
          {expiresDate && (
            <span className={`eco-card__expires ${isExpiringSoon ? 'eco-card__expires--urgent' : ''}`}>
              Vence: {expiresDate}
            </span>
          )}
        </div>
        
        {!hideReserveButton && (
          <button
            className="eco-card__cta"
            onClick={() => onReserve?.(product)}
            disabled={isLoading || displayStock === 0}
          >
            + Agregar
          </button>
        )}
      </div>
    </article>
  );
};

export default DiscountedProductCard;
