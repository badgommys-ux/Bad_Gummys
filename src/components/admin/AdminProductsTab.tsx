import React, { useState } from 'react';
import { Product } from '../../types';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Flame, 
  Sparkles, 
  DollarSign, 
  Box, 
  Check, 
  X, 
  Save, 
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface AdminProductsTabProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  
  // Modal for new product
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Enchiladas');
  const [newProductPrice, setNewProductPrice] = useState(85);
  const [newProductOriginalPrice, setNewProductOriginalPrice] = useState(99);
  const [newProductWeight, setNewProductWeight] = useState('250g');
  const [newProductStock, setNewProductStock] = useState(200);
  const [newProductSpice, setNewProductSpice] = useState('🌶️🌶️🌶️ Picor Medio');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductBadge, setNewProductBadge] = useState('Artesanal');
  const [newProductImage, setNewProductImage] = useState(products[0]?.image || '');

  // Modal for editing product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editOriginalPrice, setEditOriginalPrice] = useState(0);
  const [editStock, setEditStock] = useState(0);
  const [editWeight, setEditWeight] = useState('');
  const [editSpice, setEditSpice] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editBadge, setEditBadge] = useState('');

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setEditPrice(p.price);
    setEditOriginalPrice(p.originalPrice || Math.round(p.price * 1.15));
    setEditStock(p.stock);
    setEditWeight(p.weight);
    setEditSpice(p.spiceLabel);
    setEditDesc(p.description);
    setEditBadge(p.badge || 'Artesanal');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const updated: Product = {
      ...editingProduct,
      price: Number(editPrice),
      originalPrice: Number(editOriginalPrice),
      stock: Number(editStock),
      weight: editWeight.trim() || '250g',
      spiceLabel: editSpice.trim(),
      description: editDesc.trim(),
      badge: editBadge.trim(),
    };
    onUpdateProduct?.(updated);
    setEditingProduct(null);
  };

  const handleQuickStockAdjust = (p: Product, delta: number) => {
    const updated: Product = {
      ...p,
      stock: Math.max(0, p.stock + delta),
    };
    onUpdateProduct?.(updated);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newProductName.trim(),
      category: newProductCategory,
      price: Number(newProductPrice),
      originalPrice: Number(newProductOriginalPrice),
      weight: newProductWeight.trim() || '250g',
      stock: Number(newProductStock),
      spiceLabel: newProductSpice.trim(),
      badge: newProductBadge.trim() || 'Artesanal',
      description: newProductDesc.trim() || 'Deliciosa receta artesanal de gomitas BadGommys bañadas en chamoy casero.',
      image: newProductImage || products[0]?.image || '',
      isFavorite: false,
    };

    onAddProduct(newProd);
    setIsAddingProduct(false);
    setNewProductName('');
    setNewProductDesc('');
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term);
    const matchesCat = categoryFilter === 'Todos' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalStockAll = products.reduce((sum, p) => sum + p.stock, 0);
  const totalCatalogValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);
  const categoriesList = ['Todos', 'Enchiladas', 'Ácidas', 'Dulces', 'Combos', 'Edición Fuego'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Catálogo Artesanal & Inventario</span>
            <span className="text-xs font-black bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full">
              {products.length} Variedades
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Control de existencias de alta rotación, precios al público, gramajes y publicación de nuevas recetas.
          </p>
        </div>

        <button
          onClick={() => setIsAddingProduct(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total de Variedades</span>
            <div className="text-2xl font-black text-white mt-1">{products.length} SKUs</div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">Recetas Activas</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Stock en Almacén</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{totalStockAll.toLocaleString()} pzas</div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">Nivel Comercial Óptimo</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Box className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Valor del Inventario</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">${totalCatalogValue.toLocaleString()} <span className="text-xs text-zinc-500">MXN</span></div>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">A precio de venta</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Líneas de Sabor</span>
            <div className="text-2xl font-black text-purple-400 mt-1">5 Familias</div>
            <p className="text-[11px] text-purple-300 font-semibold mt-0.5">Chamoy, Ácidas, Dulces</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121218] border border-zinc-800/80 p-4 rounded-3xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre de producto o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#181824] border border-zinc-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-[#181824] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 flex flex-col justify-between space-y-3 shadow-xl hover:border-zinc-700 transition-all">
            
            {/* Image & Stock Badge */}
            <div className="h-40 rounded-2xl overflow-hidden bg-black relative group">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              
              <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white border border-white/10">
                {p.category}
              </div>

              <div className="absolute top-2 right-2 bg-black/85 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-black text-amber-400 border border-amber-500/30">
                {p.stock} pzas
              </div>

              {p.badge && (
                <div className="absolute bottom-2 left-2 bg-red-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {p.badge}
                </div>
              )}
            </div>

            {/* Title & Info */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">{p.weight}</span>
                <span className="text-[10px] text-amber-400 font-bold">{p.spiceLabel}</span>
              </div>
              <h4 className="font-black text-white text-sm line-clamp-1">{p.name}</h4>
              <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{p.description}</p>
              
              <div className="pt-2 flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-white">${p.price} <span className="text-xs text-zinc-400">MXN</span></span>
                  {p.originalPrice && p.originalPrice > p.price && (
                    <span className="text-xs text-zinc-500 line-through">${p.originalPrice}</span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">✓ En stock</span>
              </div>
            </div>

            {/* Quick stock buttons */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-zinc-500 font-bold mr-1">Ajustar:</span>
                <button
                  onClick={() => handleQuickStockAdjust(p, 50)}
                  className="px-2 py-0.5 bg-zinc-800 hover:bg-emerald-900/60 text-emerald-400 rounded-md font-bold text-[10px] cursor-pointer"
                  title="Añadir 50 piezas"
                >
                  +50
                </button>
                <button
                  onClick={() => handleQuickStockAdjust(p, 10)}
                  className="px-2 py-0.5 bg-zinc-800 hover:bg-emerald-900/60 text-emerald-400 rounded-md font-bold text-[10px] cursor-pointer"
                  title="Añadir 10 piezas"
                >
                  +10
                </button>
                <button
                  onClick={() => handleQuickStockAdjust(p, -5)}
                  className="px-2 py-0.5 bg-zinc-800 hover:bg-red-900/60 text-red-400 rounded-md font-bold text-[10px] cursor-pointer"
                  title="Restar 5 piezas"
                >
                  -5
                </button>
              </div>

              {/* Edit and Delete Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg cursor-pointer"
                  title="Editar Producto"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`¿Seguro que deseas eliminar "${p.name}" del catálogo?`)) {
                      onDeleteProduct(p.id);
                    }
                  }}
                  className="p-1.5 bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 rounded-lg cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL: EDIT PRODUCT */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Editar {editingProduct.name}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Precio al Público ($ MXN)</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Precio Anterior / Lista ($)</label>
                  <input
                    type="number"
                    value={editOriginalPrice}
                    onChange={(e) => setEditOriginalPrice(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-zinc-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Stock en Almacén (Piezas)</label>
                  <input
                    type="number"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Gramaje / Peso</label>
                  <input
                    type="text"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Nivel de Picante</label>
                  <input
                    type="text"
                    value={editSpice}
                    onChange={(e) => setEditSpice(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Etiqueta / Badge</label>
                  <input
                    type="text"
                    value={editBadge}
                    onChange={(e) => setEditBadge(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Descripción del Producto</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Producto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW PRODUCT */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Crear y Publicar Nuevo Producto</h3>
              <button onClick={() => setIsAddingProduct(false)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Bolitas de Sandía con Chamoy y Chile"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Categoría</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="Enchiladas">Enchiladas</option>
                    <option value="Ácidas">Ácidas</option>
                    <option value="Dulces">Dulces</option>
                    <option value="Combos">Combos</option>
                    <option value="Edición Fuego">Edición Fuego</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Precio (MXN)</label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Stock Inicial (Piezas)</label>
                  <input
                    type="number"
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Gramaje / Peso</label>
                  <input
                    type="text"
                    value={newProductWeight}
                    onChange={(e) => setNewProductWeight(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Nivel de Picor</label>
                  <input
                    type="text"
                    value={newProductSpice}
                    onChange={(e) => setNewProductSpice(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Badge Especial</label>
                  <input
                    type="text"
                    value={newProductBadge}
                    onChange={(e) => setNewProductBadge(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Descripción Artesanal</label>
                <textarea
                  rows={2}
                  placeholder="Detalla los ingredientes y la experiencia de sabor..."
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Publicar en Tienda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
