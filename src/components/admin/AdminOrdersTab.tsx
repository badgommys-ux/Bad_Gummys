import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus, Product, User } from '../../types';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Plus, 
  CreditCard, 
  Truck, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Save, 
  X,
  Store,
  Phone,
  MapPin,
  Tag,
  Trash2
} from 'lucide-react';

interface AdminOrdersTabProps {
  orders: Order[];
  products: Product[];
  customers: User[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string) => void;
  onConfirmPayment: (orderId: string, status: PaymentStatus) => void;
  onAddOrder?: (order: Order) => void;
  onUpdateOrder?: (order: Order) => void;
  onDeleteOrder?: (id: string) => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  products,
  customers,
  onUpdateOrderStatus,
  onConfirmPayment,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [paymentFilter, setPaymentFilter] = useState<string>('todos');

  // Manage Order Modal State
  const [selectedOrderToManage, setSelectedOrderToManage] = useState<Order | null>(null);
  const [manageStatus, setManageStatus] = useState<OrderStatus>('En preparación');
  const [managePaymentStatus, setManagePaymentStatus] = useState<PaymentStatus>('Pagado');
  const [manageCourier, setManageCourier] = useState('');
  const [manageCourierPhone, setManageCourierPhone] = useState('');
  const [manageTracking, setManageTracking] = useState('');
  const [manageCustomerName, setManageCustomerName] = useState('');
  const [manageCustomerPhone, setManageCustomerPhone] = useState('');
  const [manageShippingAddress, setManageShippingAddress] = useState('');
  const [manageTotal, setManageTotal] = useState(0);
  const [manageNotes, setManageNotes] = useState('');

  // POS / Manual Counter Order Modal
  const [isCreatingPOSOrder, setIsCreatingPOSOrder] = useState(false);
  const [posCustomerName, setPosCustomerName] = useState('Cliente Mostrador');
  const [posCustomerEmail, setPosCustomerEmail] = useState('mostrador@badgommys.com');
  const [posCustomerPhone, setPosCustomerPhone] = useState('55 1234 5678');
  const [posAddress, setPosAddress] = useState('Entrega Inmediata en Mostrador Naranjos, Veracruz');
  const [posPaymentMethod, setPosPaymentMethod] = useState('Efectivo en Tienda Oficial');
  const [posSelectedItems, setPosSelectedItems] = useState<Array<{ product: Product; quantity: number }>>([
    { product: products[0] || ({} as Product), quantity: 2 },
  ]);

  const handleOpenManageOrder = (o: Order) => {
    setSelectedOrderToManage(o);
    setManageStatus(o.status);
    setManagePaymentStatus(o.paymentStatus);
    setManageCourier(o.courierName || '');
    setManageCourierPhone(o.courierPhone || '55 9876 5432');
    setManageTracking(o.trackingNumber || '');
    setManageCustomerName(o.customerName || '');
    setManageCustomerPhone(o.customerPhone || '');
    setManageShippingAddress(o.shippingAddress || '');
    setManageTotal(o.total || 0);
    setManageNotes(o.deliveryNotes || '');
  };

