/**
 * Tests unitarios para Module Pattern — verifica que todas las exportaciones
 * del módulo central existan y sean del tipo esperado (función/objeto).
 */

describe('Module Pattern — src/modules/index.js', () => {
  it('exporta AppProvider (función)', () => {
    const { AppProvider } = require('../modules');
    expect(typeof AppProvider).toBe('function');
  });

  it('exporta useAppContext (función)', () => {
    const { useAppContext } = require('../modules');
    expect(typeof useAppContext).toBe('function');
  });

  it('exporta AppContext (objeto)', () => {
    const { AppContext } = require('../modules');
    expect(AppContext).toBeDefined();
    expect(AppContext.Provider).toBeDefined();
  });

  it('exporta todos los ViewModels', () => {
    const mods = require('../modules');
    expect(typeof mods.useAuthViewModel).toBe('function');
    expect(typeof mods.useProductsViewModel).toBe('function');
    expect(typeof mods.useOrdersViewModel).toBe('function');
    expect(typeof mods.useGuestCartViewModel).toBe('function');
  });

  it('exporta todos los Views como funciones (componentes React)', () => {
    const mods = require('../modules');
    const views = [
      'LoginView', 'RegisterView', 'CatalogView', 'AdminView',
      'RestaurantOrdersView', 'MyOrdersView', 'CartView',
      'Navbar', 'SuccessView',
    ];
    views.forEach(view => {
      expect(typeof mods[view]).toBe('function');
    });
  });

  it('exporta DiscountedProductCard (función)', () => {
    const { DiscountedProductCard } = require('../modules');
    expect(typeof DiscountedProductCard).toBe('function');
  });
});
