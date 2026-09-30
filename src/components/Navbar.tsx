import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, LogIn, LogOut, Package, ShieldCheck, Menu, X, ChevronDown, Sparkles, MessageSquare, Mail } from 'lucide-react';
import { PageView, User } from '../types';
import { badgommysLogo } from '../assets';

interface NavbarProps {
  currentPage: PageView;
  onNavigate?: (page: PageView) => void;
  setCurrentPage?: (page: PageView) => void;
  onNavigateToProfileTab?: (tab: 'orders' | 'tracking' | 'messages' | 'emails' | 'settings') => void;
  cartCount: number;
  currentUser: User | null;
  unreadRepliesCount?: number;
  onOpenAuth: (defaultTab?: 'customer' | 'admin') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  setCurrentPage,
  onNavigateToProfileTab,
  cartCount,
  currentUser,
  unreadRepliesCount = 0,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks: { id: PageView; label: string }[] = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'productos', label: 'Productos' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const handleNavClick = (page: PageView) => {
    if (onNavigate) {
      onNavigate(page);
    } else if (setCurrentPage) {
      setCurrentPage(page);
    }
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const handleProfileTabClick = (tab: 'orders' | 'tracking' | 'messages' | 'emails' | 'settings') => {
    if (onNavigateToProfileTab) {
      onNavigateToProfileTab(tab);
    } else {
      handleNavClick('perfil');
    }
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#111115]/95 backdrop-blur-md border-b border-red-950/40 text-white shadow-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <button
            id="nav-brand-btn"
            onClick={() => handleNavClick('inicio')}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-600 shadow-[0_0_15px_rgba(225,29,72,0.4)] group-hover:scale-105 transition-transform bg-black flex items-center justify-center">
              <img
                src={badgommysLogo}
                alt="BadGommys Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-1 font-display">
                Bad<span className="text-red-500">Gommys</span>
              </span>
              <span className="text-[11px] uppercase tracking-widest text-red-400 font-semibold block -mt-1">
                Dulce & Picoso
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-semibold">
            {navLinks.map((link) => (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => handleNavClick(link.id)}
                className={`transition-colors relative py-1 hover:text-red-400 cursor-pointer ${
                  currentPage === link.id
                    ? 'text-red-500 font-bold'
                    : 'text-zinc-300'
                }`}
              >
                {link.label}
                {currentPage === link.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-full" />
                )}
              </button>
            ))}

            {/* Cart Link */}
            <button
              id="nav-link-cart"
              onClick={() => handleNavClick('carrito')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                currentPage === 'carrito'
                  ? 'bg-red-600/20 text-red-400 border border-red-500/40'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-red-500" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="font-semibold">Carrito</span>
            </button>

            {/* Admin link if user is admin */}
            {currentUser?.role === 'admin' && (
              <button
                id="nav-link-admin"
                onClick={() => handleNavClick('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  currentPage === 'admin'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-zinc-800 text-amber-400 hover:bg-zinc-700 border border-amber-500/30'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Panel Admin
              </button>
            )}
          </nav>

          {/* Right Action: Auth button OR User Profile dropdown */}
          <div className="hidden md:flex items-center gap-4">
            {!currentUser ? (
              <button
                id="nav-login-btn"
                onClick={() => onOpenAuth('customer')}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar sesión</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  id="nav-user-dropdown-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/80 px-3.5 py-1.5 rounded-full text-sm font-semibold text-zinc-100 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-red-500 bg-zinc-800 flex items-center justify-center text-red-400">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="max-w-[130px] truncate font-bold text-zinc-200">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>

                {/* Dropdown menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#16161c] border border-zinc-800 rounded-2xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-xs text-zinc-400 uppercase font-semibold">Conectado como</p>
                      <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-950/80 text-red-300 border border-red-700/50">
                        {currentUser.role === 'admin' ? '🛡️ Administrador' : '🍬 Cliente VIP'}
                      </span>
                    </div>

                    <button
                      id="dropdown-orders-btn"
                      onClick={() => handleProfileTabClick('orders')}
                      className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-red-950/40 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-red-400" />
                      <span>Mis Pedidos & Rastreo</span>
                    </button>

                    <button
                      id="dropdown-messages-btn"
                      onClick={() => handleProfileTabClick('messages')}
                      className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-amber-950/30 hover:text-white flex items-center justify-between gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                        <span>Mis Mensajes & Respuestas</span>
                      </div>
                      {unreadRepliesCount > 0 && (
                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse">
                          {unreadRepliesCount}
                        </span>
                      )}
                    </button>

                    <button
                      id="dropdown-emails-btn"
                      onClick={() => handleProfileTabClick('emails')}
                      className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-red-950/40 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <Mail className="w-4 h-4 text-red-400" />
                      <span>Avisos & Ofertas</span>
                    </button>

                    <button
                      id="dropdown-profile-btn"
                      onClick={() => handleProfileTabClick('settings')}
                      className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-red-950/40 hover:text-white flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-zinc-400" />
                      <span>Configuración de Cuenta</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        id="dropdown-admin-btn"
                        onClick={() => handleNavClick('admin')}
                        className="w-full px-4 py-2.5 text-left text-sm text-amber-400 hover:bg-amber-950/30 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Panel de Administración</span>
                      </button>
                    )}

                    <div className="border-t border-zinc-800 my-1" />

                    <button
                      id="dropdown-logout-btn"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-950/50 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button
              id="mobile-cart-btn"
              onClick={() => handleNavClick('carrito')}
              className="relative p-2 text-zinc-300 hover:text-white"
            >
              <ShoppingBag className="w-6 h-6 text-red-500" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#14141a] border-b border-zinc-800 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`block w-full text-left py-2 px-3 rounded-lg text-base font-semibold ${
                currentPage === link.id ? 'bg-red-600/20 text-red-400' : 'text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {link.label}
            </button>
          ))}

          <button
            onClick={() => handleNavClick('carrito')}
            className="flex items-center justify-between w-full py-2 px-3 rounded-lg text-base font-semibold text-zinc-300 hover:bg-zinc-800"
          >
            <span>Carrito de Compras</span>
            <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {cartCount} productos
            </span>
          </button>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => handleNavClick('admin')}
              className="flex items-center gap-2 w-full py-2 px-3 rounded-lg text-base font-bold text-amber-400 bg-amber-950/30 border border-amber-500/30"
            >
              <ShieldCheck className="w-5 h-5" />
              Panel de Control Admin
            </button>
          )}

          <div className="pt-3 border-t border-zinc-800">
            {!currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('customer');
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-red-600/30"
              >
                <LogIn className="w-4 h-4" />
                Iniciar sesión o Registrarse
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-9 h-9 rounded-full bg-red-900 border border-red-500 overflow-hidden flex items-center justify-center">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{currentUser.name}</p>
                    <p className="text-xs text-zinc-400">{currentUser.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleProfileTabClick('orders')}
                  className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-zinc-200 hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Package className="w-4 h-4 text-red-400" />
                  Ver Mis Pedidos & Historial
                </button>

                <button
                  onClick={() => handleProfileTabClick('messages')}
                  className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-zinc-200 hover:bg-zinc-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span>Mis Mensajes & Respuestas</span>
                  </div>
                  {unreadRepliesCount > 0 && (
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {unreadRepliesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleProfileTabClick('emails')}
                  className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-zinc-200 hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 text-red-400" />
                  Avisos & Ofertas al Correo
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-950/40 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
