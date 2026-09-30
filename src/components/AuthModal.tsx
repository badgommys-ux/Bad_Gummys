import React, { useState } from 'react';
import { X, ShieldCheck, User as UserIcon, Lock, Mail, Phone, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { ADMIN_CREDENTIALS } from '../data/initialData';
import { badgommysLogo } from '../assets';

interface AuthModalProps {
  isOpen: boolean;
  defaultTab?: 'customer' | 'admin';
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  defaultTab = 'customer',
  onClose,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>(defaultTab);
  const [isRegistering, setIsRegistering] = useState(false);

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Customer form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerError, setCustomerError] = useState('');

  if (!isOpen) return null;

  // Handle Admin Login with strict credentials check
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');

    const trimmedEmail = adminEmail.trim().toLowerCase();
    const trimmedPassword = adminPassword.trim();

    if (
      trimmedEmail === ADMIN_CREDENTIALS.email.toLowerCase() &&
      trimmedPassword === ADMIN_CREDENTIALS.password
    ) {
      // Authorized admin login
      const adminUser: User = {
        id: 'admin-master',
        name: 'Administrador BadGommys',
        email: ADMIN_CREDENTIALS.email,
        role: 'admin',
        registeredAt: '2026-01-01',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      };
      onLoginSuccess(adminUser);
      onClose();
    } else {
      setAdminError('Acceso denegado: Credenciales no autorizadas. Solo el administrador autorizado puede acceder.');
    }
  };

  // Handle Customer Login or Register
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerError('');

    if (isRegistering && !customerName) {
      setCustomerError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!customerEmail || !customerPassword) {
      setCustomerError('Ingresa tu correo y contraseña.');
      return;
    }

    const newUser: User = {
      id: `cust-${Date.now()}`,
      name: isRegistering ? customerName : customerEmail.split('@')[0],
      email: customerEmail,
      phone: customerPhone || '55 1234 5678',
      address: 'Ciudad de México, CDMX',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      registeredAt: new Date().toISOString().split('T')[0],
      totalOrders: 0,
    };

    onLoginSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#14141c] border border-zinc-800 max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-600 bg-black flex items-center justify-center shadow-lg">
            <img src={badgommysLogo} alt="BadGommys Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white font-display">
              Bad<span className="text-red-500">Gommys</span>
            </h3>
            <p className="text-xs text-zinc-400">Portal de Acceso Seguro</p>
          </div>
        </div>

        {/* Tabs: Cliente vs Admin */}
        <div className="grid grid-cols-2 p-1 bg-[#1c1c24] rounded-2xl border border-zinc-800 mb-6">
          <button
            onClick={() => {
              setActiveTab('customer');
              setAdminError('');
            }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'customer'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Soy Cliente</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('admin');
              setCustomerError('');
              setAdminEmail('');
              setAdminPassword('');
              setAdminError('');
            }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Soy Administrador</span>
          </button>
        </div>

        {/* TAB 1: CLIENT FORM */}
        {activeTab === 'customer' && (
          <div>
            <div className="mb-4">
              <h4 className="text-lg font-bold text-white">
                {isRegistering ? 'Crear Cuenta de Cliente' : 'Iniciar Sesión'}
              </h4>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isRegistering
                  ? 'Regístrate para guardar tu historial de compras y rastrear envíos.'
                  : 'Ingresa a tu cuenta para continuar con tus pedidos.'}
              </p>
            </div>

            {customerError && (
              <div className="mb-4 p-3 bg-red-950/60 border border-red-700/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{customerError}</span>
              </div>
            )}

            <form onSubmit={handleCustomerSubmit} className="space-y-3.5">
              {isRegistering && (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ej. Daniela Rodríguez"
                    className="w-full bg-[#1b1b24] border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="tu.correo@ejemplo.com"
                    className="w-full bg-[#1b1b24] border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {isRegistering && (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="55 1234 5678"
                      className="w-full bg-[#1b1b24] border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1b1b24] border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                id="customer-auth-submit-btn"
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer mt-2"
              >
                {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </button>

              {/* Toggle Register/Login */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setCustomerError('');
                  }}
                  className="text-xs text-zinc-400 hover:text-red-400 cursor-pointer font-medium"
                >
                  {isRegistering
                    ? '¿Ya tienes una cuenta? Inicia sesión aquí'
                    : '¿No tienes cuenta todavía? Regístrate aquí'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: STRICT ADMIN ACCESS FORM */}
        {activeTab === 'admin' && (
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                Panel Administrativo Exclusivo
              </div>
              <h4 className="text-lg font-black text-white">Acceso de Administrador</h4>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Este portal está estrictamente restringido. Solo el usuario autorizado con las credenciales maestras puede acceder al panel de control y gestión.
              </p>
            </div>

            {adminError && (
              <div className="mb-4 p-3 bg-red-950/70 border border-red-600 rounded-xl text-xs text-red-200 flex items-start gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                <span>{adminError}</span>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Correo de Administrador *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-[#1b1b24] border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Contraseña de Administrador *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#1b1b24] border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-[11px] text-amber-300/80">
                🔒 Verificación estricta: solo las credenciales del titular otorgarán acceso al Dashboard de control, inventario, reportes y envíos.
              </div>

              <button
                id="admin-auth-submit-btn"
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-amber-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Ingresar al Panel de Administrador</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
