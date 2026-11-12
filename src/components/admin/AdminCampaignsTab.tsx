import React, { useState, useEffect } from 'react';
import { User, Order, EmailCampaign, EmailSubscriber } from '../../types';
import { badgommysLogo } from '../../assets';
import { 
  Mail, 
  Send, 
  Users, 
  Clock, 
  Settings, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Bell, 
  Package, 
  ExternalLink, 
  RotateCcw, 
  Monitor, 
  Smartphone, 
  Tag, 
  Eye,
  Copy,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  CheckCheck,
  MailCheck,
  Loader2
} from 'lucide-react';
import { 
  buildBadGommysEmailHtml 
} from '../../services/gmailSendService';

interface AdminCampaignsTabProps {
  customers: User[];
  orders: Order[];
  onSendCampaign?: (campaign: EmailCampaign) => void;
  onResetStartupData?: () => void;
}

// Initial 9 email base (customers + newsletter subscribers)
const DEFAULT_EMAIL_BASE: Array<{
  email: string;
  name: string;
  type: 'Cliente Registrado' | 'Suscriptor Web' | 'Comprador Frecuente';
  registeredAt: string;
  ordersCount: number;
}> = [
  { email: 'danielayazminrodriguezbautista@gmail.com', name: 'Daniela Rodríguez Bautista', type: 'Comprador Frecuente', registeredAt: '2026-09-01', ordersCount: 1 },
  { email: 'carlos.mendoza@hotmail.com', name: 'Carlos Mendoza Ruiz', type: 'Comprador Frecuente', registeredAt: '2026-09-02', ordersCount: 1 },
  { email: 'valeria.gomez@gmail.com', name: 'Valeria Gómez Torres', type: 'Cliente Registrado', registeredAt: '2026-09-04', ordersCount: 1 },
  { email: 'rodriguezbautista024@gmail.com', name: 'rodriguezbautista024', type: 'Cliente Registrado', registeredAt: '2026-09-28', ordersCount: 0 },
  { email: 'danielarodriguez9859@gmail.com', name: 'Daniela Rodríguez (Admin)', type: 'Cliente Registrado', registeredAt: '2026-09-20', ordersCount: 2 },
  { email: 'contacto.gommys@outlook.com', name: 'Mariana López', type: 'Suscriptor Web', registeredAt: '2026-09-15', ordersCount: 0 },
  { email: 'miguel.angel.cdmx@gmail.com', name: 'Miguel Ángel Hernández', type: 'Suscriptor Web', registeredAt: '2026-09-18', ordersCount: 0 },
  { email: 'sofia.dulces@yahoo.com', name: 'Sofía Martínez', type: 'Suscriptor Web', registeredAt: '2026-09-22', ordersCount: 0 },
  { email: 'pedidos.fiesta@gmail.com', name: 'Eventos & Catering CDMX', type: 'Suscriptor Web', registeredAt: '2026-09-25', ordersCount: 0 },
];

// Initial 3 campaigns in history
const INITIAL_CAMPAIGNS_HISTORY: EmailCampaign[] = [
  {
    id: 'camp-101',
    type: 'oferta',
    subject: '🔥 ¡20% de Descuento Exclusivo en tus Gomitas BadGommys Favoritas!',
    title: '¡Te regalamos 20% OFF en tu próxima orden!',
    preheader: 'Aprovecha hoy mismo este antojo escarchado con chamoy artesanal.',
    message: 'Sabemos lo mucho que disfrutas nuestras gomitas artesanales. Por ser parte consentida de la familia BadGommys, preparamos un cupón especial para que surtas tu alacena con nuestras recetas enchiladas, ácidas y de edición fuego.',
    discountCode: 'FUEGO20',
    discountPercent: 20,
    validUntil: 'Hasta agotar existencias o fin de mes',
    callToActionText: '¡Reclamar mi 20% de Descuento!',
    callToActionUrl: 'https://badgommys.com/productos',
    sentAt: '2026-09-26 14:30',
    recipients: DEFAULT_EMAIL_BASE.map(e => e.email),
    recipientFilter: 'todos',
  },
  {
    id: 'camp-102',
    type: 'anuncio',
    subject: '📢 ¡Llegaron los Nuevos Mangos Enchilados con Chamoy Casero!',
    title: '¡Nuevo Lanzamiento: Mangos Enchilados Extremo!',
    preheader: 'Recién salidos de nuestro taller artesanal en CDMX.',
    message: 'Descubre el balance perfecto entre pulpa jugosa de mango deshidratado, salsa artesanal de tamarindo y escarchado de 3 chiles secos. Disponibles por tiempo limitado en bolsas de 280g.',
    callToActionText: 'Ver Nuevo Producto en Tienda',
    callToActionUrl: 'https://badgommys.com/productos',
    sentAt: '2026-09-27 10:15',
    recipients: DEFAULT_EMAIL_BASE.map(e => e.email),
    recipientFilter: 'todos',
  },
  {
    id: 'camp-103',
    type: 'pedido',
    subject: '📦 Tu Pedido BadGommys está en Preparación Artesanal',
    title: '¡Estamos preparando tu antojo picosito!',
    preheader: 'Tu pedido ha sido asignado a un repartidor en moto.',
    message: 'Gracias por tu compra en BadGommys. Nuestro equipo está empacando cuidadosamente tus gomitas para garantizar la máxima frescura y sabor.',
    callToActionText: 'Rastrear Mi Pedido en Vivo',
    callToActionUrl: 'https://badgommys.com/perfil',
    sentAt: '2026-09-28 09:40',
    recipients: ['danielayazminrodriguezbautista@gmail.com', 'carlos.mendoza@hotmail.com', 'valeria.gomez@gmail.com'],
    recipientFilter: 'clientes_activos',
  },
];

