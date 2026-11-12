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
  ShieldCheck,
  Edit,
  Trash2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface AdminErpTabProps {
  insumos: ERPInsumo[];
  recipes: ERPRecipe[];
  batches: ERPBatch[];
  purchaseOrders: ERPPurchaseOrder[];
  products: Product[];
  onUpdateInsumo: (updated: ERPInsumo) => void;
  onAddInsumo: (newInsumo: ERPInsumo) => void;
  onDeleteInsumo?: (id: string) => void;
  onUpdateRecipe?: (updated: ERPRecipe) => void;
  onUpdateBatch?: (updated: ERPBatch) => void;
  onDeleteBatch?: (id: string) => void;
  onUpdateBatchStatus: (batchId: string, status: ERPBatch['status']) => void;
  onAddBatch: (newBatch: ERPBatch, targetProduct?: Product) => void;
  onUpdatePurchaseOrder?: (updated: ERPPurchaseOrder) => void;
  onDeletePurchaseOrder?: (id: string) => void;
  onMarkPurchaseOrderReceived: (poId: string) => void;
  onAddPurchaseOrder?: (po: ERPPurchaseOrder) => void;
  onNavigateToOdoo?: () => void;
}

export const AdminErpTab: React.FC<AdminErpTabProps> = ({
  insumos,
  recipes,
  batches,
  purchaseOrders,
  products,
  onUpdateInsumo,
  onAddInsumo,
  onDeleteInsumo,
  onUpdateRecipe,
  onUpdateBatch,
  onDeleteBatch,
  onUpdateBatchStatus,
  onAddBatch,
  onUpdatePurchaseOrder,
  onDeletePurchaseOrder,
  onMarkPurchaseOrderReceived,
  onAddPurchaseOrder,
  onNavigateToOdoo,
}) => {
  const [subTab, setSubTab] = useState<'insumos' | 'recetas' | 'lotes' | 'compras'>('insumos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals for Restock & Add Insumo
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

  // EDIT INSUMO MODAL
  const [isEditingInsumo, setIsEditingInsumo] = useState<ERPInsumo | null>(null);
  const [editInsName, setEditInsName] = useState('');
  const [editInsCat, setEditInsCat] = useState<ERPInsumo['category']>('Chile & Salsa');
  const [editInsStock, setEditInsStock] = useState(0);
  const [editInsUnit, setEditInsUnit] = useState('kg');
  const [editInsCost, setEditInsCost] = useState(0);
  const [editInsMin, setEditInsMin] = useState(0);
  const [editInsProvider, setEditInsProvider] = useState('');
  const [editInsLocation, setEditInsLocation] = useState('');

  // EDIT RECIPE MODAL
  const [isEditingRecipe, setIsEditingRecipe] = useState<ERPRecipe | null>(null);
  const [editRecName, setEditRecName] = useState('');
  const [editRecWeight, setEditRecWeight] = useState('');
  const [editRecBatchUnits, setEditRecBatchUnits] = useState(300);
  const [editRecCogsPerBag, setEditRecCogsPerBag] = useState(0);

  // New Production Batch Modal
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id || '');
  const [batchUnits, setBatchUnits] = useState(300);
  const [batchNotes, setBatchNotes] = useState('Lote para atender pedidos semanales y tienda física.');

  // EDIT BATCH MODAL
  const [isEditingBatch, setIsEditingBatch] = useState<ERPBatch | null>(null);
  const [editBatchCode, setEditBatchCode] = useState('');
  const [editBatchRecipeName, setEditBatchRecipeName] = useState('');
  const [editBatchUnits, setEditBatchUnits] = useState(0);
  const [editBatchStatus, setEditBatchStatus] = useState<ERPBatch['status']>('En cocción y macerado');
  const [editBatchNotes, setEditBatchNotes] = useState('');
  const [editBatchStartedAt, setEditBatchStartedAt] = useState('');

  // New Purchase Order Modal
  const [isAddingPO, setIsAddingPO] = useState(false);
  const [newPoProvider, setNewPoProvider] = useState('Distribuidora de Chiles & Especias Central de Abasto');
  const [newPoItems, setNewPoItems] = useState('10 kg - Mezcla Secreta Chile Piquín\n12 L - Chamoy Concentrado Especial');
  const [newPoTotal, setNewPoTotal] = useState(1480);

  // EDIT PURCHASE ORDER MODAL
  const [isEditingPO, setIsEditingPO] = useState<ERPPurchaseOrder | null>(null);
  const [editPoFolio, setEditPoFolio] = useState('');
  const [editPoProvider, setEditPoProvider] = useState('');
  const [editPoDate, setEditPoDate] = useState('');
  const [editPoItems, setEditPoItems] = useState('');
  const [editPoTotal, setEditPoTotal] = useState(0);
  const [editPoInvoice, setEditPoInvoice] = useState('');
  const [editPoStatus, setEditPoStatus] = useState<ERPPurchaseOrder['status']>('Enviada al Proveedor');

  // Open Edit Insumo
  const handleOpenEditInsumo = (ins: ERPInsumo) => {
    setIsEditingInsumo(ins);
    setEditInsName(ins.name);
    setEditInsCat(ins.category);
    setEditInsStock(ins.stock);
    setEditInsUnit(ins.unit);
    setEditInsCost(ins.unitCost);
    setEditInsMin(ins.minStock);
    setEditInsProvider(ins.provider);
    setEditInsLocation(ins.location);
  };

  // Save Edit Insumo
  const handleSaveEditInsumo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingInsumo) return;
    const stock = Number(editInsStock);
    const unitCost = Number(editInsCost);
    const updated: ERPInsumo = {
      ...isEditingInsumo,
      name: editInsName.trim(),
      category: editInsCat,
      stock,
      unit: editInsUnit.trim(),
      unitCost,
      minStock: Number(editInsMin),
      totalValue: Math.round(stock * unitCost * 100) / 100,
      provider: editInsProvider.trim(),
      location: editInsLocation.trim(),
    };
    onUpdateInsumo(updated);
    setIsEditingInsumo(null);
  };

  // Open Edit Recipe
  const handleOpenEditRecipe = (r: ERPRecipe) => {
    setIsEditingRecipe(r);
    setEditRecName(r.name);
    setEditRecWeight(r.weight);
    setEditRecBatchUnits(r.batchUnits);
    setEditRecCogsPerBag(r.cogsPerBag);
  };

  // Save Edit Recipe
  const handleSaveEditRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingRecipe) return;
    const updated: ERPRecipe = {
      ...isEditingRecipe,
      name: editRecName.trim(),
      weight: editRecWeight.trim(),
      batchUnits: Number(editRecBatchUnits),
      cogsPerBag: Number(editRecCogsPerBag),
    };
    onUpdateRecipe?.(updated);
    setIsEditingRecipe(null);
  };

  // Open Edit Batch
  const handleOpenEditBatch = (b: ERPBatch) => {
    setIsEditingBatch(b);
    setEditBatchCode(b.code);
    setEditBatchRecipeName(b.recipeName);
    setEditBatchUnits(b.units);
    setEditBatchStatus(b.status);
    setEditBatchNotes(b.notes);
    setEditBatchStartedAt(b.startedAt);
  };

  // Save Edit Batch
  const handleSaveEditBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingBatch) return;
    const updated: ERPBatch = {
      ...isEditingBatch,
      code: editBatchCode.trim(),
      recipeName: editBatchRecipeName.trim(),
      units: Number(editBatchUnits),
      status: editBatchStatus,
      notes: editBatchNotes.trim(),
      startedAt: editBatchStartedAt.trim(),
    };
    onUpdateBatch?.(updated);
    setIsEditingBatch(null);
  };

  // Open Edit Purchase Order
  const handleOpenEditPO = (po: ERPPurchaseOrder) => {
    setIsEditingPO(po);
    setEditPoFolio(po.folio);
    setEditPoProvider(po.provider);
    setEditPoDate(po.date);
    setEditPoItems(po.itemsRequested);
    setEditPoTotal(po.totalWithTax);
    setEditPoInvoice(po.cfdiInvoice);
    setEditPoStatus(po.status);
  };

  // Save Edit Purchase Order
  const handleSaveEditPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingPO) return;
    const updated: ERPPurchaseOrder = {
      ...isEditingPO,
      folio: editPoFolio.trim(),
      provider: editPoProvider.trim(),
      date: editPoDate.trim(),
      itemsRequested: editPoItems.trim(),
      totalWithTax: Number(editPoTotal),
      cfdiInvoice: editPoInvoice.trim(),
      status: editPoStatus,
      receivedInStock: editPoStatus === 'Recibida en Almacén' ? true : isEditingPO.receivedInStock,
    };
    onUpdatePurchaseOrder?.(updated);
    setIsEditingPO(null);
  };

  // Handle Delete Insumo
  const handleDeleteInsumoConfirm = (id: string) => {
    if (window.confirm('¿Deseas eliminar este insumo del almacén?')) {
      onDeleteInsumo?.(id);
    }
  };

  // Handle Delete Batch
  const handleDeleteBatchConfirm = (id: string) => {
    if (window.confirm('¿Deseas eliminar este lote de producción?')) {
      onDeleteBatch?.(id);
    }
  };

  // Handle Delete PO
  const handleDeletePOConfirm = (id: string) => {
    if (window.confirm('¿Deseas eliminar esta orden de compra?')) {
      onDeletePurchaseOrder?.(id);
    }
  };

  // Handle Restock
  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRestockingInsumo) return;
    const added = Number(restockAmount);
    const updatedStock = isRestockingInsumo.stock + added;
    const updated: ERPInsumo = {
      ...isRestockingInsumo,
      stock: updatedStock,
      totalValue: Math.round(updatedStock * isRestockingInsumo.unitCost * 100) / 100,
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
      totalValue: Math.round(stock * unitCost * 100) / 100,
      location: newInsLocation.trim(),
      provider: newInsProvider.trim(),
      lastRestocked: new Date().toISOString().split('T')[0],
    };

    onAddInsumo(item);
    setIsAddingInsumo(false);
    setNewInsName('');
    setNewInsStock(100);
    setNewInsCost(85);
  };

  // Handle Create Batch
  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe = recipes.find(r => r.id === selectedRecipeId) || recipes[0];
    const targetProduct = products.find(p => p.name.toLowerCase().includes(recipe.name.toLowerCase().split(' ')[0]));

    const newBatch: ERPBatch = {
      id: `batch-${Date.now()}`,
      code: `LOTE-GOM-${Math.floor(100 + Math.random() * 900)}`,
      recipeName: recipe.name,
      units: Number(batchUnits),
      status: 'En cocción y macerado',
      notes: batchNotes.trim() || 'Lote de producción artesanal iniciado en taller.',
      startedAt: new Date().toISOString().split('T')[0],
    };

    onAddBatch(newBatch, targetProduct);
    setIsAddingBatch(false);
  };

  // Handle Create Purchase Order
  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    const newPO: ERPPurchaseOrder = {
      id: `po-${Date.now()}`,
      folio: `OC-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      provider: newPoProvider,
      itemsRequested: newPoItems,
      totalWithTax: Number(newPoTotal),
      cfdiInvoice: `CFDI-PROV-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Enviada al Proveedor',
      receivedInStock: false,
    };

    onAddPurchaseOrder?.(newPO);
    setIsAddingPO(false);
  };

  // Calculated Metrics
  const totalInsumosValue = insumos.reduce((sum, i) => sum + i.totalValue, 0);
  const totalBatchesProduced = batches.reduce((sum, b) => sum + b.units, 0);

  const filteredInsumos = insumos.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase mb-1">
            <Network className="w-4 h-4" />
            <span>Módulo ERP • Fabricación, Costeo BOM & Abastecimiento</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Control de Planta & Cadena de Suministro
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Edita materias primas, recetas maestras, lotes de cocción y órdenes de compra con sincronización automática en catálogo e inventarios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
          {onNavigateToOdoo && (
            <button
              onClick={onNavigateToOdoo}
              className="bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 hover:text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
              title="Abrir conector oficial y sincronizador Odoo SCM"
            >
              <Network className="w-4 h-4 text-purple-400" />
              <span>Conector Odoo SCM</span>
            </button>
          )}

          {subTab === 'insumos' && (
            <button
              onClick={() => setIsAddingInsumo(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Insumo</span>
            </button>
          )}

          {subTab === 'lotes' && (
            <button
              onClick={() => setIsAddingBatch(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Flame className="w-4 h-4" />
              <span>Crear Lote de Producción</span>
            </button>
          )}

          {subTab === 'compras' && (
            <button
              onClick={() => setIsAddingPO(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Orden de Compra</span>
            </button>
          )}
        </div>
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
            <div className="text-2xl font-black text-white mt-1">{recipes.length} Maestras</div>
            <p className="text-[11px] text-purple-300 font-semibold mt-0.5">Margen Promedio: ~74%</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Órdenes de Compra (OC)</span>
            <div className="text-2xl font-black text-sky-400 mt-1">{purchaseOrders.length}</div>
            <p className="text-[11px] text-sky-300 font-semibold mt-0.5">Proveedores Conectados</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ERP Sub-Navigation Pills */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#121218] border border-zinc-800/80 rounded-2xl w-fit">
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
          <span>Recetas Maestras & BOM ({recipes.length})</span>
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
                    <th className="py-3.5 px-4 text-right">Acciones ERP</th>
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
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditInsumo(i)}
                            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 border border-zinc-700/60 transition-all cursor-pointer"
                            title="Editar insumo"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setIsRestockingInsumo(i);
                              setRestockAmount(50);
                            }}
                            className="bg-zinc-800 hover:bg-emerald-950 text-emerald-400 font-bold px-2.5 py-1.5 rounded-xl border border-emerald-900/40 text-xs transition-colors cursor-pointer"
                          >
                            ⚡ Reabastecer
                          </button>

                          <button
                            onClick={() => handleDeleteInsumoConfirm(i.id)}
                            className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-zinc-700/60 transition-all cursor-pointer"
                            title="Eliminar insumo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">BOM Oficial BadGommys</span>
                      <button
                        onClick={() => handleOpenEditRecipe(r)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Editar receta y costeo"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="text-lg font-black text-white mt-0.5">{r.name}</h3>
                    <p className="text-xs text-zinc-400">Presentación de {r.weight} • Lote estándar de {r.batchUnits} piezas</p>
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

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleOpenEditRecipe(r)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-400" />
                    <span>Editar Receta & COGS</span>
                  </button>
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
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        b.status === 'Completado y en Almacén'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                          : b.status === 'Control de calidad'
                          ? 'bg-amber-950 text-amber-400 border-amber-800/60'
                          : 'bg-red-950 text-red-400 border-red-800/60'
                      }`}>
                        {b.status}
                      </span>
                      <button
                        onClick={() => handleOpenEditBatch(b)}
                        className="p-1 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Editar lote"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </div>
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

                {/* Status Switcher & Actions */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditBatch(b)}
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
                      title="Editar datos del lote"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteBatchConfirm(b.id)}
                      className="p-1.5 bg-zinc-800 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 rounded-xl text-xs transition-colors cursor-pointer"
                      title="Eliminar lote"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {b.status !== 'Completado y en Almacén' ? (
                    <button
                      onClick={() => onUpdateBatchStatus(b.id, b.status === 'En cocción y macerado' ? 'Control de calidad' : 'Completado y en Almacén')}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl cursor-pointer shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{b.status === 'En cocción y macerado' ? 'A Calidad' : 'Completar en Almacén'}</span>
                    </button>
                  ) : (
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>En Catálogo</span>
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
                  <th className="py-3.5 px-4 text-right">Acciones OC</th>
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
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditPO(po)}
                          className="p-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 border border-zinc-700/60 transition-all cursor-pointer"
                          title="Editar orden de compra"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {!po.receivedInStock ? (
                          <button
                            onClick={() => onMarkPurchaseOrderReceived(po.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl cursor-pointer shadow-md"
                          >
                            Confirmar Ingreso
                          </button>
                        ) : (
                          <span className="text-zinc-500 font-bold text-xs px-2">✓ Ingresado</span>
                        )}

                        <button
                          onClick={() => handleDeletePOConfirm(po.id)}
                          className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-zinc-700/60 transition-all cursor-pointer"
                          title="Eliminar OC"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR INSUMO / MATERIA PRIMA */}
      {isEditingInsumo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#14141c] border border-amber-500/40 max-w-md w-full rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Editar Insumo: {isEditingInsumo.name}</h3>
              </div>
              <button onClick={() => setIsEditingInsumo(null)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveEditInsumo} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Nombre del Insumo</label>
                <input
                  type="text"
                  required
                  value={editInsName}
                  onChange={(e) => setEditInsName(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Familia / Categoría</label>
                  <select
                    value={editInsCat}
                    onChange={(e) => setEditInsCat(e.target.value as any)}
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
                    value={editInsUnit}
                    onChange={(e) => setEditInsUnit(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold text-[10px]">Stock en Planta</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editInsStock}
                    onChange={(e) => setEditInsStock(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2 text-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold text-[10px]">Costo Unitario ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editInsCost}
                    onChange={(e) => setEditInsCost(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2 text-emerald-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold text-[10px]">Stock Mínimo</label>
                  <input
                    type="number"
                    required
                    value={editInsMin}
                    onChange={(e) => setEditInsMin(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2 text-zinc-300"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-[#181824] rounded-xl border border-zinc-800 flex justify-between items-center text-[11px]">
                <span className="text-zinc-400">Valor Total en Almacén:</span>
                <strong className="text-emerald-400 font-mono text-sm">
                  ${(editInsStock * editInsCost).toLocaleString()} MXN
                </strong>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Proveedor Oficial</label>
                <input
                  type="text"
                  value={editInsProvider}
                  onChange={(e) => setEditInsProvider(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Ubicación en Taller</label>
                <input
                  type="text"
                  value={editInsLocation}
                  onChange={(e) => setEditInsLocation(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-between items-center gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteInsumoConfirm(isEditingInsumo.id);
                    setIsEditingInsumo(null);
                  }}
                  className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 text-rose-400 hover:text-white rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingInsumo(null)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR RECETA & BOM */}
      {isEditingRecipe && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#14141c] border border-purple-500/40 max-w-md w-full rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Editar Receta: {isEditingRecipe.name}</h3>
              </div>
              <button onClick={() => setIsEditingRecipe(null)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveEditRecipe} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Nombre de la Receta</label>
                <input
                  type="text"
                  required
                  value={editRecName}
                  onChange={(e) => setEditRecName(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Presentación / Peso</label>
                  <input
                    type="text"
                    required
                    value={editRecWeight}
                    onChange={(e) => setEditRecWeight(e.target.value)}
                    placeholder="250g"
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Bolsas por Lote Estándar</label>
                  <input
                    type="number"
                    required
                    value={editRecBatchUnits}
                    onChange={(e) => setEditRecBatchUnits(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-amber-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Costo Unitario por Bolsa (COGS $ MXN)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={editRecCogsPerBag}
                  onChange={(e) => setEditRecCogsPerBag(Number(e.target.value))}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-emerald-400 font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditingRecipe(null)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Receta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR LOTE DE PRODUCCIÓN */}
      {isEditingBatch && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#14141c] border border-red-500/40 max-w-md w-full rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-white text-base">Editar Lote: {isEditingBatch.code}</h3>
              </div>
              <button onClick={() => setIsEditingBatch(null)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveEditBatch} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Código de Lote</label>
                  <input
                    type="text"
                    required
                    value={editBatchCode}
                    onChange={(e) => setEditBatchCode(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Unidades Fabricadas</label>
                  <input
                    type="number"
                    required
                    value={editBatchUnits}
                    onChange={(e) => setEditBatchUnits(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Producto / Receta</label>
                <input
                  type="text"
                  required
                  value={editBatchRecipeName}
                  onChange={(e) => setEditBatchRecipeName(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Estado del Lote</label>
                  <select
                    value={editBatchStatus}
                    onChange={(e) => setEditBatchStatus(e.target.value as any)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="En cocción y macerado">En cocción y macerado</option>
                    <option value="Control de calidad">Control de calidad</option>
                    <option value="Completado y en Almacén">Completado y en Almacén</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Fecha de Inicio</label>
                  <input
                    type="text"
                    value={editBatchStartedAt}
                    onChange={(e) => setEditBatchStartedAt(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-zinc-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Notas de Fabricación & Calidad</label>
                <textarea
                  rows={2}
                  value={editBatchNotes}
                  onChange={(e) => setEditBatchNotes(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white resize-none"
                />
              </div>

              <div className="flex justify-between items-center gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteBatchConfirm(isEditingBatch.id);
                    setIsEditingBatch(null);
                  }}
                  className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 text-rose-400 hover:text-white rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingBatch(null)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Lote</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR ORDEN DE COMPRA (OC) */}
      {isEditingPO && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#14141c] border border-sky-500/40 max-w-md w-full rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-white text-base">Editar Orden de Compra: {isEditingPO.folio}</h3>
              </div>
              <button onClick={() => setIsEditingPO(null)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveEditPO} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Folio OC</label>
                  <input
                    type="text"
                    required
                    value={editPoFolio}
                    onChange={(e) => setEditPoFolio(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Fecha</label>
                  <input
                    type="text"
                    required
                    value={editPoDate}
                    onChange={(e) => setEditPoDate(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Proveedor Oficial</label>
                <input
                  type="text"
                  required
                  value={editPoProvider}
                  onChange={(e) => setEditPoProvider(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Insumos y Cantidades Solicitadas</label>
                <textarea
                  rows={3}
                  required
                  value={editPoItems}
                  onChange={(e) => setEditPoItems(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Total con IVA ($ MXN)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editPoTotal}
                    onChange={(e) => setEditPoTotal(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-emerald-400 font-mono font-black"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Estatus OC</label>
                  <select
                    value={editPoStatus}
                    onChange={(e) => setEditPoStatus(e.target.value as any)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                  >
                    <option value="Enviada al Proveedor">Enviada al Proveedor</option>
                    <option value="Recibida en Almacén">Recibida en Almacén</option>
                    <option value="Pendiente de emisión">Pendiente de emisión</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Factura CFDI</label>
                <input
                  type="text"
                  value={editPoInvoice}
                  onChange={(e) => setEditPoInvoice(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-zinc-300 font-mono"
                />
              </div>

              <div className="flex justify-between items-center gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    handleDeletePOConfirm(isEditingPO.id);
                    setIsEditingPO(null);
                  }}
                  className="px-3 py-2 bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 text-rose-400 hover:text-white rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingPO(null)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar OC</span>
                  </button>
                </div>
              </div>
            </form>
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

      {/* MODAL: EMITIR NUEVA ORDEN DE COMPRA (OC) */}
      {isAddingPO && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-white text-base">Emitir Orden de Compra (OC)</h3>
                <p className="text-xs text-zinc-400">Reabastece materias primas directamente con proveedores autorizados.</p>
              </div>
              <button onClick={() => setIsAddingPO(false)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Proveedor Oficial</label>
                <select
                  value={newPoProvider}
                  onChange={(e) => setNewPoProvider(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="Distribuidora de Chiles & Especias Central de Abasto">Distribuidora de Chiles & Especias Central de Abasto</option>
                  <option value="Empaques & Bolsas Industriales de México S.A.">Empaques & Bolsas Industriales de México S.A.</option>
                  <option value="Químicos & Sabores Alimentarios del Centro S.A.">Químicos & Sabores Alimentarios del Centro S.A.</option>
                  <option value="Distribuidora Dulcera del Puerto Veracruz">Distribuidora Dulcera del Puerto Veracruz</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Insumos y Cantidades Solicitadas</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ej: 50 piezas - Bolsas Zipper Stand-Up 250g&#10;5 kg - Grenetina 290 Bloom"
                  value={newPoItems}
                  onChange={(e) => setNewPoItems(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white resize-none font-mono"
                />
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  💡 Al confirmar ingreso en almacén, las cantidades de estos insumos se añadirán automáticamente al stock.
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Monto Total Estimado con IVA ($ MXN)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newPoTotal}
                  onChange={(e) => setNewPoTotal(Number(e.target.value))}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-emerald-400 font-black text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPO(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Enviar Orden a Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
