// AdminView - View Layer (MVVM Pattern) - Vista de administrador (restaurantes)
import React, { useEffect, useState } from 'react';
import { useProductsViewModel } from '../viewmodels/useProductsViewModel';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';

export function AdminView() {
  const { products, loadProducts, loadMyProducts, createProduct, updateProduct, deleteProduct, loading, error } = useProductsViewModel();
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
      alert('Producto creado exitosamente');
    } else {
      alert('Error: ' + result.error);
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
      <div className="admin-header">
        <h1>Gestión de Productos</h1>
        <button onClick={() => setIsFormOpen(true)} className="btn-primary">
          + Nuevo Producto
        </button>
      </div>

      {loading && <div className="loading">Cargando...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {products.length === 0 && !loading && (
        <div className="empty-state">
          <p>No tenés productos cargados todavía</p>
          <button onClick={() => setIsFormOpen(true)} className="btn-primary">
            + Crear tu primer producto
          </button>
        </div>
      )}

      {/* Formulario Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Precio Original:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Precio con Descuento:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock/Cantidad:</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoría:</label>
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
              </div>
              <div className="form-group">
                <label>Fecha de Vencimiento:</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>URL de Imagen:</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de productos */}
      <table className="products-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Vencimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id || product.id}>
              <td>{product.name}</td>
              <td>${product.discountPrice || product.discountedPrice}</td>
              <td>{product.quantity || product.stock}</td>
              <td>{product.category}</td>
              <td>{new Date(product.expiresAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleEdit(product)} className="btn-small">Editar</button>
                <button onClick={() => handleDelete(product._id || product.id)} className="btn-small btn-danger">
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
