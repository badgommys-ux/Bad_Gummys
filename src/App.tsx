import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { StoryCarousel } from './components/StoryCarousel';
import { FavoritesSection } from './components/FavoritesSection';
import { Footer } from './components/Footer';
import { ProductsView } from './components/ProductsView';
import { ContactView } from './components/ContactView';
import { CartView } from './components/CartView';
import { UserProfileView } from './components/UserProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CustomerChatbot } from './components/CustomerChatbot';
import { generateSmartBotReply } from './utils/botReplyEngine';
import { 
  NavigationPage, 
  Product, 
  CartItem, 
  User, 
  Order, 
  ContactMessage, 
  OrderStatus, 
  PaymentStatus 
} from './types';
import { 
  INITIAL_PRODUCTS as initialProducts, 
  INITIAL_ORDERS as initialOrders, 
  INITIAL_CUSTOMERS as initialCustomers, 
  INITIAL_MESSAGES as initialMessages 
} from './data/initialData';
import { CheckCircle2, ShoppingBag, ShieldAlert, ArrowRight } from 'lucide-react';

const STARTUP_DATA_VERSION = 'v4_high_commercial';

// Automatically migrate old mock data to realistic commercial startup data
if (typeof window !== 'undefined') {
  try {
    const currentVersion = localStorage.getItem('badgommys_data_version');
    if (currentVersion !== STARTUP_DATA_VERSION) {
      localStorage.removeItem('badgommys_products');
      localStorage.removeItem('badgommys_orders');
      localStorage.removeItem('badgommys_customers');
      localStorage.removeItem('badgommys_messages');
      localStorage.removeItem('badgommys_erp_insumos');
      localStorage.removeItem('badgommys_erp_batches');
      localStorage.removeItem('badgommys_erp_purchase_orders');
      localStorage.setItem('badgommys_data_version', STARTUP_DATA_VERSION);
    }
  } catch (e) {
    console.error('Error migrating startup data:', e);
  }
}

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<NavigationPage>('inicio');

  // Persistence for user
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('badgommys_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Persistence for cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('badgommys_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Global Products State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('badgommys_products');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  // Global Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('badgommys_orders');
      return saved ? JSON.parse(saved) : initialOrders;
    } catch {
      return initialOrders;
    }
  });

  // Global Customers
  const [customers, setCustomers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('badgommys_customers');
      return saved ? JSON.parse(saved) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  // Global Contact Messages
  const [messages, setMessages] = useState<ContactMessage[]>(() => {
    try {
      const saved = localStorage.getItem('badgommys_messages');
      return saved ? JSON.parse(saved) : initialMessages;
    } catch {
      return initialMessages;
    }
  });

  // Modals & Notifications
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'customer' | 'admin'>('customer');
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [placedOrderCelebration, setPlacedOrderCelebration] = useState<Order | null>(null);
  const [userProfileTab, setUserProfileTab] = useState<'orders' | 'tracking' | 'messages' | 'emails' | 'settings'>('orders');

  // Sync with LocalStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('badgommys_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('badgommys_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('badgommys_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('badgommys_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('badgommys_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('badgommys_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('badgommys_messages', JSON.stringify(messages));
  }, [messages]);

  // Scroll to top on page change
  const handleNavigate = (page: NavigationPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToProfileTab = (tab: 'orders' | 'tracking' | 'messages' | 'emails' | 'settings') => {
    setUserProfileTab(tab);
    setCurrentPage('perfil');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Cart Operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`¡Añadido al carrito: ${product.name}!`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Producto eliminado del carrito');
  };

  // Auth Operations
  const handleOpenAuth = (tab: 'customer' | 'admin' = 'customer') => {
    setAuthDefaultTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'customer') {
      // If customer is not yet in customers list, register them
      setCustomers((prev) => {
        if (prev.some((c) => c.email.toLowerCase() === user.email.toLowerCase())) {
          return prev;
        }
        return [...prev, user];
      });
      showToast(`¡Bienvenido/a, ${user.name}!`);
    } else if (user.role === 'admin') {
      showToast('Acceso de Administrador Autorizado.');
      setCurrentPage('admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('inicio');
    showToast('Has cerrado sesión exitosamente.');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setCustomers((prev) =>
      prev.map((c) => (c.email === updatedUser.email ? updatedUser : c))
    );
    showToast('Perfil actualizado correctamente.');
  };

  // Order Placement
  const handleCreateOrder = (orderData: Partial<Order>): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `BG-${randomSuffix}`,
      customerName: orderData.customerName || currentUser?.name || 'Cliente',
      customerEmail: orderData.customerEmail || currentUser?.email || 'cliente@badgommys.com',
      customerPhone: orderData.customerPhone || '55 1234 5678',
      shippingAddress: orderData.shippingAddress || 'Dirección de Entrega',
      items: [...cart],
      subtotal: orderData.subtotal || 0,
      shippingFee: orderData.shippingFee || 0,
      discount: orderData.discount || 0,
      total: orderData.total || 0,
      status: 'En preparación',
      paymentStatus: orderData.paymentStatus || 'Pagado',
      paymentMethod: orderData.paymentMethod || 'Tarjeta de Crédito / Débito',
      paymentDetails: orderData.paymentDetails,
      trackingNumber: `BG-MX-${randomSuffix}`,
      estimatedDelivery: 'Hoy, en aprox. 45 - 60 min',
      courierName: 'Mateo V. (Moto Express)',
      courierPhone: '55 9876 5432',
      deliveryNotes: orderData.deliveryNotes,
      createdAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeline: [
        {
          title: 'Pedido Recibido y Pago Confirmado',
          description: 'Tu orden fue recibida con éxito y el taller ya tiene tu comanda.',
          time: 'Recién procesado',
          completed: true,
          current: false,
        },
        {
          title: 'Preparación de Gomitas y Escarchado Chamoy',
          description: 'Mezclamos artesanalmente tu receta con chilito y salsa BadGommys.',
          time: 'En curso',
          completed: true,
          current: true,
        },
        {
          title: 'Asignado a Repartidor Express',
          description: 'El paquete se despachará en ruta a tu domicilio.',
          time: 'Pendiente',
          completed: false,
          current: false,
        },
        {
          title: 'Entregado en tus Manos',
          description: '¡A disfrutar del dulce y el picor único de BadGommys!',
          time: 'Pendiente',
          completed: false,
          current: false,
        },
      ],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]); // Clear cart upon successful order
    return newOrder;
  };

  const handleOrderCompleted = (order: Order) => {
    setPlacedOrderCelebration(order);
  };

  // Contact Form Submission
  const handleSendContactMessage = (msgData: { name: string; email: string; phone?: string; subject: string; message: string }) => {
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: msgData.name,
      email: msgData.email,
      phone: msgData.phone,
      subject: msgData.subject,
      message: msgData.message,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Nuevo',
    };
    setMessages((prev) => [newMsg, ...prev]);
    showToast('¡Mensaje enviado con éxito! Te responderemos enseguida.');

    // Auto-respuesta automática con el Chatbot si está habilitada (default activa)
    const isAutoReplyActive = typeof window !== 'undefined' 
      ? localStorage.getItem('badgommys_bot_autoreply') !== 'false' 
      : true;

    if (isAutoReplyActive) {
      setTimeout(() => {
        const botReply = generateSmartBotReply(newMsg);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMsg.id
              ? {
                  ...m,
                  status: 'Respondido',
                  adminReply: `🤖 [Respuesta de GommyBot]:\n\n${botReply}`,
                  repliedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
              : m
          )
        );
      }, 1200);
    }
  };

  // Admin Actions
  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
    showToast(`¡Producto "${newProd.name}" publicado en el catálogo!`);
  };

  const handleResetStartupData = () => {
    localStorage.removeItem('badgommys_products');
    localStorage.removeItem('badgommys_orders');
    localStorage.removeItem('badgommys_customers');
    localStorage.removeItem('badgommys_messages');
    localStorage.removeItem('badgommys_erp_materials');
    localStorage.removeItem('badgommys_erp_recipes');
    localStorage.removeItem('badgommys_erp_batches');
    localStorage.removeItem('badgommys_erp_pos');
    localStorage.setItem('badgommys_data_version', STARTUP_DATA_VERSION);
    setProducts(initialProducts);
    setOrders(initialOrders);
    setCustomers(initialCustomers);
    setMessages(initialMessages);
    showToast('✅ Plataforma y datos restablecidos al estado inicial de lanzamiento.');
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Producto eliminado del catálogo.');
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    showToast(`Producto "${updatedProduct.name}" actualizado con éxito.`);
  };

  const handleUpdateCustomer = (updatedCustomer: User) => {
    setCustomers((prev) => prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)));
    if (currentUser && currentUser.id === updatedCustomer.id) {
      setCurrentUser(updatedCustomer);
    }
    showToast(`Cliente "${updatedCustomer.name}" actualizado en CRM.`);
  };

  const handleAddCustomer = (newCustomer: User) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast(`Cliente "${newCustomer.name}" registrado en la plataforma.`);
  };

  const handleAddOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Descontar inventario de productos vendidos
    newOrder.items.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === item.product.id ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p))
      );
    });
    // Actualizar gasto y pedidos del cliente si existe
    setCustomers((prev) =>
      prev.map((c) =>
        c.email.toLowerCase() === newOrder.customerEmail.toLowerCase()
          ? {
              ...c,
              totalOrders: (c.totalOrders || 0) + 1,
              totalSpent: (c.totalSpent || 0) + newOrder.total,
              loyaltyPoints: (c.loyaltyPoints || 0) + Math.round(newOrder.total * 0.1),
              lastPurchaseDate: new Date().toISOString().split('T')[0],
              crmTag: ((c.totalOrders || 0) + 1 >= 3) ? 'VIP' : 'Frecuente',
            }
          : c
      )
    );
    showToast(`Venta / Pedido #${newOrder.id} registrado y reflejado en el sistema.`);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus, trackingNumber?: string, courierName?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status,
          trackingNumber: trackingNumber || o.trackingNumber,
          courierName: courierName || o.courierName,
        };
      })
    );
    showToast(`Orden #${orderId} actualizada a "${status}".`);
  };

  const handleConfirmPayment = (orderId: string, status: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, paymentStatus: status } : o))
    );
    showToast(`Pago de Orden #${orderId} actualizado a "${status}".`);
  };

  const handleReplyMessage = (messageId: string, reply: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              status: 'Respondido',
              adminReply: reply,
              repliedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : m
      )
    );
    showToast('Respuesta enviada al cliente.');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter messages for current user and count unread/official replies
  const currentUserMessages = currentUser
    ? messages.filter((m) => m.email.toLowerCase() === currentUser.email.toLowerCase())
    : [];
  const currentUserRepliesCount = currentUserMessages.filter(
    (m) => m.status === 'Respondido' || Boolean(m.adminReply)
  ).length;

  return (
    <div className="min-h-screen bg-[#0d0d11] text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1c1c24] border border-red-500/60 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation (Rendered except when fully inside admin dashboard) */}
      {currentPage !== 'admin' && (
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          setCurrentPage={handleNavigate}
          onNavigateToProfileTab={handleNavigateToProfileTab}
          cartCount={totalCartCount}
          currentUser={currentUser}
          unreadRepliesCount={currentUserRepliesCount}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
        />
      )}

      {/* VIEW ROUTER */}
      <main className="flex-1">
        
        {/* INICIO */}
        {currentPage === 'inicio' && (
          <div>
            <Hero
              onExploreProducts={() => handleNavigate('productos')}
              onContactClick={() => handleNavigate('contacto')}
            />
            <AboutSection />
            <StoryCarousel />
            <FavoritesSection
              products={products}
              onAddToCart={handleAddToCart}
              onViewAllProducts={() => handleNavigate('productos')}
              onQuickView={(p) => setSelectedProductDetail(p)}
            />
            <Footer onNavigate={handleNavigate} />
          </div>
        )}

        {/* PRODUCTOS */}
        {currentPage === 'productos' && (
          <div>
            <ProductsView
              products={products}
              onAddToCart={handleAddToCart}
              onSelectProduct={(p) => setSelectedProductDetail(p)}
            />
            <Footer onNavigate={handleNavigate} />
          </div>
        )}

        {/* CONTACTO */}
        {currentPage === 'contacto' && (
          <div>
            <ContactView
              currentUser={currentUser}
              onSendMessage={handleSendContactMessage}
              onNavigateToMyMessages={() => handleNavigateToProfileTab('messages')}
              userMessagesCount={currentUserMessages.length}
              userRepliesCount={currentUserRepliesCount}
            />
            <Footer onNavigate={handleNavigate} />
          </div>
        )}

        {/* CARRITO */}
        {currentPage === 'carrito' && (
          <div>
            <CartView
              items={cart}
              currentUser={currentUser}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveCartItem}
              onContinueShopping={() => handleNavigate('productos')}
              onRequireAuth={() => handleOpenAuth('customer')}
              onCreateOrder={handleCreateOrder}
              onOrderCompleted={handleOrderCompleted}
            />
            <Footer onNavigate={handleNavigate} />
          </div>
        )}

        {/* PERFIL DE USUARIO */}
        {currentPage === 'perfil' && (
          <div>
            {currentUser ? (
              <UserProfileView
                currentUser={currentUser}
                orders={orders}
                messages={messages}
                initialTab={userProfileTab}
                onTabChange={setUserProfileTab}
                onSendMessage={handleSendContactMessage}
                onUpdateUser={handleUpdateUser}
                onExploreProducts={() => handleNavigate('productos')}
                onNavigateToContact={() => handleNavigate('contacto')}
              />
            ) : (
              <div className="py-24 bg-[#0d0d11] min-h-[70vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center bg-[#14141c] p-8 sm:p-10 rounded-3xl border border-zinc-800 shadow-2xl">
                  <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-500">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Identificación Requerida</h2>
                  <p className="text-zinc-400 text-sm mb-6">
                    Inicia sesión o regístrate para consultar tu perfil, pedidos realizados y rastreo de envíos en tiempo real.
                  </p>
                  <button
                    onClick={() => handleOpenAuth('customer')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-red-600/30 cursor-pointer"
                  >
                    Iniciar Sesión / Registrarme
                  </button>
                </div>
              </div>
            )}
            <Footer onNavigate={handleNavigate} />
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {currentPage === 'admin' && (
          <div>
            {currentUser?.role === 'admin' ? (
              <AdminDashboard
                products={products}
                orders={orders}
                customers={customers}
                messages={messages}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onAddCustomer={handleAddCustomer}
                onUpdateCustomer={handleUpdateCustomer}
                onAddOrder={handleAddOrder}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onConfirmPayment={handleConfirmPayment}
                onReplyMessage={handleReplyMessage}
                onResetStartupData={handleResetStartupData}
                onExitAdmin={() => handleNavigate('inicio')}
              />
            ) : (
              <div className="py-24 bg-[#0a0a0e] min-h-[85vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center bg-[#14141c] p-8 sm:p-10 rounded-3xl border border-zinc-800 shadow-2xl">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Acceso Exclusivo de Administrador</h2>
                  <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                    Para ingresar al Panel de Control necesitas ingresar con las credenciales maestras autorizadas de la administración.
                  </p>
                  <button
                    onClick={() => handleOpenAuth('admin')}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-amber-600/30 cursor-pointer"
                  >
                    Ingresar Clave Maestra de Administrador
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        defaultTab={authDefaultTab}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* PRODUCT QUICK DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={handleAddToCart}
      />

      {/* ORDER CELEBRATION MODAL */}
      {placedOrderCelebration && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-md w-full rounded-3xl p-8 text-center shadow-2xl text-white animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-5 text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2 font-display">
              ¡Pedido Confirmado!
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mb-4">
              Gracias por tu compra en BadGommys. Hemos recibido tu orden y ya está en preparación artesanal.
            </p>

            <div className="p-4 bg-[#1c1c24] rounded-2xl border border-zinc-800 mb-6 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Número de Orden:</span>
                <span className="font-mono font-black text-red-400">#{placedOrderCelebration.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Código de Guía:</span>
                <span className="font-mono font-bold text-white">{placedOrderCelebration.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Método de Pago:</span>
                <span className="font-bold text-zinc-200">{placedOrderCelebration.paymentMethod}</span>
              </div>
              {placedOrderCelebration.paymentDetails?.methodType === 'card' && (
                <div className="flex justify-between text-[11px] text-zinc-400 bg-[#14141c] p-2 rounded-lg border border-zinc-800">
                  <span>Tarjeta:</span>
                  <span className="font-mono font-bold text-zinc-200">
                    {placedOrderCelebration.paymentDetails.cardBrand} •••• {placedOrderCelebration.paymentDetails.cardLast4}
                  </span>
                </div>
              )}
              {placedOrderCelebration.paymentDetails?.methodType === 'spei' && (
                <div className="text-[11px] bg-[#14141c] p-2 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Banco:</span>
                    <span className="font-bold text-zinc-200">{placedOrderCelebration.paymentDetails.speiBank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Ref / Concepto:</span>
                    <span className="font-mono font-bold text-amber-400">{placedOrderCelebration.paymentDetails.speiReference}</span>
                  </div>
                </div>
              )}
              {placedOrderCelebration.paymentDetails?.methodType === 'cash' && (
                <div className="text-[11px] bg-[#14141c] p-2 rounded-lg border border-zinc-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Modalidad:</span>
                    <span className="font-bold text-emerald-400">{placedOrderCelebration.paymentDetails.cashStoreName || 'Contra Entrega'}</span>
                  </div>
                  {placedOrderCelebration.paymentDetails.cashReferenceCode && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Código de Pago / Retiro:</span>
                      <span className="font-mono font-bold text-amber-400">{placedOrderCelebration.paymentDetails.cashReferenceCode}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-zinc-800">
                <span className="text-zinc-400">Total:</span>
                <span className="font-black text-emerald-400">${placedOrderCelebration.total} MXN</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setPlacedOrderCelebration(null);
                  handleNavigate('perfil');
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Ver y Rastrear en Mi Perfil</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setPlacedOrderCelebration(null);
                  handleNavigate('productos');
                }}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-2xl font-semibold text-xs transition-colors cursor-pointer"
              >
                Seguir Explorando Gomitas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Virtual Assistant Chatbot */}
      {currentPage !== 'admin' && (
        <CustomerChatbot
          currentUser={currentUser}
          orders={orders}
          products={products}
          onNavigateToProducts={() => handleNavigate('productos')}
          onNavigateToProfile={() => handleNavigate('perfil')}
        />
      )}

    </div>
  );
}
