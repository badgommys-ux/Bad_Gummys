import React, { useState } from 'react';
import { 
  ShoppingBag, Plus, Minus, Trash2, ArrowLeft, ShieldCheck, Tag, Check, ArrowRight, 
  Truck, CreditCard, Lock, AlertCircle, Building2, Store, Banknote, Copy, MapPin, 
  Clock, Info, Sparkles, CheckCircle2, ChevronRight, HelpCircle, FileText
} from 'lucide-react';
import { CartItem, User, Order, PaymentMethod, OrderPaymentDetails } from '../types';

interface CartViewProps {
  items: CartItem[];
  currentUser: User | null;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onContinueShopping: () => void;
  onRequireAuth: () => void;
  onCreateOrder: (orderData: Partial<Order>) => Order;
  onOrderCompleted: (order: Order) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  items,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onContinueShopping,
  onRequireAuth,
  onCreateOrder,
  onOrderCompleted,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Checkout Form states
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(currentUser?.address || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [paymentType, setPaymentType] = useState<'tarjeta' | 'transferencia' | 'efectivo'>('tarjeta');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Credit / Debit Card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(currentUser?.name?.toUpperCase() || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [cardError, setCardError] = useState('');

  // SPEI Transfer states
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [speiTrackingRef, setSpeiTrackingRef] = useState('');
  const [speiConcept] = useState(() => `BG-${Math.floor(1000 + Math.random() * 9000)}`);

  // Cash Options states
  const [cashOption, setCashOption] = useState<'oxxo' | 'tienda_oficial' | 'contra_entrega'>('oxxo');
  const [cashChangeFor, setCashChangeFor] = useState('');
  const [oxxoReference] = useState('9384 1029 4820 1932');
  const [pickupCode] = useState(() => `RET-${Math.floor(1000 + Math.random() * 9000)}`);

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = Math.round((subtotal * discountPercent) / 100);
  const freeShippingThreshold = 350;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 49;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'GOMMY10' || code === 'BADGOMMYS') {
      setDiscountPercent(10);
      setCouponApplied(true);
    } else if (code === 'BIENVENIDO15') {
      setDiscountPercent(15);
      setCouponApplied(true);
    } else if (code === 'FUEGO' || code === 'FUEGO20') {
      setDiscountPercent(20);
      setCouponApplied(true);
    } else {
      try {
        const saved = localStorage.getItem('badgommys_email_campaigns');
        if (saved) {
          const campaigns = JSON.parse(saved);
          const matched = campaigns.find(
            (c: { discountCode?: string; discountPercent?: number }) =>
              c.discountCode && c.discountCode.trim().toUpperCase() === code
          );
          if (matched) {
            setDiscountPercent(matched.discountPercent || 15);
            setCouponApplied(true);
            return;
          }
        }
      } catch {
        // ignore
      }
      setCouponError('Cupón no válido. Prueba con: BIENVENIDO15 o GOMMY10');
    }
  };

