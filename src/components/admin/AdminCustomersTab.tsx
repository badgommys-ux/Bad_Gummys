import React, { useState } from 'react';
import { User, Order } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  ShoppingBag, 
  Edit, 
  CheckCircle2, 
  X, 
  Save, 
  DollarSign, 
  Clock, 
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

interface AdminCustomersTabProps {
  customers: User[];
  orders: Order[];
  onUpdateCustomer?: (customer: User) => void;
  onAddCustomer?: (customer: User) => void;
  onSelectCustomerForMessage?: (customer: User) => void;
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({
  customers,
  orders,
  onUpdateCustomer,
  onAddCustomer,
  onSelectCustomerForMessage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState<'todos' | 'VIP' | 'Frecuente' | 'Nuevo'>('todos');
  
  // Drawer / Details modal state
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isEditingInDrawer, setIsEditingInDrawer] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editTag, setEditTag] = useState<'VIP' | 'Frecuente' | 'Nuevo'>('Frecuente');
  const [editNotes, setEditNotes] = useState('');
  const [editLoyaltyPoints, setEditLoyaltyPoints] = useState(0);

  // New Customer Modal
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newTag, setNewTag] = useState<'VIP' | 'Frecuente' | 'Nuevo'>('Nuevo');
  const [newNotes, setNewNotes] = useState('');

  // Open Drawer and populate form
  const handleOpenDetail = (c: User) => {
    setSelectedCustomer(c);
    setIsEditingInDrawer(false);
    setEditName(c.name);
    setEditPhone(c.phone || '');
    setEditAddress(c.address || '');
    setEditTag((c.crmTag as any) || 'Frecuente');
    setEditNotes(c.notes || '');
    setEditLoyaltyPoints(c.loyaltyPoints || 0);
  };

  // Save changes to customer
  const handleSaveCustomerChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const updated: User = {
      ...selectedCustomer,
      name: editName.trim() || selectedCustomer.name,
      phone: editPhone.trim(),
      address: editAddress.trim(),
      crmTag: editTag,
      notes: editNotes.trim(),
      loyaltyPoints: Number(editLoyaltyPoints),
    };
    onUpdateCustomer?.(updated);
    setSelectedCustomer(updated);
    setIsEditingInDrawer(false);
  };

  // Register New Customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newCust: User = {
      id: `cust-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      phone: newPhone.trim() || '55 0000 0000',
      address: newAddress.trim() || 'Ciudad de México, CDMX',
      role: 'customer',
      registeredAt: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
      loyaltyPoints: 50,
      crmTag: newTag,
      notes: newNotes.trim() || 'Cliente dado de alta manualmente en panel administrativo.',
      lastPurchaseDate: 'Sin compras',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };

    onAddCustomer?.(newCust);
    setIsAddingCustomer(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewAddress('');
    setNewNotes('');
  };

  // Filtered customer list
  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phone && c.phone.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term));
    const matchesTag = tagFilter === 'todos' || c.crmTag === tagFilter;
    return matchesSearch && matchesTag;
  });

  // Orders associated with selected customer in drawer
  const customerOrders = selectedCustomer
    ? orders.filter(o => o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase())
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Directorio de Clientes & CRM</span>
            <span className="text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full">
              {customers.length} Registrados
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Gestión completa de relaciones con clientes, compras acumuladas, puntos y notas de atención personalizada.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCustomer(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-[#121218] border border-zinc-800/80 p-4 rounded-3xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, teléfono o dirección en CDMX..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#181824] border border-zinc-700/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['todos', 'VIP', 'Frecuente', 'Nuevo'] as const).map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tagFilter === tag
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-[#181824] text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {tag === 'todos' ? 'Todos los Clientes' : tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161622] text-zinc-400 uppercase tracking-wider font-extrabold border-b border-zinc-800 text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4">Segmento / Tag</th>
                <th className="py-3.5 px-4">Ubicación CDMX</th>
                <th className="py-3.5 px-4">Pedidos & Gasto</th>
                <th className="py-3.5 px-4">Puntos</th>
                <th className="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                  
                  {/* Name and Avatar */}
                  <td className="py-4 px-4 font-bold text-white">
                    <div className="flex items-center gap-3">
                      {c.avatar ? (
                        <img 
                          src={c.avatar} 
                          alt={c.name} 
                          className="w-9 h-9 rounded-full object-cover border border-zinc-700 shadow-sm"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-red-600 to-amber-600 text-white font-black flex items-center justify-center text-sm shadow-md">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="block font-bold text-white text-xs">{c.name}</span>
                        <span className="text-[10px] text-zinc-500 font-normal">Alta: {c.registeredAt}</span>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-4 px-4 text-zinc-300">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-300">
                        <Mail className="w-3 h-3 text-zinc-500" />
                        <span>{c.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                        <Phone className="w-3 h-3 text-zinc-500" />
                        <span>{c.phone || '55 1234 5678'}</span>
                      </div>
                    </div>
                  </td>

                  {/* CRM Tag */}
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      c.crmTag === 'VIP'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                        : c.crmTag === 'Frecuente'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {c.crmTag || 'Frecuente'}
                    </span>
                  </td>

                  {/* Address */}
                  <td className="py-4 px-4 text-zinc-400 truncate max-w-xs text-[11px]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      <span className="truncate">{c.address || 'Ciudad de México, CDMX'}</span>
                    </div>
                  </td>

                  {/* Orders and Spent */}
                  <td className="py-4 px-4">
                    <div>
                      <span className="font-black text-white text-xs block">
                        ${c.totalSpent ? c.totalSpent.toFixed(2) : '0.00'} MXN
                      </span>
                      <span className="text-[10px] font-semibold text-red-400">
                        {c.totalOrders || 0} pedido(s)
                      </span>
                    </div>
                  </td>

                  {/* Loyalty Points */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1 text-purple-400 font-bold">
                      <Award className="w-3.5 h-3.5" />
                      <span>{c.loyaltyPoints || 0} pts</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleOpenDetail(c)}
                      className="inline-flex items-center gap-1.5 bg-zinc-800/80 hover:bg-red-600 text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Perfil CRM</span>
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CUSTOMER CRM DETAIL / EDIT DRAWER */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                {selectedCustomer.avatar ? (
                  <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-12 h-12 rounded-full object-cover border-2 border-red-500 shadow-md" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-amber-600 text-white font-black flex items-center justify-center text-lg shadow-md">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono">{selectedCustomer.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-2 text-xs">
              <a
                href={`https://wa.me/52${(selectedCustomer.phone || '5512345678').replace(/\D/g, '')}?text=${encodeURIComponent(`¡Hola ${selectedCustomer.name}! Te contactamos de BadGommys Oficial.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp Directo</span>
              </a>

              <a
                href={`mailto:${selectedCustomer.email}?subject=BadGommys Oficial - Novedades y Pedidos`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Enviar Correo</span>
              </a>

              <button
                onClick={() => setIsEditingInDrawer(!isEditingInDrawer)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>{isEditingInDrawer ? 'Ver Historial' : 'Editar Datos CRM'}</span>
              </button>
            </div>

            {/* If Editing Form */}
            {isEditingInDrawer ? (
              <form onSubmit={handleSaveCustomerChanges} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">Teléfono de Contacto</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">Segmento / Tag CRM</label>
                    <select
                      value={editTag}
                      onChange={(e) => setEditTag(e.target.value as any)}
                      className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                    >
                      <option value="VIP">⭐ VIP (Alto Valor)</option>
                      <option value="Frecuente">🔥 Frecuente</option>
                      <option value="Nuevo">🌱 Nuevo Registro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">Puntos de Lealtad</label>
                    <input
                      type="number"
                      value={editLoyaltyPoints}
                      onChange={(e) => setEditLoyaltyPoints(Number(e.target.value))}
                      className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-purple-300 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Dirección de Entrega</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Notas de Atención y Preferencias</label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Preferencias de chamoy, horarios de entrega, instrucciones especiales..."
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingInDrawer(false)}
                    className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            ) : (
              /* View History & Summary */
              <div className="space-y-4 text-xs">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-[#181824] rounded-2xl border border-zinc-800 text-center">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Total Invertido</span>
                    <p className="text-base font-black text-emerald-400 mt-0.5">
                      ${selectedCustomer.totalSpent ? selectedCustomer.totalSpent.toFixed(2) : '0.00'} MXN
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Órdenes Realizadas</span>
                    <p className="text-base font-black text-white mt-0.5">
                      {selectedCustomer.totalOrders || 0} pedidos
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Puntos Lealtad</span>
                    <p className="text-base font-black text-purple-400 mt-0.5">
                      {selectedCustomer.loyaltyPoints || 0} pts
                    </p>
                  </div>
                </div>

                {/* Notes card */}
                {selectedCustomer.notes && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-200">
                    <span className="font-bold block text-[11px] text-amber-300 mb-1">Notas del Administrador / CRM:</span>
                    <p className="text-xs leading-relaxed">{selectedCustomer.notes}</p>
                  </div>
                )}

                {/* Order history */}
                <div>
                  <h4 className="font-bold text-white text-xs mb-2">Historial de Pedidos ({customerOrders.length})</h4>
                  {customerOrders.length > 0 ? (
                    <div className="space-y-2">
                      {customerOrders.map(order => (
                        <div key={order.id} className="p-3 bg-[#181824] rounded-xl border border-zinc-800 flex justify-between items-center">
                          <div>
                            <span className="font-mono font-bold text-red-400">#{order.id}</span>
                            <span className="text-zinc-400 ml-2 font-normal">• {order.createdAt}</span>
                            <p className="text-[11px] text-zinc-300 mt-0.5">
                              {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-white block">${order.total} MXN</span>
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 italic p-3 bg-[#181824] rounded-xl text-center">
                      No hay pedidos registrados con esta cuenta todavía.
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL 2: REGISTER NEW CUSTOMER */}
      {isAddingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14141c] border border-zinc-800 max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Registrar Nuevo Cliente</h3>
              <button onClick={() => setIsAddingCustomer(false)} className="text-zinc-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sofia Castillo Mendoza"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="cliente@ejemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Teléfono</label>
                  <input
                    type="text"
                    placeholder="55 1234 5678"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-bold">Segmento Inicial</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value as any)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="Nuevo">🌱 Nuevo</option>
                    <option value="Frecuente">🔥 Frecuente</option>
                    <option value="VIP">⭐ VIP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Dirección en CDMX</label>
                <input
                  type="text"
                  placeholder="Colonia, Alcaldía, Código Postal"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-bold">Notas de Atención</label>
                <textarea
                  rows={2}
                  placeholder="Notas internas de preferencias de gomitas..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCustomer(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Dar de Alta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