  const handleSaveOrderChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderToManage) return;

    if (onUpdateOrder) {
      const updatedTimeline = (selectedOrderToManage.timeline || []).map((step, idx) => {
        if (manageStatus === 'En camino') {
          if (idx <= 2) return { ...step, completed: true, current: idx === 2 };
          return { ...step, completed: false, current: false };
        } else if (manageStatus === 'Entregado') {
          return { ...step, completed: true, current: idx === 3 };
        } else if (manageStatus === 'En preparación') {
          if (idx <= 1) return { ...step, completed: true, current: idx === 1 };
          return { ...step, completed: false, current: false };
        }
        return step;
      });

      const updated: Order = {
        ...selectedOrderToManage,
        customerName: manageCustomerName.trim(),
        customerPhone: manageCustomerPhone.trim(),
        shippingAddress: manageShippingAddress.trim(),
        total: Number(manageTotal),
        status: manageStatus,
        paymentStatus: managePaymentStatus,
        trackingNumber: manageTracking.trim(),
        courierName: manageCourier.trim(),
        courierPhone: manageCourierPhone.trim(),
        deliveryNotes: manageNotes.trim(),
        timeline: updatedTimeline,
      };

      onUpdateOrder(updated);
    } else {
      onUpdateOrderStatus(
        selectedOrderToManage.id,
        manageStatus,
        manageTracking.trim(),
        manageCourier.trim()
      );
      onConfirmPayment(selectedOrderToManage.id, managePaymentStatus);
    }

    setSelectedOrderToManage(null);
  };

  const handleDeleteOrderConfirm = (orderId: string) => {
    if (window.confirm(`¿Deseas eliminar permanentemente la orden #${orderId}?`)) {
      onDeleteOrder?.(orderId);
      setSelectedOrderToManage(null);
    }
  };

  // Add Item in POS modal
  const handleAddPosItem = () => {
    setPosSelectedItems(prev => [...prev, { product: products[0], quantity: 1 }]);
  };

  const handleUpdatePosItemProduct = (index: number, prodId: string) => {
    const prod = products.find(p => p.id === prodId) || products[0];
    setPosSelectedItems(prev => {
      const copy = [...prev];
      copy[index].product = prod;
      return copy;
    });
  };

  const handleUpdatePosItemQty = (index: number, qty: number) => {
    setPosSelectedItems(prev => {
      const copy = [...prev];
      copy[index].quantity = Math.max(1, qty);
      return copy;
    });
  };

  const handleRemovePosItem = (index: number) => {
    setPosSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  // Submit POS Order
  const handleSubmitPOSOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = posSelectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const orderId = `BG-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      customerName: posCustomerName.trim(),
      customerEmail: posCustomerEmail.trim().toLowerCase(),
      customerPhone: posCustomerPhone.trim(),
      shippingAddress: posAddress.trim(),
      items: posSelectedItems,
      subtotal,
      shippingFee: 0,
      discount: 0,
      total: subtotal,
      status: 'Entregado',
      paymentStatus: 'Pagado',
      paymentMethod: posPaymentMethod,
      trackingNumber: `BG-POS-${orderId}`,
      estimatedDelivery: 'Entregado en tienda / mostrador',
      courierName: 'Mostrador Taller BadGommys',
      deliveryNotes: 'Venta registrada en caja física / mostrador.',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      timeline: [
        {
          title: 'Venta Mostrador Pagada',
          description: 'Cobro verificado y entregado en mostrador.',
          time: 'Inmediata',
          completed: true,
          current: true,
        },
      ],
    };

    onAddOrder?.(newOrder);
    setIsCreatingPOSOrder(false);
  };

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(term) ||
      o.customerName.toLowerCase().includes(term) ||
      o.customerEmail.toLowerCase().includes(term) ||
      o.trackingNumber.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;
    const matchesPayment = paymentFilter === 'todos' || o.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalBilled = orders.filter(o => o.paymentStatus === 'Pagado').reduce((sum, o) => sum + o.total, 0);
  const inWorkshopCount = orders.filter(o => o.status === 'En preparación').length;
  const inTransitCount = orders.filter(o => o.status === 'En camino').length;
  const deliveredCount = orders.filter(o => o.status === 'Entregado').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Gestión de Pedidos & Despacho</span>
            <span className="text-xs font-black bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full">
              {orders.length} Órdenes
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Actualiza estatus de preparación, asigna repartidores de ruta y registra ventas presenciales de mostrador.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingPOSOrder(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Venta Mostrador / POS</span>
        </button>
      </div>

      {/* 4 Orders KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Pedidos</span>
            <div className="text-2xl font-black text-white mt-1">{orders.length}</div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">Tienda Online + Mostrador</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Cobrado</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">${totalBilled.toLocaleString()} <span className="text-xs text-zinc-500">MXN</span></div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">100% Validado en Bancos</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">En Taller / Reparto</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{inWorkshopCount + inTransitCount} activas</div>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">{inTransitCount} en moto • {inWorkshopCount} en taller</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Entregados con Éxito</span>
            <div className="text-2xl font-black text-sky-400 mt-1">{deliveredCount} órdenes</div>
            <p className="text-[11px] text-sky-300 font-semibold mt-0.5">Satisfacción 5/5</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#121218] border border-zinc-800/80 p-4 rounded-3xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por No. de orden, cliente, correo o guía de rastreo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#181824] border border-zinc-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#181824] border border-zinc-700/80 text-zinc-300 text-xs rounded-xl px-3 py-2 cursor-pointer"
          >
            <option value="todos">Todos los Estatus</option>
            <option value="En preparación">En preparación</option>
            <option value="En camino">En camino</option>
            <option value="Entregado">Entregado</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-[#181824] border border-zinc-700/80 text-zinc-300 text-xs rounded-xl px-3 py-2 cursor-pointer"
          >
            <option value="todos">Todos los Pagos</option>
            <option value="Pagado">Pagados</option>
            <option value="Pendiente">Pendientes</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161622] text-zinc-400 uppercase tracking-wider font-extrabold border-b border-zinc-800 text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Orden</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Productos</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Método de Pago</th>
                <th className="py-3.5 px-4">Pago</th>
                <th className="py-3.5 px-4">Estatus Entrega</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="py-4 px-4 font-mono font-black text-red-400">#{o.id}</td>
                  <td className="py-4 px-4 font-bold text-white">
                    <div>
                      <span>{o.customerName}</span>
                      <span className="block text-[10px] text-zinc-500 font-mono font-normal">{o.customerEmail}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-zinc-300 max-w-xs">
                    <span className="line-clamp-1 text-[11px]">
                      {o.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-black text-white font-mono">${o.total} MXN</td>
                  <td className="py-4 px-4 text-zinc-400 text-[11px]">{o.paymentMethod}</td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      o.paymentStatus === 'Pagado'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                        : 'bg-amber-950 text-amber-400 border-amber-800/60'
                    }`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      o.status === 'Entregado'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                        : o.status === 'En camino'
                        ? 'bg-sky-950 text-sky-400 border-sky-800/60'
                        : 'bg-amber-950 text-amber-400 border-amber-800/60'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleOpenManageOrder(o)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer shadow-md transition-colors"
                    >
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: GESTIONAR ORDEN */}
      {selectedOrderToManage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-white text-base">Gestionar Orden #{selectedOrderToManage.id}</h3>
                <p className="text-xs text-zinc-400">{selectedOrderToManage.customerName} • ${selectedOrderToManage.total} MXN</p>
              </div>
              <button onClick={() => setSelectedOrderToManage(null)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveOrderChanges} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Estatus del Pedido</label>
                  <select
                    value={manageStatus}
                    onChange={(e) => setManageStatus(e.target.value as any)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="En preparación">En preparación (Taller)</option>
                    <option value="En camino">En camino (Repartidor)</option>
                    <option value="Entregado">Entregado en tus Manos</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Estatus de Pago</label>
                  <select
                    value={managePaymentStatus}
                    onChange={(e) => setManagePaymentStatus(e.target.value as any)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-emerald-400 font-bold"
                  >
                    <option value="Pagado">✓ Pagado (Liquidado)</option>
                    <option value="Pendiente">⏳ Pendiente de validación</option>
                    <option value="Reembolsado">↩️ Reembolsado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Número de Guía / Tracking</label>
                <input
                  type="text"
                  value={manageTracking}
                  onChange={(e) => setManageTracking(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-amber-400 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Nombre del Repartidor / Mensajería</label>
                  <input
                    type="text"
                    value={manageCourier}
                    onChange={(e) => setManageCourier(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Teléfono del Repartidor</label>
                  <input
                    type="text"
                    value={manageCourierPhone}
                    onChange={(e) => setManageCourierPhone(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Nombre del Cliente</label>
                  <input
                    type="text"
                    value={manageCustomerName}
                    onChange={(e) => setManageCustomerName(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Teléfono del Cliente</label>
                  <input
                    type="text"
                    value={manageCustomerPhone}
                    onChange={(e) => setManageCustomerPhone(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Dirección de Entrega</label>
                <input
                  type="text"
                  value={manageShippingAddress}
                  onChange={(e) => setManageShippingAddress(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Total del Pedido ($ MXN)</label>
                  <input
                    type="number"
                    value={manageTotal}
                    onChange={(e) => setManageTotal(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-emerald-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Notas de Entrega / Instrucciones</label>
                  <input
                    type="text"
                    value={manageNotes}
                    onChange={(e) => setManageNotes(e.target.value)}
                    placeholder="Instrucciones especiales..."
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleDeleteOrderConfirm(selectedOrderToManage.id)}
                  className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 text-rose-400 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Pedido</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderToManage(null)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                  >
                    Guardar y Sincronizar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: POS / VENTA MOSTRADOR */}
      {isCreatingPOSOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Registrar Venta Presencial / Mostrador</h3>
              <button onClick={() => setIsCreatingPOSOrder(false)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmitPOSOrder} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Cliente</label>
                  <input
                    type="text"
                    required
                    value={posCustomerName}
                    onChange={(e) => setPosCustomerName(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Método de Pago</label>
                  <select
                    value={posPaymentMethod}
                    onChange={(e) => setPosPaymentMethod(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="Efectivo en Tienda Oficial">💵 Efectivo en Tienda</option>
                    <option value="Tarjeta de Crédito / Débito">💳 Terminal Tarjeta</option>
                    <option value="Transferencia SPEI">🏦 SPEI Confirmado</option>
                  </select>
                </div>
              </div>

              {/* Items to buy */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-zinc-400 font-bold">Productos Vendidos</label>
                  <button
                    type="button"
                    onClick={handleAddPosItem}
                    className="text-red-400 hover:text-red-300 font-bold text-[11px] cursor-pointer"
                  >
                    + Agregar otro producto
                  </button>
                </div>

                {posSelectedItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-[#181824] p-2.5 rounded-xl border border-zinc-800">
                    <select
                      value={item.product.id}
                      onChange={(e) => handleUpdatePosItemProduct(idx, e.target.value)}
                      className="flex-1 bg-[#1c1c28] border border-zinc-700 rounded-lg p-1.5 text-white text-xs"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - ${p.price} MXN (Stock: {p.stock})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleUpdatePosItemQty(idx, Number(e.target.value))}
                      className="w-16 bg-[#1c1c28] border border-zinc-700 rounded-lg p-1.5 text-white text-center font-bold"
                    />

                    {posSelectedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePosItem(idx)}
                        className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="p-3 bg-[#181824] rounded-2xl border border-zinc-800 flex justify-between items-center">
                <span className="text-zinc-400 font-bold">Total de la Venta:</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  ${posSelectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)} MXN
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPOSOrder(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Registrar Cobro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
