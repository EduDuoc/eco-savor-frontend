/**
 * Tests unitarios para DiscountedProductCard.
 * Bug: el backend real solo manda `images: [String]`, nunca `imageUrl`,
 * pero el componente sólo miraba `imageUrl` y por eso la imagen nunca se mostraba.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import DiscountedProductCard from '../components/DiscountedProductCard';

const baseProduct = {
  name: 'Pack Pizza',
  originalPrice: 10000,
  discountedPrice: 5000,
  stock: 3,
};

describe('DiscountedProductCard — imagen del producto', () => {
  it('muestra la imagen usando images[0] cuando el backend manda el array images', () => {
    const product = { ...baseProduct, images: ['https://cdn.test/pizza.jpg'] };
    render(<DiscountedProductCard product={product} />);

    const img = screen.getByAltText('Pack Pizza');
    expect(img).toHaveAttribute('src', 'https://cdn.test/pizza.jpg');
  });

  it('usa imageUrl como fallback si no hay images', () => {
    const product = { ...baseProduct, imageUrl: 'https://cdn.test/fallback.jpg' };
    render(<DiscountedProductCard product={product} />);

    const img = screen.getByAltText('Pack Pizza');
    expect(img).toHaveAttribute('src', 'https://cdn.test/fallback.jpg');
  });

  it('muestra el emoji por defecto si no hay ni images ni imageUrl', () => {
    render(<DiscountedProductCard product={baseProduct} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
