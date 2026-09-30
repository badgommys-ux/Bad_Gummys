import React, { useState } from 'react';
import { X, Flame, Sparkles, ShoppingBag, Check, ShieldCheck, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#14141c] border border-zinc-800 max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl relative text-white animate-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image */}
          <div className="relative h-64 md:h-full bg-black">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                {product.badge}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-800/40">
                  {product.category}
                </span>
                <span className="text-xs font-bold text-zinc-400">
                  {product.weight}
                </span>
              </div>

              <h2 className="text-2xl font-black text-white leading-tight">
                {product.name}
              </h2>

              <div className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 fill-red-500" />
                <span>{product.spiceLabel}</span>
              </div>

              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                {product.description}
              </p>

              {/* Ingredients */}
              {product.ingredients && (
                <div className="pt-2 border-t border-zinc-800">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Ingredientes Principales:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.ingredients.map((ing, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price & Add to Cart */}
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-black text-white">${product.price}</span>
                  <span className="text-xs font-bold text-zinc-500 ml-1">MXN</span>
                </div>
                {product.originalPrice && (
                  <span className="text-xs text-zinc-500 line-through">
                    ${product.originalPrice} MXN
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#1c1c24] border border-zinc-700 rounded-xl px-3 py-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="text-zinc-400 hover:text-white px-1 cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="text-zinc-400 hover:text-white px-1 cursor-pointer font-bold"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={added}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>¡Añadido al Carrito!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Añadir al Carrito (${product.price * quantity} MXN)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
