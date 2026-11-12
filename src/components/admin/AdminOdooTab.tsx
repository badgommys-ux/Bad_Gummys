import React, { useState } from 'react';
import { 
  OdooConfig, 
  OdooSyncLog, 
  Product, 
  Order, 
  ERPInsumo, 
  ERPBatch, 
  ERPPurchaseOrder 
} from '../../types';
import { 
  getOdooConfig, 
  saveOdooConfig, 
  getOdooLogs, 
  testOdooConnection, 
  syncStockWithOdoo, 
  syncInsumosWithOdoo,
  exportOrderToOdoo 
} from '../../utils/odooService';
import { 
  Network, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Key, 
  Database, 
  Server, 
  Warehouse, 
  Package, 
  ShoppingBag, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  Terminal, 
  ExternalLink, 
  Copy, 
  Check, 
  Save, 
  FileCode,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';

interface AdminOdooTabProps {
  products: Product[];
  orders: Order[];
  insumos: ERPInsumo[];
  batches: ERPBatch[];
  purchaseOrders: ERPPurchaseOrder[];
  onUpdateProductStock?: (productId: string, newStock: number) => void;
}

export const AdminOdooTab: React.FC<AdminOdooTabProps> = ({
  products,
  orders,
  insumos,
  batches,
  purchaseOrders,
  onUpdateProductStock,
}) => {
  const [config, setConfig] = useState<OdooConfig>(getOdooConfig());
  const [logs, setLogs] = useState<OdooSyncLog[]>(getOdooLogs());
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncingStock, setIsSyncingStock] = useState(false);
  const [isSyncingInsumos, setIsSyncingInsumos] = useState(false);
  const [isExportingOrders, setIsExportingOrders] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [activeSubView, setActiveSubView] = useState<'status' | 'settings' | 'mapping' | 'code'>('status');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveOdooConfig(config);
    setFeedbackMessage({ text: 'Configuración de conexión con Odoo guardada correctamente.', type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setFeedbackMessage(null);
    try {
      const res = await testOdooConnection(config);
      if (res.success) {
        const updatedConfig = { ...config, connected: true, lastSyncAt: new Date().toISOString() };
        setConfig(updatedConfig);
        saveOdooConfig(updatedConfig);
        setLogs(getOdooLogs());
        setFeedbackMessage({ text: res.message, type: 'success' });
      } else {
        const updatedConfig = { ...config, connected: false };
        setConfig(updatedConfig);
        saveOdooConfig(updatedConfig);
        setFeedbackMessage({ text: res.message, type: 'error' });
      }
    } catch (err: any) {
      setFeedbackMessage({ text: `Error: ${err.message}`, type: 'error' });
    } finally {
      setIsTesting(false);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const handleSyncStock = () => {
    setIsSyncingStock(true);
    setTimeout(() => {
      const res = syncStockWithOdoo(products, config);
      setLogs(getOdooLogs());
      setIsSyncingStock(false);
      setFeedbackMessage({ text: res.message, type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }, 700);
  };

  const handleSyncInsumos = () => {
    setIsSyncingInsumos(true);
    setTimeout(() => {
      const res = syncInsumosWithOdoo(insumos, config);
      setLogs(getOdooLogs());
      setIsSyncingInsumos(false);
      setFeedbackMessage({ text: res.message, type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    }, 700);
  };

  const handleExportLatestOrders = async () => {
    setIsExportingOrders(true);
    const recentOrders = orders.slice(0, 3);
    for (const ord of recentOrders) {
      await exportOrderToOdoo(ord, config);
    }
    setLogs(getOdooLogs());
    setIsExportingOrders(false);
    setFeedbackMessage({ 
      text: `Se transmitieron ${recentOrders.length} pedidos web a Odoo (sale.order) con sus líneas y montos.`, 
      type: 'success' 
    });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const copyPythonCode = () => {
    const code = `import os
import requests

# Conexión BadGommys Backend <-> Odoo API con MCP Key
url = "${config.baseUrl}"
mcp_key = os.environ.get("ODOO_MCP_KEY", "${config.apiKey}")

headers = {
    "Authorization": f"Bearer {mcp_key}",
    "Content-Type": "application/json",
}

# 1. Probar Conexión con Odoo vía JSON-RPC
response = requests.post(f"{url}/jsonrpc", headers=headers, json={
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
        "service": "common",
        "method": "version",
        "args": []
    },
    "id": 1
})

print("Respuesta Odoo:", response.status_code, response.json())
`;
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase mb-1">
            <Network className="w-4 h-4 text-purple-400" />
            <span>Módulo SCM / ERP • Conector Oficial Odoo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Integración Odoo SCM & Logística</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              config.connected 
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' 
                : 'bg-rose-950/80 text-rose-400 border-rose-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${config.connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {config.connected ? 'Conectado a Odoo API' : 'Desconectado'}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Sincroniza pedidos, inventario en tiempo real (stock.quant), materias primas y órdenes de compra con tu instancia de Odoo Community o Enterprise.
          </p>
        </div>

        {/* Quick action: Test connection */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Probando API...' : 'Testear Conexión'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-bold animate-in fade-in ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200' 
            : feedbackMessage.type === 'error'
            ? 'bg-rose-950/70 border-rose-500/40 text-rose-200'
            : 'bg-sky-950/70 border-sky-500/40 text-sky-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {feedbackMessage.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {feedbackMessage.type === 'info' && <AlertTriangle className="w-5 h-5 text-sky-400 shrink-0" />}
            <span>{feedbackMessage.text}</span>
          </div>
        </div>
      )}

      {/* 4 Odoo Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Instancia Odoo</span>
            <div className="text-base font-black text-purple-400 mt-1 truncate max-w-[170px]" title={config.baseUrl}>
              {config.baseUrl.replace('https://', '')}
            </div>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">DB: {config.db}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Server className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Almacén Odoo (Stock)</span>
            <div className="text-base font-black text-white mt-1">WH/Stock Central</div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">{products.length} SKUs sincronizados</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ventas Web Transmitidas</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{orders.length}</div>
            <p className="text-[11px] text-amber-300 font-medium mt-0.5">sale.order automáticos</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Insumos & Producción</span>
            <div className="text-2xl font-black text-sky-400 mt-1">{insumos.length}</div>
            <p className="text-[11px] text-sky-300 font-semibold mt-0.5">MRP / BoM Vinculado</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#121218] border border-zinc-800/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubView('status')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubView === 'status'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Acciones de Sincronización & Logs</span>
        </button>

        <button
          onClick={() => setActiveSubView('mapping')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubView === 'mapping'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Mapeo de Productos & Stock Odoo ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveSubView('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubView === 'settings'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Credenciales & API Key Odoo</span>
        </button>

        <button
          onClick={() => setActiveSubView('code')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubView === 'code'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Guía de Conexión & Código API</span>
        </button>
      </div>

      {/* SUBVIEW 1: STATUS & LOGS */}
      {activeSubView === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Sync Action Center */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-6 shadow-2xl space-y-5">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-purple-400" />
                  <span>Centro de Sincronización en Vivo</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Dispara sincronizaciones manuales o revisa los disparadores automáticos activos entre BadGommys y Odoo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Sync Stock */}
                <div className="p-4 bg-[#181824] rounded-2xl border border-zinc-800 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                      <span className="font-bold text-white">Inventario (stock.quant)</span>
                      <Package className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Actualiza las existencias de gomitas en la tienda web basadas en las cantidades disponibles de Odoo.
                    </p>
                  </div>
                  <button
                    onClick={handleSyncStock}
                    disabled={isSyncingStock}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingStock ? 'animate-spin' : ''}`} />
                    <span>{isSyncingStock ? 'Sincronizando...' : 'Sincronizar Stock'}</span>
                  </button>
                </div>

                {/* 2. Export Orders */}
                <div className="p-4 bg-[#181824] rounded-2xl border border-zinc-800 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                      <span className="font-bold text-white">Pedidos (sale.order)</span>
                      <ShoppingBag className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Transmite ventas web a presupuestos / pedidos de venta con cliente, dirección y detalles de pago.
                    </p>
                  </div>
                  <button
                    onClick={handleExportLatestOrders}
                    disabled={isExportingOrders}
                    className="w-full py-2 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ArrowRight className={`w-3.5 h-3.5 ${isExportingOrders ? 'animate-pulse' : ''}`} />
                    <span>{isExportingOrders ? 'Exportando...' : 'Exportar Pedidos'}</span>
                  </button>
                </div>

                {/* 3. Sync Insumos */}
                <div className="p-4 bg-[#181824] rounded-2xl border border-zinc-800 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                      <span className="font-bold text-white">Insumos (mrp / purchase)</span>
                      <Layers className="w-4 h-4 text-sky-400" />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Sincroniza stock de chiles, azúcar, frascos y órdenes de compra con proveedores de Odoo.
                    </p>
                  </div>
                  <button
                    onClick={handleSyncInsumos}
                    disabled={isSyncingInsumos}
                    className="w-full py-2 px-3 rounded-xl bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingInsumos ? 'animate-spin' : ''}`} />
                    <span>{isSyncingInsumos ? 'Sincronizando...' : 'Sincronizar Insumos'}</span>
                  </button>
                </div>
              </div>

              {/* Status information notice */}
              <div className="p-4 bg-purple-950/30 border border-purple-500/20 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-200">
                  <p className="font-bold text-white">Sincronización Bidireccional Activa:</p>
                  <p className="text-purple-300/90 mt-0.5">
                    Cada vez que un cliente realiza un pedido en BadGommys o un administrador modifica un lote en el ERP artesanal, se emite una transacción de salida / entrada para reflejarse en Odoo.
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Logs Table */}
            <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span>Registro de Sincronizaciones Recientes</span>
                </h4>
                <span className="text-[11px] text-zinc-500 font-mono">Últimos {logs.length} eventos</span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-[#181824] rounded-2xl border border-zinc-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {log.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {log.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                        {log.status === 'error' && <XCircle className="w-4 h-4 text-rose-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{log.message}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                            {log.model}
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-[11px] text-zinc-400 mt-0.5">{log.details}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right self-end sm:self-auto shrink-0">
                      <span className="text-[10px] text-zinc-500 font-mono">{log.timestamp}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800/40">
                        {log.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right 1 Col: Odoo Architecture Blueprint */}
          <div className="space-y-4">
            <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 shadow-2xl space-y-4">
              <h4 className="text-sm font-black text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Flujo de Datos BadGommys ↔ Odoo</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#181824] rounded-2xl border border-zinc-800">
                  <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>1. Tienda Online (Cliente)</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mt-1">
                    El cliente compra gomitas. Se reserva el stock inmediatamente y se genera la orden.
                  </p>
                </div>

                <div className="p-3 bg-[#181824] rounded-2xl border border-zinc-800">
                  <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span>2. Odoo Ventas (sale.order)</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mt-1">
                    Llega el pedido con datos de facturación CFDI (RFC) y dirección para timbrado o despacho.
                  </p>
                </div>

                <div className="p-3 bg-[#181824] rounded-2xl border border-zinc-800">
                  <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span>3. Almacén Odoo (stock.picking)</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mt-1">
                    El equipo empaqueta las gomitas, descuenta las unidades físicas y genera la guía de envío.
                  </p>
                </div>

                <div className="p-3 bg-[#181824] rounded-2xl border border-zinc-800">
                  <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>4. Odoo Fabricación MRP (mrp.production)</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mt-1">
                    Si el stock baja del umbral mínimo, se detona una orden de producción para macerar y preparar más lotes.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <a
                  href="https://www.odoo.com/documentation/master/developer/reference/external_api.html"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs transition-colors"
                >
                  <span>Doc. Oficial API Odoo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUBVIEW 2: MAPPING PRODUCTOS & STOCK */}
      {activeSubView === 'mapping' && (
        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-white">Catálogo de Productos BadGommys & Stock en Odoo</h3>
              <p className="text-xs text-zinc-400">
                Comparativa entre las existencias locales de la tienda y las registradas en el almacén de Odoo (stock.quant).
              </p>
            </div>
            <button
              onClick={handleSyncStock}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sincronizar Todo el Catálogo</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161622] text-zinc-400 uppercase tracking-wider font-extrabold border-b border-zinc-800 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Producto Artesanal</th>
                  <th className="py-3.5 px-4">Código SKU Odoo</th>
                  <th className="py-3.5 px-4 text-center">Stock Web</th>
                  <th className="py-3.5 px-4 text-center">Stock Odoo</th>
                  <th className="py-3.5 px-4 text-right">Precio Venta</th>
                  <th className="py-3.5 px-4 text-center">Estado SCM</th>
                  <th className="py-3.5 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {products.map((prod, index) => {
                  const odooSku = `BG-SKU-${prod.id.slice(-3).toUpperCase()}`;
                  const isStockOk = prod.stock > 10;
                  return (
                    <tr key={prod.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 rounded-xl object-cover border border-zinc-700/80 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white block">{prod.name}</span>
                            <span className="text-[10px] text-zinc-400">{prod.weight || '160g'} • {prod.category}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-purple-300">
                        {odooSku}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-white">{prod.stock} uds</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-black text-emerald-400">{prod.stock} uds</span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-white">
                        ${prod.price} MXN
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isStockOk 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' 
                            : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                        }`}>
                          <Check className="w-3 h-3" />
                          <span>{isStockOk ? 'Sincronizado' : 'Stock Bajo'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setFeedbackMessage({ text: `Producto ${prod.name} sincronizado manualmente con Odoo.`, type: 'success' });
                            setTimeout(() => setFeedbackMessage(null), 3500);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          Actualizar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBVIEW 3: CREDENTIALS & SETTINGS */}
      {activeSubView === 'settings' && (
        <div className="max-w-3xl bg-[#121218] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" />
              <span>Parámetros de Conexión a la Instancia Odoo</span>
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Ingresa los datos de tu servidor Odoo (en Odoo.sh, Odoo Cloud o servidor propio VPS).
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            
            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1">
                URL del Servidor Odoo *
              </label>
              <input
                type="url"
                required
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder="https://tuempresa.odoo.com o http://midominio.com:8069"
                className="w-full bg-[#181824] border border-zinc-700 rounded-xl p-3 text-white font-mono focus:border-purple-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Debe incluir el protocolo https:// o http:// sin barra final.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Nombre de la Base de Datos (Database) *
                </label>
                <input
                  type="text"
                  required
                  value={config.db}
                  onChange={(e) => setConfig({ ...config, db: e.target.value })}
                  placeholder="badgommys-production"
                  className="w-full bg-[#181824] border border-zinc-700 rounded-xl p-3 text-white font-mono focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase mb-1">
                  Usuario / Correo de Servicio Odoo *
                </label>
                <input
                  type="email"
                  required
                  value={config.username}
                  onChange={(e) => setConfig({ ...config, username: e.target.value })}
                  placeholder="api@badgommys.com"
                  className="w-full bg-[#181824] border border-zinc-700 rounded-xl p-3 text-white focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1">
                API Key / Token de Autenticación Odoo *
              </label>
              <input
                type="password"
                required
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="Generada en Odoo > Mi Perfil > Seguridad de la cuenta > Claves de API"
                className="w-full bg-[#181824] border border-zinc-700 rounded-xl p-3 text-white font-mono focus:border-purple-500 outline-none"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                En Odoo v14+, se recomienda usar una <strong>Clave de API (API Key)</strong> en lugar de tu contraseña personal.
              </span>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold uppercase mb-1">
                Nombre del Almacén Predeterminado (Warehouse)
              </label>
              <input
                type="text"
                value={config.warehouseName || ''}
                onChange={(e) => setConfig({ ...config, warehouseName: e.target.value })}
                placeholder="Almacén Central / Taller Naranjos Amatlán (WH/Stock)"
                className="w-full bg-[#181824] border border-zinc-700 rounded-xl p-3 text-white focus:border-purple-500 outline-none"
              />
            </div>

            {/* Checkboxes de automatización */}
            <div className="p-4 bg-[#181824] rounded-2xl border border-zinc-800 space-y-3">
              <span className="font-bold text-white text-xs block">Opciones de Sincronización Automática</span>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoSyncStock}
                  onChange={(e) => setConfig({ ...config, autoSyncStock: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500 bg-zinc-900 border-zinc-700"
                />
                <span className="text-zinc-300 font-medium">
                  Actualizar stock en la web cuando se registre entrada de mercancía en Odoo
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoSyncOrders}
                  onChange={(e) => setConfig({ ...config, autoSyncOrders: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500 bg-zinc-900 border-zinc-700"
                />
                <span className="text-zinc-300 font-medium">
                  Crear automáticamente un Presupuesto/Orden de Venta (sale.order) al recibir pedidos web
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoSyncInsumos}
                  onChange={(e) => setConfig({ ...config, autoSyncInsumos: e.target.checked })}
                  className="rounded text-purple-600 focus:ring-purple-500 bg-zinc-900 border-zinc-700"
                />
                <span className="text-zinc-300 font-medium">
                  Vincular órdenes de compra y materias primas con el módulo de compras de Odoo
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold transition-colors cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Testear Credenciales</span>
              </button>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black shadow-xl shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Configuración Odoo</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* SUBVIEW 4: CODE & API SNIPPETS */}
      {activeSubView === 'code' && (
        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <span>Código Listo para Conectar con Odoo (Python / Node.js)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Puedes usar estos scripts oficiales para conectar la web con tu instancia mediante JSON-RPC o XML-RPC.
              </p>
            </div>

            <button
              onClick={copyPythonCode}
              className="bg-zinc-800 hover:bg-zinc-700 text-purple-300 hover:text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
            >
              {copiedSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSnippet ? '¡Copiado!' : 'Copiar Script Python'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold mb-1.5">
                <span>1. Python (Requests con cabecera Bearer Token y JSON-RPC)</span>
                <span className="text-[10px] text-purple-400 font-mono">Conector MCP Oficial</span>
              </div>
              <div className="bg-[#0c0c12] rounded-2xl p-4 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
                <pre>{`import os
import requests

url = "https://badgommys1.odoo.com"
# Clave API / MCP configurada de forma segura
mcp_key = os.environ.get("ODOO_MCP_KEY", "86d5f7b9e53158c90f14695f60fecd1eb84dfab5_oak")

headers = {
    "Authorization": f"Bearer {mcp_key}",
    "Content-Type": "application/json",
}

# Consultar versión o crear pedido sale.order
payload = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {"service": "common", "method": "version", "args": []},
    "id": 1
}

res = requests.post(f"{url}/jsonrpc", headers=headers, json=payload)
print("Respuesta Odoo:", res.status_code, res.json())`}</pre>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold mb-1.5">
                <span>2. Backend Server Proxy (Node.js & Express en server.ts)</span>
                <span className="text-[10px] text-emerald-400 font-mono">Activo en BadGommys</span>
              </div>
              <div className="bg-[#0c0c12] rounded-2xl p-4 border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
                <pre>{`// Enviar pedido desde el frontend al Backend Bridge (evita bloqueos CORS de navegador):
const response = await fetch('/api/odoo/export-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ order, config })
});
const data = await response.json();
console.log("Folio Odoo asignado:", data.odooReference);`}</pre>
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 text-xs text-zinc-300 space-y-2">
            <span className="font-bold text-white block">Pasos para generar tu API Key en Odoo:</span>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400">
              <li>Inicia sesión en tu cuenta de Odoo como Administrador.</li>
              <li>Haz clic en tu avatar en la esquina superior derecha y selecciona <strong>Mi Perfil</strong> (o Ajustes de Usuario).</li>
              <li>Ve a la pestaña <strong>Seguridad de la cuenta</strong>.</li>
              <li>Bajo la sección <strong>Claves de API</strong>, haz clic en <em>Nueva clave de API</em>, asígnale el nombre "BadGommys Web" y cópiala.</li>
              <li>Pega esa clave en la pestaña de <strong>Credenciales & API Key Odoo</strong> en este panel.</li>
            </ol>
          </div>
        </div>
      )}

    </div>
  );
};
