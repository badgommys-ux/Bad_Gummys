import React, { useState } from 'react';
import { 
  ERPInsumo, 
  ERPRecipe, 
  ERPBatch, 
  ERPPurchaseOrder, 
  Product 
} from '../../types';
import { 
  Network, 
  Box, 
  Flame, 
  Layers, 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Search, 
  Filter, 
  ArrowRight, 
  Save, 
  X,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';

interface AdminErpTabProps {
  insumos: ERPInsumo[];
  recipes: ERPRecipe[];
  batches: ERPBatch[];
  purchaseOrders: ERPPurchaseOrder[];
  products: Product[];
  onUpdateInsumo: (updated: ERPInsumo) => void;
  onAddInsumo: (newInsumo: ERPInsumo) => void;
  onUpdateBatchStatus: (batchId: string, status: ERPBatch['status']) => void;
  onAddBatch: (newBatch: ERPBatch, targetProduct?: Product) => void;
  onMarkPurchaseOrderReceived: (poId: string) => void;
}

export const AdminErpTab: React.FC<AdminErpTabProps> = ({
  insumos,
  recipes,
  batches,
  purchaseOrders,
  products,
  onUpdateInsumo,
  onAddInsumo,
  onUpdateBatchStatus,
  onAddBatch,
  onMarkPurchaseOrderReceived,
}) => {
  const [subTab, setSubTab] = useState<'insumos' | 'recetas' | 'lotes' | 'compras'>('insumos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isRestockingInsumo, setIsRestockingInsumo] = useState<ERPInsumo | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(50);

  const [isAddingInsumo, setIsAddingInsumo] = useState(false);
  const [newInsName, setNewInsName] = useState('');
  const [newInsCat, setNewInsCat] = useState<ERPInsumo['category']>('Chile & Salsa');
  const [newInsStock, setNewInsStock] = useState(100);
  const [newInsUnit, setNewInsUnit] = useState('kg');
  const [newInsCost, setNewInsCost] = useState(85);
  const [newInsMin, setNewInsMin] = useState(20);
  const [newInsProvider, setNewInsProvider] = useState('Distribuidora Central de Abasto');
  const [newInsLocation, setNewInsLocation] = useState('Almacén Principal Taller CDMX');

  // New Production Batch Modal
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id || '');
  const [batchUnits, setBatchUnits] = useState(300);
  const [batchNotes, setBatchNotes] = useState('Lote para atender pedidos semanales y tienda física.');

  // Handle Restock
  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRestockingInsumo) return;
    const added = Number(restockAmount);
    const updatedStock = isRestockingInsumo.stock + added;
    const updated: ERPInsumo = {
      ...isRestockingInsumo,
      stock: updatedStock,
      totalValue: updatedStock * isRestockingInsumo.unitCost,
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    onUpdateInsumo(updated);
    setIsRestockingInsumo(null);
  };

  // Handle Create Insumo
  const handleCreateInsumo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsName.trim()) return;

    const stock = Number(newInsStock);
    const unitCost = Number(newInsCost);
    const item: ERPInsumo = {
      id: `ins-${Date.now()}`,
      name: newInsName.trim(),
      category: newInsCat,
      stock,
      unit: newInsUnit.trim(),
      minStock: Number(newInsMin),
      unitCost,
      totalValue: stock * unitCost,
      location: newInsLocation.trim(),
      provider: newInsProvider.trim(),
      lastRestocked: new Date().toISOString().split('T')[0],
    };

    onAddInsumo(item);
    setIsAddingInsumo(false);
    setNewInsName('');
  };

  // Handle Create Batch
  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];
    const code = `LOTE-${String(batches.length + 1).padStart(3, '0')}-${recipe.name.substring(0, 6).toUpperCase().replace(/\s+/g, '')}`;
    
    // Find matching finished product to increase stock
    const matchingProduct = products.find(p => p.name.toLowerCase().includes(recipe.name.toLowerCase().substring(0, 10)));

    const newBatch: ERPBatch = {
      id: `batch-${Date.now()}`,
      code,
      recipeName: recipe.name,
      units: Number(batchUnits),
      status: 'En cocción y macerado',
      notes: batchNotes.trim(),
      startedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    onAddBatch(newBatch, matchingProduct);
    setIsAddingBatch(false);
  };

  // Calculations
  const totalInsumosValue = insumos.reduce((sum, i) => sum + i.totalValue, 0);
  const totalBatchesProduced = batches.reduce((sum, b) => sum + b.units, 0);

  const filteredInsumos = insumos.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
            <Network className="w-4 h-4" />
            <span>Cadena de Suministro, Recetas Maestras & Taller CDMX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Módulo ERP & Fabricación Artesanal
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Control de inventario de materias primas con cantidades comerciales, costeo unitario y lotes de escarchado.
          </p>
        </div>

        {subTab === 'insumos' && (
          <button
            onClick={() => setIsAddingInsumo(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Insumo</span>
          </button>
        )}

        {subTab === 'lotes' && (
          <button
            onClick={() => setIsAddingBatch(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Flame className="w-4 h-4" />
            <span>Crear Lote de Producción</span>
          </button>
        )}
      </div>

      {/* 4 ERP Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Valor Materias Primas</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">${totalInsumosValue.toLocaleString()} <span className="text-xs text-zinc-500">MXN</span></div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">{insumos.length} Insumos en Almacén</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Lotes Fabricados</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{totalBatchesProduced.toLocaleString()} pzas</div>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">{batches.length} Lotes Registrados</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Recetas & BOM</span>
            <div className="text-2xl font-black text-white mt-1">4 Maestras</div>
            <p className="text-[11px] text-purple-300 font-semibold mt-0.5">Margen Promedio: 74.2%</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Órdenes de Compra (OC)</span>
            <div className="text-2xl font-black text-sky-400 mt-1">{purchaseOrders.length}</div>
            <p className="text-[11px] text-sky-300 font-semibold mt-0.5">Conectado a CFDI 4.0</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ERP Sub-Navigation Pills */}
      <div className="flex gap-2 p-1.5 bg-[#121218] border border-zinc-800/80 rounded-2xl w-fit">
        <button
          onClick={() => setSubTab('insumos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'insumos'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>Materias Primas & Insumos ({insumos.length})</span>
        </button>

        <button
          onClick={() => setSubTab('recetas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'recetas'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Recetas Maestras & Costeo BOM (4)</span>
        </button>

        <button
          onClick={() => setSubTab('lotes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'lotes'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Lotes de Producción ({batches.length})</span>
        </button>

        <button
          onClick={() => setSubTab('compras')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'compras'
              ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Órdenes de Compra ({purchaseOrders.length})</span>
        </button>
      </div>

      {/* SUB-VIEW 1: INSUMOS & MATERIAS PRIMAS */}
      {subTab === 'insumos' && (
        <div className="space-y-4">
          <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161622] text-zinc-400 uppercase tracking-wider font-extrabold border-b border-zinc-800 text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">Materia Prima / Insumo</th>
                    <th className="py-3.5 px-4">Familia</th>
                    <th className="py-3.5 px-4">Stock en Planta</th>
                    <th className="py-3.5 px-4">Costo Unitario</th>
                    <th className="py-3.5 px-4">Valor Total</th>
                    <th className="py-3.5 px-4">Ubicación Taller</th>
                    <th className="py-3.5 px-4">Proveedor</th>
                    <th className="py-3.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredInsumos.map((i) => (
                    <tr key={i.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <Box className="w-4 h-4 text-red-500 shrink-0" />
                          <span>{i.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1a1a26] text-zinc-300 border border-zinc-700/60">
                          {i.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base font-black text-amber-400">{i.stock.toLocaleString()}</span>
                          <span className="text-[10px] text-zinc-400 font-bold">{i.unit}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-zinc-300 font-mono">${i.unitCost.toFixed(2)} /{i.unit}</td>
                      <td className="py-4 px-4 font-black text-emerald-400">${i.totalValue.toLocaleString()} MXN</td>
                      <td className="py-4 px-4 text-zinc-400 text-[11px]">{i.location}</td>
                      <td className="py-4 px-4 text-zinc-400 text-[11px] truncate max-w-xs">{i.provider}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => {
                            setIsRestockingInsumo(i);
                            setRestockAmount(50);
                          }}
                          className="bg-zinc-800 hover:bg-emerald-950 text-emerald-400 font-bold px-3 py-1.5 rounded-xl border border-emerald-900/40 text-xs transition-colors cursor-pointer"
                        >
                          ⚡ Reabastecer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: RECETAS MAESTRAS & BOM */}
      {subTab === 'recetas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipes.map((r) => {
            const retailPriceEstimate = r.id === 'rec-4' ? 195 : 85;
            const grossMargin = Math.round(((retailPriceEstimate - r.cogsPerBag) / retailPriceEstimate) * 100);

            return (
              <div key={r.id} className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-start pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">BOM Oficial BadGommys</span>
                    <h3 className="text-lg font-black text-white mt-0.5">{r.name}</h3>
                    <p className="text-xs text-zinc-400">Presentación hermética de {r.weight} • Lote estándar de {r.batchUnits} piezas</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block font-bold">Costo Unitario (COGS)</span>
                    <span className="text-xl font-black text-emerald-400">${r.cogsPerBag.toFixed(2)} MXN</span>
                  </div>
                </div>

                {/* Profit Margin bar */}
                <div className="p-3 bg-[#181824] rounded-2xl border border-zinc-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Precio de Venta Sugerido:</span>
                    <strong className="text-white font-mono text-sm">${retailPriceEstimate} MXN</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Margen Bruto de Utilidad:</span>
                    <strong className="text-emerald-400 font-mono text-sm">{grossMargin}% de Rentabilidad</strong>
                  </div>
                </div>

                {/* Recipe Ingredients Breakdown */}
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Insumos por Lote y Bolsa:</span>
                  <div className="divide-y divide-zinc-800/60 bg-[#161622] rounded-2xl border border-zinc-800/80 overflow-hidden">
                    {r.items.map((item, idx) => (
                      <div key={idx} className="p-2.5 flex justify-between items-center text-[11px]">
                        <div>
                          <span className="font-bold text-zinc-200">{item.ingredient}</span>
                          <span className="text-zinc-500 block text-[10px]">Por bolsa: {item.perUnit} (Total lote: {item.perBatch})</span>
                        </div>
                        <span className="font-mono text-zinc-300 font-semibold">${item.costPerUnit.toFixed(2)} MXN</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-VIEW 3: LOTES DE PRODUCCIÓN */}
      {subTab === 'lotes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {batches.map((b) => (
              <div key={b.id} className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <span className="font-mono font-black text-amber-400 text-xs">{b.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      b.status === 'Completado y en Almacén'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                        : b.status === 'Control de calidad'
                        ? 'bg-amber-950 text-amber-400 border-amber-800/60'
                        : 'bg-red-950 text-red-400 border-red-800/60'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <h4 className="font-black text-white text-base mt-2">{b.recipeName}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{b.notes}</p>
                  
                  <div className="mt-3 p-3 bg-[#181824] rounded-2xl border border-zinc-800 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">Volumen Fabricado:</span>
                      <strong className="text-white text-sm font-black">{b.units.toLocaleString()} bolsas</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold block">Fecha Inicio:</span>
                      <span className="text-zinc-400 font-mono text-[11px]">{b.startedAt}</span>
                    </div>
                  </div>
                </div>

                {/* Status Switcher Button */}
                <div className="pt-2 border-t border-zinc-800/80 flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-bold">Avanzar Proceso:</span>
                  {b.status !== 'Completado y en Almacén' ? (
                    <button
                      onClick={() => onUpdateBatchStatus(b.id, b.status === 'En cocción y macerado' ? 'Control de calidad' : 'Completado y en Almacén')}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{b.status === 'En cocción y macerado' ? 'A Control Calidad' : 'Completar en Almacén'}</span>
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Disponible en Catálogo</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: ÓRDENES DE COMPRA (OC) */}
      {subTab === 'compras' && (
        <div className="space-y-4">
          <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161622] text-zinc-400 uppercase tracking-wider font-extrabold border-b border-zinc-800 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Folio OC</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Proveedor Oficial</th>
                  <th className="py-3.5 px-4">Insumos Solicitados</th>
                  <th className="py-3.5 px-4">Total con IVA</th>
                  <th className="py-3.5 px-4">Factura CFDI</th>
                  <th className="py-3.5 px-4">Estatus</th>
                  <th className="py-3.5 px-4 text-right">Recepción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-4 px-4 font-mono font-black text-amber-400">{po.folio}</td>
                    <td className="py-4 px-4 text-zinc-400">{po.date}</td>
                    <td className="py-4 px-4 font-bold text-white">{po.provider}</td>
                    <td className="py-4 px-4 text-zinc-300 text-[11px] whitespace-pre-line max-w-xs">{po.itemsRequested}</td>
                    <td className="py-4 px-4 font-black text-emerald-400 font-mono">${po.totalWithTax.toFixed(2)} MXN</td>
                    <td className="py-4 px-4 font-mono text-[11px] text-zinc-400">{po.cfdiInvoice}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        po.status === 'Recibida en Almacén'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                          : 'bg-amber-950 text-amber-400 border-amber-800/60'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {!po.receivedInStock ? (
                        <button
                          onClick={() => onMarkPurchaseOrderReceived(po.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer shadow-md"
                        >
                          Confirmar Ingreso
                        </button>
                      ) : (
                        <span className="text-zinc-500 font-bold text-xs">✓ Ingresado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: REABASTECER INSUMO */}
      {isRestockingInsumo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-sm w-full rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-sm">Reabastecer {isRestockingInsumo.name}</h3>
              <button onClick={() => setIsRestockingInsumo(null)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleConfirmRestock} className="space-y-3 text-xs">
              <p className="text-zinc-400">
                Stock actual: <strong className="text-white font-bold">{isRestockingInsumo.stock} {isRestockingInsumo.unit}</strong>
              </p>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Cantidad a ingresar ({isRestockingInsumo.unit})</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-black text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestockingInsumo(null)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Ingresar a Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR NUEVO INSUMO */}
      {isAddingInsumo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Registrar Materia Prima / Insumo</h3>
              <button onClick={() => setIsAddingInsumo(false)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateInsumo} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Nombre del Insumo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pulpa Concentrada de Mango Criollo"
                  value={newInsName}
                  onChange={(e) => setNewInsName(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Familia / Categoría</label>
                  <select
                    value={newInsCat}
                    onChange={(e) => setNewInsCat(e.target.value as any)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="Chile & Salsa">Chile & Salsa</option>
                    <option value="Ingrediente Base">Ingrediente Base</option>
                    <option value="Empaque & Envase">Empaque & Envase</option>
                    <option value="Aditivos & Ácidos">Aditivos & Ácidos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Unidad de Medida</label>
                  <input
                    type="text"
                    required
                    placeholder="kg, L, pzas"
                    value={newInsUnit}
                    onChange={(e) => setNewInsUnit(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Stock Inicial</label>
                  <input
                    type="number"
                    required
                    value={newInsStock}
                    onChange={(e) => setNewInsStock(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Costo Unitario ($ MXN)</label>
                  <input
                    type="number"
                    required
                    value={newInsCost}
                    onChange={(e) => setNewInsCost(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingInsumo(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Guardar en Almacén
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREAR LOTE DE PRODUCCIÓN */}
      {isAddingBatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Iniciar Nuevo Lote de Producción</h3>
              <button onClick={() => setIsAddingBatch(false)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Seleccionar Receta Maestra</label>
                <select
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                >
                  {recipes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.weight})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Unidades a Producir (Bolsas terminadas)</label>
                <input
                  type="number"
                  required
                  min={10}
                  value={batchUnits}
                  onChange={(e) => setBatchUnits(Number(e.target.value))}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-amber-400 font-black text-sm"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  💡 Al completar el lote, las unidades se sumarán automáticamente al inventario del catálogo de la tienda.
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Notas de Fabricación & Calidad</label>
                <textarea
                  rows={2}
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingBatch(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Iniciar Lote en Taller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
