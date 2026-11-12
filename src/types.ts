export type NavigationPage = 'inicio' | 'productos' | 'contacto' | 'carrito' | 'perfil' | 'admin';
export type PageView = NavigationPage;

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  weight: string;
  spiceLabel: string;
  spiceLevel?: number;
  stock: number;
  isFavorite?: boolean;
  ingredients?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  secondaryPhone?: string;
  address?: string;
  // Dirección detallada y logística
  streetAndNumber?: string;
  interiorNumber?: string;
  crossStreets?: string;
  colony?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  deliveryReferences?: string;
  addressType?: 'Casa' | 'Oficina' | 'Taller' | 'Otro';
  preferredDeliverySchedule?: string;
  // Información adicional de perfil y preferencias
  birthDate?: string;
  favoriteSpiceLevel?: string;
  favoriteGummy?: string;
  rfc?: string;
  requiresInvoice?: boolean;
  wantsSurpriseSamples?: boolean;
  specialInstructions?: string;
  avatar?: string;
  registeredAt: string;
  totalOrders?: number;
  totalSpent?: number;
  loyaltyPoints?: number;
  crmTag?: 'VIP' | 'Frecuente' | 'Nuevo' | 'Mayorista';
  lastPurchaseDate?: string;
  notes?: string;
}

export interface TrackingStep {
  title: string;
  description: string;
  time: string;
  completed: boolean;
  current: boolean;
}

export type OrderStatus = 'En preparación' | 'En camino' | 'Entregado' | 'Confirmado' | 'Pendiente' | 'Cancelado';
export type PaymentStatus = 'Pagado' | 'Pendiente' | 'Fallido' | 'Reembolsado';

export type PaymentMethod = 
  | 'Tarjeta de Crédito / Débito'
  | 'Transferencia SPEI'
  | 'Efectivo en OXXO'
  | 'Efectivo en Tienda Oficial'
  | 'Efectivo Contra Entrega'
  | string;

export interface OrderPaymentDetails {
  methodType: 'card' | 'spei' | 'cash';
  cardBrand?: string;
  cardLast4?: string;
  cardHolder?: string;
  speiBank?: string;
  speiClabe?: string;
  speiBeneficiary?: string;
  speiReference?: string;
  speiTrackingKey?: string;
  cashOption?: 'oxxo' | 'tienda_oficial' | 'contra_entrega';
  cashStoreName?: string;
  cashReferenceCode?: string;
  pickupLocation?: string;
  cashInstructions?: string;
  cashChangeFor?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDetails?: OrderPaymentDetails;
  trackingNumber: string;
  estimatedDelivery: string;
  courierName: string;
  courierPhone?: string;
  deliveryNotes?: string;
  createdAt: string;
  timeline: TrackingStep[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'Nuevo' | 'Leído' | 'Respondido';
  adminReply?: string;
  repliedAt?: string;
}

export interface EmailCampaign {
  id: string;
  type: 'oferta' | 'pedido' | 'anuncio' | 'general';
  subject: string;
  title: string;
  preheader?: string;
  message: string;
  sentAt: string;
  recipients: string[];
  recipientFilter: 'todos' | 'clientes_activos' | 'personalizado' | string;
  discountCode?: string;
  discountPercent?: number;
  validUntil?: string;
  callToActionText?: string;
  callToActionUrl?: string;
  orderSummary?: {
    orderId: string;
    total: number;
    trackingNumber: string;
    courierName: string;
    estimatedDelivery?: string;
    itemsListText: string;
    items?: Array<{ name: string; qty: number; price: number }>;
  };
}

export interface EmailSubscriber {
  email: string;
  subscribedAt: string;
  source: string;
}

export interface CarouselSlide {
  id: number;
  highlight: string;
  title: string;
  subtitle: string;
  description: string;
  points: string[];
  icon: string;
}

/* ========================================================= */
/* ERP & OPERACIONES INTERFACES                              */
/* ========================================================= */
export interface ERPInsumo {
  id: string;
  name: string;
  category: 'Chile & Salsa' | 'Ingrediente Base' | 'Empaque & Envase' | 'Aditivos & Ácidos';
  stock: number;
  unit: string;
  minStock: number;
  unitCost: number;
  totalValue: number;
  location: string;
  provider: string;
  lastRestocked: string;
}

export interface ERPRecipeItem {
  ingredient: string;
  perBatch: string;
  perUnit: string;
  costPerUnit: number;
}

export interface ERPRecipe {
  id: string;
  name: string;
  weight: string;
  batchUnits: number;
  cogsPerBag: number;
  capacityBatches: number;
  items: ERPRecipeItem[];
}

export interface ERPBatch {
  id: string;
  code: string;
  recipeName: string;
  units: number;
  status: 'Completado y en Almacén' | 'Control de calidad' | 'En cocción y macerado';
  notes: string;
  startedAt: string;
}

export interface ERPPurchaseOrder {
  id: string;
  folio: string;
  date: string;
  provider: string;
  itemsRequested: string;
  totalWithTax: number;
  cfdiInvoice: string;
  status: 'Recibida en Almacén' | 'Enviada al Proveedor' | 'Pendiente de emisión';
  receivedInStock: boolean;
}

/* ========================================================= */
/* ODOO SCM / ERP INTEGRATION INTERFACES                     */
/* ========================================================= */
export interface OdooConfig {
  baseUrl: string;
  db: string;
  username: string;
  apiKey: string;
  autoSyncStock: boolean;
  autoSyncOrders: boolean;
  autoSyncInsumos: boolean;
  activeWarehouseId?: number;
  warehouseName?: string;
  connected: boolean;
  lastSyncAt?: string;
}

export interface OdooSyncLog {
  id: string;
  timestamp: string;
  model: 'product.product' | 'sale.order' | 'stock.quant' | 'mrp.production' | 'purchase.order' | 'res.partner';
  action: 'import' | 'export' | 'sync' | 'test_connection';
  status: 'success' | 'warning' | 'error';
  recordsAffected: number;
  message: string;
  details?: string;
}

export interface OdooProductMapping {
  odooId: number;
  localProductId: string;
  odooName: string;
  odooDefaultCode: string;
  odooQtyAvailable: number;
  localStock: number;
  priceUnit: number;
  lastSyncedAt: string;
  status: 'sincronizado' | 'desfasado' | 'pendiente';
}

export interface OdooInsumoMapping {
  odooId: number;
  localInsumoId: string;
  odooName: string;
  odooCode: string;
  odooQty: number;
  localQty: number;
  unitCost: number;
  status: 'sincronizado' | 'desfasado' | 'pendiente';
}
