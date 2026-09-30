import React, { useState } from 'react';
import { ShoppingBag, Flame, Sparkles, Check, ArrowRight, Eye } from 'lucide-react';
import { Product } from '../types';

interface FavoritesSectionProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onViewAllProducts: () => void;
  onQuickView?: (product: Product) => void;
}

export const FavoritesSection: React.FC<FavoritesSectionProps> = ({
  products,
  onAddToCart,
  onViewAllProducts,
  onQuickView,
}) => {
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Filter top favorite products
  const favoriteProducts = products.filter((p) => p.isFavorite).slice(0, 4);

  const handleAdd = (product: Product) => {
    onAddToCart(product, 1);
    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <section className="py-20 bg-[#0d0d11] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-700/40 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Flame className="w-3.5 h-3.5 fill-red-500" />
              Los Más Pedidos por la Comunidad
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display">
              Favoritos del <span className="text-red-500">Cliente</span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base mt-2 max-w-xl">
              Las recetas y combinaciones que nuestros clientes repiten una y otra vez. ¡Pídelas antes de que se agoten!
            </p>
          </div>

          <button
            id="fav-view-all-btn"
            onClick={onViewAllProducts}
            className="inline-flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 hover:gap-3 transition-all cursor-pointer group self-start md:self-auto"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="w-4 h-4 text-red-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {favoriteProducts.map((product) => {
            const isAdded = addedIds[product.id];
            return (
              <div
                key={product.id}
                className="group flex flex-col bg-[#14141c] rounded-3xl overflow-hidden border border-zinc-800/80 hover:border-red-600/50 transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-[0_10px_30px_rgba(220,38,38,0.2)]"
              >
                {/* Image & Badge Container */}
                <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-zinc-950">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14141c] via-transparent to-black/20" />
                  
                  {/* Top Badge */}
                  {product.badge && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <span>{product.badge}</span>
                    </div>
                  )}

                  {/* Weight pill */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-zinc-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/10">
                    {product.weight}
                  </div>

                  {/* Quick View trigger */}
                  {onQuickView && (
                    <button
                      onClick={() => onQuickView(product)}
                      className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg"
                      title="Ver detalles rápidos"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Spice Level Indicator */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <span className="font-semibold text-amber-400 flex items-center gap-1">
                        {product.spiceLabel}
                      </span>
                      <span className="text-zinc-500 text-[11px]">Stock: {product.stock}</span>
                    </div>

                    <h3 className="font-black text-lg text-white group-hover:text-red-400 transition-colors leading-snug">
                      {product.name}
                    </h3>

                    <p className="text-zinc-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Pricing & Add to Cart button */}
                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-white">${product.price}</span>
                        <span className="text-xs font-semibold text-zinc-500">MXN</span>
                      </div>
                      {product.originalPrice && (
                        <span className="text-xs text-zinc-500 line-through">
                          ${product.originalPrice} MXN
                        </span>
                      )}
                    </div>

                    <button
                      id={`fav-add-btn-${product.id}`}
                      onClick={() => handleAdd(product)}
                      disabled={isAdded || product.stock === 0}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 active:scale-95'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>¡Listo!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Añadir</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
