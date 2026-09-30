import React from 'react';
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
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface AdminShipmentsTabProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string) => void;
}

export const AdminShipmentsTab: React.FC<AdminShipmentsTabProps> = ({
  orders,
  onUpdateOrderStatus,
}) => {
  // Advance delivery step
  const handleAdvanceStep = (order: Order) => {
    if (order.status === 'En preparación') {
      onUpdateOrderStatus(order.id, 'En camino');
    } else if (order.status === 'En camino') {
      onUpdateOrderStatus(order.id, 'Entregado');
    }
  };

  const activeInTransit = orders.filter(o => o.status === 'En camino');
  const inPreparation = orders.filter(o => o.status === 'En preparación');
  const delivered = orders.filter(o => o.status === 'Entregado');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase mb-1">
          <Navigation className="w-4 h-4" />
          <span>Despacho Logístico & Rutas Locales CDMX</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Monitoreo & Seguimiento de Envíos Express
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Seguimiento en tiempo real de pedidos asignados a repartidores en motocicleta, tiempos estimados de llegada y entrega con firma.
        </p>
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

      {/* Orders Dispatch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.map((order) => {
          const isDelivered = order.status === 'Entregado';
          const isInTransit = order.status === 'En camino';
          const isInPrep = order.status === 'En preparación';

          return (
            <div key={order.id} className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
              
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start pb-3 border-b border-zinc-800">
                  <div>
                    <span className="font-mono font-black text-white text-base">Orden #{order.id}</span>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Cliente: <strong className="text-zinc-200">{order.customerName}</strong>
                    </p>
                    <p className="text-xs text-zinc-400">
                      Guía oficial: <strong className="text-amber-400 font-mono">{order.trackingNumber}</strong>
                    </p>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                    isDelivered
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                      : isInTransit
                      ? 'bg-sky-950 text-sky-400 border-sky-800/60 shadow-sm shadow-sky-500/20'
                      : 'bg-amber-950 text-amber-400 border-amber-800/60'
                  }`}>
                    {order.status}
                  </span>
                </div>

                {/* Courier & Delivery Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#181824] rounded-2xl border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block">Repartidor Asignado:</span>
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Truck className="w-3.5 h-3.5 text-sky-400" />
                      <span>{order.courierName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                      <Phone className="w-3 h-3 text-zinc-500" />
                      <span>{order.courierPhone || '55 9876 5432'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#181824] rounded-2xl border border-zinc-800 space-y-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block">Destino en CDMX:</span>
                    <div className="flex items-start gap-1.5 text-zinc-300 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{order.shippingAddress}</span>
                    </div>
                  </div>
                </div>

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
                <a
                  href={`https://wa.me/52${order.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `¡Hola ${order.customerName}! Te escribimos de BadGommys. Tu pedido #${order.id} tiene la guía ${order.trackingNumber} y el repartidor (${order.courierName}) está atendiendo tu entrega. Estás a un paso de disfrutar tus gomitas artesanales 🌶️.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Notificar WhatsApp</span>
                </a>

                {!isDelivered && (
                  <button
                    onClick={() => handleAdvanceStep(order)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-1.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{isInPrep ? 'Poner en Ruta (Moto)' : 'Marcar como Entregado'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {isDelivered && (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Entrega Finalizada</span>
                  </span>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
