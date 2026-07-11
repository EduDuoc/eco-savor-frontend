// Utilidades de presentación de productos (compartidas entre vistas/componentes)

// Obtener emoji según categoría o nombre del producto.
// Versión más completa (categoría + palabras clave de nombre), usada como
// fuente única de verdad para evitar reimplementaciones divergentes.
export function getEmojiForProduct(name, category) {
  const nameLower = name?.toLowerCase() || '';
  const categoryLower = category?.toLowerCase() || '';

  if (categoryLower === 'panadería') return '🍞';
  if (categoryLower === 'bebidas') return '🥤';
  if (categoryLower === 'postres') return '🍰';
  if (categoryLower === 'comida caliente') return '🍲';

  if (nameLower.includes('tomate') || nameLower.includes('manzana') || nameLower.includes('fruta')) return '🍎';
  if (nameLower.includes('palta') || nameLower.includes('aguacate')) return '🥑';
  if (nameLower.includes('zanahoria')) return '🥕';
  if (nameLower.includes('pizza')) return '🍕';
  if (nameLower.includes('sushi')) return '🍣';
  if (nameLower.includes('burger') || nameLower.includes('hamburguesa')) return '🍔';
  if (nameLower.includes('pan')) return '🍞';
  if (nameLower.includes('ensalada')) return '🥗';

  return '🥡'; // Default
}
