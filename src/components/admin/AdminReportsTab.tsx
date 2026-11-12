import React from 'react';
import { Order, Product, User, ERPInsumo } from '../../types';
import { 
  BarChart2, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  CreditCard, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Flame, 
  Layers,
  Award,
  Box,
  Network
} from 'lucide-react';

interface AdminReportsTabProps {
  orders: Order[];
  products: Product[];
  customers: User[];
  insumos?: ERPInsumo[];
}

export const AdminReportsTab: React.FC<AdminReportsTabProps> = ({
  orders,
  products,
  customers,
  insumos = [],
}) => {
  // Calculations
  const paidOrders = orders.filter(o => o.paymentStatus === 'Pagado');
  const grossSales = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalUnitsSold = paidOrders.reduce((sum, o) => 
    sum + o.items.reduce((itemSum, i) => itemSum + i.quantity, 0), 0);
  
  const avgTicket = paidOrders.length > 0 ? Math.round(grossSales / paidOrders.length) : 0;
  // Estimated COGS average is ~28% of gross sales -> Net gross profit is ~72%
  const estimatedProfit = Math.round(grossSales * 0.72);

  // Real-time Inventory Valuation
  const totalProductsInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const totalCatalogStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInsumosValue = insumos.reduce((sum, i) => sum + (i.stock * i.unitCost), 0);
  const totalEnterpriseInventoryValue = totalProductsInventoryValue + totalInsumosValue;

  // Payment Breakdown
  const paymentBreakdown: Record<string, number> = {};
  paidOrders.forEach(o => {
    const key = o.paymentMethod || 'Otros';
    paymentBreakdown[key] = (paymentBreakdown[key] || 0) + o.total;
  });

  // Top Selling Products Calculation
  const productSalesMap: Record<string, { name: string; units: number; revenue: number; image: string }> = {};
  paidOrders.forEach(o => {
    o.items.forEach(item => {
      const id = item.product.id;
      if (!productSalesMap[id]) {
        productSalesMap[id] = {
          name: item.product.name,
          units: 0,
          revenue: 0,
          image: item.product.image,
        };
      }
      productSalesMap[id].units += item.quantity;
      productSalesMap[id].revenue += item.quantity * item.product.price;
    });
  });

  const sortedTopProducts = Object.values(productSalesMap).sort((a, b) => b.units - a.units);

  // Sales by Category
  const categorySalesMap: Record<string, number> = {
    'Enchiladas': 0,
    'Ácidas': 0,
    'Dulces': 0,
    'Combos': 0,
  };
  paidOrders.forEach(o => {
    o.items.forEach(item => {
      const cat = item.product.category || 'Enchiladas';
      categorySalesMap[cat] = (categorySalesMap[cat] || 0) + item.quantity * item.product.price;
    });
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'ID Orden,Cliente,Correo,Total MXN,Metodo Pago,Estatus Pago,Estatus Envio,Fecha\n';
    const rows = orders.map(o => 
      `"${o.id}","${o.customerName}","${o.customerEmail}",${o.total},"${o.paymentMethod}","${o.paymentStatus}","${o.status}","${o.createdAt}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BadGommys_Reporte_Financiero_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header and Download Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Métricas Financieras & Inteligencia Comercial</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Reportes & Analíticas de Rendimiento
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Auditoría de ingresos brutos, márgenes brutos de ganancia, métodos de cobro y demanda de recetas.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Reporte (CSV)</span>
        </button>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ingresos Brutos</span>
            <div className="text-2xl font-black text-white mt-1">${grossSales.toLocaleString()} <span className="text-xs text-zinc-500">MXN</span></div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">100% cobrado y liquidado</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Utilidad Bruta Estimada</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">${estimatedProfit.toLocaleString()} <span className="text-xs text-zinc-500">MXN</span></div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">Margen comercial de ~72%</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ticket Promedio</span>
            <div className="text-2xl font-black text-amber-400 mt-1">${avgTicket} <span className="text-xs text-zinc-500">MXN</span></div>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">Por orden completada</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Bolsas Despachadas</span>
            <div className="text-2xl font-black text-sky-400 mt-1">{totalUnitsSold} pzas</div>
            <p className="text-[11px] text-sky-300 font-semibold mt-0.5">Volumen total de producto</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Real-time Enterprise Inventory Valuation Card */}
      <div className="bg-gradient-to-r from-[#121218] via-[#161624] to-[#121218] border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Valuación de Activos & Inventario Global (ERP)</h3>
              <p className="text-xs text-zinc-400">Cálculo dinámico sincronizado en tiempo real con ventas, compras y producción artesanal.</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Valor Total del Inventario</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
              ${totalEnterpriseInventoryValue.toLocaleString()} <span className="text-xs text-zinc-400 font-sans">MXN</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-[#181822] rounded-2xl border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="font-bold">Gomitas en Catálogo</span>
              <Box className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-black text-white font-mono">${totalProductsInventoryValue.toLocaleString()} MXN</div>
            <p className="text-[11px] text-zinc-400">{totalCatalogStockUnits} unidades listas para venta</p>
          </div>

          <div className="p-3.5 bg-[#181822] rounded-2xl border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="font-bold">Materias Primas (Insumos)</span>
              <Flame className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="text-lg font-black text-emerald-400 font-mono">${totalInsumosValue.toLocaleString()} MXN</div>
            <p className="text-[11px] text-zinc-400">{insumos.length} insumos en almacén de taller</p>
          </div>

          <div className="p-3.5 bg-[#181822] rounded-2xl border border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="font-bold">Capital Circulante Total</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-amber-400 font-mono">${(totalEnterpriseInventoryValue + grossSales).toLocaleString()} MXN</div>
            <p className="text-[11px] text-emerald-400 font-semibold">Ventas realizadas + Stock valuado</p>
          </div>
        </div>
      </div>

      {/* Grid of 2 Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Payment Method Breakdown */}
        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Canales Financieros</span>
              <h3 className="font-black text-white text-base">Ventas por Método de Pago</h3>
            </div>
            <CreditCard className="w-5 h-5 text-red-500" />
          </div>

          <div className="space-y-3 text-xs">
            {Object.entries(paymentBreakdown).map(([method, amount]) => {
              const pct = grossSales > 0 ? Math.round((amount / grossSales) * 100) : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-zinc-200">{method}</span>
                    <span className="text-emerald-400">${amount} MXN ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#181824] h-2.5 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="bg-gradient-to-r from-red-600 to-amber-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Demanda de Líneas</span>
              <h3 className="font-black text-white text-base">Facturación por Familia de Gomitas</h3>
            </div>
            <Flame className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-3 text-xs">
            {Object.entries(categorySalesMap).map(([cat, amount]) => {
              const pct = grossSales > 0 ? Math.round((amount / grossSales) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-zinc-200">{cat}</span>
                    <span className="text-amber-400">${amount} MXN ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#181824] h-2.5 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct || 15}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Top Products Ranking */}
      <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Ranking de Preferencia</span>
            <h3 className="font-black text-white text-base">Top 5 Productos Más Vendidos</h3>
          </div>
          <Award className="w-5 h-5 text-purple-400" />
        </div>

        <div className="space-y-3">
          {sortedTopProducts.slice(0, 5).map((prod, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-[#181824] rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center font-black text-xs">
                  #{idx + 1}
                </div>
                {prod.image && (
                  <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-xl object-cover border border-zinc-700" />
                )}
                <div>
                  <h4 className="font-bold text-white text-xs">{prod.name}</h4>
                  <span className="text-[11px] text-zinc-400">{prod.units} unidades vendidas</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-emerald-400 text-sm font-mono">${prod.revenue} MXN</span>
                <span className="block text-[10px] text-zinc-500">Ingresos Totales</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
