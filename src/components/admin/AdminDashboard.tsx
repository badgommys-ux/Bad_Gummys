import React, { useState, useEffect } from 'react';
import { 
  Product, 
  Order, 
  User, 
  ContactMessage, 
  OrderStatus, 
  PaymentStatus,
  EmailCampaign,
  EmailSubscriber,
  ERPInsumo,
  ERPRecipe,
  ERPBatch,
  ERPPurchaseOrder
} from '../../types';
import { 
  INITIAL_ERP_INSUMOS,
  INITIAL_ERP_RECIPES,
  INITIAL_ERP_BATCHES,
  INITIAL_ERP_PURCHASE_ORDERS
} from '../../data/initialData';
import { AdminCustomersTab } from './AdminCustomersTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminErpTab } from './AdminErpTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminShipmentsTab } from './AdminShipmentsTab';
import { AdminReportsTab } from './AdminReportsTab';
import { AdminCampaignsTab } from './AdminCampaignsTab';
import { generateSmartBotReply } from '../../utils/botReplyEngine';
import { 
  ShieldCheck, 
  Shield,
  LayoutGrid,
  Package, 
  ShoppingBag, 
  Users, 
  MessageSquare, 
  Mail, 
  LogOut, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Truck, 
  DollarSign, 
  Send, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  Search,
  Filter,
  Eye,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Tag,
  ExternalLink,
  Bot,
  Layers,
  Network,
  BarChart2,
  Box,
  Check,
  X,
  Edit,
  Phone,
  MapPin,
  Award,
  FileText,
  Download
} from 'lucide-react';
import { badgommysLogo } from '../../assets';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  customers: User[];
  messages: ContactMessage[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct?: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddCustomer?: (customer: User) => void;
  onUpdateCustomer?: (customer: User) => void;
  onAddOrder?: (order: Order) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string) => void;
  onConfirmPayment: (orderId: string, status: PaymentStatus) => void;
  onReplyMessage: (messageId: string, reply: string) => void;
  onResetStartupData: () => void;
  onExitAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  customers,
  messages,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCustomer,
  onUpdateCustomer,
  onAddOrder,
  onUpdateOrderStatus,
  onConfirmPayment,
  onReplyMessage,
  onResetStartupData,
  onExitAdmin,
}) => {
  // Navigation tabs matching the screenshot
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'clientes' | 'productos' | 'erp' | 'pedidos' | 'envios' | 'mensajes' | 'campanas' | 'copilot' | 'reportes'
  >('dashboard');

  // Search and filter states
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Order management modal
  const [selectedOrderToManage, setSelectedOrderToManage] = useState<Order | null>(null);
  const [manageStatus, setManageStatus] = useState<OrderStatus>('En preparación');
  const [manageCourier, setManageCourier] = useState('');
  const [manageTracking, setManageTracking] = useState('');

  // New product form state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Enchiladas');
  const [newProductPrice, setNewProductPrice] = useState(65);
  const [newProductWeight, setNewProductWeight] = useState('160g');
  const [newProductStock, setNewProductStock] = useState(30);
  const [newProductSpice, setNewProductSpice] = useState('🌶️🌶️ Picor Medio');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductImage, setNewProductImage] = useState(products[0]?.image || '');

  // Reply message modal / state
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');

  // Email Campaign Creator state
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [campaignDiscountCode, setCampaignDiscountCode] = useState('FUEGO20');
  const [campaignDiscountPercent, setCampaignDiscountPercent] = useState(20);
  const [campaignType, setCampaignType] = useState<'oferta' | 'anuncio' | 'general'>('oferta');
  const [campaignSuccess, setCampaignSuccess] = useState(false);

  // Chatbot Copilot State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: 'ai' | 'user'; text: string; time: string }>>([
    {
      role: 'ai',
      text: '¡Hola Administrador! Soy tu Copilot de BadGommys. Puedo ayudarte con métricas de ventas, recomendaciones de inventario de gomitas, recetas de chamoy, estado de pedidos y redacción de campañas.',
      time: '12:00 PM'
    }
  ]);
  const [copilotInput, setCopilotInput] = useState('');

  // Auto-reply with Chatbot state
  const [isAutoReplyEnabled, setIsAutoReplyEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('badgommys_bot_autoreply');
      return saved !== 'false';
    } catch {
      return true;
    }
  });
  const [autoReplyNotice, setAutoReplyNotice] = useState<string | null>(null);

  // ERP Persistent State
  const [erpInsumos, setErpInsumos] = useState<ERPInsumo[]>(() => {
    try {
      const saved = localStorage.getItem('badgommys_erp_insumos');
      return saved ? JSON.parse(saved) : INITIAL_ERP_INSUMOS;
    } catch {
      return INITIAL_ERP_INSUMOS;
    }
  });

  const [erpBatches, setErpBatches] = useState<ERPBatch[]>(() => {
    try {
      const saved = localStorage.getItem('badgommys_erp_batches');
      return saved ? JSON.parse(saved) : INITIAL_ERP_BATCHES;
    } catch {
      return INITIAL_ERP_BATCHES;
    }
  });

  const [erpPurchaseOrders, setErpPurchaseOrders] = useState<ERPPurchaseOrder[]>(() => {
    try {
      const saved = localStorage.getItem('badgommys_erp_purchase_orders');
      return saved ? JSON.parse(saved) : INITIAL_ERP_PURCHASE_ORDERS;
    } catch {
      return INITIAL_ERP_PURCHASE_ORDERS;
    }
  });

  useEffect(() => {
    localStorage.setItem('badgommys_erp_insumos', JSON.stringify(erpInsumos));
  }, [erpInsumos]);

  useEffect(() => {
    localStorage.setItem('badgommys_erp_batches', JSON.stringify(erpBatches));
  }, [erpBatches]);

  useEffect(() => {
    localStorage.setItem('badgommys_erp_purchase_orders', JSON.stringify(erpPurchaseOrders));
  }, [erpPurchaseOrders]);

  const handleUpdateInsumo = (updated: ERPInsumo) => {
    setErpInsumos(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const handleAddInsumo = (newInsumo: ERPInsumo) => {
    setErpInsumos(prev => [newInsumo, ...prev]);
  };

  const handleUpdateBatchStatus = (batchId: string, status: ERPBatch['status']) => {
    setErpBatches(prev => prev.map(b => b.id === batchId ? { ...b, status } : b));
  };

  const handleAddBatch = (newBatch: ERPBatch, targetProduct?: Product) => {
    setErpBatches(prev => [newBatch, ...prev]);
    if (targetProduct && onUpdateProduct) {
      onUpdateProduct({
        ...targetProduct,
        stock: targetProduct.stock + newBatch.units,
      });
    }
  };

  const handleMarkPurchaseOrderReceived = (poId: string) => {
    setErpPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, status: 'Recibida en Almacén', receivedInStock: true } : po));
  };

  // Quick stats calculation
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Pagado' ? o.total : 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'En preparación' || o.status === 'Pendiente').length;
  const inTransitOrdersCount = orders.filter(o => o.status === 'En camino').length;
  const newMessagesCount = messages.filter(m => m.status === 'Nuevo' || !m.adminReply).length;

  const handleOpenManageOrder = (order: Order) => {
    setSelectedOrderToManage(order);
    setManageStatus(order.status);
    setManageCourier(order.courierName || 'Mateo V. (Moto Express)');
    setManageTracking(order.trackingNumber);
  };

  const handleSaveOrderChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderToManage) return;
    onUpdateOrderStatus(selectedOrderToManage.id, manageStatus, manageTracking, manageCourier);
    setSelectedOrderToManage(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newProductName.trim(),
      category: newProductCategory,
      price: Number(newProductPrice),
      weight: newProductWeight.trim() || '150g',
      stock: Number(newProductStock),
      spiceLabel: newProductSpice,
      description: newProductDesc.trim() || 'Deliciosa receta artesanal de gomitas BadGommys.',
      image: newProductImage || products[0]?.image || '',
      isFavorite: false,
    };

    onAddProduct(newProd);
    setIsAddingProduct(false);
    setNewProductName('');
    setNewProductDesc('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;

    onReplyMessage(selectedMessage.id, replyText.trim());
    setSelectedMessage(null);
    setReplyText('');
  };

  const handleToggleAutoReply = () => {
    const nextVal = !isAutoReplyEnabled;
    setIsAutoReplyEnabled(nextVal);
    try {
      localStorage.setItem('badgommys_bot_autoreply', String(nextVal));
    } catch {
      // ignore
    }
    setAutoReplyNotice(
      nextVal 
        ? '⚡ Auto-respuesta automática activada: El Chatbot responderá consultas de inmediato.'
        : '⏸️ Auto-respuesta automática pausada: Los mensajes requerirán respuesta manual.'
    );
    setTimeout(() => setAutoReplyNotice(null), 4000);
  };

  const handleAutoReplySingle = (m: ContactMessage) => {
    const reply = generateSmartBotReply(m);
    onReplyMessage(m.id, `🤖 [Respuesta de GommyBot]:\n\n${reply}`);
    setAutoReplyNotice(`¡El Chatbot ha respondido automáticamente el mensaje de "${m.name}"!`);
    setTimeout(() => setAutoReplyNotice(null), 4000);
  };

  const handleAutoReplyAllPending = () => {
    const pending = messages.filter(m => m.status !== 'Respondido' && !m.adminReply);
    if (pending.length === 0) {
      setAutoReplyNotice('No hay mensajes pendientes por contestar.');
      setTimeout(() => setAutoReplyNotice(null), 3000);
      return;
    }
    pending.forEach(m => {
      const reply = generateSmartBotReply(m);
      onReplyMessage(m.id, `🤖 [Respuesta de GommyBot]:\n\n${reply}`);
    });
    setAutoReplyNotice(`¡El Chatbot ha respondido automáticamente ${pending.length} mensaje(s) pendiente(s)!`);
    setTimeout(() => setAutoReplyNotice(null), 5000);
  };

  const handleSendEmailCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignSubject.trim() || !campaignMessage.trim()) return;

    const newCampaign: EmailCampaign = {
      id: `camp-${Date.now()}`,
      type: campaignType,
      subject: campaignSubject.trim(),
      title: campaignTitle.trim() || campaignSubject.trim(),
      message: campaignMessage.trim(),
      sentAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recipients: customers.map(c => c.email),
      recipientFilter: 'todos',
      discountCode: campaignDiscountCode.trim() ? campaignDiscountCode.trim().toUpperCase() : undefined,
      discountPercent: campaignDiscountCode ? Number(campaignDiscountPercent) : undefined,
      callToActionText: 'Ir a la Tienda de Gomitas',
    };

    try {
      const stored = localStorage.getItem('badgommys_email_campaigns');
      const list: EmailCampaign[] = stored ? JSON.parse(stored) : [];
      list.unshift(newCampaign);
      localStorage.setItem('badgommys_email_campaigns', JSON.stringify(list));
    } catch {
      // ignore
    }

    setCampaignSuccess(true);
    setCampaignSubject('');
    setCampaignTitle('');
    setCampaignMessage('');
    setTimeout(() => setCampaignSuccess(false), 3500);
  };

  const handleSendCopilotMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;

    const userText = copilotInput.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setCopilotMessages(prev => [...prev, { role: 'user', text: userText, time: timeNow }]);
    setCopilotInput('');

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = `He procesado tu consulta, Administrador. Actualmente cuentas con ${customers.length} clientes en base de datos, ${orders.length} pedidos registrados y $${totalRevenue} MXN en ventas cobradas al 100%.`;

      if (lower.includes('vip') || lower.includes('top cliente') || lower.includes('mayor')) {
        const topClients = [...customers].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
        const listText = topClients.slice(0, 3).map((c, i) => `${i + 1}. ${c.name} (${c.email}) - $${c.totalSpent || 0} MXN acumulados [${c.crmTag || 'Frecuente'}]`).join('\n');
        reply = `👥 **Tus Clientes de Mayor Valor (VIP):**\n${listText}\n\n💡 *Sugerencia CRM:* Envíales una muestra gratis de la nueva receta o un cupón exclusivo VIP25 para consentirlos.`;
      } else if (lower.includes('whatsapp') || lower.includes('agradecimiento') || lower.includes('post-venta') || lower.includes('daniela')) {
        reply = `💬 **Mensaje Post-Venta redactado para WhatsApp:**\n\n"¡Hola Daniela! 🍬 Te saludamos con mucho cariño del taller de BadGommys. Esperamos que estés disfrutando muchísimo tus Aros de Durazno y Gomitas Fuego con chamoy casero. ¿Qué te pareció el nivel de picante? Como agradecimiento por ser cliente VIP, en tu próxima compra usa el cupón FUEGO20 para un 20% de descuento. ¡Que tengas un excelente día! 🔥"`;
      } else if (lower.includes('reactiv') || lower.includes('campaña') || lower.includes('cupon') || lower.includes('oferta')) {
        reply = `🎟️ **Estrategia de Reactivación Sugerida:**\n\n1. Código propuesto: **VUELVE20** (20% de descuento en pedidos mayores a $150 MXN).\n2. Mensaje para campaña: "¡Te extrañamos en el taller BadGommys! Escarchamos tus gomitas favoritas al momento con chilito Tajín y chamoy fresco. Válido este fin de semana."\n3. Clientes objetivo: ${customers.filter(c => c.totalOrders && c.totalOrders >= 1).length} clientes con compras previas.`;
      } else if (lower.includes('envio') || lower.includes('ruta') || lower.includes('repartidor') || lower.includes('reparto')) {
        const inTransit = orders.filter(o => o.status === 'En camino');
        reply = `🚚 **Monitoreo de Envíos en Tiempo Real:**\n- Envíos en motocicleta activa: ${inTransit.length}\n- Repartidores en calle: Mateo V. (Moto Express Benito Juárez - 55 9876 5432) y Mensajería Local.\n- Tiempo promedio de entrega: 42 minutos con 100% de entregas exitosas hoy.`;
      } else if (lower.includes('stock') || lower.includes('inventario') || lower.includes('alerta') || lower.includes('critico')) {
        const lowStock = products.filter(p => p.stock < 160);
        const lowText = lowStock.map(p => `• ${p.name}: ${p.stock} piezas restantes`).join('\n');
        reply = `📦 **Auditoría de Stock en Catálogo:**\nTotal de unidades disponibles: ${products.reduce((sum, p) => sum + p.stock, 0).toLocaleString()} piezas en almacén.\n${lowStock.length > 0 ? `\nProductos con rotación más veloz hoy:\n${lowText}` : 'Todos los productos cuentan con inventario comercial suficiente.'}`;
      } else if (lower.includes('erp') || lower.includes('lote') || lower.includes('materia') || lower.includes('insumo')) {
        const totalMatValue = erpInsumos.reduce((sum, i) => sum + i.totalValue, 0);
        reply = `🏭 **Módulo ERP Artesanal:**\n- Valor de materias primas en planta: $${totalMatValue.toLocaleString()} MXN.\n- Lotes fabricados: ${erpBatches.length} lotes con ${erpBatches.reduce((sum, b) => sum + b.units, 0).toLocaleString()} bolsas producidas.\n- Grenetina 290 Bloom, Chamoy Concentrado y Chiles Secos en nivel óptimo de abasto.`;
      } else if (lower.includes('venta') || lower.includes('ingreso') || lower.includes('total') || lower.includes('dinero')) {
        reply = `💰 **Resumen Financiero:**\n- Ventas Totales: $${totalRevenue.toLocaleString()} MXN.\n- 100% cobrado y validado en cuentas bancarias.\n- Ticket promedio: $${orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0} MXN por orden.`;
      }

      setCopilotMessages(prev => [...prev, { role: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }, 500);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.trackingNumber.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 flex font-sans">
      
      {/* ======================================================== */}
      {/* EXACT SIDEBAR FROM SCREENSHOT                            */}
      {/* ======================================================== */}
      <aside className="w-64 lg:w-72 shrink-0 bg-[#0d0d12] border-r border-zinc-800/80 flex flex-col justify-between p-4 sticky top-0 h-screen select-none z-30">
        <div className="space-y-6">
          
          {/* Top Brand / Control Panel Badge */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white leading-tight">Panel de Control</h2>
              <p className="text-[11px] font-bold text-amber-500/90">Master Admin BadGommys</p>
            </div>
          </div>

          {/* Navigation Links with Badges */}
          <nav className="space-y-1.5 text-xs font-semibold">
            
            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-red-600 text-white font-bold shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            {/* 2. Clientes */}
            <button
              onClick={() => setActiveTab('clientes')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'clientes'
                  ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Clientes</span>
              </div>
              <span className="bg-zinc-800 text-zinc-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {customers.length}
              </span>
            </button>

            {/* 3. Productos */}
            <button
              onClick={() => setActiveTab('productos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'productos'
                  ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Box className="w-4 h-4" />
                <span>Productos</span>
              </div>
              <span className="bg-zinc-800 text-zinc-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {products.length}
              </span>
            </button>

            {/* 4. ERP & Operaciones */}
            <button
              onClick={() => setActiveTab('erp')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'erp'
                  ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Network className="w-4 h-4" />
                <span>ERP & Operaciones</span>
              </div>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Activo
              </span>
            </button>

            {/* 5. Pedidos de Clientes */}
            <button
              onClick={() => setActiveTab('pedidos')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'pedidos'
                  ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" />
                <span>Pedidos de Clientes</span>
              </div>
              <span className="bg-zinc-800 text-zinc-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {orders.length}
              </span>
            </button>

            {/* 6. Seguimiento de Envíos */}
            <button
              onClick={() => setActiveTab('envios')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'envios'
                  ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Seguimiento de Envíos</span>
            </button>

            {/* 7. Mensajes de Clientes */}
            <button
              onClick={() => setActiveTab('mensajes')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'mensajes'
                  ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Mensajes de Clientes</span>
              </div>
              <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {messages.length || 2}
              </span>
            </button>

            {/* 8. Campañas & Correos */}
            <button
              onClick={() => setActiveTab('campanas')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'campanas'
                  ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>Campañas & Correos</span>
              </div>
              <span className="bg-red-950/80 text-red-300 border border-red-800/60 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                Ofertas / Envíos
              </span>
            </button>

            {/* 9. Chatbot Copilot */}
            <button
              onClick={() => {
                setActiveTab('copilot');
                setIsCopilotOpen(true);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'copilot'
                  ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-bold'
                  : 'border-amber-500/20 text-amber-400/90 hover:bg-amber-500/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bot className="w-4 h-4 text-amber-400" />
                <span>Chatbot Copilot</span>
              </div>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                ✨ IA
              </span>
            </button>

            {/* 10. Reportes & Gráficas */}
            <button
              onClick={() => setActiveTab('reportes')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer ${
                activeTab === 'reportes'
                  ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Reportes & Gráficas</span>
            </button>

          </nav>
        </div>

        {/* Bottom Button: Volver a la Tienda */}
        <div className="pt-4 border-t border-zinc-800/80">
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-zinc-300 hover:text-white bg-[#14141c] hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer"
          >
            <span>Volver a la Tienda</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* MAIN VIEW CONTENT AREA                                   */}
      {/* ======================================================== */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 relative">
        
        {/* VIEW 1: DASHBOARD (EXACT SCREENSHOT LAYOUT) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Dashboard Principal
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Sesión activa: <strong className="text-amber-400">Administrador General</strong> (Acceso Total Concedido) • <strong className="text-emerald-400">Fase de Lanzamiento / Datos Reales</strong>
                </p>
              </div>

              <button
                onClick={onResetStartupData}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-zinc-300 hover:text-white bg-[#14141c] hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer self-start sm:self-auto shadow-md"
              >
                <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                <span>Restablecer Datos de Apertura</span>
              </button>
            </div>

            {/* 4 KPI Cards Grid from Screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Total de Clientes */}
              <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    TOTAL DE CLIENTES
                  </span>
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-black text-white">{customers.length}</div>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    ↗ Fase de Apertura (Nuevos Registros 🚀)
                  </p>
                </div>
              </div>

              {/* Card 2: Pedidos Recibidos */}
              <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    PEDIDOS RECIBIDOS
                  </span>
                  <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-black text-white">{orders.length}</div>
                  <p className="text-xs text-zinc-400 font-medium mt-1">
                    {inTransitOrdersCount} en reparto • {pendingOrdersCount} en taller
                  </p>
                </div>
              </div>

              {/* Card 3: Ventas de Apertura */}
              <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    VENTAS DE APERTURA
                  </span>
                  <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-black text-white">
                    ${totalRevenue} <span className="text-sm font-semibold text-zinc-400">MXN</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    ✓ 100% cobrado ({orders.length} pedidos)
                  </p>
                </div>
              </div>

              {/* Card 4: Catálogo Artesanal */}
              <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    CATÁLOGO ARTESANAL
                  </span>
                  <div className="w-8 h-8 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Box className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-4xl font-black text-white">{products.length}</div>
                  <p className="text-xs text-zinc-400 font-medium mt-1">
                    Variedades con stock inicial activo
                  </p>
                </div>
              </div>

            </div>

            {/* ERP & Fabricación Banner from Screenshot */}
            <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                  <Network className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      Módulo ERP & Fabricación BadGommys
                    </h3>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      Nativo + Conectores Multi-ERP
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    <span className="text-emerald-400 font-semibold">✓ Todos los insumos en nivel óptimo</span> • 2 lote(s) en producción • 4 ERPs sincronizados (Odoo, SAT, Alegra)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('erp')}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all shrink-0 hover:scale-[1.02]"
              >
                <span>Abrir Módulo ERP Completo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pedidos Recientes Table from Screenshot */}
            <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Pedidos Recientes</h3>
                  <p className="text-xs text-zinc-400">
                    Monitorea y despacha las órdenes recién recibidas.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('pedidos')}
                  className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Ver todos los pedidos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-zinc-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-zinc-800/80">
                    <tr>
                      <th className="py-3 px-4">NO. ORDEN</th>
                      <th className="py-3 px-4">CLIENTE</th>
                      <th className="py-3 px-4">TOTAL</th>
                      <th className="py-3 px-4">PAGO</th>
                      <th className="py-3 px-4">ESTADO</th>
                      <th className="py-3 px-4">ACCIÓN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {orders.slice(0, 3).map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-4 px-4 font-mono font-black text-white">
                          #{order.id}
                        </td>
                        <td className="py-4 px-4 font-bold text-zinc-200">
                          {order.customerName}
                        </td>
                        <td className="py-4 px-4 font-black text-white">
                          ${order.total} MXN
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="bg-zinc-800/90 text-zinc-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-md">
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleOpenManageOrder(order)}
                            className="text-red-500 hover:text-red-400 font-bold text-xs cursor-pointer transition-colors"
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

          </div>
        )}

        {/* VIEW 2: CLIENTES (CRM COMPLETO & DIRECTÓRIO) */}
        {activeTab === 'clientes' && (
          <AdminCustomersTab
            customers={customers}
            orders={orders}
            onUpdateCustomer={onUpdateCustomer}
            onAddCustomer={onAddCustomer}
            onSelectCustomerForMessage={(c) => {
              setActiveTab('campanas');
              setCampaignSubject(`Atención personalizada: ${c.name}`);
            }}
          />
        )}

        {/* VIEW 3: PRODUCTOS (CATÁLOGO ARTESANAL & STOCK ALTO) */}
        {activeTab === 'productos' && (
          <AdminProductsTab
            products={products}
            onAddProduct={onAddProduct}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
          />
        )}

        {/* VIEW 4: ERP & OPERACIONES ($95,785 MXN INSUMOS, BOM & LOTES REACTIVOS) */}
        {activeTab === 'erp' && (
          <AdminErpTab
            insumos={erpInsumos}
            recipes={INITIAL_ERP_RECIPES}
            batches={erpBatches}
            purchaseOrders={erpPurchaseOrders}
            products={products}
            onUpdateInsumo={handleUpdateInsumo}
            onAddInsumo={handleAddInsumo}
            onUpdateBatchStatus={handleUpdateBatchStatus}
            onAddBatch={handleAddBatch}
            onMarkPurchaseOrderReceived={handleMarkPurchaseOrderReceived}
          />
        )}

        {/* VIEW 5: PEDIDOS DE CLIENTES (GESTIÓN & VENTA MOSTRADOR POS) */}
        {activeTab === 'pedidos' && (
          <AdminOrdersTab
            orders={orders}
            products={products}
            customers={customers}
            onUpdateOrderStatus={onUpdateOrderStatus}
            onConfirmPayment={onConfirmPayment}
            onAddOrder={onAddOrder}
          />
        )}

        {/* VIEW 6: SEGUIMIENTO DE ENVÍOS (DESPACHO CDMX & AVANCE EN TIEMPO REAL) */}
        {activeTab === 'envios' && (
          <AdminShipmentsTab
            orders={orders}
            onUpdateOrderStatus={onUpdateOrderStatus}
          />
        )}

        {/* VIEW 7: MENSAJES DE CLIENTES CON AUTO-RESPUESTA CHATBOT */}
        {activeTab === 'mensajes' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xl">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>Atención al Cliente Asistida por IA</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <span>Mensajes de Clientes</span>
                  <span className="text-xs font-black bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full">
                    {messages.length} en total
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Dudas de catálogo, preguntas de envíos, cotizaciones de mayoreo y comentarios recibidos.
                </p>
              </div>

              {/* Bot Controls */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {/* Auto-reply toggle */}
                <button
                  type="button"
                  onClick={handleToggleAutoReply}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                    isAutoReplyEnabled
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-950/50'
                      : 'bg-[#181822] border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                  title="Activar o pausar respuesta automática para nuevos mensajes entrantes"
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isAutoReplyEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                  <span>Auto-Respuesta IA: {isAutoReplyEnabled ? 'ACTIVA' : 'PAUSADA'}</span>
                </button>

                {/* Auto-reply all pending button */}
                <button
                  type="button"
                  onClick={handleAutoReplyAllPending}
                  disabled={messages.filter(m => m.status !== 'Respondido' && !m.adminReply).length === 0}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg transition-all cursor-pointer ${
                    messages.filter(m => m.status !== 'Respondido' && !m.adminReply).length > 0
                      ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-orange-600/25 hover:scale-[1.02]'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>Auto-responder Pendientes ({messages.filter(m => m.status !== 'Respondido' && !m.adminReply).length})</span>
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {autoReplyNotice && (
              <div className="p-4 bg-gradient-to-r from-amber-950/80 to-red-950/80 border border-amber-500/60 rounded-2xl text-xs text-amber-200 font-bold flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2.5">
                  <Bot className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{autoReplyNotice}</span>
                </div>
                <button 
                  onClick={() => setAutoReplyNotice(null)}
                  className="text-amber-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Messages List */}
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="bg-[#121218] border border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 text-xs">
                  No hay mensajes registrados en la bandeja.
                </div>
              ) : (
                messages.map((m) => {
                  const isReplied = m.status === 'Respondido' || Boolean(m.adminReply);
                  return (
                    <div 
                      key={m.id} 
                      className={`bg-[#121218] border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl transition-all ${
                        isReplied ? 'border-zinc-800/80' : 'border-red-600/40 shadow-red-950/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-white text-base">{m.subject}</h4>
                            {!isReplied && (
                              <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                Pendiente
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            De: <strong className="text-zinc-200 font-bold">{m.name}</strong> • <span>{m.email}</span> {m.phone && `• Tel: ${m.phone}`} • <span className="text-zinc-500">{m.createdAt}</span>
                          </p>
                        </div>

                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
                          isReplied 
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50' 
                            : 'bg-red-950/80 text-red-300 border-red-700/50'
                        }`}>
                          {isReplied ? '✓ Respondido' : 'Por atender'}
                        </span>
                      </div>

                      {/* Customer Question */}
                      <div className="bg-[#161622] p-4 rounded-2xl border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed">
                        <span className="text-zinc-500 font-semibold block text-[10px] uppercase mb-1">Mensaje del Cliente:</span>
                        "{m.message}"
                      </div>

                      {/* Official or Bot Reply */}
                      {m.adminReply && (
                        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs space-y-1.5 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Respuesta enviada ({m.repliedAt || 'Reciente'}):</span>
                            </span>
                            {m.adminReply.includes('GommyBot') && (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                <Bot className="w-3 h-3" />
                                <span>Contestado por Chatbot</span>
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-200 whitespace-pre-line leading-relaxed">{m.adminReply}</p>
                        </div>
                      )}

                      {/* Actions Toolbar */}
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-zinc-800/60">
                        {/* 1-Click Bot Auto-Reply */}
                        <button
                          type="button"
                          onClick={() => handleAutoReplySingle(m)}
                          className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                          title="Genera una respuesta inteligente con el chatbot y la envía al cliente de inmediato"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>{isReplied ? 'Regenerar con Chatbot' : 'Contestar con Chatbot Automáticamente'}</span>
                        </button>

                        {/* Manual Reply Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMessage(m);
                            setReplyText(m.adminReply || '');
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>{isReplied ? 'Editar Manualmente' : 'Responder Manual'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal de respuesta */}
            {selectedMessage && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-[#14141c] border border-zinc-800 max-w-lg w-full rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                    <div>
                      <h3 className="font-black text-white text-base">Responder a {selectedMessage.name}</h3>
                      <p className="text-[11px] text-zinc-400">Asunto: {selectedMessage.subject}</p>
                    </div>
                    <button onClick={() => setSelectedMessage(null)} className="text-zinc-400 hover:text-white text-sm cursor-pointer p-1">✕</button>
                  </div>

                  <div className="bg-[#1c1c28] p-3 rounded-2xl border border-zinc-800 text-xs text-zinc-300">
                    <span className="text-[10px] text-zinc-500 font-bold block uppercase mb-0.5">Consulta del Cliente:</span>
                    "{selectedMessage.message}"
                  </div>

                  {/* Autocomplete with Bot Button */}
                  <div className="flex justify-between items-center">
                    <label className="block text-zinc-300 text-xs font-bold">Tu Respuesta Oficial:</label>
                    <button
                      type="button"
                      onClick={() => setReplyText(generateSmartBotReply(selectedMessage))}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      <span>Autocompletar con Chatbot</span>
                    </button>
                  </div>

                  <form onSubmit={handleSendReply} className="space-y-4">
                    <textarea
                      rows={5}
                      required
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Escribe tu respuesta aquí o haz clic en 'Autocompletar con Chatbot'..."
                      className="w-full bg-[#1c1c28] border border-zinc-700 rounded-2xl p-3.5 text-xs text-white resize-none focus:outline-none focus:border-red-500 leading-relaxed placeholder-zinc-500"
                    />

                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setSelectedMessage(null)} 
                        className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded-xl cursor-pointer transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Guardar & Enviar Respuesta</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 8: CAMPAÑAS & CORREOS A CLIENTES */}
        {activeTab === 'campanas' && (
          <AdminCampaignsTab
            customers={customers}
            orders={orders}
            onSendCampaign={() => {
              setCampaignSuccess(true);
              setTimeout(() => setCampaignSuccess(false), 3500);
            }}
            onResetStartupData={onResetStartupData}
          />
        )}

        {/* VIEW 9: CHATBOT COPILOT & CRM ASSISTANT */}
        {activeTab === 'copilot' && (
          <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
                  <Bot className="w-4 h-4" />
                  <span>Inteligencia Operativa & CRM BadGommys</span>
                </div>
                <h2 className="text-2xl font-black text-white">Chatbot Copilot CRM</h2>
                <p className="text-xs text-zinc-400">
                  Asistente inteligente para fidelización de clientes, retención, redacción de mensajes post-venta y control de taller.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Modo CRM Activo</span>
              </div>
            </div>

            {/* CRM Quick Actions Bar */}
            <div className="bg-[#121218] border border-zinc-800 p-4 rounded-3xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                Herramientas Rápidas de CRM con 1 Clic:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const prompt = '¿Quiénes son nuestros clientes con más compras y mayor ticket?';
                    setCopilotInput(prompt);
                  }}
                  className="bg-[#1a1a26] hover:bg-amber-950/60 border border-zinc-700 hover:border-amber-500/50 text-zinc-300 hover:text-amber-300 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>👥 Top Clientes VIP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const prompt = 'Redacta un mensaje de agradecimiento y seguimiento post-venta para WhatsApp para Daniela Rodríguez por su pedido de Aros de Durazno.';
                    setCopilotInput(prompt);
                  }}
                  className="bg-[#1a1a26] hover:bg-red-950/60 border border-zinc-700 hover:border-red-500/50 text-zinc-300 hover:text-red-300 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                  <span>💬 Mensaje Post-Venta WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const prompt = 'Genera una estrategia de reactivación para clientes que tienen más de 10 días sin comprar, incluyendo un cupón de 20%.';
                    setCopilotInput(prompt);
                  }}
                  className="bg-[#1a1a26] hover:bg-emerald-950/60 border border-zinc-700 hover:border-emerald-500/50 text-zinc-300 hover:text-emerald-300 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🎟️ Campaña de Reactivación</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const prompt = '¿Cuál es el estatus de las entregas en curso y qué repartidores están en ruta?';
                    setCopilotInput(prompt);
                  }}
                  className="bg-[#1a1a26] hover:bg-sky-950/60 border border-zinc-700 hover:border-sky-500/50 text-zinc-300 hover:text-sky-300 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5 text-sky-400" />
                  <span>🚚 Estado de Envíos</span>
                </button>
              </div>
            </div>

            <div className="bg-[#121218] border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col h-[540px]">
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 text-xs">
                {copilotMessages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl p-4 rounded-2xl leading-relaxed whitespace-pre-line shadow-md ${
                      m.role === 'user'
                        ? 'bg-red-600 text-white rounded-br-none'
                        : 'bg-[#181824] text-zinc-200 border border-zinc-800 rounded-bl-none'
                    }`}>
                      <p>{m.text}</p>
                      <span className="text-[9px] opacity-70 mt-1 block text-right">{m.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendCopilotMessage} className="pt-3 border-t border-zinc-800 flex gap-2">
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  placeholder="Pregúntale al Copilot (ej: ¿Cómo mejorar la recompra de clientes este fin de semana?)..."
                  className="flex-1 bg-[#181822] border border-zinc-700 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-red-500 placeholder-zinc-500"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs px-6 rounded-2xl shadow-lg cursor-pointer"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 10: REPORTES & GRÁFICAS (FINANZAS REALES, DESGLOSES & EXPORTACIÓN CSV) */}
        {activeTab === 'reportes' && (
          <AdminReportsTab
            orders={orders}
            products={products}
            customers={customers}
          />
        )}

      </main>

      {/* ======================================================== */}
      {/* FLOATING CHATBOT COPILOT BUTTON (EXACT FROM SCREENSHOT)  */}
      {/* ======================================================== */}
      <button
        onClick={() => {
          setActiveTab('copilot');
          setIsCopilotOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-full shadow-[0_0_30px_rgba(234,88,12,0.6)] flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Bot className="w-5 h-5 text-white" />
        <span>Chatbot Copilot</span>
      </button>

      {/* MODAL GESTIONAR ORDEN */}
      {selectedOrderToManage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-md w-full rounded-3xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Gestionar Orden #{selectedOrderToManage.id}</h3>
              <button onClick={() => setSelectedOrderToManage(null)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveOrderChanges} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Estado de la Orden</label>
                <select
                  value={manageStatus}
                  onChange={(e) => setManageStatus(e.target.value as any)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="En preparación">En preparación</option>
                  <option value="En camino">En camino (Repartidor en ruta)</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Repartidor Asignado</label>
                <input
                  type="text"
                  value={manageCourier}
                  onChange={(e) => setManageCourier(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Código de Guía de Rastreo</label>
                <input
                  type="text"
                  value={manageTracking}
                  onChange={(e) => setManageTracking(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setSelectedOrderToManage(null)} className="px-4 py-2 bg-zinc-800 rounded-xl text-zinc-300 cursor-pointer">Cancelar</button>
                <button type="submit" className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg cursor-pointer">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
