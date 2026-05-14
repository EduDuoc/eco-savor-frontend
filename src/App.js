// App.js - Punto de entrada principal
// Implementa los 3 patrones de Frontend:
// 1. Module Pattern: Importa desde modules/index.js
// 2. MVVM: Usa ViewModels + Views separadas
// 3. Observer Pattern: AppContext para estado global

import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext, useAuthViewModel } from './modules';
import { Navbar, LoginView, RegisterView, CatalogView, AdminView, RestaurantOrdersView, MyOrdersView, CartView, SuccessView } from './modules';
import './App.css';
import './styles/new-design.css';

// Componente principal que usa el contexto (Observer Pattern)
function AppContent() {
  const { state } = useAppContext();
  const { isAuthenticated, user, logout } = useAuthViewModel();
  const [currentView, setCurrentView] = useState('catalog'); // Por defecto catálogo (invitado)
  const [successOrderData, setSuccessOrderData] = useState(null);

  // Escuchar evento de auth fallida (token expirado) desde api.js
  useEffect(() => {
    const handleAuthFailed = () => {
      logout();
      setCurrentView('login');
      alert('Tu sesión expiró. Por favor, iniciá sesión nuevamente.');
    };

    window.addEventListener('auth-failed', handleAuthFailed);
    return () => window.removeEventListener('auth-failed', handleAuthFailed);
  }, [logout]);

  // Redirigir según estado de autenticación (solo para login/register)
  useEffect(() => {
    // Si está logueado y está en login/register, ir al catálogo
    if (isAuthenticated && (currentView === 'login' || currentView === 'register')) {
      setCurrentView(user?.role === 'restaurant' ? 'restaurant-orders' : 'catalog');
    }
  }, [isAuthenticated, user, currentView]);

  // Renderizar la vista actual
  const renderView = () => {
    // Login y Register no muestran Navbar ni main-content (tienen su propio layout completo)
    if (currentView === 'login' || currentView === 'register') {
      switch (currentView) {
        case 'login':
          return <LoginView onNavigate={setCurrentView} />;
        case 'register':
          return <RegisterView onNavigate={setCurrentView} />;
        default:
          return null;
      }
    }
    
    // Las demás vistas sí muestran Navbar
    switch (currentView) {
      case 'catalog':
        return <CatalogView onNavigate={setCurrentView} />;
      case 'admin':
        return <AdminView />;
      case 'restaurant-orders':
        return <RestaurantOrdersView />;
      case 'orders':
        return <MyOrdersView />;
      case 'cart':
        return <CartView onNavigate={setCurrentView} onSuccess={(orderData) => {
          setSuccessOrderData(orderData);
          setCurrentView('success');
        }} />;
      case 'success':
        return <SuccessView onNavigate={setCurrentView} orderData={successOrderData} />;
      default:
        return <CatalogView onNavigate={setCurrentView} />;
    }
  };

  // Login y Register no usan la estructura con Navbar
  if (currentView === 'login' || currentView === 'register') {
    return (
      <div className="app">
        {renderView()}
      </div>
    );
  }
  
  // SuccessView tiene layout especial
  if (currentView === 'success') {
    return (
      <div className="app">
        <Navbar currentView={currentView} onNavigate={setCurrentView} />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {renderView()}
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar currentView={currentView} onNavigate={setCurrentView} />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

// App root con Provider (Observer Pattern)
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
