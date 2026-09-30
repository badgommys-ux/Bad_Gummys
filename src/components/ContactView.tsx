import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle2, Navigation, Copy, Check, Instagram, Facebook, MessageSquare, ArrowRight } from 'lucide-react';
import { ContactMessage, User } from '../types';

interface ContactViewProps {
  currentUser?: User | null;
  onSendMessage: (message: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) => void;
  onNavigateToMyMessages?: () => void;
  userMessagesCount?: number;
  userRepliesCount?: number;
}

export const ContactView: React.FC<ContactViewProps> = ({ 
  currentUser,
  onSendMessage, 
  onNavigateToMyMessages,
  userMessagesCount = 0,
  userRepliesCount = 0,
}) => {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || currentUser.name,
        email: prev.email || currentUser.email,
        phone: prev.phone || currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  const [submitted, setSubmitted] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    onSendMessage({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject || 'Comentario general sobre BadGommys',
      message: formData.message,
    });

    setSubmitted(true);
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      subject: '',
      message: '',
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 8000);
  };

  const copyToClipboard = (text: string, type: 'phone' | 'email') => {
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch {
      // ignore
    }
    if (type === 'phone') {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="py-14 bg-[#0d0d11] min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-700/40 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
            <MessageCircle className="w-3.5 h-3.5" />
            Atención al Cliente
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-display">
            Ponte en <span className="text-red-500">Contacto</span> con Nosotros
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base mt-3">
            ¿Tienes dudas sobre nuestros productos, pedidos especiales para eventos o deseas dejarnos un comentario? Estamos para escucharte.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Form to submit comment */}
          <div className="lg:col-span-7 bg-[#14141c] rounded-3xl border border-zinc-800 p-6 sm:p-10 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white">Envíanos un Comentario</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Completa este formulario y nuestro equipo administrativo responderá tus inquietudes a la brevedad.
              </p>
            </div>

            {/* Banner to access customer messages if user is logged in */}
            {currentUser && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#181824] to-red-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      ¿Ya enviaste dudas o comentarios antes?
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Tienes {userMessagesCount} mensaje(s) registrado(s){userRepliesCount > 0 ? ` y ${userRepliesCount} respuesta(s) de BadGommys` : ''}.
                    </p>
                  </div>
                </div>
                {onNavigateToMyMessages && (
                  <button
                    type="button"
                    onClick={onNavigateToMyMessages}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-sm"
                  >
                    <span>Ver Mis Mensajes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {submitted && (
              <div className="mb-6 p-5 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in shadow-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-200">¡Comentario recibido con éxito!</p>
                    <p className="text-xs text-emerald-300/80 mt-0.5">
                      Tu mensaje fue registrado en el taller. Nuestro equipo te responderá y podrás consultar la respuesta directamente en tu apartado de mensajes.
                    </p>
                  </div>
                </div>
                {onNavigateToMyMessages && (
                  <button
                    type="button"
                    onClick={onNavigateToMyMessages}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-500/20 shrink-0"
                  >
                    Ver Mis Mensajes
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Tu Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Daniela Rodríguez"
                    className="w-full bg-[#1b1b24] border border-zinc-700/80 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu.correo@ejemplo.com"
                    className="w-full bg-[#1b1b24] border border-zinc-700/80 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-zinc-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="55 1234 5678"
                    className="w-full bg-[#1b1b24] border border-zinc-700/80 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Asunto
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Ej. Consulta sobre pedidos mayoreo"
                    className="w-full bg-[#1b1b24] border border-zinc-700/80 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Mensaje o Comentario *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Escribe aquí tu comentario, sugerencia o consulta sobre nuestros productos..."
                  className="w-full bg-[#1b1b24] border border-zinc-700/80 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-zinc-500 resize-none"
                />
              </div>

              <button
                id="contact-submit-btn"
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Comentario</span>
              </button>
            </form>
          </div>

          {/* Right Column: Contact Info & Location Map */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Contact Cards */}
            <div className="bg-[#14141c] rounded-3xl border border-zinc-800 p-6 space-y-4 shadow-xl">
              <h3 className="text-lg font-black text-white mb-2">Canales de Contacto Directo</h3>

              {/* Phone card */}
              <div className="flex items-center justify-between p-3.5 bg-[#1b1b24] rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-semibold block">Número de Teléfono</span>
                    <span className="text-sm font-bold text-white">+52 (55) 8392-4512</span>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard('+525583924512', 'phone')}
                  className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Copiar teléfono"
                >
                  {copiedPhone ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Email card */}
              <div className="flex items-center justify-between p-3.5 bg-[#1b1b24] rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 font-semibold block">Correo Electrónico</span>
                    <a href="mailto:badgommys@gmail.com" className="text-sm font-bold text-white hover:text-red-400 transition-colors">
                      badgommys@gmail.com
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard('badgommys@gmail.com', 'email')}
                  className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Copiar correo"
                >
                  {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-3 p-3.5 bg-[#1b1b24] rounded-2xl border border-zinc-800">
                <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-zinc-400 font-semibold block">Horario de Atención</span>
                  <span className="text-sm font-bold text-white">Lunes a Sábado: 9:00 AM - 9:00 PM</span>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/525583924512?text=Hola%20BadGommys,%20quiero%20hacer%20un%20pedido!"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Escríbenos directamente por WhatsApp</span>
              </a>

              {/* TikTok CTA */}
              <a
                href="https://www.tiktok.com/@bad.gommys?_r=1&_t=ZS-9A9Oj6QjhFF"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2.5 bg-black hover:bg-zinc-900 border border-zinc-700 text-white py-3 rounded-2xl font-bold text-sm shadow-lg transition-all cursor-pointer group"
              >
                <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                </svg>
                <span>Síguenos en TikTok (@bad.gommys)</span>
              </a>

              {/* Facebook CTA */}
              <a
                href="https://www.facebook.com/share/19TbNtWtdS/?mibextid=wwXIfr"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Facebook className="w-4 h-4" />
                <span>Página Oficial de Facebook</span>
              </a>

              {/* Instagram CTA */}
              <a
                href="https://www.instagram.com/badgummys_1?igsi=MXZkc28zZ3pkc2Nleg%3D%3D&utm_source=qr"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:opacity-90 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-pink-600/20 transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>Visítanos en Instagram (@badgummys_1)</span>
              </a>
            </div>

            {/* Location Map Section */}
            <div className="bg-[#14141c] rounded-3xl border border-zinc-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-black text-white">Ubicación de Nuestros Datos</h3>
                </div>
                <span className="text-xs bg-red-950 text-red-300 font-bold px-2.5 py-1 rounded-full border border-red-800/40">
                  Veracruz Matriz
                </span>
              </div>

              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Naranjos, Amatlan, Veracruz, México.
              </p>

              {/* Interactive Stylized Map Visualizer */}
              <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-zinc-700 bg-neutral-900 group">
                
                {/* SVG Stylized Map Graphics */}
                <svg className="w-full h-full object-cover" viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Map Grid Roads */}
                  <rect width="600" height="300" fill="#111116" />
                  <path d="M0 80 H600 M0 160 H600 M0 240 H600" stroke="#1f1f28" strokeWidth="6" />
                  <path d="M120 0 V300 M260 0 V300 M400 0 V300 M520 0 V300" stroke="#1f1f28" strokeWidth="6" />
                  {/* Diagonal Avenues */}
                  <path d="M0 300 L500 0" stroke="#2d1c24" strokeWidth="12" />
                  <path d="M100 0 L600 250" stroke="#2a222f" strokeWidth="8" />
                  {/* Insurgentes Main Avenue Highlight */}
                  <path d="M0 220 L600 90" stroke="#dc2626" strokeWidth="4" strokeDasharray="6 4" opacity="0.8" />

                  {/* Coverage Pulse Circle */}
                  <circle cx="310" cy="150" r="60" fill="#dc2626" fillOpacity="0.15" />
                  <circle cx="310" cy="150" r="30" fill="#dc2626" fillOpacity="0.25" />
                </svg>

                {/* Central Location Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(220,38,38,0.8)] border-2 border-white animate-bounce">
                      <MapPin className="w-5 h-5 fill-white text-red-600" />
                    </div>
                  </div>
                  <div className="bg-black/90 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/40 text-[11px] font-bold text-white shadow-xl mt-1 whitespace-nowrap">
                    📍 Taller & Boutique BadGommys
                  </div>
                </div>

                {/* Map Action Button Overlay */}
                <div className="absolute bottom-3 right-3">
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-zinc-900/90 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-700 backdrop-blur-md shadow-lg transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-red-400" />
                    <span>Abrir en Google Maps</span>
                  </a>
                </div>

              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
                <span>📍 Entregas locales en Naranjos, Amatlán y envíos exprés a todo México</span>
                <span className="text-emerald-400 font-bold">Cobertura 100%</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
