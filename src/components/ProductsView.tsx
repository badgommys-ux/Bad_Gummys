import React, { useState, useMemo } from 'react';
import { ShoppingBag, Search, Filter, Flame, Sparkles, Check, Eye, X, Plus, Minus, ArrowUpDown } from 'lucide-react';
import { Product } from '../types';

interface ProductsViewProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onOpenQuickView?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onAddToCart,
  onOpenQuickView,
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const categories = ['Todas', 'Enchiladas', 'Ácidas', 'Dulces', 'Combos', 'Edición Fuego'];

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(20, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const handleAdd = (product: Product) => {
    const qty = quantities[product.id] || 1;
    onAddToCart(product, qty);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory =
          selectedCategory === 'Todas' || p.category === selectedCategory;
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="py-12 bg-[#0d0d11] min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-700/40 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Flame className="w-3.5 h-3.5 fill-red-500" />
            Catálogo Oficial BadGommys
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-display">
            Todos Nuestros <span className="text-red-500">Productos</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-2">
            Elige tus gomitas favoritas bañadas en nuestra salsa chamoy artesanal o disfruta de nuestras variedades ácidas y dulces.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#14141c] p-4 sm:p-6 rounded-3xl border border-zinc-800 shadow-xl mb-10 space-y-4">
          
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por gomita, chamoy, ácido..."
                className="w-full bg-[#1c1c24] border border-zinc-700 text-white rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-zinc-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <ArrowUpDown className="w-4 h-4 text-zinc-400" />
              <span className="text-xs text-zinc-400 font-semibold hidden sm:inline">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#1c1c24] border border-zinc-700 text-zinc-200 text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="default">Destacados</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
              </select>
            </div>

          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-zinc-800/80">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-[#1c1c24] text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-[#14141c] rounded-3xl border border-zinc-800">
            <p className="text-4xl mb-3">🍬</p>
            <h3 className="text-xl font-bold text-white mb-1">No encontramos productos</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Intenta con otro término de búsqueda o selecciona otra categoría.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Todas');
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => {
              const isAdded = addedIds[product.id];
              const qty = quantities[product.id] || 1;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-[#14141c] rounded-3xl overflow-hidden border border-zinc-800/80 hover:border-red-600/50 transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)]"
                >
                  {/* Image Container */}
                  <div className="relative h-60 w-full overflow-hidden bg-zinc-950">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14141c] via-transparent to-black/20" />

                    {/* Badge */}
                    {product.badge && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                        {product.badge}
                      </div>
                    )}

                    {/* Weight pill */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-zinc-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/10">
                      {product.weight}
                    </div>

                    {/* Quick view button */}
                    <button
                      onClick={() => {
                        if (onSelectProduct) onSelectProduct(product);
                        else if (onOpenQuickView) onOpenQuickView(product);
                      }}
                      className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg"
                      title="Vista rápida del producto"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Meta header */}
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-amber-400">
                          {product.spiceLabel}
                        </span>
                        <span className="text-zinc-500 text-[11px]">
                          Stock: {product.stock} pzas
                        </span>
                      </div>

                      <h3 className="font-black text-lg text-white group-hover:text-red-400 transition-colors leading-snug">
                        {product.name}
                      </h3>

                      <p className="text-zinc-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Price, Quantity Selector and Add Button */}
                    <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-2xl font-black text-white">${product.price}</span>
                          <span className="text-xs font-semibold text-zinc-500 ml-1">MXN</span>
                        </div>
                        {product.originalPrice && (
                          <span className="text-xs text-zinc-500 line-through">
                            ${product.originalPrice} MXN
                          </span>
                        )}
                      </div>

                      {/* Quantity counter + Add to cart */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-[#1e1e28] border border-zinc-700/60 rounded-xl px-2 py-1">
                          <button
                            onClick={() => handleQuantityChange(product.id, -1)}
                            className="text-zinc-400 hover:text-white p-1 cursor-pointer"
                            title="Restar cantidad"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-bold text-xs text-white">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(product.id, 1)}
                            className="text-zinc-400 hover:text-white p-1 cursor-pointer"
                            title="Sumar cantidad"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          id={`product-add-${product.id}`}
                          onClick={() => handleAdd(product)}
                          disabled={isAdded || product.stock === 0}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 active:scale-95'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>¡Añadido!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              <span>Añadir al Carrito</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
