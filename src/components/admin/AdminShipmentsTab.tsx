import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Navigation, 
  MessageSquare, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  Edit, 
  Plus, 
  X, 
  Save, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface AdminShipmentsTabProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string) => void;
  onUpdateOrder?: (order: Order) => void;
  onDeleteOrder?: (id: string) => void;
  onAddOrder?: (order: Order) => void;
}

export const AdminShipmentsTab: React.FC<AdminShipmentsTabProps> = ({
  orders,
  onUpdateOrderStatus,
  onUpdateOrder,
  onDeleteOrder,
  onAddOrder,
}) => {
  // View filter: 'active' (default: orders requiring action), 'delivered', 'all'
  const [filterMode, setFilterMode] = useState<'active' | 'delivered' | 'all'>('active');

  // Dismissed orders from tracking
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('badgommys_dismissed_shipments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders currently exiting with smooth completion animation
  const [exitingOrderIds, setExitingOrderIds] = useState<string[]>([]);

  // SCM Editing Modal State
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editCourierName, setEditCourierName] = useState('');
  const [editCourierPhone, setEditCourierPhone] = useState('');
  const [editShippingAddress, setEditShippingAddress] = useState('');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editCustomerEmail, setEditCustomerEmail] = useState('');
  const [editStatus, setEditStatus] = useState<OrderStatus>('En preparación');
  const [editEstimatedDelivery, setEditEstimatedDelivery] = useState('');
  const [editDeliveryNotes, setEditDeliveryNotes] = useState('');

  // New Manual Shipment Modal State
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [newShipCustomer, setNewShipCustomer] = useState('');
  const [newShipPhone, setNewShipPhone] = useState('');
  const [newShipEmail, setNewShipEmail] = useState('');
  const [newShipAddress, setNewShipAddress] = useState('');
  const [newShipCourier, setNewShipCourier] = useState('Repartidor Express BadGommys (Mateo V.)');
  const [newShipCourierPhone, setNewShipCourierPhone] = useState('55 9876 5432');
  const [newShipTracking, setNewShipTracking] = useState(`BG-EXP-${Math.floor(10000 + Math.random() * 90000)}`);
  const [newShipNotes, setNewShipNotes] = useState('');

  // Open Edit Modal & populate
  const handleOpenEdit = (order: Order) => {
    setEditingOrder(order);
    setEditCourierName(order.courierName || 'Repartidor Express BadGommys (Mateo V.)');
    setEditCourierPhone(order.courierPhone || '55 9876 5432');
    setEditShippingAddress(order.shippingAddress || '');
    setEditTrackingNumber(order.trackingNumber || '');
    setEditCustomerName(order.customerName || '');
    setEditCustomerPhone(order.customerPhone || '');
    setEditCustomerEmail(order.customerEmail || '');
    setEditStatus(order.status);
    setEditEstimatedDelivery(order.estimatedDelivery || 'Hoy en 45 minutos');
    setEditDeliveryNotes(order.deliveryNotes || '');
  };

  // Save SCM Shipment Changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    // Recalculate timeline based on status
    const updatedTimeline = (editingOrder.timeline || []).map((step, idx) => {
      if (editStatus === 'En camino') {
        if (idx <= 2) return { ...step, completed: true, current: idx === 2 };
        return { ...step, completed: false, current: false };
      } else if (editStatus === 'Entregado') {
        return { ...step, completed: true, current: idx === 3 };
      } else if (editStatus === 'En preparación') {
        if (idx <= 1) return { ...step, completed: true, current: idx === 1 };
        return { ...step, completed: false, current: false };
      }
      return step;
    });

    const updated: Order = {
      ...editingOrder,
      courierName: editCourierName.trim(),
      courierPhone: editCourierPhone.trim(),
      shippingAddress: editShippingAddress.trim(),
      trackingNumber: editTrackingNumber.trim(),
      customerName: editCustomerName.trim(),
      customerPhone: editCustomerPhone.trim(),
      customerEmail: editCustomerEmail.trim(),
      status: editStatus,
      estimatedDelivery: editEstimatedDelivery.trim(),
      deliveryNotes: editDeliveryNotes.trim(),
      timeline: updatedTimeline,
    };

    if (onUpdateOrder) {
      onUpdateOrder(updated);
    } else {
      onUpdateOrderStatus(updated.id, updated.status, updated.trackingNumber, updated.courierName);
    }

    // Auto-eliminate from active list if transitioned to Entregado
    if (editStatus === 'Entregado' && editingOrder.status !== 'Entregado') {
      setExitingOrderIds(prev => [...prev, updated.id]);
      setTimeout(() => {
        setExitingOrderIds(prev => prev.filter(id => id !== updated.id));
      }, 850);
    }

    setEditingOrder(null);
  };

  // Create Manual Shipment
  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShipCustomer.trim() || !newShipAddress.trim()) return;

    const newOrder: Order = {
      id: `BG-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: newShipCustomer.trim(),
      customerEmail: newShipEmail.trim() || 'cliente@badgommys.com',
      customerPhone: newShipPhone.trim() || '55 1234 5678',
      shippingAddress: newShipAddress.trim(),
      items: [],
      subtotal: 350,
      shippingFee: 0,
      discount: 0,
      total: 350,
      status: 'En preparación',
      paymentStatus: 'Pagado',
      paymentMethod: 'Efectivo Contra Entrega',
      trackingNumber: newShipTracking.trim() || `BG-EXP-${Math.floor(10000 + Math.random() * 90000)}`,
      estimatedDelivery: 'Hoy entre 40 - 60 minutos',
      courierName: newShipCourier.trim() || 'Repartidor Express BadGommys (Mateo V.)',
      courierPhone: newShipCourierPhone.trim() || '55 9876 5432',
      deliveryNotes: newShipNotes.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      timeline: [
        { title: 'Comanda Recibida', description: 'Orden confirmada en sistema', time: 'Ahora', completed: true, current: false },
        { title: 'En Taller', description: 'Empaque y sellado', time: 'En proceso', completed: true, current: true },
        { title: 'En Camino', description: 'Repartidor en ruta', time: 'Pendiente', completed: false, current: false },
        { title: 'Entregado', description: 'Firma de recibido', time: 'Pendiente', completed: false, current: false },
      ],
    };

    onAddOrder?.(newOrder);
    setIsCreatingShipment(false);
    setNewShipCustomer('');
    setNewShipPhone('');
    setNewShipEmail('');
    setNewShipAddress('');
    setNewShipNotes('');
    setNewShipTracking(`BG-EXP-${Math.floor(10000 + Math.random() * 90000)}`);
  };

  // Advance delivery step & auto-eliminate when delivered
  const handleAdvanceStep = (order: Order) => {
    if (order.status === 'En preparación') {
      if (onUpdateOrder) {
        onUpdateOrder({
          ...order,
          status: 'En camino',
          timeline: (order.timeline || []).map((t, idx) => ({
            ...t,
            completed: idx <= 2,
            current: idx === 2,
          })),
        });
      } else {
        onUpdateOrderStatus(order.id, 'En camino');
      }
    } else if (order.status === 'En camino') {
      setExitingOrderIds(prev => [...prev, order.id]);
      
      if (onUpdateOrder) {
        onUpdateOrder({
          ...order,
          status: 'Entregado',
          timeline: (order.timeline || []).map((t, idx) => ({
            ...t,
            completed: true,
            current: idx === 3,
          })),
        });
      } else {
        onUpdateOrderStatus(order.id, 'Entregado');
      }

      setTimeout(() => {
        setExitingOrderIds(prev => prev.filter(id => id !== order.id));
      }, 850);
    }
  };

  // Dismiss / archive from shipments view
  const handleDismissOrder = (orderId: string) => {
    setExitingOrderIds(prev => [...prev, orderId]);
    setTimeout(() => {
      setDismissedIds(prev => {
        const next = [...new Set([...prev, orderId])];
        localStorage.setItem('badgommys_dismissed_shipments', JSON.stringify(next));
        return next;
      });
      setExitingOrderIds(prev => prev.filter(id => id !== orderId));
    }, 400);
  };

  // Batch clear all delivered shipments
  const handleClearAllDelivered = () => {
    const deliveredIds = orders.filter(o => o.status === 'Entregado').map(o => o.id);
    setDismissedIds(prev => {
      const next = [...new Set([...prev, ...deliveredIds])];
      localStorage.setItem('badgommys_dismissed_shipments', JSON.stringify(next));
      return next;
    });
  };

  // Restore dismissed shipments
  const handleRestoreDismissed = () => {
    setDismissedIds([]);
    localStorage.removeItem('badgommys_dismissed_shipments');
  };

  // Delete an order completely from system
  const handleDeleteShipment = (orderId: string) => {
    if (window.confirm(`¿Deseas eliminar definitivamente el despacho y orden #${orderId}?`)) {
      if (onDeleteOrder) {
        onDeleteOrder(orderId);
      } else {
        handleDismissOrder(orderId);
      }
    }
  };

  // Metrics
  const activeInTransit = orders.filter(o => o.status === 'En camino' && !dismissedIds.includes(o.id));
  const inPreparation = orders.filter(o => o.status === 'En preparación' && !dismissedIds.includes(o.id));
  const delivered = orders.filter(o => o.status === 'Entregado' && !dismissedIds.includes(o.id));

  // Orders filtered by current active tab
  const displayedOrders = orders.filter(order => {
    if (dismissedIds.includes(order.id)) return false;

    if (filterMode === 'active') {
      if (order.status !== 'Entregado' && order.status !== 'Cancelado') return true;
      if (exitingOrderIds.includes(order.id)) return true;
      return false;
    }

    if (filterMode === 'delivered') {
      return order.status === 'Entregado';
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header with Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase mb-1">
            <Navigation className="w-4 h-4" />
            <span>Módulo SCM • Despacho Logístico & Rutas Locales CDMX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Monitoreo & Seguimiento de Envíos Express
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Edita y gestiona repartidores, guías oficiales, direcciones de entrega y avances en tiempo real.
          </p>
        </div>

        <button
          onClick={() => {
            setNewShipTracking(`BG-EXP-${Math.floor(10000 + Math.random() * 90000)}`);
            setIsCreatingShipment(true);
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Despacho SCM</span>
        </button>
      </div>

      {/* 4 Fleet Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Envíos en Ruta Activa</span>
            <div className="text-2xl font-black text-sky-400 mt-1">{activeInTransit.length} en moto</div>
            <p className="text-[11px] text-sky-300 font-semibold mt-0.5">Despacho en tiempo real</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">En Empaque & Taller</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{inPreparation.length} órdenes</div>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">Sellado al alto vacío</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tiempo Promedio Entrega</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">42 minutos</div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">Zona Metropolitana CDMX</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Entregados con Éxito</span>
            <div className="text-2xl font-black text-white mt-1">{delivered.length}</div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">100% de cumplimiento</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* View Switcher & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 bg-[#121218] p-1.5 rounded-2xl border border-zinc-800/80 self-start">
          <button
            onClick={() => setFilterMode('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              filterMode === 'active'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <span>Activos en Ruta ({activeInTransit.length + inPreparation.length})</span>
          </button>

          <button
            onClick={() => setFilterMode('delivered')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              filterMode === 'delivered'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <span>Historial Entregados ({delivered.length})</span>
          </button>

          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              filterMode === 'all'
                ? 'bg-zinc-700 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <span>Todos los Envíos</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {delivered.length > 0 && filterMode === 'delivered' && (
            <button
              onClick={handleClearAllDelivered}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-rose-400 bg-[#121218] hover:bg-rose-950/30 border border-zinc-800 hover:border-rose-800/40 transition-all cursor-pointer shadow-sm"
              title="Limpiar de la lista todos los envíos finalizados"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar Todos los Entregados</span>
            </button>
          )}

          {dismissedIds.length > 0 && (
            <button
              onClick={handleRestoreDismissed}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              title="Restaurar envíos descartados"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restaurar ({dismissedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State when no orders match */}
      {displayedOrders.length === 0 && (
        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-10 sm:p-14 text-center shadow-xl space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-900/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-black text-white">
              {filterMode === 'active' 
                ? '¡Ruta Libre y Entregas al Día!' 
                : filterMode === 'delivered'
                ? 'No hay entregas archivadas en esta vista'
                : 'No hay envíos registrados'}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              {filterMode === 'active'
                ? 'Todos los pedidos han sido entregados con éxito o no hay órdenes en taller. Las entregas finalizadas se eliminan automáticamente de la ruta activa.'
                : 'Los envíos registrados aparecerán aquí.'}
            </p>
          </div>
          {filterMode === 'active' && delivered.length > 0 && (
            <button
              onClick={() => setFilterMode('delivered')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-sky-400 bg-sky-950/50 hover:bg-sky-900/60 border border-sky-800/60 transition-colors cursor-pointer shadow-md"
            >
              <span>Ver {delivered.length} Entrega(s) Finalizada(s) en Historial</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Orders Dispatch Cards */}
      {displayedOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedOrders.map((order) => {
            const isDelivered = order.status === 'Entregado';
            const isInTransit = order.status === 'En camino';
            const isInPrep = order.status === 'En preparación';
            const isExiting = exitingOrderIds.includes(order.id);

            return (
              <div 
                key={order.id} 
                className={`bg-[#121218] border rounded-3xl p-6 space-y-5 shadow-xl flex flex-col justify-between transition-all duration-700 ${
                  isExiting 
                    ? 'opacity-20 scale-95 -translate-y-2 border-emerald-500/60' 
                    : isDelivered
                    ? 'border-emerald-900/50 hover:border-emerald-700/60'
                    : isInTransit
                    ? 'border-sky-800/60 shadow-sky-950/20'
                    : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start pb-3 border-b border-zinc-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white text-base">Orden #{order.id}</span>
                        <button
                          onClick={() => handleOpenEdit(order)}
                          className="p-1 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Editar todos los datos de este envío"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Cliente: <strong className="text-zinc-200">{order.customerName}</strong>
                      </p>
                      <p className="text-xs text-zinc-400">
                        Guía oficial: <strong className="text-amber-400 font-mono">{order.trackingNumber}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                        isDelivered
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                          : isInTransit
                          ? 'bg-sky-950 text-sky-400 border-sky-800/60 shadow-sm shadow-sky-500/20'
                          : 'bg-amber-950 text-amber-400 border-amber-800/60'
                      }`}>
                        {order.status}
                      </span>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(order)}
                        className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 border border-zinc-700/60 transition-all cursor-pointer"
                        title="Editar despacho SCM"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Quick Dismiss / Delete button */}
                      <button
                        onClick={() => handleDeleteShipment(order.id)}
                        className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-zinc-700/60 transition-all cursor-pointer"
                        title="Eliminar de envíos"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Courier & Delivery Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#181824] rounded-2xl border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Repartidor Asignado:</span>
                        <button onClick={() => handleOpenEdit(order)} className="text-[10px] text-sky-400 hover:underline">Cambiar</button>
                      </div>
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Truck className="w-3.5 h-3.5 text-sky-400" />
                        <span className="truncate">{order.courierName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                        <Phone className="w-3 h-3 text-zinc-500" />
                        <span>{order.courierPhone || '55 9876 5432'}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#181824] rounded-2xl border border-zinc-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Destino en CDMX:</span>
                        <button onClick={() => handleOpenEdit(order)} className="text-[10px] text-sky-400 hover:underline">Editar</button>
                      </div>
                      <div className="flex items-start gap-1.5 text-zinc-300 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{order.shippingAddress}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Notes if any */}
                  {order.deliveryNotes && (
                    <div className="p-2.5 bg-[#14141e] rounded-xl border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Instrucciones:</strong> {order.deliveryNotes}</span>
                    </div>
                  )}

                  {/* Visual Progress Bar (4 Milestones) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[10px] font-bold text-zinc-400">
                      <span className={isInPrep || isInTransit || isDelivered ? 'text-emerald-400' : 'text-zinc-600'}>1. Comanda</span>
                      <span className={isInPrep || isInTransit || isDelivered ? 'text-emerald-400' : 'text-zinc-600'}>2. Taller</span>
                      <span className={isInTransit || isDelivered ? 'text-sky-400' : 'text-zinc-600'}>3. Reparto</span>
                      <span className={isDelivered ? 'text-emerald-400' : 'text-zinc-600'}>4. Entregado</span>
                    </div>

                    <div className="w-full bg-[#181824] h-2 rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          isDelivered 
                            ? 'w-full bg-emerald-500' 
                            : isInTransit 
                            ? 'w-3/4 bg-sky-500' 
                            : 'w-1/2 bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/52${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `¡Hola ${order.customerName}! Te escribimos de BadGommys. Tu pedido #${order.id} tiene la guía ${order.trackingNumber} y el repartidor (${order.courierName}) está atendiendo tu entrega en ${order.shippingAddress}. Estás a un paso de disfrutar tus gomitas artesanales 🌶️.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Notificar WhatsApp</span>
                    </a>

                    <button
                      onClick={() => handleOpenEdit(order)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                      title="Editar todos los campos"
                    >
                      <Edit className="w-3 h-3 text-amber-400" />
                      <span>Editar SCM</span>
                    </button>
                  </div>

                  {/* Advance Delivery button */}
                  {!isDelivered && (
                    <button
                      onClick={() => handleAdvanceStep(order)}
                      className={`font-bold text-xs px-4 py-1.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all ${
                        isInPrep 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                      }`}
                    >
                      <span>{isInPrep ? 'Poner en Ruta (Moto)' : 'Marcar como Entregado'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Exiting notice when marked as delivered */}
                  {isExiting && (
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5 animate-pulse bg-emerald-950/80 px-2.5 py-1 rounded-xl border border-emerald-500/40">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                      <span>¡Entrega Finalizada! Eliminando...</span>
                    </span>
                  )}

                  {/* If already delivered and not exiting, show button to dismiss or status */}
                  {isDelivered && !isExiting && (
                    <button
                      onClick={() => handleDismissOrder(order.id)}
                      className="text-emerald-400 hover:text-rose-400 text-xs font-bold flex items-center gap-1.5 bg-emerald-950/60 hover:bg-rose-950/40 border border-emerald-800/60 hover:border-rose-800/40 px-3 py-1.5 rounded-xl transition-all cursor-pointer group"
                      title="Eliminar de la lista de seguimiento"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 group-hover:hidden" />
                      <Trash2 className="w-4 h-4 text-rose-400 hidden group-hover:block" />
                      <span>Entrega Finalizada <span className="text-[10px] text-zinc-400 group-hover:text-rose-300 font-normal">(Quitar ✕)</span></span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: EDITAR DESPACHO SCM (Editar TODO) */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#14141c] border border-sky-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Editar Despacho SCM #{editingOrder.id}</h3>
                  <p className="text-xs text-zinc-400">Edita datos de ruta, repartidor, dirección y cliente en tiempo real.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              
              {/* Repartidor Info */}
              <div className="p-3.5 bg-[#181824] rounded-2xl border border-zinc-800 space-y-3">
                <h4 className="text-[11px] font-black uppercase text-sky-400 tracking-wider flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Repartidor & Logística SCM</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Nombre del Repartidor</label>
                    <input
                      type="text"
                      value={editCourierName}
                      onChange={(e) => setEditCourierName(e.target.value)}
                      placeholder="Ej. Mateo V. / Mensajería Local"
                      required
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl p-2.5 text-white font-medium focus:border-sky-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Teléfono Repartidor</label>
                    <input
                      type="text"
                      value={editCourierPhone}
                      onChange={(e) => setEditCourierPhone(e.target.value)}
                      placeholder="55 9876 5432"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl p-2.5 text-white font-medium focus:border-sky-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Guía Oficial de Rastreo</label>
                    <input
                      type="text"
                      value={editTrackingNumber}
                      onChange={(e) => setEditTrackingNumber(e.target.value)}
                      placeholder="BG-EXP-99241"
                      required
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl p-2.5 text-amber-400 font-mono font-bold focus:border-sky-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Tiempo Estimado</label>
                    <input
                      type="text"
                      value={editEstimatedDelivery}
                      onChange={(e) => setEditEstimatedDelivery(e.target.value)}
                      placeholder="Hoy en 40 minutos"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl p-2.5 text-white font-medium focus:border-sky-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Destino & Cliente Info */}
              <div className="p-3.5 bg-[#181824] rounded-2xl border border-zinc-800 space-y-3">
                <h4 className="text-[11px] font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Destino de Entrega & Cliente</span>
                </h4>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Dirección Completa (Destino en CDMX / EdoMex)</label>
                  <input
                    type="text"
                    value={editShippingAddress}
                    onChange={(e) => setEditShippingAddress(e.target.value)}
                    placeholder="Calle, Número, Colonia, Alcaldía, CP"
                    required
                    className="w-full bg-[#121218] border border-zinc-700 rounded-xl p-2.5 text-white font-medium focus:border-sky-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Cliente</label>
                    <input
                      type="text"
                      value={editCustomerName}
                      onChange={(e) => setEditCustomerName(e.target.value)}
                      required
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl p-2.5 text-white font-medium focus:border-sky-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Teléfono Cliente</label>
                    <input
                      type="text"
                      value={editCustomerPhone}
                      onChange={(e) => setEditCustomerPhone(e.target.value)}
                      required
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl p-2.5 text-white font-medium focus:border-sky-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold mb-1">Email</label>
                    <input
                      type="email"
                      value={editCustomerEmail}
                      onChange={(e) => setEditCustomerEmail(e.target.value)}
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl p-2.5 text-white font-medium focus:border-sky-500 outline-none text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Estado de la Ruta</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold focus:border-sky-500 outline-none"
                  >
                    <option value="En preparación">En preparación (Taller)</option>
                    <option value="En camino">En camino (Repartidor en moto)</option>
                    <option value="Entregado">Entregado (Entrega Finalizada)</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Notas de Entrega / Caseta</label>
                  <input
                    type="text"
                    value={editDeliveryNotes}
                    onChange={(e) => setEditDeliveryNotes(e.target.value)}
                    placeholder="Ej. Tocar timbre 4B, dejar en recepción"
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-medium focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => handleDeleteShipment(editingOrder.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Orden</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-lg shadow-sky-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Cambios SCM</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVO DESPACHO MANUAL SCM */}
      {isCreatingShipment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#14141c] border border-red-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Nuevo Despacho SCM Manual</h3>
                  <p className="text-xs text-zinc-400">Registra un envío directo para repartidor en motocicleta.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingShipment(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Nombre del Cliente</label>
                  <input
                    type="text"
                    value={newShipCustomer}
                    onChange={(e) => setNewShipCustomer(e.target.value)}
                    placeholder="Nombre completo"
                    required
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-medium outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Teléfono (WhatsApp)</label>
                  <input
                    type="text"
                    value={newShipPhone}
                    onChange={(e) => setNewShipPhone(e.target.value)}
                    placeholder="55 1234 5678"
                    required
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-medium outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Destino en CDMX (Dirección de Entrega)</label>
                <input
                  type="text"
                  value={newShipAddress}
                  onChange={(e) => setNewShipAddress(e.target.value)}
                  placeholder="Calle, Número, Colonia, Referencias"
                  required
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-medium outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Repartidor Asignado</label>
                  <input
                    type="text"
                    value={newShipCourier}
                    onChange={(e) => setNewShipCourier(e.target.value)}
                    required
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-medium outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Guía de Rastreo</label>
                  <input
                    type="text"
                    value={newShipTracking}
                    onChange={(e) => setNewShipTracking(e.target.value)}
                    required
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-amber-400 font-mono font-bold outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Notas de Entrega / Instrucciones</label>
                <input
                  type="text"
                  value={newShipNotes}
                  onChange={(e) => setNewShipNotes(e.target.value)}
                  placeholder="Ej. Llevar cambio de $500, tocar timbre"
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-medium outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingShipment(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Crear y Despachar Envío</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
