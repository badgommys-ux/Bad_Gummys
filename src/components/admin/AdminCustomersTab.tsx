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
  ShieldCheck,
  Trash2,
  Calendar,
  Image as ImageIcon,
  Camera,
  Upload,
  PhoneCall,
  FileText,
  Sparkles,
  Gift,
  Building2,
  Home,
  Check
} from 'lucide-react';
import { compressAvatarImage, BADGOMMYS_PRESET_AVATARS } from '../../utils/userStorage';

interface AdminCustomersTabProps {
  customers: User[];
  orders: Order[];
  onUpdateCustomer?: (customer: User) => void;
  onAddCustomer?: (customer: User) => void;
  onDeleteCustomer?: (id: string) => void;
  onSelectCustomerForMessage?: (customer: User) => void;
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({
  customers,
  orders,
  onUpdateCustomer,
  onAddCustomer,
  onDeleteCustomer,
  onSelectCustomerForMessage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState<'todos' | 'VIP' | 'Frecuente' | 'Nuevo' | 'Mayorista'>('todos');
  
  // Drawer / Details modal state
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isEditingInDrawer, setIsEditingInDrawer] = useState(false);
  
  // Comprehensive Edit fields (ALL fields editable)
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSecondaryPhone, setEditSecondaryPhone] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editRfc, setEditRfc] = useState('');
  const [editRequiresInvoice, setEditRequiresInvoice] = useState(false);

  // Address and Logistics fields
  const [editAddress, setEditAddress] = useState('');
  const [editAddressType, setEditAddressType] = useState<'Casa' | 'Oficina' | 'Taller' | 'Otro'>('Casa');
  const [editStreet, setEditStreet] = useState('');
  const [editInteriorNumber, setEditInteriorNumber] = useState('');
  const [editCrossStreets, setEditCrossStreets] = useState('');
  const [editColony, setEditColony] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPostalCode, setEditPostalCode] = useState('');
  const [editReferences, setEditReferences] = useState('');
  const [editPreferredSchedule, setEditPreferredSchedule] = useState('Cualquier horario');
  const [editSpecialInstructions, setEditSpecialInstructions] = useState('');

  // Preferences
  const [editFavoriteSpice, setEditFavoriteSpice] = useState('🌶️🌶️ Clásico Chamoy Especial');
  const [editFavoriteGummy, setEditFavoriteGummy] = useState('Mangos Enchilados Artesanales');
  const [editWantsSamples, setEditWantsSamples] = useState(true);

  // Commercial and CRM fields
  const [editTag, setEditTag] = useState<'VIP' | 'Frecuente' | 'Nuevo' | 'Mayorista'>('Frecuente');
  const [editNotes, setEditNotes] = useState('');
  const [editLoyaltyPoints, setEditLoyaltyPoints] = useState(0);
  const [editTotalOrders, setEditTotalOrders] = useState(0);
  const [editTotalSpent, setEditTotalSpent] = useState(0);
  const [editRegisteredAt, setEditRegisteredAt] = useState('');
  const [editLastPurchaseDate, setEditLastPurchaseDate] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isUploadingCustomerAvatar, setIsUploadingCustomerAvatar] = useState(false);
  const [showAvatarPickerInDrawer, setShowAvatarPickerInDrawer] = useState(false);

  // New Customer Modal States
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newTag, setNewTag] = useState<'VIP' | 'Frecuente' | 'Nuevo' | 'Mayorista'>('Nuevo');
  const [newLoyaltyPoints, setNewLoyaltyPoints] = useState(50);
  const [newTotalOrders, setNewTotalOrders] = useState(0);
  const [newTotalSpent, setNewTotalSpent] = useState(0);

  // Open Drawer and populate form
  const handleOpenDetail = (c: User, startInEdit = false) => {
    setSelectedCustomer(c);
    setIsEditingInDrawer(startInEdit);
    setShowAvatarPickerInDrawer(false);
    setEditName(c.name || '');
    setEditEmail(c.email || '');
    setEditPhone(c.phone || '');
    setEditSecondaryPhone(c.secondaryPhone || '');
    setEditBirthDate(c.birthDate || '');
    setEditRfc(c.rfc || '');
    setEditRequiresInvoice(c.requiresInvoice || false);

    setEditAddress(c.address || '');
    setEditAddressType(c.addressType || 'Casa');
    setEditStreet(c.streetAndNumber || '');
    setEditInteriorNumber(c.interiorNumber || '');
    setEditCrossStreets(c.crossStreets || '');
    setEditColony(c.colony || '');
    setEditCity(c.city || '');
    setEditState(c.state || '');
    setEditPostalCode(c.postalCode || '');
    setEditReferences(c.deliveryReferences || '');
    setEditPreferredSchedule(c.preferredDeliverySchedule || 'Cualquier horario');
    setEditSpecialInstructions(c.specialInstructions || '');

    setEditFavoriteSpice(c.favoriteSpiceLevel || '🌶️🌶️ Clásico Chamoy Especial');
    setEditFavoriteGummy(c.favoriteGummy || 'Mangos Enchilados Artesanales');
    setEditWantsSamples(c.wantsSurpriseSamples !== false);

    setEditTag((c.crmTag as any) || 'Frecuente');
    setEditNotes(c.notes || '');
    setEditLoyaltyPoints(c.loyaltyPoints || 0);
    setEditTotalOrders(c.totalOrders || 0);
    setEditTotalSpent(c.totalSpent || 0);
    setEditRegisteredAt(c.registeredAt || new Date().toISOString().split('T')[0]);
    setEditLastPurchaseDate(c.lastPurchaseDate || 'Sin compras');
    setEditAvatar(c.avatar || '');
  };

  // Upload Avatar for Customer
  const handleCustomerAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCustomerAvatar(true);
    try {
      const base64 = await compressAvatarImage(file, 280, 0.82);
      if (base64) {
        setEditAvatar(base64);
      }
    } catch (err) {
      console.error('Error procesando avatar en CRM:', err);
    } finally {
      setIsUploadingCustomerAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  // Save changes to customer (updates in real-time)
  const handleSaveCustomerChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    // Construct formatted single line address
    const parts = [
      (editStreet.trim() ? editStreet.trim() + (editInteriorNumber.trim() ? ` Int. ${editInteriorNumber.trim()}` : '') : ''),
      editCrossStreets.trim() ? `Entre ${editCrossStreets.trim()}` : '',
      editColony.trim() ? `Col. ${editColony.trim()}` : '',
      editCity.trim(),
      editState.trim(),
      editPostalCode.trim() ? `C.P. ${editPostalCode.trim()}` : '',
    ].filter(Boolean);
    const finalFormattedAddress = parts.length > 0 ? parts.join(', ') : editAddress.trim();

    const updated: User = {
      ...selectedCustomer,
      name: editName.trim() || selectedCustomer.name,
      email: editEmail.trim().toLowerCase() || selectedCustomer.email,
      phone: editPhone.trim(),
      secondaryPhone: editSecondaryPhone.trim(),
      address: finalFormattedAddress || selectedCustomer.address,
      addressType: editAddressType,
      streetAndNumber: editStreet.trim(),
      interiorNumber: editInteriorNumber.trim(),
      crossStreets: editCrossStreets.trim(),
      colony: editColony.trim(),
      city: editCity.trim(),
      state: editState.trim(),
      postalCode: editPostalCode.trim(),
      deliveryReferences: editReferences.trim(),
      preferredDeliverySchedule: editPreferredSchedule,
      specialInstructions: editSpecialInstructions.trim(),
      birthDate: editBirthDate.trim(),
      rfc: editRfc.trim().toUpperCase(),
      requiresInvoice: editRequiresInvoice,
      favoriteSpiceLevel: editFavoriteSpice,
      favoriteGummy: editFavoriteGummy.trim(),
      wantsSurpriseSamples: editWantsSamples,
      crmTag: editTag,
      notes: editNotes.trim(),
      loyaltyPoints: Number(editLoyaltyPoints),
      totalOrders: Number(editTotalOrders),
      totalSpent: Number(editTotalSpent),
      registeredAt: editRegisteredAt.trim(),
      lastPurchaseDate: editLastPurchaseDate.trim(),
      avatar: editAvatar.trim() || selectedCustomer.avatar,
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
      totalOrders: Number(newTotalOrders),
      totalSpent: Number(newTotalSpent),
      loyaltyPoints: Number(newLoyaltyPoints),
      crmTag: newTag,
      notes: newNotes.trim() || 'Cliente dado de alta manualmente en panel administrativo.',
      lastPurchaseDate: newTotalOrders > 0 ? new Date().toISOString().split('T')[0] : 'Sin compras',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };

    onAddCustomer?.(newCust);
    setIsAddingCustomer(false);
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewAddress('');
    setNewNotes('');
    setNewLoyaltyPoints(50);
    setNewTotalOrders(0);
    setNewTotalSpent(0);
  };

  // Delete customer with confirmation
  const handleDeleteCustomerConfirm = (customerId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este cliente del CRM? Esta acción eliminará su registro.')) {
      onDeleteCustomer?.(customerId);
      setSelectedCustomer(null);
      setIsEditingInDrawer(false);
    }
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

  // Metrics for CRM
  const vipCount = customers.filter(c => c.crmTag === 'VIP').length;
  const frequentCount = customers.filter(c => c.crmTag === 'Frecuente').length;
  const newCount = customers.filter(c => c.crmTag === 'Nuevo').length;
  const totalRevenueAll = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header and Add Customer Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
            <Users className="w-4 h-4" />
            <span>Módulo CRM • Gestión de Clientes & Fidelización</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Directorio & Base de Clientes BadGommys
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Edita perfiles, historial de compras, puntos de lealtad, teléfonos y preferencias con sincronización en tiempo real.
          </p>
        </div>

        <button
          onClick={() => setIsAddingCustomer(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Cliente Nuevo</span>
        </button>
      </div>

      {/* 4 CRM Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Clientes CRM</span>
            <div className="text-2xl font-black text-white mt-1">{customers.length}</div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">Base de datos sincronizada</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Clientes VIP</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{vipCount}</div>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">Alto valor & recurrencia</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Frecuentes / Nuevos</span>
            <div className="text-2xl font-black text-sky-400 mt-1">{frequentCount} / {newCount}</div>
            <p className="text-[11px] text-sky-300 font-semibold mt-0.5">Segmentación activa</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#121218] border border-zinc-800/80 rounded-3xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Gasto Acumulado Total</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">${totalRevenueAll.toLocaleString()} MXN</div>
            <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">LTV Global de Clientes</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, teléfono o dirección en CDMX..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121218] border border-zinc-800/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#121218] p-1 rounded-2xl border border-zinc-800/80 self-start sm:self-auto">
          {(['todos', 'VIP', 'Frecuente', 'Nuevo', 'Mayorista'] as const).map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tagFilter === tag
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              {tag === 'todos' ? 'Todos' : tag}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
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
                <th className="py-3.5 px-4 text-right">Acciones CRM</th>
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
                        : c.crmTag === 'Mayorista'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
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

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenDetail(c, true)}
                        className="p-1.5 rounded-xl bg-zinc-800 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 border border-zinc-700/60 transition-all cursor-pointer"
                        title="Editar todos los datos del cliente"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={() => handleOpenDetail(c, false)}
                        className="bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        Ver Perfil
                      </button>

                      <button
                        onClick={() => handleDeleteCustomerConfirm(c.id)}
                        className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-zinc-700/60 transition-all cursor-pointer"
                        title="Eliminar cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER / DETAILS & FULL EDIT MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center sm:justify-end p-4 animate-in fade-in">
          <div className="bg-[#14141c] border-l border-zinc-800 w-full max-w-xl h-full max-h-[96vh] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between overflow-y-auto space-y-6">
            
            {/* Drawer Top Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  {selectedCustomer.avatar ? (
                    <img 
                      src={selectedCustomer.avatar} 
                      alt={selectedCustomer.name} 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-red-500 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 text-white font-black flex items-center justify-center text-lg shadow-md">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedCustomer.name}</h3>
                    <p className="text-xs text-zinc-400 font-mono">{selectedCustomer.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action tabs inside drawer */}
              <div className="flex items-center justify-between gap-2 mt-4">
                <div className="flex items-center gap-2">
                  {onSelectCustomerForMessage && (
                    <button
                      onClick={() => onSelectCustomerForMessage(selectedCustomer)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Mensaje CRM</span>
                    </button>
                  )}

                  <a
                    href={`mailto:${selectedCustomer.email}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                </div>

                <button
                  onClick={() => setIsEditingInDrawer(!isEditingInDrawer)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer border border-zinc-700"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>{isEditingInDrawer ? 'Ver Historial' : '✏️ Editar Todo'}</span>
                </button>
              </div>
            </div>

            {/* If Editing Form: EDIT EVERYTHING */}
            {isEditingInDrawer ? (
              <form onSubmit={handleSaveCustomerChanges} className="space-y-5 text-xs">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Modo Edición Total CRM: Actualiza datos de contacto, dirección completa, facturación y preferencias.</span>
                </div>

                {/* 1. Información Personal & Contacto */}
                <div className="p-4 bg-[#181824] rounded-2xl border border-zinc-800 space-y-3">
                  <span className="text-[11px] uppercase font-black text-red-400 tracking-wider block">
                    1. Información Personal & Contacto
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold focus:border-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Correo Electrónico (Email) *</label>
                      <input
                        type="email"
                        required
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-medium focus:border-red-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Teléfono Principal / WhatsApp *</label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Ej. 55 1234 5678"
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white focus:border-red-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Teléfono Secundario / Respaldo</label>
                      <input
                        type="text"
                        value={editSecondaryPhone}
                        onChange={(e) => setEditSecondaryPhone(e.target.value)}
                        placeholder="Ej. 55 9876 5432"
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white focus:border-red-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Cumpleaños 🎂</label>
                      <input
                        type="date"
                        value={editBirthDate}
                        onChange={(e) => setEditBirthDate(e.target.value)}
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">RFC / Facturación</label>
                      <input
                        type="text"
                        value={editRfc}
                        onChange={(e) => setEditRfc(e.target.value.toUpperCase())}
                        placeholder="XAXX010101000"
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2 text-white font-mono uppercase outline-none"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input
                          type="checkbox"
                          checked={editRequiresInvoice}
                          onChange={(e) => setEditRequiresInvoice(e.target.checked)}
                          className="rounded text-red-600 focus:ring-red-500 bg-zinc-900 border-zinc-700"
                        />
                        <span className="text-[11px] font-bold">Requiere Factura CFDI</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 2. Dirección Habitual de Entrega & Logística */}
                <div className="p-4 bg-[#181824] rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-black text-sky-400 tracking-wider">
                      2. Dirección Habitual & Logística de Entrega
                    </span>
                    <div className="flex items-center gap-1">
                      {(['Casa', 'Oficina', 'Taller', 'Otro'] as const).map((type) => (
                        <button
                          type="button"
                          key={type}
                          onClick={() => setEditAddressType(type)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            editAddressType === type
                              ? 'bg-sky-500 text-white'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {type === 'Casa' ? '🏠 Casa' : type === 'Oficina' ? '🏢 Oficina' : type === 'Taller' ? '🏬 Negocio' : '📍 Otro'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-zinc-400 mb-1 font-bold">Calle y Número Exterior *</label>
                      <input
                        type="text"
                        value={editStreet}
                        onChange={(e) => setEditStreet(e.target.value)}
                        placeholder="Ej. Av. Hidalgo #123"
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">No. Interior / Depto</label>
                      <input
                        type="text"
                        value={editInteriorNumber}
                        onChange={(e) => setEditInteriorNumber(e.target.value)}
                        placeholder="Ej. Depto 4B"
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Entre qué Calles (Cruces)</label>
                      <input
                        type="text"
                        value={editCrossStreets}
                        onChange={(e) => setEditCrossStreets(e.target.value)}
                        placeholder="Ej. Entre Morelos y Juárez"
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Colonia / Barrio *</label>
                      <input
                        type="text"
                        value={editColony}
                        onChange={(e) => setEditColony(e.target.value)}
                        placeholder="Ej. Col. Centro"
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Municipio / Ciudad *</label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        placeholder="Ej. Naranjos Amatlán / CDMX"
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Estado *</label>
                      <input
                        type="text"
                        value={editState}
                        onChange={(e) => setEditState(e.target.value)}
                        placeholder="Ej. Veracruz / CDMX"
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Código Postal (C.P.)</label>
                      <input
                        type="text"
                        value={editPostalCode}
                        onChange={(e) => setEditPostalCode(e.target.value)}
                        placeholder="Ej. 92300"
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">Horario Preferido de Entrega</label>
                    <select
                      value={editPreferredSchedule}
                      onChange={(e) => setEditPreferredSchedule(e.target.value)}
                      className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white outline-none"
                    >
                      <option value="Cualquier horario">☀️ Cualquier horario</option>
                      <option value="Mañana (9:00 - 14:00)">🌅 Mañana (9:00 - 14:00)</option>
                      <option value="Tarde (14:00 - 19:00)">🌇 Tarde (14:00 - 19:00)</option>
                      <option value="Noche (19:00 - 22:00)">🌙 Noche (19:00 - 22:00)</option>
                      <option value="Fines de semana">📅 Fines de semana</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">Referencias para el Repartidor</label>
                    <textarea
                      rows={2}
                      value={editReferences}
                      onChange={(e) => setEditReferences(e.target.value)}
                      placeholder="Color de fachada, timbre, portón..."
                      className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white resize-none outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">Instrucciones Especiales Permanentes</label>
                    <input
                      type="text"
                      value={editSpecialInstructions}
                      onChange={(e) => setEditSpecialInstructions(e.target.value)}
                      placeholder="Ej. Dejar en caseta, llamar 5 min antes..."
                      className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2 text-white outline-none"
                    />
                  </div>
                </div>

                {/* 3. Preferencias del Cliente */}
                <div className="p-4 bg-[#181824] rounded-2xl border border-zinc-800 space-y-3">
                  <span className="text-[11px] uppercase font-black text-amber-400 tracking-wider block">
                    3. Preferencias de Gomitas & Degustación
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Nivel de Picante Favorito</label>
                      <select
                        value={editFavoriteSpice}
                        onChange={(e) => setEditFavoriteSpice(e.target.value)}
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2 text-white outline-none"
                      >
                        <option value="🌶️ Suave Dulce Chamoy">🌶️ Suave Dulce Chamoy</option>
                        <option value="🌶️🌶️ Clásico Chamoy Especial">🌶️🌶️ Clásico Chamoy Especial</option>
                        <option value="🌶️🌶️🌶️ Bravo Picoso Piquín">🌶️🌶️🌶️ Bravo Picoso Piquín</option>
                        <option value="🔥🔥🔥 Fuego Extremo Habanero">🔥🔥🔥 Fuego Extremo Habanero</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Gomitas Favoritas</label>
                      <input
                        type="text"
                        value={editFavoriteGummy}
                        onChange={(e) => setEditFavoriteGummy(e.target.value)}
                        placeholder="Ej. Mango Enchilado, Ositos Picositos..."
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                    <input
                      type="checkbox"
                      checked={editWantsSamples}
                      onChange={(e) => setEditWantsSamples(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500 bg-zinc-900 border-zinc-700"
                    />
                    <span className="text-[11px] font-bold">Enviar muestras gratis sorpresa en compras</span>
                  </label>
                </div>

                {/* 4. Métricas Comerciales & Segmentación */}
                <div className="p-4 bg-[#181824] rounded-2xl border border-zinc-800 space-y-3">
                  <span className="text-[11px] uppercase font-black text-purple-400 tracking-wider block">
                    4. Segmentación & Historial Comercial
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold text-[10px] uppercase">Gasto Total ($ MXN)</label>
                      <input
                        type="number"
                        step="any"
                        value={editTotalSpent}
                        onChange={(e) => setEditTotalSpent(Number(e.target.value))}
                        className="w-full bg-[#121218] border border-zinc-700 rounded-xl p-2 text-emerald-400 font-black font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold text-[10px] uppercase">Órdenes Realizadas</label>
                      <input
                        type="number"
                        value={editTotalOrders}
                        onChange={(e) => setEditTotalOrders(Number(e.target.value))}
                        className="w-full bg-[#121218] border border-zinc-700 rounded-xl p-2 text-white font-black"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold text-[10px] uppercase">Puntos Lealtad</label>
                      <input
                        type="number"
                        value={editLoyaltyPoints}
                        onChange={(e) => setEditLoyaltyPoints(Number(e.target.value))}
                        className="w-full bg-[#121218] border border-zinc-700 rounded-xl p-2 text-purple-400 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Segmento / Tag CRM</label>
                      <select
                        value={editTag}
                        onChange={(e) => setEditTag(e.target.value as any)}
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold focus:border-red-500 outline-none"
                      >
                        <option value="VIP">⭐ VIP (Alto Valor)</option>
                        <option value="Frecuente">🔥 Frecuente</option>
                        <option value="Nuevo">🌱 Nuevo Registro</option>
                        <option value="Mayorista">📦 Mayorista / B2B</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1 font-bold">Fecha de Registro</label>
                      <input
                        type="text"
                        value={editRegisteredAt}
                        onChange={(e) => setEditRegisteredAt(e.target.value)}
                        placeholder="YYYY-MM-DD"
                        className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-zinc-300 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 mb-1 font-bold">Notas de Atención y Preferencias CRM</label>
                    <textarea
                      rows={2}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Preferencias de chamoy, horarios de entrega, instrucciones especiales..."
                      className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white resize-none"
                    />
                  </div>
                </div>

                {/* 5. Foto de Perfil del Cliente */}
                <div className="p-4 bg-[#181824] rounded-2xl border border-zinc-800 space-y-3">
                  <span className="text-[11px] uppercase font-black text-zinc-300 tracking-wider block">
                    5. Foto de Perfil / Avatar
                  </span>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-red-500 bg-zinc-900 shrink-0 flex items-center justify-center">
                      {editAvatar ? (
                        <img src={editAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-black text-white">{editName.charAt(0) || 'C'}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <label 
                          htmlFor="crm-customer-avatar-upload"
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir Foto de Archivo</span>
                        </label>
                        <input
                          id="crm-customer-avatar-upload"
                          type="file"
                          onChange={handleCustomerAvatarUpload}
                          accept="image/*"
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() => setShowAvatarPickerInDrawer(!showAvatarPickerInDrawer)}
                          className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs px-3 py-2 rounded-xl cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                          <span>{showAvatarPickerInDrawer ? 'Ocultar Avatares' : 'Elegir Avatar BadGommys'}</span>
                        </button>

                        {editAvatar && (
                          <button
                            type="button"
                            onClick={() => setEditAvatar('')}
                            className="bg-zinc-800 text-zinc-400 hover:text-rose-400 text-xs px-3 py-2 rounded-xl cursor-pointer"
                          >
                            Quitar Foto
                          </button>
                        )}
                      </div>

                      {isUploadingCustomerAvatar && (
                        <p className="text-[11px] text-amber-400 animate-pulse font-bold">
                          ⏳ Procesando imagen...
                        </p>
                      )}
                    </div>
                  </div>

                  {showAvatarPickerInDrawer && (
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800">
                      {BADGOMMYS_PRESET_AVATARS.map((preset) => (
                        <button
                          type="button"
                          key={preset.id}
                          onClick={() => {
                            setEditAvatar(preset.url);
                            setShowAvatarPickerInDrawer(false);
                          }}
                          className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-center flex flex-col items-center gap-1 cursor-pointer"
                        >
                          <img src={preset.url} alt={preset.name} className="w-8 h-8 rounded-lg object-cover" />
                          <span className="text-[9px] text-zinc-300 truncate w-full">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block text-zinc-400 mb-1 text-[10px] font-bold">O ingresar URL directa de imagen:</label>
                    <input
                      type="url"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#121218] border border-zinc-700 rounded-xl p-2 text-zinc-300 font-mono text-[11px] outline-none"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomerConfirm(selectedCustomer.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-900 border border-rose-800/40 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Cliente</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingInDrawer(false)}
                      className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl cursor-pointer hover:bg-zinc-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 cursor-pointer shadow-red-600/30"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Cambios CRM</span>
                    </button>
                  </div>
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

                {/* Contact Card */}
                <div className="p-4 bg-[#181824] rounded-2xl border border-zinc-800 space-y-2">
                  <span className="text-[10px] font-black uppercase text-red-400 tracking-wider block mb-1">
                    Contacto & Facturación
                  </span>
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="text-zinc-500">Teléfono Principal:</span>
                    <strong className="text-white">{selectedCustomer.phone || 'No registrado'}</strong>
                  </div>
                  {selectedCustomer.secondaryPhone && (
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Teléfono Respaldo:</span>
                      <strong className="text-zinc-200">{selectedCustomer.secondaryPhone}</strong>
                    </div>
                  )}
                  {selectedCustomer.birthDate && (
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Cumpleaños:</span>
                      <span className="text-amber-400 font-bold">🎂 {selectedCustomer.birthDate}</span>
                    </div>
                  )}
                  {selectedCustomer.rfc && (
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">RFC:</span>
                      <span className="text-white font-mono font-bold">{selectedCustomer.rfc}</span>
                    </div>
                  )}
                  {selectedCustomer.requiresInvoice && (
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="text-zinc-500">Factura Electrónica:</span>
                      <span className="text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded-full border border-sky-800 text-[10px]">
                        ✓ CFDI Solicitado
                      </span>
                    </div>
                  )}
                </div>

                {/* Address Card */}
                <div className="p-4 bg-[#181824] rounded-2xl border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">
                      Dirección Habitual de Entrega
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
                      {selectedCustomer.addressType || 'Casa'}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-white leading-relaxed">
                    {selectedCustomer.address || 'Sin dirección registrada'}
                  </p>

                  {selectedCustomer.deliveryReferences && (
                    <p className="text-xs text-amber-300/90 pt-1 border-t border-zinc-800">
                      <strong className="text-zinc-400 text-[10px] uppercase block">Referencias de Entrega:</strong>
                      {selectedCustomer.deliveryReferences}
                    </p>
                  )}

                  {selectedCustomer.preferredDeliverySchedule && (
                    <p className="text-[11px] text-zinc-300 flex items-center gap-1.5 pt-1">
                      <Clock className="w-3 h-3 text-sky-400 shrink-0" />
                      <span>Horario preferido: <strong className="text-white">{selectedCustomer.preferredDeliverySchedule}</strong></span>
                    </p>
                  )}

                  {selectedCustomer.specialInstructions && (
                    <p className="text-[11px] text-zinc-400">
                      <strong>Instrucciones fijas:</strong> {selectedCustomer.specialInstructions}
                    </p>
                  )}
                </div>

                {/* Preferences Card */}
                {(selectedCustomer.favoriteSpiceLevel || selectedCustomer.favoriteGummy || selectedCustomer.wantsSurpriseSamples !== undefined) && (
                  <div className="p-4 bg-[#181824] rounded-2xl border border-zinc-800 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block mb-1">
                      Preferencias de Gomitas
                    </span>
                    {selectedCustomer.favoriteSpiceLevel && (
                      <p className="text-xs text-zinc-300">
                        Picante preferido: <strong className="text-white">{selectedCustomer.favoriteSpiceLevel}</strong>
                      </p>
                    )}
                    {selectedCustomer.favoriteGummy && (
                      <p className="text-xs text-zinc-300">
                        Gomita preferida: <strong className="text-white">{selectedCustomer.favoriteGummy}</strong>
                      </p>
                    )}
                    {selectedCustomer.wantsSurpriseSamples && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-800 font-bold mt-1">
                        🎁 Recibe muestras gratis sorpresa
                      </span>
                    )}
                  </div>
                )}

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

      {/* MODAL: REGISTRAR NUEVO CLIENTE */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#14141c] border border-red-500/40 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Nuevo Cliente en CRM</h3>
                  <p className="text-xs text-zinc-400">Registra un nuevo contacto en la base de datos.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingCustomer(false)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Sofía Hernández"
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-medium focus:border-red-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="sofia@ejemplo.com"
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-medium focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="55 1234 5678"
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-medium focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Segmento / Tag CRM</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value as any)}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-bold focus:border-red-500 outline-none"
                  >
                    <option value="Nuevo">🌱 Nuevo Registro</option>
                    <option value="Frecuente">🔥 Frecuente</option>
                    <option value="VIP">⭐ VIP (Alto Valor)</option>
                    <option value="Mayorista">📦 Mayorista / B2B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 font-bold mb-1">Puntos de Bienvenida</label>
                  <input
                    type="number"
                    value={newLoyaltyPoints}
                    onChange={(e) => setNewLoyaltyPoints(Number(e.target.value))}
                    className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-purple-400 font-bold focus:border-red-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Dirección de Entrega</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Calle, Número, Colonia, Alcaldía..."
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white font-medium focus:border-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1">Notas de Atención</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Notas de gusto por chamoy o entrega..."
                  className="w-full bg-[#1c1c28] border border-zinc-700 rounded-xl p-2.5 text-white resize-none focus:border-red-500 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddingCustomer(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Cliente</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
