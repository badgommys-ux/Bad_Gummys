import React, { useState, useEffect, useRef } from 'react';
import { User, Order, TrackingStep, EmailCampaign, ContactMessage } from '../types';
import { 
  Package, 
  User as UserIcon, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ExternalLink, 
  ArrowRight, 
  ShieldCheck, 
  Edit3, 
  Save, 
  Sparkles, 
  Navigation, 
  Tag, 
  Bell,
  MessageSquare,
  MessageCircle,
  Send,
  PlusCircle,
  CornerDownRight,
  Eye,
  AlertCircle,
  Check,
  Camera,
  Upload,
  Trash2,
  Home,
  Building2,
  Flame,
  Calendar,
  FileText,
  PhoneCall,
  Gift,
  X,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { badgommysLogo } from '../assets';
import { 
  saveUserAvatar, 
  saveAdminProfile, 
  compressAvatarImage, 
  BADGOMMYS_PRESET_AVATARS,
  DEFAULT_CUSTOMER_AVATAR
} from '../utils/userStorage';

interface UserProfileViewProps {
  currentUser: User;
  orders: Order[];
  messages?: ContactMessage[];
  onSendMessage?: (message: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => void;
  onUpdateUser: (updatedUser: User) => void;
  onExploreProducts: () => void;
  onNavigateToContact?: () => void;
  initialTab?: 'orders' | 'tracking' | 'messages' | 'emails' | 'settings';
  onTabChange?: (tab: 'orders' | 'tracking' | 'messages' | 'emails' | 'settings') => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  orders,
  messages = [],
  onSendMessage,
  onUpdateUser,
  onExploreProducts,
  onNavigateToContact,
  initialTab,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'tracking' | 'messages' | 'emails' | 'settings'>(
    initialTab || 'orders'
  );

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Filter orders for this customer (or all if admin)
  const userOrders = orders.filter(
    (order) =>
      order.customerEmail.toLowerCase() === currentUser.email.toLowerCase() ||
      currentUser.role === 'admin'
  );

  // Filter contact messages for this customer (or all if admin)
  const userMessages = messages.filter(
    (msg) =>
      msg.email.toLowerCase() === currentUser.email.toLowerCase() ||
      currentUser.role === 'admin'
  );

  const answeredMessagesCount = userMessages.filter(
    (m) => m.status === 'Respondido' || Boolean(m.adminReply)
  ).length;

  const pendingMessagesCount = userMessages.filter(
    (m) => m.status === 'Nuevo' && !m.adminReply
  ).length;

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrderForTracking =
    (selectedOrderId ? userOrders.find((o) => o.id === selectedOrderId) : null) ||
    userOrders[0] ||
    null;

  // New Message Composer State
  const [isComposingMessage, setIsComposingMessage] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composePhone, setComposePhone] = useState(currentUser.phone || '');
  const [composeMessage, setComposeMessage] = useState('');
  const [composeSuccess, setComposeSuccess] = useState(false);
  const [composeError, setComposeError] = useState('');

  const handleSendNewMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeMessage.trim()) {
      setComposeError('Por favor redacta el texto de tu consulta o mensaje.');
      return;
    }
    setComposeError('');
    if (onSendMessage) {
      onSendMessage({
        name: currentUser.name,
        email: currentUser.email,
        phone: composePhone.trim() || currentUser.phone || '',
        subject: composeSubject.trim() || 'Consulta desde mi perfil',
        message: composeMessage.trim(),
      });
      setComposeSuccess(true);
      setComposeMessage('');
      setComposeSubject('');
      setTimeout(() => {
        setComposeSuccess(false);
        setIsComposingMessage(false);
      }, 3500);
    }
  };

  const handleFollowUp = (originalMsg: ContactMessage) => {
    setComposeSubject(`Seguimiento: ${originalMsg.subject}`);
    setIsComposingMessage(true);
    setTimeout(() => {
      const el = document.getElementById('customer-message-composer');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Stored campaigns targeting this user or all users
  const [receivedEmails, setReceivedEmails] = useState<EmailCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('badgommys_email_campaigns');
      if (saved) {
        const all: EmailCampaign[] = JSON.parse(saved);
        return all.filter(c => 
          c.recipientFilter === 'todos' || 
          c.recipients.some(r => r.toLowerCase() === currentUser.email.toLowerCase()) ||
          currentUser.role === 'admin'
        );
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    const handleSyncCampaigns = () => {
      try {
        const saved = localStorage.getItem('badgommys_email_campaigns');
        if (saved) {
          const all: EmailCampaign[] = JSON.parse(saved);
          setReceivedEmails(
            all.filter(c => 
              c.recipientFilter === 'todos' || 
              c.recipients.some(r => r.toLowerCase() === currentUser.email.toLowerCase()) ||
              currentUser.role === 'admin'
            )
          );
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('badgommys_campaign_sent', handleSyncCampaigns);
    window.addEventListener('storage', handleSyncCampaigns);
    return () => {
      window.removeEventListener('badgommys_campaign_sent', handleSyncCampaigns);
      window.removeEventListener('storage', handleSyncCampaigns);
    };
  }, [currentUser]);

  // Editable settings form - Personal & Contact
  const [editName, setEditName] = useState(currentUser.name || '');
  const [editPhone, setEditPhone] = useState(currentUser.phone || '');
  const [editSecondaryPhone, setEditSecondaryPhone] = useState(currentUser.secondaryPhone || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar || '');
  const [editBirthDate, setEditBirthDate] = useState(currentUser.birthDate || '');
  const [editRfc, setEditRfc] = useState(currentUser.rfc || '');
  const [editRequiresInvoice, setEditRequiresInvoice] = useState(currentUser.requiresInvoice || false);

  // Editable settings form - Structured Delivery Address
  const [editAddress, setEditAddress] = useState(currentUser.address || '');
  const [editStreet, setEditStreet] = useState(currentUser.streetAndNumber || '');
  const [editInteriorNumber, setEditInteriorNumber] = useState(currentUser.interiorNumber || '');
  const [editCrossStreets, setEditCrossStreets] = useState(currentUser.crossStreets || '');
  const [editColony, setEditColony] = useState(currentUser.colony || '');
  const [editPostalCode, setEditPostalCode] = useState(currentUser.postalCode || '');
  const [editCity, setEditCity] = useState(currentUser.city || '');
  const [editState, setEditState] = useState(currentUser.state || '');
  const [editReferences, setEditReferences] = useState(currentUser.deliveryReferences || '');
  const [editAddressType, setEditAddressType] = useState<'Casa' | 'Oficina' | 'Taller' | 'Otro'>(
    currentUser.addressType || 'Casa'
  );
  const [editPreferredSchedule, setEditPreferredSchedule] = useState(
    currentUser.preferredDeliverySchedule || 'Cualquier horario'
  );
  const [editSpecialInstructions, setEditSpecialInstructions] = useState(
    currentUser.specialInstructions || ''
  );

  // Editable settings form - Preferences
  const [editFavoriteSpice, setEditFavoriteSpice] = useState(
    currentUser.favoriteSpiceLevel || '🌶️🌶️ Clásico Chamoy Especial'
  );
  const [editFavoriteGummy, setEditFavoriteGummy] = useState(
    currentUser.favoriteGummy || 'Mangos Enchilados Artesanales'
  );
  const [editWantsSamples, setEditWantsSamples] = useState(
    currentUser.wantsSurpriseSamples !== false
  );

  // Avatar Modal and Upload States
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarTab, setAvatarTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // Synchronize state with currentUser whenever props update
  useEffect(() => {
    setEditName(currentUser.name || '');
    setEditPhone(currentUser.phone || '');
    setEditSecondaryPhone(currentUser.secondaryPhone || '');
    setEditAvatar(currentUser.avatar || '');
    setEditBirthDate(currentUser.birthDate || '');
    setEditRfc(currentUser.rfc || '');
    setEditRequiresInvoice(currentUser.requiresInvoice || false);
    setEditAddress(currentUser.address || '');
    setEditStreet(currentUser.streetAndNumber || '');
    setEditInteriorNumber(currentUser.interiorNumber || '');
    setEditCrossStreets(currentUser.crossStreets || '');
    setEditColony(currentUser.colony || '');
    setEditPostalCode(currentUser.postalCode || '');
    setEditCity(currentUser.city || '');
    setEditState(currentUser.state || '');
    setEditReferences(currentUser.deliveryReferences || '');
    setEditAddressType(currentUser.addressType || 'Casa');
    setEditPreferredSchedule(currentUser.preferredDeliverySchedule || 'Cualquier horario');
    setEditSpecialInstructions(currentUser.specialInstructions || '');
    setEditFavoriteSpice(currentUser.favoriteSpiceLevel || '🌶️🌶️ Clásico Chamoy Especial');
    setEditFavoriteGummy(currentUser.favoriteGummy || 'Mangos Enchilados Artesanales');
    setEditWantsSamples(currentUser.wantsSurpriseSamples !== false);
  }, [currentUser]);

  // Robust Avatar Upload Handler
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setAvatarUploadError('');

    try {
      const base64 = await compressAvatarImage(file, 280, 0.82);
      if (base64) {
        setEditAvatar(base64);
        if (currentUser.role === 'admin') {
          saveAdminProfile({ avatar: base64 });
        } else if (currentUser.email) {
          saveUserAvatar(currentUser.email, base64);
        }
        onUpdateUser({
          ...currentUser,
          avatar: base64,
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
        setIsAvatarModalOpen(false);
      }
    } catch (err: any) {
      console.error('Error procesando imagen de perfil:', err);
      setAvatarUploadError(err?.message || 'No se pudo procesar la imagen seleccionada.');
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleSelectPresetAvatar = (url: string) => {
    setEditAvatar(url);
    if (currentUser.role === 'admin') {
      saveAdminProfile({ avatar: url });
    } else if (currentUser.email) {
      saveUserAvatar(currentUser.email, url);
    }
    onUpdateUser({
      ...currentUser,
      avatar: url,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
    setIsAvatarModalOpen(false);
  };

  const handleApplyAvatarUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const url = avatarUrlInput.trim();
    if (!url) return;

    setEditAvatar(url);
    if (currentUser.role === 'admin') {
      saveAdminProfile({ avatar: url });
    } else if (currentUser.email) {
      saveUserAvatar(currentUser.email, url);
    }
    onUpdateUser({
      ...currentUser,
      avatar: url,
    });
    setAvatarUrlInput('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
    setIsAvatarModalOpen(false);
  };

  const handleRemoveAvatar = () => {
    setEditAvatar('');
    if (currentUser.role === 'admin') {
      saveAdminProfile({ avatar: '' });
    } else if (currentUser.email) {
      saveUserAvatar(currentUser.email, '');
    }
    onUpdateUser({ ...currentUser, avatar: '' });
    setIsAvatarModalOpen(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct formatted single line address if structured fields are provided
    const parts = [
      (editStreet.trim() ? editStreet.trim() + (editInteriorNumber.trim() ? ` Int. ${editInteriorNumber.trim()}` : '') : ''),
      editCrossStreets.trim() ? `Entre ${editCrossStreets.trim()}` : '',
      editColony.trim() ? `Col. ${editColony.trim()}` : '',
      editCity.trim(),
      editState.trim(),
      editPostalCode.trim() ? `C.P. ${editPostalCode.trim()}` : '',
    ].filter(Boolean);
    const finalFormattedAddress = parts.length > 0 ? parts.join(', ') : editAddress.trim();

    const updatedUser: User = {
      ...currentUser,
      name: editName.trim() || currentUser.name,
      phone: editPhone.trim(),
      secondaryPhone: editSecondaryPhone.trim(),
      address: finalFormattedAddress,
      streetAndNumber: editStreet.trim(),
      interiorNumber: editInteriorNumber.trim(),
      crossStreets: editCrossStreets.trim(),
      colony: editColony.trim(),
      postalCode: editPostalCode.trim(),
      city: editCity.trim(),
      state: editState.trim(),
      deliveryReferences: editReferences.trim(),
      addressType: editAddressType,
      preferredDeliverySchedule: editPreferredSchedule,
      specialInstructions: editSpecialInstructions.trim(),
      birthDate: editBirthDate.trim(),
      favoriteSpiceLevel: editFavoriteSpice,
      favoriteGummy: editFavoriteGummy.trim(),
      rfc: editRfc.trim().toUpperCase(),
      requiresInvoice: editRequiresInvoice,
      wantsSurpriseSamples: editWantsSamples,
      avatar: editAvatar,
    };

    if (currentUser.role === 'admin') {
      saveAdminProfile(updatedUser);
    } else if (currentUser.email && editAvatar) {
      saveUserAvatar(currentUser.email, editAvatar);
    }

    onUpdateUser(updatedUser);
    setEditAddress(finalFormattedAddress);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Entregado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Entregado
          </span>
        );
      case 'En camino':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-950/80 text-sky-300 border border-sky-700/50 animate-pulse">
            <Truck className="w-3.5 h-3.5 text-sky-400" />
            En camino (Repartidor en ruta)
          </span>
        );
      case 'En preparación':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-300 border border-amber-700/50">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Preparando en taller
          </span>
        );
      case 'Confirmado':
      case 'Pendiente':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-950/80 text-purple-300 border border-purple-700/50">
            <Package className="w-3.5 h-3.5 text-purple-400" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="py-12 bg-[#0d0d11] min-h-screen text-white">
      {/* Hidden file input for uploading profile photo */}
      <input
        type="file"
        ref={avatarFileRef}
        onChange={handleAvatarFileUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* User Profile Header Card */}
        <div className="bg-[#14141c] rounded-3xl border border-zinc-800 p-6 sm:p-8 shadow-2xl mb-10 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
          
          {/* Avatar with click-to-open modal badge */}
          <div 
            onClick={() => setIsAvatarModalOpen(true)}
            className="group relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-red-500 bg-zinc-800 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(239,68,68,0.3)] cursor-pointer hover:border-amber-400 transition-all"
            title="Haz clic para subir o cambiar tu foto de perfil desde tu dispositivo o elegir un avatar"
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <UserIcon className="w-12 h-12 text-zinc-400" />
            )}
            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity p-1 text-center">
              <Camera className="w-6 h-6 text-amber-400" />
              <span className="text-[10px] font-black mt-1 leading-tight text-white">Cambiar Foto</span>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{currentUser.name}</h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-red-950 text-red-300 border border-red-800/60">
                {currentUser.role === 'admin' ? '🛡️ Administrador Master' : '🍬 Cliente VIP BadGommys'}
              </span>
            </div>

            <p className="text-sm text-zinc-400 flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4 text-red-400" />
              <span>{currentUser.email}</span>
              {currentUser.phone && (
                <>
                  <span className="text-zinc-600">•</span>
                  <Phone className="w-4 h-4 text-red-400" />
                  <span>{currentUser.phone}</span>
                </>
              )}
            </p>

            <p className="text-xs text-zinc-500">
              Miembro registrado desde: {currentUser.registeredAt} • Total de pedidos: {userOrders.length}
            </p>
          </div>

          {/* Quick Tab Selectors */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-[#1c1c24] text-zinc-400 hover:text-white'
              }`}
            >
              Mis Pedidos ({userOrders.length})
            </button>
            <button
              id="tab-tracking-btn"
              onClick={() => {
                setActiveTab('tracking');
                onTabChange?.('tracking');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'tracking'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-[#1c1c24] text-zinc-400 hover:text-white'
              }`}
            >
              Rastrear Envío
            </button>
            <button
              id="tab-messages-btn"
              onClick={() => {
                setActiveTab('messages');
                onTabChange?.('messages');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'messages'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-[#1c1c24] text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Mis Mensajes ({userMessages.length})</span>
              {answeredMessagesCount > 0 && (
                <span className="bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1 animate-pulse">
                  {answeredMessagesCount} resuelto{answeredMessagesCount > 1 ? 's' : ''}
                </span>
              )}
            </button>
            <button
              id="tab-emails-btn"
              onClick={() => {
                setActiveTab('emails');
                onTabChange?.('emails');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'emails'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-[#1c1c24] text-zinc-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4 text-red-400" />
              <span>Avisos & Ofertas ({receivedEmails.length})</span>
            </button>
            <button
              id="tab-settings-btn"
              onClick={() => {
                setActiveTab('settings');
                onTabChange?.('settings');
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-[#1c1c24] text-zinc-400 hover:text-white'
              }`}
            >
              Configuración de Cuenta
            </button>
          </div>
        </div>

        {/* TAB 1: ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Historial de Pedidos
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Consulta el detalle y estado de todas tus compras en BadGommys.
                </p>
              </div>

              <button
                onClick={onExploreProducts}
                className="inline-flex items-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <span>Hacer Nuevo Pedido</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {userOrders.length === 0 ? (
              <div className="text-center py-16 bg-[#14141c] rounded-3xl border border-zinc-800">
                <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">Aún no tienes pedidos registrados</h3>
                <p className="text-xs text-zinc-400 mb-6">
                  ¡Explora el catálogo y pide tus gomitas de chamoy favoritas!
                </p>
                <button
                  onClick={onExploreProducts}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full text-xs font-bold cursor-pointer"
                >
                  Ver Gomitas
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#14141c] rounded-3xl border border-zinc-800 p-5 sm:p-6 shadow-xl space-y-4"
                  >
                    {/* Order Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/80 gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-base text-red-400">
                            Orden #{order.id}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Fecha: {order.createdAt} • Guía: <span className="font-mono text-zinc-300">{order.trackingNumber}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <button
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setActiveTab('tracking');
                          }}
                          className="flex items-center gap-2 bg-zinc-800 hover:bg-red-600 text-zinc-200 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-zinc-700"
                        >
                          <Truck className="w-4 h-4 text-red-400" />
                          <span>Rastrear este pedido</span>
                        </button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-[#1c1c24] rounded-2xl border border-zinc-800"
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-black shrink-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {item.product.name}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              {item.quantity} x ${item.product.price} MXN
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Footer Summary */}
                    <div className="pt-3 border-t border-zinc-800/80 text-xs space-y-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="text-zinc-400">
                          <span>Destino: </span>
                          <span className="text-zinc-200 font-semibold">{order.shippingAddress}</span>
                        </div>
                        <div className="text-right self-end sm:self-auto">
                          <span className="text-zinc-400 mr-2">Total:</span>
                          <span className="text-lg font-black text-red-500">${order.total} MXN</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-900 text-[11px] bg-[#1c1c24] p-2.5 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400">Método de pago:</span>
                          <span className="text-white font-bold">{order.paymentMethod}</span>
                        </div>

                        {order.paymentDetails?.methodType === 'card' && (
                          <span className="text-zinc-300 font-mono">
                            {order.paymentDetails.cardBrand} •••• {order.paymentDetails.cardLast4}
                          </span>
                        )}

                        {order.paymentDetails?.methodType === 'spei' && (
                          <span className="text-amber-400 font-mono">
                            {order.paymentDetails.speiBank} • Ref: {order.paymentDetails.speiReference}
                          </span>
                        )}

                        {order.paymentDetails?.methodType === 'cash' && (
                          <span className="text-emerald-400 font-medium">
                            {order.paymentDetails.cashStoreName || 'Efectivo'} 
                            {order.paymentDetails.cashReferenceCode ? ` • Ref: ${order.paymentDetails.cashReferenceCode}` : ''}
                          </span>
                        )}

                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          order.paymentStatus === 'Pagado'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LIVE ORDER TRACKING */}
        {activeTab === 'tracking' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Rastreador de Envíos en Tiempo Real
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Monitorea el trayecto de tu paquete desde nuestro taller hasta tu puerta.
                </p>
              </div>

              {/* Order selector dropdown if multiple orders exist */}
              {userOrders.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-semibold">Seleccionar orden:</span>
                  <select
                    value={selectedOrderForTracking?.id}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="bg-[#1c1c24] border border-zinc-700 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
                  >
                    {userOrders.map((o) => (
                      <option key={o.id} value={o.id}>
                        Orden #{o.id} - {o.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {selectedOrderForTracking ? (
              <div className="bg-[#14141c] rounded-3xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-8">
                
                {/* Header status bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#1b1b24] rounded-2xl border border-zinc-700/60">
                  <div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Código de Guía de Rastreo
                    </span>
                    <span className="font-mono text-xl font-black text-white">
                      {selectedOrderForTracking.trackingNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Tiempo Estimado de Llegada
                    </span>
                    <span className="text-base font-bold text-amber-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {selectedOrderForTracking.estimatedDelivery}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Estatus Actual
                    </span>
                    {getStatusBadge(selectedOrderForTracking.status)}
                  </div>
                </div>

                {/* Visual Progress Steps Bar */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6">
                    Línea de Tiempo del Despacho
                  </h3>

                  <div className="relative pl-6 sm:pl-8 border-l-2 border-red-600/40 space-y-8">
                    {selectedOrderForTracking.timeline.map((step, index) => (
                      <div key={index} className="relative group">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-[31px] sm:-left-[39px] top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all ${
                            step.completed
                              ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(220,38,38,0.7)]'
                              : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                          }`}
                        >
                          {step.completed ? '✓' : index + 1}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-bold text-white">{step.title}</span>
                            <span className="text-xs text-red-400 font-mono bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                              {step.time}
                            </span>
                            {step.current && (
                              <span className="text-[10px] uppercase font-black tracking-widest bg-sky-500/20 text-sky-400 border border-sky-500/40 px-2 py-0.5 rounded-full animate-pulse">
                                En Curso
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Courier & Delivery details card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                  <div className="p-4 bg-[#1b1b24] rounded-2xl border border-zinc-800 space-y-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Repartidor Asignado
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {selectedOrderForTracking.courierName}
                        </p>
                        {selectedOrderForTracking.courierPhone && (
                          <p className="text-xs text-zinc-400">
                            Contacto: {selectedOrderForTracking.courierPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#1b1b24] rounded-2xl border border-zinc-800 space-y-2">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Dirección de Entrega
                    </p>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          {selectedOrderForTracking.shippingAddress}
                        </p>
                        {selectedOrderForTracking.deliveryNotes && (
                          <p className="text-xs text-amber-400/90 mt-0.5">
                            Nota: "{selectedOrderForTracking.deliveryNotes}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 bg-[#14141c] rounded-3xl border border-zinc-800">
                <p className="text-zinc-400 text-sm">No hay pedidos disponibles para rastrear.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MIS MENSAJES & RESPUESTAS */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#14141c] p-6 rounded-3xl border border-zinc-800 shadow-xl">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Mis Mensajes & Atención al Cliente
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mt-1">
                  Consulta el historial de dudas, cotizaciones o comentarios que has enviado a BadGommys, y revisa las respuestas directas de nuestro equipo en un solo lugar.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  id="btn-compose-message-toggle"
                  onClick={() => {
                    setIsComposingMessage(!isComposingMessage);
                    setComposeError('');
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg shadow-red-600/30 hover:scale-[1.02]"
                >
                  {isComposingMessage ? (
                    <span>Cerrar Formulario</span>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Enviar Nueva Consulta</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#14141c] p-4 rounded-2xl border border-zinc-800 flex items-center gap-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{userMessages.length}</div>
                  <div className="text-xs text-zinc-400">Mensajes Enviados</div>
                </div>
              </div>

              <div className="bg-[#14141c] p-4 rounded-2xl border border-emerald-900/40 flex items-center gap-3.5 shadow-md relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-400 flex items-center gap-1.5">
                    <span>{answeredMessagesCount}</span>
                    {answeredMessagesCount > 0 && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-700/50">
                        Atendidos
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400">Respuestas Oficiales</div>
                </div>
              </div>

              <div className="bg-[#14141c] p-4 rounded-2xl border border-amber-900/30 flex items-center gap-3.5 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-black text-amber-400">{pendingMessagesCount}</div>
                  <div className="text-xs text-zinc-400">En Espera de Respuesta</div>
                </div>
              </div>
            </div>

            {/* In-place message composer */}
            {isComposingMessage && (
              <div id="customer-message-composer" className="bg-[#161622] rounded-3xl border border-red-500/40 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-red-400" />
                    <h3 className="text-base font-black text-white">Redactar Consulta para Atención al Cliente</h3>
                  </div>
                  <span className="text-xs text-zinc-400 hidden sm:inline">
                    Enviando como: <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
                  </span>
                </div>

                {composeSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-200">¡Mensaje enviado al taller de BadGommys con éxito!</p>
                      <p className="text-xs text-emerald-300/80 mt-0.5">
                        El administrador ha recibido tu notificación y verás la respuesta directamente en esta pantalla.
                      </p>
                    </div>
                  </div>
                )}

                {composeError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center gap-2 text-xs text-red-300">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{composeError}</span>
                  </div>
                )}

                <form onSubmit={handleSendNewMessage} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                      Temas Rápidos Sugeridos:
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {[
                        'Duda sobre mi pedido',
                        'Consulta de envío y entrega',
                        'Cotización para fiesta o mayoreo',
                        'Sugerencia de receta de chamoy',
                        'Otro tema',
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setComposeSubject(tag)}
                          className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                            composeSubject === tag
                              ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                              : 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700 hover:text-white'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Asunto o motivo de tu mensaje (ej: ¿Puedo pedir chamoy extra?)"
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Teléfono de Contacto (opcional):
                      </label>
                      <input
                        type="text"
                        placeholder="ej: 55 1234 5678"
                        value={composePhone}
                        onChange={(e) => setComposePhone(e.target.value)}
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Correo Registrado:
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full bg-[#181820] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      ¿En qué te podemos apoyar? (Escribe tu mensaje):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Escribe aquí con detalle tu duda, número de orden si aplica, o solicitud especial para el taller..."
                      value={composeMessage}
                      onChange={(e) => setComposeMessage(e.target.value)}
                      className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none font-sans"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsComposingMessage(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Mensaje Ahora</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of Messages */}
            {userMessages.length === 0 ? (
              <div className="text-center py-16 bg-[#14141c] rounded-3xl border border-zinc-800 p-8 space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Aún no has enviado mensajes</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mt-1">
                    ¿Tienes alguna duda sobre tus pedidos, salsas de chamoy o tiempos de entrega? Escríbenos y recibirás una respuesta personalizada aquí mismo.
                  </p>
                </div>
                <button
                  onClick={() => setIsComposingMessage(true)}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Escribir mi primer mensaje</span>
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {userMessages.map((msg) => {
                  const isAnswered = msg.status === 'Respondido' || Boolean(msg.adminReply);
                  return (
                    <div
                      key={msg.id}
                      className={`bg-[#14141c] rounded-3xl border transition-all p-5 sm:p-7 space-y-4 shadow-xl ${
                        isAnswered
                          ? 'border-emerald-500/40 bg-gradient-to-b from-[#14141c] to-[#121b16]'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {/* Message Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-zinc-400 font-bold bg-zinc-800 px-2 py-0.5 rounded-md">
                              #{msg.id.replace('msg-', 'MSG-')}
                            </span>
                            <h3 className="text-base font-black text-white">{msg.subject}</h3>
                          </div>
                          <p className="text-[11px] text-zinc-400 flex items-center gap-2">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span>Enviado el {msg.createdAt}</span>
                            {msg.phone && (
                              <>
                                <span className="text-zinc-600">•</span>
                                <Phone className="w-3 h-3 text-zinc-500" />
                                <span>{msg.phone}</span>
                              </>
                            )}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isAnswered ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span>¡Respondido por BadGommys!</span>
                            </span>
                          ) : msg.status === 'Leído' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-950 text-blue-300 border border-blue-600/50">
                              <Eye className="w-3.5 h-3.5 text-blue-400" />
                              <span>Leído por el equipo</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-600/50">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>En espera de respuesta</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Original Customer Message */}
                      <div className="bg-[#1a1a24] rounded-2xl p-4 border border-zinc-800/80 space-y-1.5">
                        <div className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-red-400" />
                          <span>Tu mensaje enviado:</span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line pl-1 font-sans">
                          {msg.message}
                        </p>
                      </div>

                      {/* Official Administrator Response Box */}
                      {isAnswered && msg.adminReply ? (
                        <div className="bg-gradient-to-r from-emerald-950/40 via-[#15231c] to-emerald-950/20 border-2 border-emerald-500/50 rounded-2xl p-5 shadow-lg space-y-3 relative overflow-hidden">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full overflow-hidden border border-emerald-400 bg-black shrink-0 flex items-center justify-center shadow-md">
                                <img src={badgommysLogo} alt="BadGommys" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                                  <span>Respuesta Oficial de BadGommys</span>
                                  <span className="px-1.5 py-0.2 bg-emerald-800/50 text-emerald-200 text-[9px] rounded font-bold">
                                    Atendido
                                  </span>
                                </h4>
                                {msg.repliedAt && (
                                  <p className="text-[10px] text-emerald-400/80">
                                    Contestado el {msg.repliedAt}
                                  </p>
                                )}
                              </div>
                            </div>

                            <span className="text-[10px] text-zinc-400 font-semibold">
                              Canal Directo de Soporte
                            </span>
                          </div>

                          <div className="p-3.5 bg-[#0e1713]/80 rounded-xl border border-emerald-500/30">
                            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed whitespace-pre-line font-medium">
                              {msg.adminReply}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <p className="text-[10px] text-zinc-400 italic">
                              ¿Deseas dar seguimiento a esta respuesta?
                            </p>
                            <button
                              type="button"
                              onClick={() => handleFollowUp(msg)}
                              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <CornerDownRight className="w-3.5 h-3.5" />
                              <span>Enviar seguimiento</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3 text-xs text-zinc-400">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              Tu mensaje está siendo revisado por el administrador. En breve verás la respuesta en este recuadro.
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0">
                            Tiempo prom: 15-45m
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: NOTIFICACIONES & CORREOS DEL CLIENTE */}
        {activeTab === 'emails' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Mis Avisos, Ofertas & Detalles al Correo
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Comunicaciones oficiales enviadas a tu dirección de correo registrado ({currentUser.email}).
                </p>
              </div>
              <span className="text-xs font-bold text-red-400 bg-red-950/60 border border-red-800/40 px-3 py-1 rounded-full self-start sm:self-auto">
                {receivedEmails.length} mensaje(s)
              </span>
            </div>

            {receivedEmails.length === 0 ? (
              <div className="text-center py-16 bg-[#14141c] rounded-3xl border border-zinc-800 space-y-3">
                <Mail className="w-10 h-10 text-zinc-600 mx-auto" />
                <p className="text-sm font-bold text-zinc-300">Aún no tienes avisos o correos acumulados.</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Aquí aparecerán las ofertas exclusivas con cupones, notificaciones de guías de envío y anuncios de BadGommys.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedEmails.map((camp) => (
                  <div
                    key={camp.id}
                    className="p-6 bg-[#14141c] rounded-3xl border border-zinc-800 space-y-4 shadow-xl hover:border-zinc-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          camp.type === 'oferta'
                            ? 'bg-red-950 text-red-300 border border-red-800'
                            : camp.type === 'pedido'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {camp.type}
                        </span>
                        <h3 className="font-bold text-white text-sm sm:text-base">{camp.subject}</h3>
                      </div>
                      <span className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{camp.sentAt}</span>
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-zinc-200">{camp.title}</h4>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                        {camp.message}
                      </p>
                    </div>

                    {/* Offer Coupon Box */}
                    {camp.discountCode && (
                      <div className="p-4 bg-gradient-to-r from-red-950/40 via-[#18151c] to-amber-950/30 border border-red-800/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-red-300">Cupón Especial para Ti:</p>
                          <p className="text-[11px] text-zinc-400">
                            {camp.discountPercent ? `${camp.discountPercent}% de descuento` : 'Promoción especial'} • {camp.validUntil || 'Válido en la tienda'}
                          </p>
                        </div>
                        <div className="bg-black/50 border border-red-500/50 px-4 py-2 rounded-xl text-center">
                          <span className="font-mono font-black text-red-400 text-sm tracking-wider">
                            {camp.discountCode}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Order Details box if present */}
                    {camp.orderSummary && (
                      <div className="p-4 bg-[#1b1b24] border border-zinc-700/60 rounded-2xl text-xs space-y-2">
                        <div className="flex justify-between font-bold text-white">
                          <span>Pedido #{camp.orderSummary.orderId}</span>
                          <span className="text-red-400">${camp.orderSummary.total} MXN</span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                          <span>Guía: <strong className="font-mono text-white">{camp.orderSummary.trackingNumber}</strong></span>
                          <span>Paquetería: <strong className="text-white">{camp.orderSummary.courierName}</strong></span>
                        </div>
                        <p className="text-zinc-400 text-[11px] pt-1">
                          Productos: {camp.orderSummary.itemsListText}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={onExploreProducts}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <span>{camp.callToActionText || 'Aprovechar en la Tienda'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACCOUNT SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl bg-[#14141c] rounded-3xl border border-zinc-800 p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Configuración de la Cuenta
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Actualiza tu información personal, dirección de entrega con referencias para repartidores y preferencias.
              </p>
            </div>

            {saveSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 flex items-center gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-emerald-200">
                  ¡Información y dirección de entrega actualizadas con éxito! Se sincronizará automáticamente en tus pedidos.
                </span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* SECTION 1: DATOS PERSONALES & CONTACTO */}
              <div className="p-5 bg-[#181824] rounded-2xl border border-zinc-800/80 space-y-4">
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider">
                  <UserIcon className="w-4 h-4" />
                  <span>1. Información Personal & Contacto</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Tu nombre y apellido"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Correo Electrónico (No modificable)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full bg-[#101016] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-sm text-zinc-500 cursor-not-allowed font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Teléfono Principal / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Ej. 55 1234 5678"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                      <span>Teléfono Secundario / Respaldo (Para Repartidor)</span>
                    </label>
                    <input
                      type="tel"
                      value={editSecondaryPhone}
                      onChange={(e) => setEditSecondaryPhone(e.target.value)}
                      placeholder="Ej. 55 9876 5432"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cumpleaños 🎂</span>
                    </label>
                    <input
                      type="date"
                      value={editBirthDate}
                      onChange={(e) => setEditBirthDate(e.target.value)}
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-400" />
                      <span>RFC / Facturación (Opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={editRfc}
                      onChange={(e) => setEditRfc(e.target.value.toUpperCase())}
                      placeholder="XAXX010101000"
                      maxLength={13}
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 uppercase font-mono"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-2.5 bg-[#121218] border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                      <input
                        type="checkbox"
                        checked={editRequiresInvoice}
                        onChange={(e) => setEditRequiresInvoice(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500 bg-zinc-900 border-zinc-700"
                      />
                      <span className="text-xs text-zinc-300 font-semibold">
                        Solicitar Factura Electrónica (CFDI)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DIRECCIÓN HABITUAL DE ENTREGA (CON DESGLOSE DETALLADO) */}
              <div className="p-5 bg-[#181824] rounded-2xl border border-zinc-800/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-4 h-4" />
                    <span>2. Dirección Habitual de Entrega (Auto-completado de Pedidos)</span>
                  </div>

                  {/* Address Type Selector */}
                  <div className="flex items-center gap-1.5">
                    {(['Casa', 'Oficina', 'Taller', 'Otro'] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setEditAddressType(type)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          editAddressType === type
                            ? 'bg-sky-500 text-white shadow-sm'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {type === 'Casa' ? '🏠 Casa' : type === 'Oficina' ? '🏢 Oficina' : type === 'Taller' ? '🏬 Negocio' : '📍 Otro'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-sky-950/20 border border-sky-500/20 rounded-xl text-xs text-sky-300">
                  💡 <strong>Entrega automática:</strong> Esta dirección se cargará automáticamente cada vez que hagas un pedido desde el carrito, con opción a modificarla si necesitas entregar en otro lugar.
                </div>

                {/* Street, Ext Number and Int Number */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Calle y Número Exterior *
                    </label>
                    <input
                      type="text"
                      value={editStreet}
                      onChange={(e) => setEditStreet(e.target.value)}
                      placeholder="Ej. Av. Hidalgo #452"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      No. Interior / Depto / Piso
                    </label>
                    <input
                      type="text"
                      value={editInteriorNumber}
                      onChange={(e) => setEditInteriorNumber(e.target.value)}
                      placeholder="Ej. Depto 3B / Piso 2"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Between Streets and Colony */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Entre qué Calles (Cruces para el Repartidor)
                    </label>
                    <input
                      type="text"
                      value={editCrossStreets}
                      onChange={(e) => setEditCrossStreets(e.target.value)}
                      placeholder="Ej. Entre Juárez y 5 de Mayo"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Colonia / Barrio / Fraccionamiento *
                    </label>
                    <input
                      type="text"
                      value={editColony}
                      onChange={(e) => setEditColony(e.target.value)}
                      placeholder="Ej. Col. Centro / Del Valle"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* City, State, CP */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Municipio / Alcaldía / Ciudad *
                    </label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      placeholder="Ej. Naranjos Amatlán / Benito Juárez"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Estado de la República *
                    </label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      placeholder="Ej. Veracruz / CDMX / Jalisco"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Código Postal (C.P.)
                    </label>
                    <input
                      type="text"
                      value={editPostalCode}
                      onChange={(e) => setEditPostalCode(e.target.value)}
                      placeholder="Ej. 92300"
                      maxLength={6}
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                {/* Preferred Schedule */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Horario Preferido de Entrega</span>
                  </label>
                  <select
                    value={editPreferredSchedule}
                    onChange={(e) => setEditPreferredSchedule(e.target.value)}
                    className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Cualquier horario">☀️ Cualquier horario del día (Flexible)</option>
                    <option value="Mañana (9:00 - 14:00)">🌅 Por la mañana (9:00 AM a 2:00 PM)</option>
                    <option value="Tarde (14:00 - 19:00)">🌇 Por la tarde (2:00 PM a 7:00 PM)</option>
                    <option value="Noche (19:00 - 22:00)">🌙 Por la noche (7:00 PM a 10:00 PM)</option>
                    <option value="Fines de semana">📅 Preferentemente fines de semana</option>
                  </select>
                </div>

                {/* References for Courier */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Referencias para el Repartidor (Color de fachada, portón, timbre, caseta)
                  </label>
                  <textarea
                    rows={2}
                    value={editReferences}
                    onChange={(e) => setEditReferences(e.target.value)}
                    placeholder="Ej. Fachada color crema con portón café, timbre blanco a la derecha o tocar el claxon al llegar"
                    className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>

                {/* Special permanent instructions */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Instrucciones Especiales Fijas
                  </label>
                  <input
                    type="text"
                    value={editSpecialInstructions}
                    onChange={(e) => setEditSpecialInstructions(e.target.value)}
                    placeholder="Ej. Dejar con vigilancia en caseta, llamar 5 minutos antes, dejar con vecino si no estoy"
                    className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Fallback general address field */}
                {(!editStreet && editAddress) && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Dirección anterior registrada
                    </label>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full bg-[#121218] border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-400"
                    />
                  </div>
                )}

                {/* Dynamic Preview */}
                {(editStreet || editAddress) && (
                  <div className="p-3.5 bg-[#121218] rounded-xl border border-zinc-700/80 space-y-1">
                    <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider block">
                      Vista previa de envío en checkout:
                    </span>
                    <p className="text-xs text-zinc-200 font-semibold">
                      📍 [{editAddressType}] {[editStreet + (editInteriorNumber ? ` Int. ${editInteriorNumber}` : ''), editCrossStreets ? `Entre ${editCrossStreets}` : '', editColony ? `Col. ${editColony}` : '', editCity, editState, editPostalCode ? `C.P. ${editPostalCode}` : ''].filter(Boolean).join(', ') || editAddress}
                    </p>
                    {editReferences && (
                      <p className="text-[11px] text-amber-400/90">
                        <strong>Referencias:</strong> {editReferences}
                      </p>
                    )}
                    {editSpecialInstructions && (
                      <p className="text-[11px] text-sky-400">
                        <strong>Instrucciones:</strong> {editSpecialInstructions}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 3: PREFERENCIAS BADGOMMYS */}
              <div className="p-5 bg-[#181824] rounded-2xl border border-zinc-800/80 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Flame className="w-4 h-4" />
                  <span>3. Preferencias de Gomitas & Picante</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Nivel de Picante Favorito
                    </label>
                    <select
                      value={editFavoriteSpice}
                      onChange={(e) => setEditFavoriteSpice(e.target.value)}
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-bold"
                    >
                      <option value="🌶️ Suave Dulce Chamoy">🌶️ Suave Dulce Chamoy</option>
                      <option value="🌶️🌶️ Clásico Chamoy Especial">🌶️🌶️ Clásico Chamoy Especial</option>
                      <option value="🌶️🌶️🌶️ Bravo Picoso Piquín">🌶️🌶️🌶️ Bravo Picoso Piquín</option>
                      <option value="🔥🔥🔥 Fuego Extremo Habanero">🔥🔥🔥 Fuego Extremo Habanero</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Gomitas Favoritas
                    </label>
                    <input
                      type="text"
                      value={editFavoriteGummy}
                      onChange={(e) => setEditFavoriteGummy(e.target.value)}
                      placeholder="Ej. Mango Enchilado, Ositos Picositos, Panditas Chamoy"
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#121218] border border-zinc-800 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editWantsSamples}
                      onChange={(e) => setEditWantsSamples(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 bg-zinc-900 border-zinc-700"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-amber-400" />
                        <span>Recibir Muestras Gratis Sorpresa en Mis Pedidos</span>
                      </span>
                      <p className="text-zinc-400 text-[11px] mt-0.5">
                        Al empaquetar tus compras incluiremos pequeñas degustaciones de nuevos sabores de gomitas artesanales.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* SECTION 4: FOTO DE PERFIL */}
              <div className="p-5 bg-[#181824] rounded-2xl border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                    4. Foto de Perfil del Cliente
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Abrir Galería de Avatares</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div 
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-red-500 bg-zinc-900 shrink-0 shadow-md flex items-center justify-center cursor-pointer relative group"
                    title="Haz clic para cambiar foto"
                  >
                    {editAvatar ? (
                      <img src={editAvatar} alt="Vista previa" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <UserIcon className="w-10 h-10 text-zinc-500" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <p className="text-xs text-zinc-300">
                      Sube cualquier fotografía desde tu dispositivo (teléfono o PC), o elige uno de nuestros avatares exclusivos BadGommys.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      {/* Direct label to native file input */}
                      <label 
                        htmlFor="settings-avatar-file-upload"
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-red-600/30 transition-all cursor-pointer hover:scale-[1.02]"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Foto de mi Dispositivo</span>
                      </label>
                      <input
                        id="settings-avatar-file-upload"
                        type="file"
                        onChange={handleAvatarFileUpload}
                        accept="image/*"
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ver Avatares BadGommys</span>
                      </button>

                      {editAvatar && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 text-xs px-3 py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Quitar Foto
                        </button>
                      )}
                    </div>

                    {isUploadingAvatar && (
                      <p className="text-xs text-amber-400 animate-pulse font-bold">
                        ⏳ Comprimiendo y guardando foto de perfil...
                      </p>
                    )}
                    {avatarUploadError && (
                      <p className="text-xs text-red-400 font-bold">
                        ⚠️ {avatarUploadError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800">
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    O pega el enlace web directo de tu imagen:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={avatarUrlInput}
                      onChange={(e) => setAvatarUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-[#121218] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyAvatarUrl()}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-red-600/30 cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Información & Dirección de Entrega</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>

      {/* MODAL: SELECTOR DE FOTO DE PERFIL & AVATARES */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-600/20 text-red-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Elegir Foto de Perfil</h3>
                  <p className="text-xs text-zinc-400">Sube una foto o escoge un avatar BadGommys</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-[#101016] p-1 rounded-2xl border border-zinc-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAvatarTab('upload')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  avatarTab === 'upload' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Foto</span>
              </button>

              <button
                type="button"
                onClick={() => setAvatarTab('presets')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  avatarTab === 'presets' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Avatares</span>
              </button>

              <button
                type="button"
                onClick={() => setAvatarTab('url')}
                className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  avatarTab === 'url' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Enlace Web</span>
              </button>
            </div>

            {/* Tab 1: Upload from device */}
            {avatarTab === 'upload' && (
              <div className="space-y-4">
                <label 
                  htmlFor="modal-avatar-file-upload"
                  className="border-2 border-dashed border-zinc-700 hover:border-red-500 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3 cursor-pointer bg-[#181824] hover:bg-[#1a1a28] transition-all group"
                >
                  <div className="w-14 h-14 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Haz clic aquí para seleccionar una foto</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Compatible con galería, fotos de cámara (JPG, PNG, WebP)</p>
                  </div>
                  <span className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md">
                    Examinar Dispositivo
                  </span>
                </label>
                <input
                  id="modal-avatar-file-upload"
                  type="file"
                  onChange={handleAvatarFileUpload}
                  accept="image/*"
                  className="hidden"
                />

                {isUploadingAvatar && (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    <span>Procesando imagen con compresión inteligente...</span>
                  </div>
                )}
                {avatarUploadError && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                    {avatarUploadError}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: BadGommys Preset Avatars */}
            {avatarTab === 'presets' && (
              <div className="space-y-3">
                <p className="text-xs text-zinc-400">
                  Selecciona uno de nuestros personajes y sabores de gomitas artesanales con 1 solo clic:
                </p>
                <div className="grid grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-1">
                  {BADGOMMYS_PRESET_AVATARS.map((preset) => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => handleSelectPresetAvatar(preset.url)}
                      className="group p-2 rounded-2xl bg-[#181824] hover:bg-zinc-800 border border-zinc-700/80 hover:border-red-500 transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer"
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[10px] font-bold text-zinc-300 group-hover:text-white line-clamp-1 leading-tight">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: URL Direct Link */}
            {avatarTab === 'url' && (
              <form onSubmit={handleApplyAvatarUrl} className="space-y-3">
                <label className="block text-xs font-bold text-zinc-300">
                  Pega el enlace directo de tu imagen (Unsplash, Imgur, etc.)
                </label>
                <input
                  type="url"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-[#101016] border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
                {avatarUrlInput && (
                  <div className="flex items-center gap-3 p-3 bg-[#181824] rounded-xl border border-zinc-800">
                    <img src={avatarUrlInput} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                    <span className="text-xs text-zinc-400">Vista previa en tiempo real</span>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Guardar y Aplicar Foto
                </button>
              </form>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              {currentUser.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Quitar foto actual
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="ml-auto px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
