import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Flame, 
  Sparkles, 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  MapPin, 
  HelpCircle, 
  Bot,
  User as UserIcon,
  Tag,
  Phone
} from 'lucide-react';
import { badgommysLogo } from '../assets';
import { Product, Order, User } from '../types';

interface CustomerChatbotProps {
  currentUser: User | null;
  orders: Order[];
  products: Product[];
  onNavigateToProducts: () => void;
  onNavigateToProfile: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  suggestions?: string[];
  actionLink?: {
    label: string;
    action: () => void;
  };
}

export const CustomerChatbot: React.FC<CustomerChatbotProps> = ({
  currentUser,
  orders,
  products,
  onNavigateToProducts,
  onNavigateToProfile,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `¡Hola ${currentUser ? currentUser.name.split(' ')[0] : 'amigo/a'}! 🍬 Soy **GommyBot**, el asistente virtual de BadGommys. ¿En qué te puedo ayudar hoy?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        '🔥 ¿Cuáles son las más picosas?',
        '🚚 ¿Cuánto tarda el envío?',
        '💳 ¿Cómo pagar con OXXO o SPEI?',
        '🎟️ ¿Hay cupones de descuento?',
        '📦 Rastrear mi pedido',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Process Bot reply with intelligent logic
    setTimeout(() => {
      const q = query.toLowerCase();
      let botResponse = '';
      let suggestions: string[] | undefined = undefined;
      let actionLink: { label: string; action: () => void } | undefined = undefined;

      if (q.includes('picosa') || q.includes('fuego') || q.includes('picante') || q.includes('chile')) {
        botResponse = '¡Nuestras reinas del fuego son el **Mango Enchilado Extremo** (nivel pro con chiltepín) y las **Gomitas Fuego Chamoy & Tajín**! Todas tienen nuestra salsa secreta de ciruela, tamarindo y jamaica natural.';
        suggestions = ['Ver catálogo de gomitas', '¿Tienen opciones dulces o ácidas?'];
        actionLink = {
          label: 'Explorar Catálogo',
          action: () => {
            setIsOpen(false);
            onNavigateToProducts();
          },
        };
      } else if (q.includes('envio') || q.includes('envío') || q.includes('entrega') || q.includes('tiempo') || q.includes('naranjos') || q.includes('amatlan') || q.includes('donde') || q.includes('dónde')) {
        botResponse = '🚚 **Cobertura de Envíos:** Al ser un negocio artesanal local en crecimiento, nuestras entregas a domicilio son exclusivas en **Naranjos, Amatlán, Veracruz y sus alrededores** (Centro, Amatlán, El Trébol, Aviación, Bicentenario, etc.). También puedes recoger tu pedido en nuestra tienda oficial de Naranjos. ¡El envío es **GRATIS en compras mayores a $350 MXN!**';
        suggestions = ['¿Dónde está la tienda física?', 'Ver zonas de entrega en el carrito'];
      } else if (q.includes('oxxo') || q.includes('pago') || q.includes('spei') || q.includes('tarjeta') || q.includes('efectivo')) {
        botResponse = '💳 Aceptamos:\n• **Tarjetas** de crédito y débito Visa, Mastercard y Amex (cifrado 256-bit).\n• **Transferencia SPEI** con CLABE directa de BBVA sin comisiones.\n• **Efectivo en OXXO Pay** con código de barras.\n• **Efectivo Contra Entrega** al repartidor en tu puerta.';
        suggestions = ['¿Cómo comprar?', '¿Tienen cupones?'];
      } else if (q.includes('cupon') || q.includes('cupón') || q.includes('descuento') || q.includes('promocion') || q.includes('código')) {
        botResponse = '🎁 ¡Claro que sí! Usa estos cupones en el carrito de compras:\n• **`BIENVENIDO15`** para 15% de descuento en tu orden.\n• **`GOMMY10`** para 10% de descuento.\n• **`FUEGO20`** para 20% de descuento en pedidos especiales.';
        suggestions = ['Ir al carrito', 'Ver catálogo'];
      } else if (q.includes('pedido') || q.includes('rastrear') || q.includes('guia') || q.includes('orden')) {
        if (!currentUser) {
          botResponse = 'Para rastrear tu pedido en tiempo real necesitas iniciar sesión con tu cuenta. ¡Así podrás ver la ubicación del repartidor y el tiempo estimado!';
          suggestions = ['¿Cómo registrarme?', 'Hablar por WhatsApp'];
        } else {
          const userOrders = orders.filter(
            (o) => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
          );
          if (userOrders.length === 0) {
            botResponse = `Hola ${currentUser.name}, aún no tienes pedidos registrados en tu cuenta. ¡Elige tus gomitas favoritas y haz tu primera orden!`;
            actionLink = {
              label: 'Ver Catálogo',
              action: () => {
                setIsOpen(false);
                onNavigateToProducts();
              },
            };
          } else {
            const latest = userOrders[0];
            botResponse = `Tu último pedido es el **#${latest.id}** (${latest.items.map((i) => i.product.name).join(', ')}).\nEstatus actual: **${latest.status}** con guía **${latest.trackingNumber}** (${latest.estimatedDelivery}).`;
            actionLink = {
              label: 'Ver Rastreador en Tiempo Real',
              action: () => {
                setIsOpen(false);
                onNavigateToProfile();
              },
            };
          }
        }
      } else if (q.includes('tienda') || q.includes('ubicacion') || q.includes('direccion') || q.includes('donde estan') || q.includes('física')) {
        botResponse = '📍 Nuestra sede física oficial está en **Naranjos, Amatlan, Veracruz**. Abrimos de Lunes a Sábado de 9:00 AM a 9:00 PM y realizamos envíos a todo México. ¡Te consentimos con recetas artesanales únicas!';
        suggestions = ['¿Tienen envío a domicilio?', '¿Cuál es su WhatsApp?'];
      } else if (q.includes('redes') || q.includes('tiktok') || q.includes('facebook') || q.includes('instagram')) {
        botResponse = '📱 ¡Síguenos en nuestras redes sociales oficiales!\n• **TikTok**: https://www.tiktok.com/@bad.gommys?_r=1&_t=ZS-9A9Oj6QjhFF\n• **Facebook**: https://www.facebook.com/share/19TbNtWtdS/?mibextid=wwXIfr\n• **Instagram**: https://www.instagram.com/badgummys_1\n• **WhatsApp**: +52 (768) 104-6796';
        suggestions = ['Ver catálogo de productos', '¿Cuál es su dirección?'];
      } else if (q.includes('whatsapp') || q.includes('telefono') || q.includes('humano') || q.includes('contacto')) {
        botResponse = '📱 Puedes escribirle directamente a nuestro equipo humano por WhatsApp al **+52 (768) 104-6796** o a **badgommys@gmail.com**. ¡Estamos atentos para atenderte!';
        suggestions = ['🔥 ¿Cuáles son las más picosas?', '🚚 ¿Cuánto tarda el envío?'];
      } else {
        botResponse = '¡Gracias por tu mensaje! En BadGommys preparamos las mejores gomitas artesanales dulces y con chamoy de México. Puedo ayudarte con recomendaciones de sabores, dudas sobre envíos, pagos o rastreo de tu comanda.';
        suggestions = [
          '🔥 Ver gomitas más picosas',
          '🚚 Tiempos de entrega',
          '💳 Métodos de pago',
          '🎟️ Cupones disponibles',
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions,
          actionLink,
        },
      ]);
    }, 450);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
          title="Abrir Asistente BadGommys"
        >
          <div className="w-7 h-7 rounded-full bg-black/40 border border-white/20 flex items-center justify-center shrink-0">
            <img src={badgommysLogo} alt="Mascota" className="w-5 h-5 rounded-full object-cover" />
          </div>
          <span className="hidden sm:inline font-black text-xs tracking-wide">
            ¿Dudas o Antojo? ¡Pregúntame!
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-1 -right-1" />
        </button>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[380px] h-[520px] max-h-[85vh] bg-[#14141c] border border-red-500/40 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in zoom-in-95 text-white">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-red-950 via-[#1a1215] to-[#161622] p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-500 bg-black flex items-center justify-center shadow-md">
                  <img src={badgommysLogo} alt="GommyBot" className="w-full h-full object-cover" />
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900 absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5 font-display">
                  <span>GommyBot</span>
                  <span className="text-[10px] bg-red-600/30 text-red-300 font-bold px-1.5 py-0.2 rounded-full border border-red-500/30">
                    Asistente 24/7
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">Atención al cliente & recomendaciones</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-red-600 text-white rounded-br-none'
                      : 'bg-[#1e1e2a] text-zinc-200 border border-zinc-700/60 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Action Link button inside bot message */}
                  {msg.actionLink && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-700/50">
                      <button
                        onClick={msg.actionLink.action}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-1.5 px-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{msg.actionLink.label}</span>
                        <Sparkles className="w-3 h-3 text-amber-300" />
                      </button>
                    </div>
                  )}

                  <span className="text-[9px] text-zinc-400 opacity-70 block text-right mt-1">
                    {msg.time}
                  </span>
                </div>

                {/* Quick Suggestion Pills under bot response */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(sug)}
                        className="text-[11px] font-semibold bg-[#181824] hover:bg-red-950/60 text-zinc-300 hover:text-red-300 border border-zinc-700 hover:border-red-500/50 px-2.5 py-1 rounded-full transition-all cursor-pointer text-left"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Shortcuts Bar */}
          <div className="px-3 py-1.5 bg-[#101016] border-t border-zinc-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <button
              onClick={() => handleSendMessage('🔥 ¿Cuáles son las más picosas?')}
              className="text-zinc-400 hover:text-white px-2 py-0.5 rounded-md hover:bg-zinc-800 shrink-0 cursor-pointer"
            >
              🌶️ Picantes
            </button>
            <span className="text-zinc-700">•</span>
            <button
              onClick={() => handleSendMessage('🚚 ¿Dónde realizan entregas y envíos?')}
              className="text-zinc-400 hover:text-white px-2 py-0.5 rounded-md hover:bg-zinc-800 shrink-0 cursor-pointer"
            >
              🚚 Envíos Naranjos
            </button>
            <span className="text-zinc-700">•</span>
            <button
              onClick={() => handleSendMessage('🎟️ ¿Hay cupones de descuento?')}
              className="text-zinc-400 hover:text-white px-2 py-0.5 rounded-md hover:bg-zinc-800 shrink-0 cursor-pointer"
            >
              🎟️ Cupones
            </button>
            <span className="text-zinc-700">•</span>
            <a
              href="https://wa.me/527681046796"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 font-bold px-2 py-0.5 rounded-md hover:bg-emerald-950 shrink-0 cursor-pointer"
            >
              💬 WhatsApp
            </a>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#161620] border-t border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu duda aquí..."
              className="flex-1 bg-[#121218] border border-zinc-700 text-white rounded-2xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-red-500 placeholder-zinc-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
