import { render, screen } from '@testing-library/react';
import App from './App';

// Mock de los ViewModels para evitar dependencias complejas
jest.mock('./viewmodels/useAuthViewModel', () => ({
  useAuthViewModel: () => ({
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn()
  })
}));

jest.mock('./viewmodels/useProductsViewModel', () => ({
  useProductsViewModel: () => ({
    products: [],
    loading: false,
    error: null,
    loadProducts: jest.fn(),
    loadMyProducts: jest.fn()
  })
}));

jest.mock('./viewmodels/useGuestCartViewModel', () => ({
  useGuestCartViewModel: () => ({
    cartItems: [],
    total: 0,
    itemCount: 0,
    addToCart: jest.fn(),
    removeFromCart: jest.fn(),
    updateQuantity: jest.fn(),
    clearCart: jest.fn()
  })
}));

describe('App Component', () => {
  test('renderiza el catálogo por defecto', () => {
    render(<App />);
    
    // El catálogo debería renderizarse como vista por defecto
    const catalogTitle = screen.getByText(/Catálogo/i);
    expect(catalogTitle).toBeInTheDocument();
  });

  test('renderiza la navbar con el logo de EcoSavor', () => {
    render(<App />);
    
    // La navbar debería mostrar el nombre de la app
    const brandElement = screen.getByText(/EcoSavor/i);
    expect(brandElement).toBeInTheDocument();
  });
});
