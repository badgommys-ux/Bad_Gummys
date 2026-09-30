import React, { useState } from 'react';
import { Flame, Instagram, Facebook, MessageCircle, Phone, Mail, MapPin, Heart, ShieldCheck, Truck, Lock, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { badgommysLogo } from '../assets';
import { PageView, EmailSubscriber } from '../types';

const NewsletterSubscribeForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    try {
      const stored = localStorage.getItem('badgommys_newsletter_subscribers');
      const list: EmailSubscriber[] = stored ? JSON.parse(stored) : [];
      if (!list.some(s => s.email.toLowerCase() === email.toLowerCase())) {
        list.push({
          email: email.trim().toLowerCase(),
          subscribedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          source: 'newsletter'
        });
        localStorage.setItem('badgommys_newsletter_subscribers', JSON.stringify(list));
      }
    } catch {
      // ignore
    }

    setPromoCode('BIENVENIDO15');
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <div className="pt-3">
        <div className="inline-flex flex-col sm:flex-row items-center gap-3 p-4 bg-emerald-950/70 border border-emerald-600/60 rounded-2xl text-xs text-white shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">¡Listo! Te suscribiste con éxito ({email}).</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-emerald-500/40">
            <span className="text-zinc-300">Tu cupón de 15% OFF:</span>
            <strong className="font-mono text-emerald-300 font-black tracking-wider">{promoCode}</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="pt-2 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingresa tu correo electrónico..."
          className="w-full bg-[#1e1e28] border border-zinc-700/80 rounded-2xl pl-10 pr-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 shadow-inner"
        />
      </div>
      <button
        type="submit"
        className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Suscribirme</span>
      </button>
    </form>
  );
};

interface FooterProps {
  onNavigate: (page: PageView) => void;
  onOpenTracking?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTracking }) => {
  return (
    <footer className="bg-[#09090c] text-zinc-400 border-t border-red-950/40 relative overflow-hidden">
      {/* Top Banner with Service Guarantees */}
      <div className="border-b border-zinc-800/80 bg-[#0f0f14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Envíos Rápidos & Seguros</p>
                <p className="text-xs text-zinc-400">Entrega en empaque hermético anti-fugas.</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Pago 100% Protegido</p>
                <p className="text-xs text-zinc-400">Tarjetas, transferencia SPEI y OXXO.</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Flame className="w-5 h-5 fill-red-500" />
              </div>
              <div>
                <p className="text-white text-sm font-bold">Sabor Artesanal Insuperable</p>
                <p className="text-xs text-zinc-400">Receta original con chamoy de la casa.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Logo & About */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-red-600 bg-black flex items-center justify-center shadow-[0_0_15px_rgba(225,29,72,0.4)]">
                <img
                  src={badgommysLogo}
                  alt="BadGommys Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight font-display">
                  Bad<span className="text-red-500">Gommys</span>
                </h3>
                <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                  Dulce, picoso y todo lo demás
                </p>
              </div>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              La marca rebelde de confitería artesanal mexicana. Llevamos el antojo a otro nivel con gomitas de primera, salsas chamoy espesas y mezclas de chiles que te harán salivar.
            </p>

            {/* Social Networks requested by user */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3">
                Síguenos en Redes Sociales
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/badgummys_1?igsi=MXZkc28zZ3pkc2Nleg%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-gradient-to-tr hover:from-amber-600 hover:via-pink-600 hover:to-purple-600 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all shadow-md"
                  title="Instagram BadGommys (@badgummys_1)"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://www.tiktok.com/@bad.gommys?_r=1&_t=ZS-9A9Oj6QjhFF"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-black border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all shadow-md group"
                  title="TikTok BadGommys (@bad.gommys)"
                >
                  <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/share/19TbNtWtdS/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-blue-600 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all shadow-md"
                  title="Facebook BadGommys"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://wa.me/525583924512?text=Hola%20BadGommys,%20quiero%20hacer%20un%20pedido!"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-emerald-600 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center transition-all shadow-md"
                  title="WhatsApp Directo"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">
              Navegación Rápida
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('inicio')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('productos')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Catálogo de Productos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contacto')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Contacto & Ubicación
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('carrito')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Carrito de Compras
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('perfil')}
                  className="hover:text-red-400 transition-colors cursor-pointer"
                >
                  Rastrear mi Pedido
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details summary */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider">
              Atención al Cliente
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-red-500 shrink-0" />
                <span>+52 (55) 8392-4512</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                <a href="mailto:badgommys@gmail.com" className="hover:text-white transition-colors">
                  badgommys@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span>Naranjos, Amatlan, Veracruz</span>
              </div>
              <p className="text-xs text-zinc-500 pt-1">
                Lunes a Sábado: 9:00 AM a 9:00 PM | Envíos a todo el país
              </p>
            </div>
          </div>

        </div>

        {/* Newsletter Subscription Banner for Customer Email Capture */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#181216] via-[#14141c] to-[#1a1215] border border-red-900/40 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <span className="bg-red-600/20 text-red-400 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-red-500/30 inline-flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-red-500" />
              Club de Antojos & Ofertas Exclusivas
            </span>

            <h4 className="text-xl sm:text-2xl font-black text-white font-display">
              Recibe Ofertas Especiales, Anuncios y Nuevos Sabores en tu Correo
            </h4>

            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
              Sé el primero en probar nuestras recetas de temporada, ediciones limitadas de chamoy y obtén un cupón de bienvenida en tu bandeja de entrada.
            </p>

            <NewsletterSubscribeForm />
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© 2026 BadGommys. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-400 cursor-pointer">Términos de Servicio</span>
            <span>•</span>
            <span className="hover:text-zinc-400 cursor-pointer">Política de Privacidad</span>
            <span>•</span>
            <span className="text-red-400 font-semibold flex items-center gap-1">
              Hecho con <Flame className="w-3.5 h-3.5 fill-red-500 inline" /> para paladares atrevidos
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