  const handleStartCheckout = () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    // Pre-populate address if available
    if (!shippingAddress && currentUser.address) {
      setShippingAddress(currentUser.address);
    }
    if (!phone && currentUser.phone) {
      setPhone(currentUser.phone);
    }
    if (!cardHolder && currentUser.name) {
      setCardHolder(currentUser.name.toUpperCase());
    }
    setCardError('');
    setIsCheckingOut(true);
  };

  const copyToClipboard = (text: string, fieldKey: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // ignore
    }
    setCopiedField(fieldKey);
    setTimeout(() => {
      setCopiedField(null);
    }, 2200);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
    if (cardError) setCardError('');
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
    if (cardError) setCardError('');
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(raw);
    if (cardError) setCardError('');
  };

  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'American Express';
    return 'Tarjeta Bancaria';
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    if (!shippingAddress.trim() && cashOption !== 'tienda_oficial') {
      setCardError('Por favor introduce tu dirección de entrega en CDMX.');
      return;
    }

    // Card validation
    if (paymentType === 'tarjeta') {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        setCardError('Por favor ingresa un número de tarjeta válido (16 dígitos).');
        return;
      }
      if (!cardHolder.trim()) {
        setCardError('Por favor ingresa el nombre del titular como aparece en la tarjeta.');
        return;
      }
      if (cardExpiry.length < 5) {
        setCardError('Por favor ingresa una fecha de expiración válida (MM/AA).');
        return;
      }
      if (cardCvv.length < 3) {
        setCardError('Por favor ingresa los 3 o 4 dígitos de seguridad (CVV).');
        return;
      }
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      let finalPaymentMethod: PaymentMethod = 'Tarjeta de Crédito / Débito';
      let finalPaymentDetails: OrderPaymentDetails;

      if (paymentType === 'tarjeta') {
        finalPaymentMethod = 'Tarjeta de Crédito / Débito';
        finalPaymentDetails = {
          methodType: 'card',
          cardBrand: getCardBrand(cardNumber),
          cardLast4: cardNumber.replace(/\s+/g, '').slice(-4) || '4242',
          cardHolder: cardHolder.trim(),
        };
      } else if (paymentType === 'transferencia') {
        finalPaymentMethod = 'Transferencia SPEI';
        finalPaymentDetails = {
          methodType: 'spei',
          speiBank: 'BBVA México',
          speiClabe: '0121 8001 5678 9234 12',
          speiBeneficiary: 'BadGommys Oficial S.A.P.I. de C.V.',
          speiReference: speiConcept,
          speiTrackingKey: speiTrackingRef || undefined,
        };
      } else {
        // Efectivo
        if (cashOption === 'oxxo') {
          finalPaymentMethod = 'Efectivo en OXXO';
          finalPaymentDetails = {
            methodType: 'cash',
            cashOption: 'oxxo',
            cashStoreName: 'OXXO Pay & Tiendas de Conveniencia',
            cashReferenceCode: oxxoReference,
            cashInstructions: 'Presenta el código en caja de OXXO o 7-Eleven y paga en efectivo.',
          };
        } else if (cashOption === 'tienda_oficial') {
          finalPaymentMethod = 'Efectivo en Tienda Oficial';
          finalPaymentDetails = {
            methodType: 'cash',
            cashOption: 'tienda_oficial',
            cashStoreName: 'Tienda Física BadGommys Roma Norte',
            cashReferenceCode: pickupCode,
            pickupLocation: 'Av. Álvaro Obregón #151, Col. Roma Norte, CDMX',
            cashInstructions: 'Paga en caja al recoger tus gomitas en la sucursal física oficial.',
          };
        } else {
          finalPaymentMethod = 'Efectivo Contra Entrega';
          finalPaymentDetails = {
            methodType: 'cash',
            cashOption: 'contra_entrega',
            cashChangeFor: cashChangeFor || 'Importe exacto',
            cashInstructions: `Paga en efectivo al repartidor express (${cashChangeFor ? `Pagarás con: $${cashChangeFor}` : 'Importe exacto'}).`,
          };
        }
      }

      const order = onCreateOrder({
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        customerPhone: phone || '55 1234 5678',
        shippingAddress: cashOption === 'tienda_oficial' && paymentType === 'efectivo' 
          ? 'Recogida en Tienda Oficial: Av. Álvaro Obregón 151, Col. Roma Norte, CDMX'
          : shippingAddress,
        items,
        subtotal,
        shippingFee: cashOption === 'tienda_oficial' && paymentType === 'efectivo' ? 0 : shippingFee,
        discount,
        total: cashOption === 'tienda_oficial' && paymentType === 'efectivo' ? Math.max(0, subtotal - discount) : total,
        paymentMethod: finalPaymentMethod,
        paymentDetails: finalPaymentDetails,
        deliveryNotes,
        status: 'En preparación',
        paymentStatus: paymentType === 'tarjeta' ? 'Pagado' : 'Pendiente',
      });

      setIsProcessingPayment(false);
      setIsCheckingOut(false);
      onOrderCompleted(order);
    }, 1200);
  };

  if (items.length === 0) {
    return (
      <div className="py-20 bg-[#0d0d11] min-h-[70vh] flex items-center justify-center text-white px-4">
        <div className="max-w-md w-full text-center bg-[#14141c] p-10 rounded-3xl border border-zinc-800 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6 text-red-500">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Tu carrito está vacío</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Parece que aún no has agregado ninguna de nuestras deliciosas gomitas dulces o picosas con chamoy.
          </p>
          <button
            id="cart-empty-shop-btn"
            onClick={onContinueShopping}
            className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ver Catálogo de Gomitas</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#0d0d11] min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-zinc-800">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
              Carrito de <span className="text-red-500">Compras</span>
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Revisa tus productos seleccionados y calcula el total antes de pagar.
            </p>
          </div>

          <button
            onClick={onContinueShopping}
            className="inline-flex items-center gap-2 text-sm font-bold text-zinc-300 hover:text-red-400 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Seguir añadiendo más artículos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-[#14141c] p-4 sm:p-5 rounded-2xl border border-zinc-800 shadow-md"
              >
                {/* Product Thumbnail */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-700/50">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/30">
                      {item.product.category}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-400">
                      {item.product.weight}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white">
                    {item.product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                    {item.product.description}
                  </p>

                  <div className="mt-2 text-red-400 font-extrabold text-base">
                    ${item.product.price} MXN c/u
                  </div>
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex items-center gap-6 justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                  <div className="flex items-center bg-[#1c1c24] border border-zinc-700 rounded-xl px-2 py-1">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                      title="Restar una unidad"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-black text-sm text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 text-zinc-400 hover:text-white cursor-pointer"
                      title="Sumar una unidad"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <div className="text-lg font-black text-white">
                      ${item.product.price * item.quantity} MXN
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}

            {/* Bottom button to continue adding */}
            <div className="pt-2">
              <button
                id="cart-continue-bottom-btn"
                onClick={onContinueShopping}
                className="w-full py-3.5 border-2 border-dashed border-zinc-700 hover:border-red-500 text-zinc-300 hover:text-white rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-red-500" />
                <span>Seguir añadiendo más artículos al carrito</span>
              </button>
            </div>

          </div>

          {/* Right Summary Column */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-[#14141c] rounded-3xl border border-zinc-800 p-6 shadow-2xl space-y-5">
              <h2 className="text-xl font-black text-white border-b border-zinc-800 pb-3">
                Resumen de Compra
              </h2>

              {/* Promo Code box */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 block uppercase tracking-wider">
                  Código de Descuento
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Ej. GOMMY10"
                    className="flex-1 bg-[#1c1c24] border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs uppercase font-bold focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="submit"
                    className="bg-zinc-800 hover:bg-red-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 10% de descuento aplicado!
                  </p>
                )}
                {couponError && (
                  <p className="text-xs text-red-400 font-medium">{couponError}</p>
                )}
              </form>

              {/* Price Calculation Breakdown */}
              <div className="space-y-3 pt-2 border-t border-zinc-800 text-sm">
                <div className="flex justify-between text-zinc-300">
                  <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} artículos)</span>
                  <span className="font-bold">${subtotal} MXN</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Descuento aplicado ({discountPercent}%)</span>
                    <span className="font-bold">-${discount} MXN</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-zinc-400" />
                    <span>Envío</span>
                  </div>
                  <span className="font-bold">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-400 uppercase font-black text-xs">¡Gratis!</span>
                    ) : (
                      `$${shippingFee} MXN`
                    )}
                  </span>
                </div>

                {subtotal < freeShippingThreshold && (
                  <p className="text-[11px] text-amber-400/90 bg-amber-950/30 p-2 rounded-lg border border-amber-800/30">
                    Agrega ${(freeShippingThreshold - subtotal).toFixed(0)} MXN más para envío GRATIS.
                  </p>
                )}

                <div className="pt-3 border-t border-zinc-700 flex justify-between items-baseline">
                  <span className="text-base font-black text-white">Total a Pagar</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-red-500">${total}</span>
                    <span className="text-xs font-semibold text-zinc-400 ml-1">MXN</span>
                  </div>
                </div>
              </div>

              {/* Checkout Security notice */}
              {!currentUser && (
                <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-zinc-300">
                    <span className="font-bold text-white block mb-0.5">Seguridad Requerida</span>
                    Antes de finalizar la compra, inicia sesión o regístrate para vincular tu pedido de forma segura.
                  </div>
                </div>
              )}

              {/* Two Main Required Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  id="cart-checkout-btn"
                  onClick={handleStartCheckout}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black text-base shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Finalizar la Compra</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  id="cart-continue-btn"
                  onClick={onContinueShopping}
                  className="w-full flex items-center justify-center gap-2 bg-[#1c1c24] hover:bg-zinc-800 text-zinc-300 hover:text-white py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer border border-zinc-700"
                >
                  <span>Seguir añadiendo más artículos</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Checkout Modal if user clicked Finalizar Compra and is authenticated */}
      {isCheckingOut && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#14141c] border border-zinc-800 max-w-xl w-full rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Completar Pedido Seguro</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>Total a pagar:</span>
                    <span className="text-white font-bold font-mono text-sm">${total} MXN</span>
                    {shippingFee === 0 && (
                      <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full text-[10px] border border-emerald-800/40">
                        Envío Gratis
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckingOut(false)}
                className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleConfirmOrder} className="overflow-y-auto pr-1 sm:pr-2 space-y-4 text-sm flex-1">
              
              {/* Customer summary */}
              <div className="p-3 bg-[#1c1c24] rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase tracking-wider font-bold">Cliente Registrado</span>
                  <span className="text-white font-bold">{currentUser.name}</span>
                </div>
                <span className="text-zinc-400 font-mono text-[11px] truncate max-w-[200px]">{currentUser.email}</span>
              </div>

              {/* Delivery Address & Contact (hidden/simplified if picking up in physical store) */}
              {!(paymentType === 'efectivo' && cashOption === 'tienda_oficial') ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Dirección Completa de Envío *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Calle, número exterior e interior, colonia, municipio/alcaldía, C.P."
                      className="w-full bg-[#1c1c24] border border-zinc-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1">
                      Teléfono de Contacto para el Repartidor *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ej. 55 1234 5678"
                      className="w-full bg-[#1c1c24] border border-zinc-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-2xl">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>Recogerás directamente en nuestra Tienda Física Oficial de Gomitas</span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Av. Álvaro Obregón #151, Col. Roma Norte, Cuauhtémoc, CDMX.
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Teléfono de confirmación: <span className="text-white font-mono">{phone || currentUser.phone || '55 1234 5678'}</span>
                  </p>
                </div>
              )}

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Selecciona Método de Pago *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  
                  {/* Option 1: Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentType('tarjeta')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentType === 'tarjeta'
                        ? 'bg-red-600/15 border-red-500 shadow-md shadow-red-950/40'
                        : 'bg-[#1c1c24] border-zinc-800 hover:border-zinc-700 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <CreditCard className={`w-5 h-5 ${paymentType === 'tarjeta' ? 'text-red-500' : 'text-zinc-400'}`} />
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        paymentType === 'tarjeta' ? 'border-red-500 bg-red-500' : 'border-zinc-600'
                      }`}>
                        {paymentType === 'tarjeta' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white block">Tarjeta</span>
                    <span className="text-[10px] text-zinc-400">Crédito o Débito</span>
                  </button>

                  {/* Option 2: SPEI */}
                  <button
                    type="button"
                    onClick={() => setPaymentType('transferencia')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentType === 'transferencia'
                        ? 'bg-red-600/15 border-red-500 shadow-md shadow-red-950/40'
                        : 'bg-[#1c1c24] border-zinc-800 hover:border-zinc-700 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <Building2 className={`w-5 h-5 ${paymentType === 'transferencia' ? 'text-red-500' : 'text-zinc-400'}`} />
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        paymentType === 'transferencia' ? 'border-red-500 bg-red-500' : 'border-zinc-600'
                      }`}>
                        {paymentType === 'transferencia' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white block">Transferencia</span>
                    <span className="text-[10px] text-zinc-400">SPEI / CLABE</span>
                  </button>

                  {/* Option 3: Cash */}
                  <button
                    type="button"
                    onClick={() => setPaymentType('efectivo')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      paymentType === 'efectivo'
                        ? 'bg-red-600/15 border-red-500 shadow-md shadow-red-950/40'
                        : 'bg-[#1c1c24] border-zinc-800 hover:border-zinc-700 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <Banknote className={`w-5 h-5 ${paymentType === 'efectivo' ? 'text-red-500' : 'text-zinc-400'}`} />
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        paymentType === 'efectivo' ? 'border-red-500 bg-red-500' : 'border-zinc-600'
                      }`}>
                        {paymentType === 'efectivo' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-white block">Efectivo</span>
                    <span className="text-[10px] text-zinc-400">OXXO / Tienda Física</span>
                  </button>

                </div>
              </div>

              {/* ======================================================== */}
              {/* DYNAMIC SECTION 1: TARJETA DE CRÉDITO / DÉBITO            */}
              {/* ======================================================== */}
              {paymentType === 'tarjeta' && (
                <div className="p-4 bg-[#181822] rounded-2xl border border-zinc-800 space-y-3 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Ingresa los Datos de tu Tarjeta
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {getCardBrand(cardNumber)}
                    </span>
                  </div>

                  {cardError && (
                    <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-700/60 text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{cardError}</span>
                    </div>
                  )}

                  {/* Sleek Credit Card Preview */}
                  <div className="bg-gradient-to-tr from-zinc-950 via-[#1e1927] to-[#2b1622] p-4 rounded-2xl border border-zinc-700/60 shadow-lg text-white font-mono space-y-2.5 relative overflow-hidden">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-5 rounded bg-amber-500/80 border border-amber-300/50 shadow-inner flex items-center justify-center">
                          <div className="w-3 h-2 border border-amber-700 rounded-sm" />
                        </div>
                        <span className="text-[10px] text-zinc-400 font-sans font-semibold">Crédito / Débito</span>
                      </div>
                      <span className="font-sans font-black text-xs tracking-wider text-red-400">
                        {getCardBrand(cardNumber).toUpperCase()}
                      </span>
                    </div>

                    <div className="text-base sm:text-lg tracking-widest font-bold text-zinc-200">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </div>

                    <div className="flex justify-between items-end text-[10px] tracking-wider pt-1">
                      <div>
                        <span className="text-zinc-500 block text-[8px]">TITULAR DE LA TARJETA</span>
                        <span className="font-semibold text-zinc-200 uppercase truncate max-w-[170px] block">
                          {cardHolder || 'NOMBRE Y APELLIDO'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-zinc-500 block text-[8px]">EXPIRACIÓN</span>
                        <span className="font-semibold text-zinc-200">
                          {cardExpiry || 'MM/AA'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Input: Card Number */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Número de Tarjeta *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="1234 5678 9012 3456"
                        className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-red-500"
                      />
                      <div className="absolute right-3 top-2.5 text-xs text-zinc-400 font-bold">
                        {getCardBrand(cardNumber)}
                      </div>
                    </div>
                  </div>

                  {/* Input: Cardholder Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Nombre del Titular (como aparece en el plástico) *
                    </label>
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => {
                        setCardHolder(e.target.value.toUpperCase());
                        if (cardError) setCardError('');
                      }}
                      placeholder="JUAN PÉREZ GARCÍA"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white uppercase focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Expiration & CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                        Expiración (MM/AA) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="12/28"
                        className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-red-500 text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 mb-1 flex items-center justify-between">
                        <span>CVV / CVC *</span>
                        <span className="text-[10px] text-zinc-500">3 o 4 dígitos</span>
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvv}
                          onChange={handleCvvChange}
                          placeholder="•••"
                          className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-white focus:outline-none focus:border-red-500 text-center"
                        />
                        <Lock className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Save Card Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="rounded border-zinc-700 text-red-600 focus:ring-red-500 bg-[#121218]"
                    />
                    <span className="text-[11px] text-zinc-400">
                      Guardar tarjeta de forma segura y encriptada para futuras compras
                    </span>
                  </label>

                  {/* Security Assurance Banner */}
                  <div className="pt-1 flex items-center gap-2 text-[10px] text-emerald-400/90 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-800/30">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Cifrado bancario SSL 256-bit y certificación PCI-DSS. Tu dinero y datos están 100% protegidos.</span>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* DYNAMIC SECTION 2: TRANSFERENCIA SPEI                     */}
              {/* ======================================================== */}
              {paymentType === 'transferencia' && (
                <div className="p-4 bg-[#181822] rounded-2xl border border-zinc-800 space-y-3.5 animate-in fade-in-50">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Datos para Transferencia SPEI
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Sin comisiones
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Realiza tu transferencia desde la app de tu banco (BBVA, Banorte, Santander, Nu, Mercado Pago, Citibanamex, etc.) a la siguiente cuenta:
                  </p>

                  {/* Bank Account Details Box */}
                  <div className="space-y-2 text-xs">
                    
                    {/* Banco & Beneficiario */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 bg-[#121218] rounded-xl border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 block font-semibold">Banco Destino</span>
                        <span className="text-white font-bold">BBVA México</span>
                      </div>
                      <div className="p-2.5 bg-[#121218] rounded-xl border border-zinc-800">
                        <span className="text-[10px] text-zinc-400 block font-semibold">Beneficiario</span>
                        <span className="text-white font-bold truncate block" title="BadGommys Oficial S.A.P.I. de C.V.">
                          BadGommys Oficial
                        </span>
                      </div>
                    </div>

                    {/* CLABE Interbancaria con botón copiar */}
                    <div className="p-3 bg-[#121218] rounded-xl border border-zinc-800 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-semibold">CLABE Interbancaria (18 dígitos)</span>
                        <span className="font-mono text-sm font-bold text-amber-400 tracking-wider">
                          0121 8001 5678 9234 12
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('012180015678923412', 'clabe')}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700 shrink-0"
                      >
                        {copiedField === 'clabe' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-[11px]">Copiar CLABE</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Número de Tarjeta Débito Alternativa */}
                    <div className="p-3 bg-[#121218] rounded-xl border border-zinc-800 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-semibold">O Tarjeta Débito BBVA (16 dígitos)</span>
                        <span className="font-mono text-xs font-bold text-zinc-200">
                          4152 3140 8921 5634
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('4152314089215634', 'card')}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700 shrink-0"
                      >
                        {copiedField === 'card' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-[11px]">Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Concepto / Referencia */}
                    <div className="p-3 bg-[#121218] rounded-xl border border-zinc-800 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-semibold">Concepto o Referencia de Pago *</span>
                        <span className="font-mono text-sm font-bold text-red-400">
                          {speiConcept}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(speiConcept, 'concept')}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-700 shrink-0"
                      >
                        {copiedField === 'concept' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-[11px]">Copiar</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Monto exacto */}
                    <div className="p-3 bg-red-950/30 rounded-xl border border-red-800/40 flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-300">Monto Exacto a Transferir:</span>
                      <span className="text-base font-black text-emerald-400">${total} MXN</span>
                    </div>

                  </div>

                  {/* Optional field for tracking code or reference after sending */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1">
                      Folio de Rastreo o Comprobante de tu Banco (Opcional)
                    </label>
                    <input
                      type="text"
                      value={speiTrackingRef}
                      onChange={(e) => setSpeiTrackingRef(e.target.value)}
                      placeholder="Ej. Clave de rastreo o últimos 4 dígitos de autorización"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="flex items-start gap-2 text-[11px] text-zinc-400 bg-[#121218] p-3 rounded-xl border border-zinc-800">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Al presionar el botón de abajo, tu orden quedará registrada y nuestro taller comenzará a alistar tus gomitas mientras se refleja la transferencia en el sistema.
                    </span>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* DYNAMIC SECTION 3: EFECTIVO (OXXO / TIENDA FÍSICA / REPARTIDOR) */}
              {/* ======================================================== */}
              {paymentType === 'efectivo' && (
                <div className="p-4 bg-[#181822] rounded-2xl border border-zinc-800 space-y-3.5 animate-in fade-in-50">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Opciones de Pago en Efectivo
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400">Elige dónde pagar</span>
                  </div>

                  {/* 3 Sub-Options Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    
                    {/* Sub-Option A: OXXO */}
                    <button
                      type="button"
                      onClick={() => setCashOption('oxxo')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        cashOption === 'oxxo'
                          ? 'bg-amber-600/20 border-amber-500 text-white font-bold'
                          : 'bg-[#121218] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Store className="w-4 h-4 text-amber-400" />
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 font-bold">
                          OXXO Pay
                        </span>
                      </div>
                      <span className="text-xs block font-bold text-zinc-100">En OXXO</span>
                      <span className="text-[10px] text-zinc-400">Tiendas de conveniencia</span>
                    </button>

                    {/* Sub-Option B: Tienda Oficial Física BadGommys */}
                    <button
                      type="button"
                      onClick={() => setCashOption('tienda_oficial')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        cashOption === 'tienda_oficial'
                          ? 'bg-red-600/20 border-red-500 text-white font-bold'
                          : 'bg-[#121218] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Sparkles className="w-4 h-4 text-red-400" />
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-red-950 text-red-300 font-bold">
                          Físico
                        </span>
                      </div>
                      <span className="text-xs block font-bold text-zinc-100">Tienda Oficial</span>
                      <span className="text-[10px] text-zinc-400">Mostrador BadGommys</span>
                    </button>

                    {/* Sub-Option C: Contra Entrega al Repartidor */}
                    <button
                      type="button"
                      onClick={() => setCashOption('contra_entrega')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        cashOption === 'contra_entrega'
                          ? 'bg-emerald-600/20 border-emerald-500 text-white font-bold'
                          : 'bg-[#121218] border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
                          A Domicilio
                        </span>
                      </div>
                      <span className="text-xs block font-bold text-zinc-100">Al Repartidor</span>
                      <span className="text-[10px] text-zinc-400">Contra Entrega</span>
                    </button>

                  </div>

                  {/* Detail A: OXXO Pay */}
                  {cashOption === 'oxxo' && (
                    <div className="p-3.5 bg-[#121218] rounded-xl border border-zinc-800 space-y-3 text-xs animate-in fade-in-50">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                          <Store className="w-4 h-4 text-amber-500" />
                          Ficha Digital de Pago OXXO Pay
                        </span>
                        <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                          Válido por 48 horas
                        </span>
                      </div>

                      {/* Barcode visual card */}
                      <div className="p-3.5 bg-white text-zinc-900 rounded-xl border text-center space-y-1.5 shadow-sm">
                        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-600 px-2 pb-1 border-b border-zinc-200">
                          <span>CONVENIO: OXXO PAY #8491</span>
                          <span className="text-red-600 font-black">BADGOMMYS OFICIAL</span>
                        </div>
                        
                        {/* Realistic Barcode Stripes */}
                        <div className="py-2 flex items-center justify-center gap-[2px] h-12 overflow-hidden px-4">
                          {[4, 2, 6, 1, 3, 5, 2, 4, 1, 6, 3, 2, 5, 1, 4, 3, 6, 2, 1, 5, 3, 4, 2, 6, 1, 4, 2, 5, 3, 1, 6].map((w, i) => (
                            <div
                              key={i}
                              style={{ width: `${w}px` }}
                              className="h-full bg-black shrink-0"
                            />
                          ))}
                        </div>

                        <div className="font-mono font-black text-sm tracking-wider text-zinc-900">
                          {oxxoReference}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-semibold">Código de Referencia:</span>
                          <span className="font-mono text-sm font-bold text-white">{oxxoReference}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(oxxoReference.replace(/\s+/g, ''), 'oxxo')}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedField === 'oxxo' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-white" />
                              <span>Copiar Código</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-[11px] text-zinc-400 leading-relaxed bg-[#181822] p-2.5 rounded-lg border border-zinc-800">
                        <span className="font-bold text-zinc-200 block mb-0.5">Instrucciones para pagar en OXXO:</span>
                        1. Acude a cualquier OXXO, 7-Eleven o Farmacias del Ahorro.<br />
                        2. Indica al cajero que realizarás un pago con <strong>OXXO Pay</strong>.<br />
                        3. Dicta este código o muestra el código de barras y paga los <strong>${total} MXN</strong> en efectivo.<br />
                        4. Tu pedido comenzará su preparación automáticamente en cuanto se emita el ticket.
                      </div>
                    </div>
                  )}

                  {/* Detail B: Tienda Oficial Física BadGommys */}
                  {cashOption === 'tienda_oficial' && (
                    <div className="p-3.5 bg-[#121218] rounded-xl border border-zinc-800 space-y-3 text-xs animate-in fade-in-50">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                          <Store className="w-4 h-4 text-red-500" />
                          Tienda Oficial Física (Pick-up & Pago en Mostrador)
                        </span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full font-bold border border-emerald-800/40">
                          Sin comisiones
                        </span>
                      </div>

                      {/* Store Address & Hours Card */}
                      <div className="p-3 bg-[#181822] rounded-xl border border-zinc-700/60 space-y-2">
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-white block">BadGommys Flagship Store Roma Norte</span>
                            <span className="text-zinc-300 text-xs block">
                              Av. Álvaro Obregón #151, Col. Roma Norte, Cuauhtémoc, CDMX (C.P. 06700).
                            </span>
                            <span className="text-zinc-500 text-[11px] block mt-0.5">
                              Entre calles Orizaba y Jalapa • A 2 cuadras del Parque México
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-400">
                          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>
                            <strong>Horarios:</strong> Lunes a Sábado de 11:00 AM a 8:30 PM | Domingos de 12:00 PM a 6:00 PM
                          </span>
                        </div>
                      </div>

                      {/* Pickup voucher code */}
                      <div className="p-3 bg-red-950/30 rounded-xl border border-red-800/40 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-semibold">Tu Código de Retiro en Mostrador:</span>
                          <span className="font-mono text-base font-black text-red-400">{pickupCode}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-400 block">Total a pagar en mostrador:</span>
                          <span className="text-sm font-black text-white">${Math.max(0, subtotal - discount)} MXN</span>
                          {shippingFee > 0 && (
                            <span className="text-[10px] text-emerald-400 block font-bold">¡Ahorro de $49 en envío!</span>
                          )}
                        </div>
                      </div>

                      <div className="text-[11px] text-emerald-400/90 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-800/30 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                        <span>
                          <strong>Beneficio de recoger en sucursal física:</strong> Gomitas artesanales frescas recién escarchadas en tu presencia + cortesía de vasito extra de salsa chamoy BadGommys.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Detail C: Contra Entrega al Repartidor */}
                  {cashOption === 'contra_entrega' && (
                    <div className="p-3.5 bg-[#121218] rounded-xl border border-zinc-800 space-y-3 text-xs animate-in fade-in-50">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-emerald-500" />
                          Pago en Efectivo al Repartidor en tu Puerta
                        </span>
                        <span className="text-[10px] text-zinc-400">Entrega Express</span>
                      </div>

                      <p className="text-zinc-300 text-xs">
                        Pagas en efectivo al repartidor de Moto Express en el momento en que recibas el paquete en tus manos.
                      </p>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 mb-1.5">
                          ¿Con cuánto dinero pagarás? (Para que el repartidor lleve tu cambio listo)
                        </label>
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          {[`Exacto ($${total})`, '200', '500', '1000'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setCashChangeFor(opt.includes('Exacto') ? 'Importe exacto' : opt)}
                              className={`py-2 px-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                (opt.includes('Exacto') && (cashChangeFor === 'Importe exacto' || !cashChangeFor)) || cashChangeFor === opt
                                  ? 'bg-emerald-600/30 border-emerald-500 text-white'
                                  : 'bg-[#181822] border-zinc-800 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {opt.includes('Exacto') ? opt : `$${opt}`}
                            </button>
                          ))}
                        </div>
                        <input
                          type="text"
                          value={cashChangeFor === 'Importe exacto' ? '' : cashChangeFor}
                          onChange={(e) => setCashChangeFor(e.target.value)}
                          placeholder="O especifica otra cantidad (ej. billete de $200 o $500)"
                          className="w-full bg-[#181822] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Delivery Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Notas de Entrega o Referencias (Opcional)
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Ej. Tocar timbre 4B o dejar con portería / casa portón negro"
                  className="w-full bg-[#1c1c24] border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-red-600/40 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Procesando pedido y registrando método de pago...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>
                        Confirmar y Realizar Pedido (
                        ${paymentType === 'efectivo' && cashOption === 'tienda_oficial' ? Math.max(0, subtotal - discount) : total} MXN
                        )
                      </span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
