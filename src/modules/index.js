// Module Pattern - Exporta módulos reutilizables

// Context (Observer Pattern)
export { AppProvider, useAppContext, AppContext } from '../context/AppContext';

// ViewModels (MVVM Pattern)
export { useAuthViewModel } from '../viewmodels/useAuthViewModel';
export { useProductsViewModel } from '../viewmodels/useProductsViewModel';
export { useOrdersViewModel } from '../viewmodels/useOrdersViewModel';
export { useGuestCartViewModel } from '../viewmodels/useGuestCartViewModel';

// Components (Views)
export { LoginView } from '../views/LoginView';
export { RegisterView } from '../views/RegisterView';
export { CatalogView } from '../views/CatalogView';
export { AdminView } from '../views/AdminView';
export { RestaurantOrdersView } from '../views/RestaurantOrdersView';
export { MyOrdersView } from '../views/MyOrdersView';
export { CartView } from '../views/CartView';
export { Navbar } from '../views/Navbar';

// Componentes compartidos (reciclados del compañero)
export { default as DiscountedProductCard } from '../components/DiscountedProductCard';
