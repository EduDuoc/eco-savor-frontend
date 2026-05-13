// App.js - Punto de entrada principal
// Implementa los 3 patrones de Frontend:
// 1. Module Pattern: Importa desde modules/index.js
// 2. MVVM: Usa ViewModels + Views separadas
// 3. Observer Pattern: AppContext para estado global

import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext, useAuthViewModel } from './modules';
import { Navbar, LoginView, RegisterView, CatalogView, AdminView, MyOrdersView, CartView } from './modules';
import './App.css';

// Componente principal que usa el contexto (Observer Pattern)
function AppContent() {
  const { state } = useAppContext();
  const { isAuthenticated, user } = useAuthViewModel();
  const [currentView, setCurrentView] = useState('catalog'); // Por defecto catálogo (invitado)

  // Redirigir según estado de autenticación (solo para login/register)
  useEffect(() => {
    // Si está logueado y está en login/register, ir al catálogo
    if (isAuthenticated && (currentView === 'login' || currentView === 'register')) {
      setCurrentView(user?.role === 'restaurant' ? 'admin' : 'catalog');
    }
  }, [isAuthenticated, user, currentView]);

  // Renderizar la vista actual
  const renderView = () => {
    switch (currentView) {
      case 'login':
        return <LoginView onNavigate={setCurrentView} />;
      case 'register':
        return <RegisterView onNavigate={setCurrentView} />;
      case 'catalog':
        return <CatalogView onNavigate={setCurrentView} />;
      case 'admin':
        return <AdminView />;
      case 'orders':
        return <MyOrdersView />;
      case 'cart':
        return <CartView onNavigate={setCurrentView} />;
      default:
        return <CatalogView onNavigate={setCurrentView} />;
    }
  };

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