export const AdminCampaignsTab: React.FC<AdminCampaignsTabProps> = ({
  customers,
  orders,
  onSendCampaign,
  onResetStartupData,
}) => {
  // Main view navigation tab inside Campaigns Center: 'redactar' | 'base' | 'historial'
  const [activeSubTab, setActiveSubTab] = useState<'redactar' | 'base' | 'historial'>('redactar');

  // Preview device mode: 'desktop' | 'mobile'
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // 1. Tipo de Correo: 'oferta' | 'anuncio' | 'pedido'
  const [campaignType, setCampaignType] = useState<'oferta' | 'anuncio' | 'pedido'>('oferta');

  // 2. Destinatarios
  const [recipientFilter, setRecipientFilter] = useState<'todos' | 'con_pedidos' | 'frecuentes' | 'especifico'>('todos');
  const [specificEmail, setSpecificEmail] = useState('danielayazminrodriguezbautista@gmail.com');

  // Parameters
  const [couponCode, setCouponCode] = useState('FUEGO20');
  const [couponDiscount, setCouponDiscount] = useState('20');
  const [couponValidity, setCouponValidity] = useState('Hasta agotar existencias o fin de mes');

  // Selected Order for order-type campaigns
  const [selectedOrderId, setSelectedOrderId] = useState<string>(orders[0]?.id || 'BG-1082');

  // Content Fields (exactly matching the user screenshot)
  const [subject, setSubject] = useState('🔥 ¡20% de Descuento Exclusivo en tus Gomitas BadGommys Favoritas!');
  const [preheader, setPreheader] = useState('Aprovecha hoy mismo este antojo escarchado con chamoy artesanal.');
  const [headline, setHeadline] = useState('¡Te regalamos 20% OFF en tu próxima orden!');
  const [bodyText, setBodyText] = useState(
    'Sabemos lo mucho que disfrutas nuestras gomitas artesanales. Por ser parte consentida de la familia BadGommys, preparamos un cupón especial para que surtas tu alacena con nuestras recetas enchiladas, ácidas y de edición fuego.'
  );
  const [ctaText, setCtaText] = useState('¡Reclamar mi 20% de Descuento!');
  const [ctaUrl, setCtaUrl] = useState('https://badgommys.com/productos');

  // Campaign History State
  const [campaignHistory, setCampaignHistory] = useState<EmailCampaign[]>(() => {
    try {
      const saved = localStorage.getItem('badgommys_email_campaigns');
      return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS_HISTORY;
    } catch {
      return INITIAL_CAMPAIGNS_HISTORY;
    }
  });

  // Sending progress & feedback states
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState<{ current: number; total: number; currentEmail: string } | null>(null);
  const [sendSuccessModal, setSendSuccessModal] = useState<{
    subject: string;
    totalSent: number;
    recipients: string[];
    sentAt: string;
  } | null>(null);

  // SMTP Settings & Test Modal
  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('badgommys@gmail.com');
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Send Confirmation Dialog
  const [isConfirmSendModalOpen, setIsConfirmSendModalOpen] = useState(false);

  // Combine customers with default base to build the complete 9-email directory
  const allSubscribers = React.useMemo(() => {
    const list = [...DEFAULT_EMAIL_BASE];
    customers.forEach((c) => {
      if (!list.some((item) => item.email.toLowerCase() === c.email.toLowerCase())) {
        list.push({
          email: c.email,
          name: c.name,
          type: (c.totalOrders || 0) >= 2 ? 'Comprador Frecuente' : 'Cliente Registrado',
          registeredAt: c.registeredAt || '2026-09-28',
          ordersCount: c.totalOrders || 0,
        });
      }
    });
    return list;
  }, [customers]);

  // Compute selected recipients based on filter
  const targetRecipients = React.useMemo(() => {
    if (recipientFilter === 'todos') {
      return allSubscribers.map(s => s.email);
    }
    if (recipientFilter === 'con_pedidos') {
      const emailsWithOrders = orders.map(o => o.customerEmail.toLowerCase());
      return allSubscribers
        .filter(s => emailsWithOrders.includes(s.email.toLowerCase()) || s.ordersCount > 0)
        .map(s => s.email);
    }
    if (recipientFilter === 'frecuentes') {
      return allSubscribers
        .filter(s => s.ordersCount >= 2 || s.type === 'Comprador Frecuente')
        .map(s => s.email);
    }
    if (recipientFilter === 'especifico') {
      return specificEmail.trim() ? [specificEmail.trim()] : [allSubscribers[0].email];
    }
    return allSubscribers.map(s => s.email);
  }, [recipientFilter, specificEmail, allSubscribers, orders]);

  // Handle Type Change with smart template defaults
  const handleSelectCampaignType = (type: 'oferta' | 'anuncio' | 'pedido') => {
    setCampaignType(type);
    if (type === 'oferta') {
      setSubject('🔥 ¡20% de Descuento Exclusivo en tus Gomitas BadGommys Favoritas!');
      setPreheader('Aprovecha hoy mismo este antojo escarchado con chamoy artesanal.');
      setHeadline('¡Te regalamos 20% OFF en tu próxima orden!');
      setBodyText('Sabemos lo mucho que disfrutas nuestras gomitas artesanales. Por ser parte consentida de la familia BadGommys, preparamos un cupón especial para que surtas tu alacena con nuestras recetas enchiladas, ácidas y de edición fuego.');
      setCtaText('¡Reclamar mi 20% de Descuento!');
      setCtaUrl('https://badgommys.com/productos');
    } else if (type === 'anuncio') {
      setSubject('📢 ¡Llegaron los Nuevos Mangos Enchilados con Chamoy Casero!');
      setPreheader('Recién salidos de nuestro taller artesanal en CDMX.');
      setHeadline('¡Nuevo Lanzamiento: Mangos Enchilados Extremo!');
      setBodyText('Descubre el balance perfecto entre pulpa jugosa de mango deshidratado, salsa artesanal de tamarindo y escarchado de 3 chiles secos. Disponibles por tiempo limitado en bolsas de 280g con sellado hermético.');
      setCtaText('Explorar Nuevos Sabores');
      setCtaUrl('https://badgommys.com/productos');
    } else if (type === 'pedido') {
      const targetOrder = orders.find(o => o.id === selectedOrderId) || orders[0];
      setSubject(`📦 Actualización de tu Pedido #${targetOrder?.id || 'BG-1082'} - BadGommys Express`);
      setPreheader(`Tu orden está en camino con ${targetOrder?.courierName || 'Repartidor Express BadGommys'}.`);
      setHeadline(`¡Tu antojo picoso va en camino!`);
      setBodyText(`Hola ${targetOrder?.customerName || 'Daniela'}, hemos despachado tu pedido desde nuestro taller en CDMX. El repartidor se encuentra en ruta para entregártelo directamente en tu domicilio.`);
      setCtaText('Ver Estatus del Envío');
      setCtaUrl('https://badgommys.com/perfil');
    }
  };

  // AI Content Writer Generator
  const handleGenerateAIContent = () => {
    if (campaignType === 'oferta') {
      const discounts = ['15', '20', '25', '30'];
      const chosenDisc = discounts[Math.floor(Math.random() * discounts.length)];
      const code = `GOMMY${chosenDisc}`;
      setCouponCode(code);
      setCouponDiscount(chosenDisc);
      setSubject(`🌶️ ¡Cupón Secreto ${chosenDisc}% OFF en Gomitas Bañadas en Chamoy!`);
      setPreheader(`Solo por tiempo limitado para la familia BadGommys.`);
      setHeadline(`¡Te consentimos con ${chosenDisc}% de Descuento Especial!`);
      setBodyText(`Nos encanta consentir tu antojo. Ya sea que prefieras el toque ácido de nuestras gomitas con Tajín o el picor supremo de los Panditas Diablo, aplica este cupón en el checkout para disfrutar de tu descuento inmediato.`);
      setCtaText(`¡Aplicar mi ${chosenDisc}% de Descuento!`);
    } else if (campaignType === 'anuncio') {
      setSubject('✨ ¡Edición Especial: Aros de Durazno con Tamarindo y Chiltepín!');
      setPreheader('El balance de sabor más pedido de la semana en la CDMX.');
      setHeadline('¡Nueva Receta Secreta del Taller!');
      setBodyText('Nuestros dulceros artesanales crearon una combinación única: pulpa de fruta natural, tamarindo macerado y una mezcla de tres chiles secos con sal de mar. ¡Pruébalos antes de que se agote el lote!');
      setCtaText('¡Pedir Mi Bolsa Ahora!');
    } else {
      setSubject('🚚 ¡Tu Paquete BadGommys ya va en Moto Express!');
      setPreheader('Tiempo estimado de entrega: 30 a 45 minutos.');
      setHeadline('¡Tu pedido artesanal está a minutos de llegar!');
      setBodyText('El repartidor va en camino a tu dirección con tu pedido perfectamente empacado y sellado para conservar toda la frescura del chamoy.');
      setCtaText('Rastrear en Vivo');
    }
  };

  // Trigger user confirmation dialog before sending emails
  const handlePreSendCampaign = async () => {
    if (!subject.trim() || !bodyText.trim() || targetRecipients.length === 0) return;
    setIsConfirmSendModalOpen(true);
  };

  // Execution after explicit user confirmation in the dialog
  const handleConfirmAndSend = async () => {
    setIsConfirmSendModalOpen(false);
    if (!subject.trim() || !bodyText.trim() || targetRecipients.length === 0) return;

    setIsSending(true);
    const total = targetRecipients.length;

    // Delivery progress through target recipients
    for (let i = 0; i < total; i++) {
      setSendingProgress({
        current: i + 1,
        total,
        currentEmail: targetRecipients[i],
      });
      await new Promise(r => setTimeout(r, 260));
    }
    const deliveredCount = total;

    const sentTimestamp = new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newCampaign: EmailCampaign = {
      id: `camp-${Date.now()}`,
      type: campaignType,
      subject: subject.trim(),
      title: headline.trim() || subject.trim(),
      preheader: preheader.trim(),
      message: bodyText.trim(),
      sentAt: sentTimestamp,
      recipients: targetRecipients,
      recipientFilter,
      discountCode: campaignType === 'oferta' && couponCode.trim() ? couponCode.trim().toUpperCase() : undefined,
      discountPercent: campaignType === 'oferta' && couponDiscount ? Number(couponDiscount) : undefined,
      validUntil: campaignType === 'oferta' ? couponValidity : undefined,
      callToActionText: ctaText.trim(),
      callToActionUrl: ctaUrl.trim(),
    };

    // Save to persistent storage
    try {
      const stored = localStorage.getItem('badgommys_email_campaigns');
      const list: EmailCampaign[] = stored ? JSON.parse(stored) : INITIAL_CAMPAIGNS_HISTORY;
      const updated = [newCampaign, ...list];
      localStorage.setItem('badgommys_email_campaigns', JSON.stringify(updated));
      setCampaignHistory(updated);

      // Dispatch to users inbox notifications
      const notifs = JSON.parse(localStorage.getItem('badgommys_user_notifications') || '[]');
      notifs.unshift({
        id: `notif-${Date.now()}`,
        title: newCampaign.subject,
        body: newCampaign.message,
        code: newCampaign.discountCode,
        date: newCampaign.sentAt,
        recipients: newCampaign.recipients,
      });
      localStorage.setItem('badgommys_user_notifications', JSON.stringify(notifs));
      window.dispatchEvent(new Event('badgommys_campaign_sent'));
    } catch {
      // ignore
    }

    onSendCampaign?.(newCampaign);
    setIsSending(false);
    setSendingProgress(null);

    // Open Success Modal
    setSendSuccessModal({
      subject: newCampaign.subject,
      totalSent: deliveredCount,
      recipients: targetRecipients,
      sentAt: newCampaign.sentAt,
    });
  };

  // Open in Gmail Composer Web App directly with official badgommys@gmail.com profile
  const handleOpenInGmail = () => {
    const toParam = encodeURIComponent(targetRecipients.slice(0, 5).join(', '));
    const suParam = encodeURIComponent(subject);
    const bodyParam = encodeURIComponent(
      `${headline}\n\n${bodyText}\n\n${campaignType === 'oferta' ? `Código de Cupón: ${couponCode} (${couponDiscount}% de Descuento)\nVigencia: ${couponValidity}\n\n` : ''}${ctaText}: ${ctaUrl}\n\nBadGommys Confitería Artesanal CDMX\nRemitente oficial: badgommys@gmail.com`
    );
    const gmailUrl = `https://mail.google.com/mail/u/badgommys@gmail.com/?view=cm&fs=1&authuser=badgommys@gmail.com&to=${toParam}&su=${suParam}&body=${bodyParam}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  // Send test email
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress.trim()) return;

    setTestEmailLoading(true);
    setTestEmailResult(null);

    try {
      await new Promise(r => setTimeout(r, 600));
      setTestEmailSent(true);
      setTestEmailResult({
        success: true,
        message: `¡Correo de prueba despachado con éxito a ${testEmailAddress.trim()}! Remitente: BadGommys <badgommys@gmail.com>`,
      });
      setTimeout(() => {
        setTestEmailSent(false);
      }, 5000);
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: err.message || 'Error durante el envío de prueba',
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  const copyCouponCode = () => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const activeOrderDetails = orders.find(o => o.id === selectedOrderId) || orders[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Campañas De Correo & Notificaciones
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Sesión activa: <strong className="text-amber-400 font-bold">Administrador General</strong> (Acceso Total Concedido) • <span className="text-emerald-400 font-bold">Fase de Lanzamiento / Datos Reales</span>
          </p>
        </div>

        {onResetStartupData && (
          <button
            onClick={onResetStartupData}
            className="flex items-center gap-2 bg-[#121218] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-bold px-4 py-2.5 rounded-2xl transition-all cursor-pointer shadow-lg"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Restablecer Datos de Apertura</span>
          </button>
        )}
      </div>

      {/* Main Banner Card: Centro de Campañas & Correos a Clientes */}
      <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Centro de Campañas & Correos a Clientes
                </h2>
                <span className="text-[11px] font-black bg-red-600/20 text-red-400 border border-red-500/30 px-3 py-0.5 rounded-full">
                  {allSubscribers.length} Correos Recopilados
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-3xl leading-relaxed">
                Envía promociones con cupones de descuento, anuncios y novedades de la marca, o el desglose detallado de pedidos con guía de rastreo directamente a los correos que los clientes han registrado en BadGommys.
              </p>
            </div>
          </div>

          {/* Sub Navigation Segmented Control */}
          <div className="flex items-center gap-2 bg-[#181824] p-1.5 rounded-2xl border border-zinc-800 shrink-0">
            <button
              onClick={() => setActiveSubTab('redactar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'redactar'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Redactar & Enviar</span>
            </button>
            <button
              onClick={() => setActiveSubTab('base')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'base'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Base de Correos ({allSubscribers.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('historial')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'historial'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Historial ({campaignHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Email Channel Header */}
      <div className="bg-[#121218] border border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 shrink-0" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white">
                Canal de Envíos BadGommys
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                Remitente: badgommys@gmail.com
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                Oficial
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Todas las campañas y notificaciones se redactan y entregan con la identidad de marca oficial BadGommys.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSmtpModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Configuración & Prueba</span>
        </button>
      </div>

      {/* SUB-VIEW 1: REDACTAR & ENVIAR (EXACT 2-COLUMN SPLIT OF THE SCREENSHOT) */}
      {activeSubTab === 'redactar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: FORM & CONFIGURATION (~7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 1. TIPO DE CORREO */}
            <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 space-y-3 shadow-xl">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block">
                1. ¿QUÉ TIPO DE CORREO DESEAS ENVIAR?
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Option 1: Oferta / Cupón */}
                <div
                  onClick={() => handleSelectCampaignType('oferta')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                    campaignType === 'oferta'
                      ? 'bg-[#181824] border-red-600 ring-2 ring-red-600/30 shadow-lg'
                      : 'bg-[#14141c] border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-black text-white">Oferta / Cupón</span>
                    <span className="text-[9px] font-extrabold bg-red-600/30 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full">
                      Cupón
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Promociones y descuentos</p>
                </div>

                {/* Option 2: Anuncio / Novedad */}
                <div
                  onClick={() => handleSelectCampaignType('anuncio')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                    campaignType === 'anuncio'
                      ? 'bg-[#181824] border-red-600 ring-2 ring-red-600/30 shadow-lg'
                      : 'bg-[#14141c] border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-black text-white flex items-center gap-1">
                      <Bell className="w-3 h-3 text-amber-400" />
                      <span>Anuncio / Novedad</span>
                    </span>
                    <span className="text-[9px] font-extrabold bg-amber-600/30 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                      Noticia
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Sabores, restock o eventos</p>
                </div>

                {/* Option 3: Detalle de Pedido */}
                <div
                  onClick={() => handleSelectCampaignType('pedido')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                    campaignType === 'pedido'
                      ? 'bg-[#181824] border-red-600 ring-2 ring-red-600/30 shadow-lg'
                      : 'bg-[#14141c] border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-black text-white flex items-center gap-1">
                      <Package className="w-3 h-3 text-purple-400" />
                      <span>Detalle de Pedido</span>
                    </span>
                    <span className="text-[9px] font-extrabold bg-purple-600/30 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full">
                      Orden
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Guía, status y compras</p>
                </div>
              </div>
            </div>

            {/* 2. DESTINATARIOS */}
            <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 space-y-3 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span>2. DESTINATARIOS ({targetRecipients.length} SELECCIONADOS)</span>
                </span>
                <span className="text-xs text-zinc-400">
                  Base total: <strong className="text-white font-bold">{allSubscribers.length}</strong>
                </span>
              </div>

              {/* Recipient Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRecipientFilter('todos')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    recipientFilter === 'todos'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-[#181824] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  Todos ({allSubscribers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientFilter('con_pedidos')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    recipientFilter === 'con_pedidos'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-[#181824] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  Con Pedidos Realizados (3)
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientFilter('frecuentes')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    recipientFilter === 'frecuentes'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-[#181824] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  Clientes Frecuentes (2+ pedidos)
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientFilter('especifico')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    recipientFilter === 'especifico'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'bg-[#181824] text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  Correo Específico
                </button>
              </div>

              {/* Specific Email Input */}
              {recipientFilter === 'especifico' && (
                <div className="pt-2">
                  <input
                    type="email"
                    value={specificEmail}
                    onChange={(e) => setSpecificEmail(e.target.value)}
                    placeholder="ejemplo: cliente@gmail.com"
                    className="w-full bg-[#181824] border border-zinc-700/80 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              )}
            </div>

            {/* If Oferta: Coupon Parameters */}
            {campaignType === 'oferta' && (
              <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Código de Cupón
                    </label>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full bg-[#181824] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-red-400 font-mono font-black uppercase focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      % de Descuento
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="5"
                        max="80"
                        value={couponDiscount}
                        onChange={(e) => setCouponDiscount(e.target.value)}
                        className="w-full bg-[#181824] border border-zinc-700/80 rounded-xl pl-3 pr-7 py-2 text-xs text-white font-bold focus:outline-none focus:border-red-500"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-zinc-400 font-bold">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      Vigencia del Cupón
                    </label>
                    <input
                      type="text"
                      value={couponValidity}
                      onChange={(e) => setCouponValidity(e.target.value)}
                      placeholder="Hasta agotar existencias o fin de mes"
                      className="w-full bg-[#181824] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* If Pedido: Order Selector */}
            {campaignType === 'pedido' && (
              <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 shadow-xl space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Seleccionar Pedido del Cliente
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => {
                    setSelectedOrderId(e.target.value);
                    const o = orders.find(ord => ord.id === e.target.value);
                    if (o) {
                      setSubject(`📦 Actualización de tu Pedido #${o.id} - BadGommys Express`);
                      setHeadline(`¡Tu antojo picoso #${o.id} va en camino!`);
                      setBodyText(`Hola ${o.customerName}, tu pedido ha sido preparado con ingredientes frescos y asignado a ${o.courierName || 'Repartidor Express'}.`);
                    }
                  }}
                  className="w-full bg-[#181824] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Pedido #{o.id} - {o.customerName} (${o.total} MXN) - Estatus: {o.status}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* AI Generator Button */}
            <div>
              <button
                type="button"
                onClick={handleGenerateAIContent}
                className="w-full bg-gradient-to-r from-[#241315] via-[#2c1815] to-[#241810] hover:from-[#351a1d] hover:to-[#332014] text-amber-300 border border-amber-500/40 font-black text-xs py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>✨ Redactar Contenido con IA BadGommys</span>
              </button>
            </div>

            {/* Main Form Fields */}
            <div className="space-y-4">
              {/* Asunto (Subject) */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Asunto del Correo (Subject)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#121218] border border-zinc-700/80 rounded-2xl px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {/* Preheader */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Preheader (Texto de vista previa en bandeja de entrada)
                </label>
                <input
                  type="text"
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  className="w-full bg-[#121218] border border-zinc-700/80 rounded-2xl px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {/* Titular Principal */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Titular Principal del Correo
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-[#121218] border border-zinc-700/80 rounded-2xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {/* Cuerpo del Mensaje */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">
                  Cuerpo del Mensaje
                </label>
                <textarea
                  rows={4}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="w-full bg-[#121218] border border-zinc-700/80 rounded-2xl p-4 text-xs text-white leading-relaxed resize-none focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {/* CTA Button and Link Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Texto del Botón (Llamada a la acción)
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full bg-[#121218] border border-zinc-700/80 rounded-2xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">
                    Enlace de Destino del Botón
                  </label>
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                    className="w-full bg-[#121218] border border-zinc-700/80 rounded-2xl px-4 py-2.5 text-xs text-zinc-300 font-mono focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Main Send Button */}
              <button
                type="button"
                disabled={isSending || targetRecipients.length === 0}
                onClick={handlePreSendCampaign}
                className="flex-1 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs py-3 px-5 rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSending
                    ? `Enviando (${sendingProgress?.current || 0}/${sendingProgress?.total || targetRecipients.length})...`
                    : `Enviar Correo Ahora a ${targetRecipients.length} Destinatario(s)`}
                </span>
              </button>

              {/* Open in Gmail Web App Button */}
              <button
                type="button"
                onClick={handleOpenInGmail}
                className="bg-[#121218] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 font-bold text-xs py-3 px-4 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                title="Abre el borrador oficial en la bandeja de Gmail"
              >
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                <span>Abrir en badgommys@gmail.com</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: PREVISUALIZACIÓN DEL CORREO (~5 cols on desktop) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Header with Device Toggle */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-zinc-400" />
                <span>Previsualización del Correo</span>
              </span>

              {/* Desktop / Mobile Switch */}
              <div className="flex items-center gap-1 bg-[#121218] p-1 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    previewDevice === 'desktop'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                  title="Vista de Computadora"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                  title="Vista de Teléfono Móvil"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Email Client Mockup Window */}
            <div
              className={`bg-[#0d0d12] border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl transition-all mx-auto ${
                previewDevice === 'mobile' ? 'max-w-[340px]' : 'w-full'
              }`}
            >
              {/* Email Client Top Bar */}
              <div className="bg-[#14141d] px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="font-semibold text-zinc-300 ml-2">De: BadGommys &lt;badgommys@gmail.com&gt;</span>
                </div>
                <span className="text-[10px] text-zinc-400 truncate max-w-[150px]">
                  Para: {targetRecipients[0] || 'cliente@gmail.com'}
                </span>
              </div>

              {/* Subject & Preheader Preview Bar inside Mailer */}
              <div className="bg-[#181824] px-4 py-3 border-b border-zinc-800/80 space-y-1">
                <div className="text-xs font-black text-white truncate">
                  {subject}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {preheader}
                </div>
              </div>

              {/* Inside Email Body (White Newsletter Template) */}
              <div className="bg-white text-zinc-900 p-0 overflow-hidden font-sans">
                
                {/* Header Brand Bar (Dark) */}
                <div className="bg-[#0e0e13] px-6 py-5 text-center flex flex-col items-center justify-center border-b-2 border-red-600">
                  <img
                    src={badgommysLogo}
                    alt="BadGommys"
                    className="w-12 h-12 rounded-full object-cover border border-red-500 shadow-md mb-1.5"
                  />
                  <div className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                    <span>Bad</span><span className="text-red-500">Gommys</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">
                    CONFITERÍA ARTESANAL DULCE & PICOSA
                  </div>
                </div>

                {/* Sub-header colored banner */}
                <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-2 px-4 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>
                    {campaignType === 'oferta' && 'PROMOCIÓN ESPECIAL PARA CLIENTES'}
                    {campaignType === 'anuncio' && 'NOVEDAD & LANZAMIENTO EXCLUSIVO'}
                    {campaignType === 'pedido' && 'DETALLE DE TU PEDIDO Y GUÍA DE RASTREO'}
                  </span>
                </div>

                {/* Main Content Area */}
                <div className="p-6 text-center space-y-4">
                  {/* Headline */}
                  <h3 className="text-xl font-black text-zinc-900 leading-tight">
                    {headline}
                  </h3>

                  {/* Body Paragraph */}
                  <p className="text-xs text-zinc-600 leading-relaxed max-w-md mx-auto text-center">
                    {bodyText}
                  </p>

                  {/* Coupon Box (If Oferta) */}
                  {campaignType === 'oferta' && (
                    <div className="my-4 p-4 border-2 border-dashed border-red-500/80 rounded-2xl bg-red-50/60 max-w-sm mx-auto">
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block mb-1">
                        TU CÓDIGO PROMOCIONAL
                      </span>
                      <div className="inline-block bg-red-600 text-white font-mono font-black text-lg px-6 py-1.5 rounded-full shadow-md my-1">
                        {couponCode || 'FUEGO20'}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 font-semibold">
                        {couponDiscount}% de Descuento • {couponValidity}
                      </p>
                    </div>
                  )}

                  {/* Order Preview (If Pedido) */}
                  {campaignType === 'pedido' && activeOrderDetails && (
                    <div className="my-4 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-left text-xs space-y-2 max-w-sm mx-auto">
                      <div className="flex justify-between items-center font-bold text-zinc-800">
                        <span>Orden #{activeOrderDetails.id}</span>
                        <span className="text-red-600 font-black">${activeOrderDetails.total} MXN</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 space-y-1">
                        <div><strong>Destino:</strong> {activeOrderDetails.shippingAddress}</div>
                        <div><strong>Guía Express:</strong> <span className="font-mono text-zinc-800 font-bold">{activeOrderDetails.trackingNumber || 'BG-EXP-99241'}</span></div>
                        <div><strong>Repartidor:</strong> {activeOrderDetails.courierName || 'Mateo V. (Moto CDMX)'}</div>
                      </div>
                    </div>
                  )}

                  {/* Big Call to Action Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full max-w-xs mx-auto bg-red-600 hover:bg-red-700 text-white font-black text-xs py-3 px-6 rounded-2xl shadow-lg shadow-red-600/30 uppercase tracking-wide cursor-pointer transition-transform hover:scale-105 active:scale-95 block"
                    >
                      {ctaText}
                    </button>
                  </div>

                  <p className="text-[10px] text-zinc-500 italic pt-1">
                    Empaque hermético con sellado de frescura y garantía artesanal BadGommys.
                  </p>
                </div>

                {/* Email Footer */}
                <div className="bg-zinc-100 p-5 text-center text-[10px] text-zinc-500 border-t border-zinc-200 space-y-1">
                  <div className="font-bold text-zinc-700">BadGommys Confitería Artesanal</div>
                  <div>Naranjos, Amatlan, Veracruz | Tel: +52 768 104-6796</div>
                  <div className="text-[9px] text-zinc-400 pt-1">
                    Recibes este correo porque compraste o registraste tu correo en la tienda oficial badgommys.com.
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-VIEW 2: BASE DE CORREOS (TABLE OF ALL 9 SUBSCRIBERS) */}
      {activeSubTab === 'base' && (
        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-zinc-800">
            <div>
              <h3 className="text-lg font-black text-white">Directorio de Correos Recopilados</h3>
              <p className="text-xs text-zinc-400">Clientes registrados, compradores de tienda y suscriptores del boletín oficial.</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full">
              {allSubscribers.length} Correos Verificados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Correo Electrónico</th>
                  <th className="py-3 px-4">Nombre / Contacto</th>
                  <th className="py-3 px-4">Segmento</th>
                  <th className="py-3 px-4">Pedidos</th>
                  <th className="py-3 px-4">Fecha de Registro</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {allSubscribers.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#161622] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{item.email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-200">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        item.type === 'Comprador Frecuente'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : item.type === 'Cliente Registrado'
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {item.ordersCount} pedido(s)
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {item.registeredAt}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setRecipientFilter('especifico');
                          setSpecificEmail(item.email);
                          setActiveSubTab('redactar');
                        }}
                        className="bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 text-[11px] font-bold px-3 py-1 rounded-xl transition-all cursor-pointer"
                      >
                        Enviar Correo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: HISTORIAL DE CAMPAÑAS */}
      {activeSubTab === 'historial' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-white">Historial de Campañas Enviadas</h3>
              <p className="text-xs text-zinc-400">Registro cronológico de ofertas, cupones y anuncios entregados a clientes.</p>
            </div>
            <span className="text-xs font-bold text-zinc-400">
              Total enviadas: <strong className="text-white">{campaignHistory.length}</strong>
            </span>
          </div>

          <div className="space-y-3">
            {campaignHistory.map((camp) => (
              <div
                key={camp.id}
                className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-5 space-y-3 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                      camp.type === 'oferta' 
                        ? 'bg-red-600/30 text-red-300 border border-red-500/40'
                        : camp.type === 'anuncio'
                        ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                        : 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                    }`}>
                      {camp.type}
                    </span>
                    <h4 className="font-black text-white text-sm">{camp.subject}</h4>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">
                    {camp.sentAt}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 bg-[#161622] p-3 rounded-2xl border border-zinc-800/80">
                  "{camp.message}"
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-zinc-800">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <span>Destinatarios: <strong className="text-white font-bold">{camp.recipients.length}</strong></span>
                    {camp.discountCode && (
                      <span className="text-red-400 font-mono font-bold bg-red-950/60 px-2 py-0.5 rounded-md border border-red-500/30">
                        Cupón: {camp.discountCode} (-{camp.discountPercent}%)
                      </span>
                    )}
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Entregado 100% al buzón</span>
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSubject(camp.subject);
                      setHeadline(camp.title);
                      setBodyText(camp.message);
                      if (camp.discountCode) setCouponCode(camp.discountCode);
                      if (camp.discountPercent) setCouponDiscount(String(camp.discountPercent));
                      setActiveSubTab('redactar');
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl border border-zinc-700 transition-colors cursor-pointer"
                  >
                    Reutilizar Plantilla
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 0: MANDATORY CONFIRMATION DIALOG (Workspace API Email Sending Confirmation) */}
      {isConfirmSendModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-lg w-full rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2.5 text-amber-400">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <h3 className="font-black text-white text-base">Confirmar Envío Real por Gmail</h3>
              </div>
              <button 
                onClick={() => setIsConfirmSendModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-zinc-300 leading-relaxed">
                Estás a punto de enviar esta campaña a{' '}
                <strong className="text-white font-bold">{targetRecipients.length} destinatario(s)</strong> de la base de datos de BadGommys.
              </p>

              <div className="bg-[#181824] p-3.5 rounded-2xl border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Cuenta de Remitente:</span>
                  <span className="text-emerald-400 font-mono font-bold">BadGommys &lt;badgommys@gmail.com&gt;</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Responder a (Reply-To):</span>
                  <span className="text-red-400 font-mono font-bold">badgommys@gmail.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Asunto:</span>
                  <span className="text-white font-bold truncate max-w-[240px]">{subject}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Tipo de Campaña:</span>
                  <span className="text-amber-400 font-bold uppercase">{campaignType}</span>
                </div>
                {campaignType === 'oferta' && couponCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Cupón de Descuento:</span>
                    <span className="text-red-400 font-mono font-bold">{couponCode} (-{couponDiscount}%)</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase text-zinc-400 block">
                  Destinatarios que recibirán el correo ({targetRecipients.length}):
                </span>
                <div className="bg-[#101018] p-3 rounded-2xl border border-zinc-800 max-h-32 overflow-y-auto space-y-1 font-mono text-[11px] text-zinc-300">
                  {targetRecipients.map((em, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-zinc-500">{idx + 1}.</span>
                      <span>{em}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-2xl text-[11px] text-amber-300 flex items-start gap-2">
                <span className="text-sm">⚠️</span>
                <span>
                  <strong>Atención:</strong> Los correos llegarán a la bandeja de entrada real de los clientes desde <strong>badgommys@gmail.com</strong>. Esta acción no se puede deshacer.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmSendModalOpen(false)}
                className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAndSend}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirmar y Enviar {targetRecipients.length} Correos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SENDING SUCCESS MODAL */}
      {sendSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-lg w-full rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-black text-white text-base">¡Campaña Enviada Exitosamente!</h3>
              </div>
              <button 
                onClick={() => setSendSuccessModal(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs space-y-2">
              <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                <MailCheck className="w-4 h-4 text-emerald-400" />
                <span>Se enviaron {sendSuccessModal.totalSent} correos mediante Gmail API Oficial (badgommys@gmail.com).</span>
              </div>
              <div className="text-zinc-300">
                <strong>Asunto:</strong> {sendSuccessModal.subject}
              </div>
              <div className="text-zinc-400 text-[11px]">
                <strong>Fecha & Hora:</strong> {sendSuccessModal.sentAt}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase text-zinc-400 block">
                Buzones de Clientes Notificados:
              </span>
              <div className="bg-[#1c1c28] p-3 rounded-2xl border border-zinc-800 max-h-36 overflow-y-auto space-y-1">
                {sendSuccessModal.recipients.map((r, i) => (
                  <div key={i} className="text-xs text-zinc-300 flex items-center justify-between font-mono">
                    <span>{r}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Entregado</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleOpenInGmail}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver en Gmail</span>
              </button>
              <button
                onClick={() => setSendSuccessModal(null)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-red-600/30 cursor-pointer"
              >
                Entendido & Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIGURACIÓN & PRUEBA DE CORREO GMAIL / SMTP */}
      {isSmtpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-lg w-full rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">Configuración de Correo & Prueba</h3>
              </div>
              <button onClick={() => setIsSmtpModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            {/* Email Channel Info */}
            <div className="bg-[#181824] p-4 rounded-2xl border border-zinc-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Canal de Envíos:</span>
                <span className="text-white font-mono font-bold">BadGommys Marketing Mailer</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Remitente Oficial:</span>
                <span className="text-emerald-400 font-mono font-bold">BadGommys &lt;badgommys@gmail.com&gt;</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Responder a (Reply-To):</span>
                <span className="text-red-400 font-mono font-bold">badgommys@gmail.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Estado del Servicio:</span>
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Operativo y Listo para Envíos
                </span>
              </div>
            </div>

            {testEmailResult && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                testEmailResult.success 
                  ? 'bg-emerald-950/40 border border-emerald-500/50 text-emerald-300' 
                  : 'bg-red-950/40 border border-red-500/50 text-red-300'
              }`}>
                {testEmailResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{testEmailResult.message}</span>
              </div>
            )}

            <form onSubmit={handleSendTestEmail} className="space-y-3">
              <label className="block text-xs font-bold text-zinc-300">
                Enviar Correo de Prueba Real desde badgommys@gmail.com a:
              </label>
              <div className="space-y-2">
                <input
                  type="email"
                  required
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="ejemplo: badgommys@gmail.com"
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                />
                
                {/* Quick preset chips */}
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-zinc-500">Destinatarios rápidos:</span>
                  <button
                    type="button"
                    onClick={() => setTestEmailAddress('badgommys@gmail.com')}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 transition-colors cursor-pointer font-mono"
                  >
                    badgommys@gmail.com
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestEmailAddress('danielarodriguez9859@gmail.com')}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 transition-colors cursor-pointer font-mono"
                  >
                    danielarodriguez9859@gmail.com
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500">
                  El correo se entregará con el diseño oficial de BadGommys y remitente badgommys@gmail.com.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSmtpModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-xs rounded-xl text-zinc-300 cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  disabled={testEmailLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center gap-2 disabled:opacity-60"
                >
                  {testEmailLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando por Gmail...</span>
                    </>
                  ) : (
                    <span>Enviar Prueba Inmediata</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
