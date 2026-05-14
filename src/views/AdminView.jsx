// AdminView - View Layer (MVVM Pattern) - Diseño actualizado 2026
import React, { useEffect, useState } from 'react';
import { useProductsViewModel } from '../viewmodels/useProductsViewModel';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

export function AdminView() {
  const { products, loadMyProducts, createProduct, updateProduct, deleteProduct, loading, error } = useProductsViewModel();
  const { user } = useAuthViewModel();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    quantity: '',
    category: 'otros',
    expiresAt: '',
    imageUrl: '',
  });

  useEffect(() => {
    loadMyProducts();
  }, [loadMyProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que discountPrice sea menor que price
    const price = parseFloat(formData.price);
    const discountPrice = parseFloat(formData.discountPrice);
    
    if (discountPrice >= price) {
      alert('El precio con descuento debe ser MENOR al precio original');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: price,
      discountPrice: discountPrice,
      quantity: parseInt(formData.quantity) || 0,
      category: formData.category,
      expiresAt: new Date(formData.expiresAt),
      images: formData.imageUrl ? [formData.imageUrl] : [],
      // NO enviar restaurantId ni restaurantName - el backend lo asigna automáticamente desde el token
    };

    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct._id, productData);
    } else {
      result = await createProduct(productData);
    }

    if (result.success) {
      setIsFormOpen(false);
      setEditingProduct(null);
      resetForm();
      alert('✅ Producto creado exitosamente');
    } else {
      alert('❌ Error: ' + result.error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      quantity: '',
      category: 'otros',
      expiresAt: '',
      imageUrl: '',
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price || product.originalPrice,
      discountPrice: product.discountPrice || product.discountedPrice,
      quantity: product.quantity || product.stock,
      category: product.category || 'otros',
      expiresAt: new Date(product.expiresAt).toISOString().split('T')[0],
      imageUrl: product.images?.[0] || product.imageUrl || '',
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro que querés eliminar este producto?')) {
      const result = await deleteProduct(id);
      if (!result.success) {
        alert('Error al eliminar: ' + result.error);
      }
    }
  };

  return (
    <div className="admin-container">
      <h1>Gestión de productos</h1>

      {loading && <div className="loading">Cargando...</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="admin-layout">
        {/* Formulario */}
        <div className="admin-form-card">
          <h2>➕ Agregar producto</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Pack Pizza Hut"
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows="3"
              />
            </div>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Precio original ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="24990"
                />
              </div>
              <div className="form-group">
                <label>Precio con descuento ($)</label>
                <input
                  type="number"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                  required
                  placeholder="14990"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                placeholder="10"
              />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="panadería">Panadería</option>
                <option value="comida caliente">Comida Caliente</option>
                <option value="bebidas">Bebidas</option>
                <option value="postres">Postres</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fecha de Vencimiento</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>URL de Imagen (opcional)</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary"
              style={{ marginTop: '1rem' }}
            >
              {loading ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear Producto'}
            </button>
          </form>
        </div>

        {/* Lista de productos */}
        <div className="admin-products-list">
          <h2>Productos existentes</h2>
          
          {products.length === 0 && !loading && (
            <div className="empty-state">
              <p>No tenés productos cargados todavía</p>
            </div>
          )}

          {products.map((product) => (
            <div key={product._id || product.id} className="product-card">
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.25rem' }}>{product.name}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0' }}>{product.restaurantName || 'Sin restaurante'}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '0.9rem' }}>${(product.price || product.originalPrice)?.toLocaleString('es-CL')}</span>
                  <span style={{ color: '#16a34a', fontSize: '1.25rem', fontWeight: '700' }}>${(product.discountPrice || product.discountedPrice)?.toLocaleString('es-CL')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <span style={{ background: '#d1fae5', color: '#16a34a', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.85rem', fontWeight: '600' }}>Stock: {product.quantity || product.stock}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(product)} className="btn-edit">
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleDelete(product._id || product.id)} className="btn-delete">
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
