
import React, { useState } from 'react';
import { StoreSettings, DeliveryRange } from '../types';
import { Save, Lock, Store, MapPin, Image, LogOut, Truck, Plus, Trash2, Globe, MessageCircle, Wallet, QrCode, ExternalLink } from 'lucide-react';

interface SettingsProps {
  settings: StoreSettings;
  onSave: (settings: StoreSettings) => void;
  onLogout?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSave, onLogout }) => {
  const [formData, setFormData] = useState<StoreSettings>({
    ...settings,
    integrations: settings.integrations || { ifoodEnabled: false, whatsappEnabled: false },
    driverFeeRanges: settings.driverFeeRanges || []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  // Local state for adding a new range (Client)
  const [newRange, setNewRange] = useState<Partial<DeliveryRange>>({ minKm: 0, maxKm: 0, price: 0 });
  // Local state for adding a new range (Driver)
  const [newDriverRange, setNewDriverRange] = useState<Partial<DeliveryRange>>({ minKm: 0, maxKm: 0, price: 0 });

  const handleSave = () => {
    onSave(formData);
    setSavedMessage('Configurações salvas com sucesso!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  // Helper to open Digital Menu
  const openDigitalMenu = () => {
    // Get current session to find store ID (a bit hacky since settings doesn't have ID, but we rely on the URL params logic)
    // We will use 'demo_store' as fallback or try to grab from localStorage if possible, 
    // but better is to construct the URL relative to current path.
    // Since we are in the StoreApp, we know the storeId is in the parent context, but not passed here directly.
    // However, for testing, we can grab the ID from the localStorage key logic or just use 'demo_store' if testing.
    
    // Attempt to find store ID from localStorage session
    const sessionStr = localStorage.getItem('dm_session');
    let currentStoreId = 'demo_store';
    if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.storeId) currentStoreId = session.storeId;
    }

    const url = `${window.location.origin}${window.location.pathname}?mode=menu&store=${currentStoreId}`;
    window.open(url, '_blank');
  };

  // --- CLIENT FEE LOGIC ---
  const addRange = () => {
    if (newRange.minKm === undefined || newRange.maxKm === undefined || !newRange.price) return;
    
    const range: DeliveryRange = {
        id: Date.now().toString(),
        minKm: Number(newRange.minKm),
        maxKm: Number(newRange.maxKm),
        price: Number(newRange.price)
    };

    const currentRanges = formData.deliveryRanges || [];
    setFormData({ ...formData, deliveryRanges: [...currentRanges, range].sort((a,b) => a.minKm - b.minKm) });
    setNewRange({ minKm: 0, maxKm: 0, price: 0 });
  };

  const removeRange = (id: string) => {
    const currentRanges = formData.deliveryRanges || [];
    setFormData({ ...formData, deliveryRanges: currentRanges.filter(r => r.id !== id) });
  };

  // --- DRIVER FEE LOGIC ---
  const addDriverRange = () => {
    if (newDriverRange.minKm === undefined || newDriverRange.maxKm === undefined || !newDriverRange.price) return;
    
    const range: DeliveryRange = {
        id: Date.now().toString(),
        minKm: Number(newDriverRange.minKm),
        maxKm: Number(newDriverRange.maxKm),
        price: Number(newDriverRange.price)
    };

    const currentRanges = formData.driverFeeRanges || [];
    setFormData({ ...formData, driverFeeRanges: [...currentRanges, range].sort((a,b) => a.minKm - b.minKm) });
    setNewDriverRange({ minKm: 0, maxKm: 0, price: 0 });
  };

  const removeDriverRange = (id: string) => {
    const currentRanges = formData.driverFeeRanges || [];
    setFormData({ ...formData, driverFeeRanges: currentRanges.filter(r => r.id !== id) });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* --- DIGITAL MENU SECTION (NEW) --- */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-xl shadow-lg text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
               <QrCode /> Seu Cardápio Digital
            </h2>
            <p className="text-indigo-100 max-w-md">
              Envie este link para seus clientes. Eles poderão ver seus produtos e fazer pedidos diretamente pelo celular sem precisar baixar nada.
            </p>
          </div>
          <button 
            onClick={openDigitalMenu}
            className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg flex items-center gap-2 transform hover:scale-105"
          >
            <ExternalLink size={20} /> Abrir Cardápio (Simulação)
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Store className="text-indigo-600" /> Configurações da Loja
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Identidade */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Identidade Visual</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Estabelecimento</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL do Logo</label>
              <div className="flex gap-2">
                 <div className="relative flex-1">
                    <Image className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                    <input 
                        type="text" 
                        placeholder="https://..."
                        className="w-full pl-10 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.logoUrl || ''}
                        onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                    />
                 </div>
              </div>
              {formData.logoUrl && (
                  <div className="mt-2 w-16 h-16 rounded-lg border overflow-hidden">
                      <img src={formData.logoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
              )}
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">Localização</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                <textarea 
                    className="w-full pl-10 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Este endereço aparecerá nas comandas impressas.</p>
            </div>
          </div>

          {/* CUSTOMER Delivery Ranges */}
          <div className="space-y-4 md:col-span-2">
             <h3 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                <Truck size={18} /> Taxa de Entrega (Cobrada do Cliente)
            </h3>
            
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex flex-wrap items-end gap-3 mb-4">
                    <div className="flex-1 min-w-[100px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">De (km)</label>
                        <input 
                            type="number" 
                            className="w-full border border-gray-300 rounded-lg p-2" 
                            placeholder="0"
                            value={newRange.minKm}
                            onChange={e => setNewRange({...newRange, minKm: parseFloat(e.target.value)})}
                        />
                    </div>
                    <div className="flex-1 min-w-[100px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Até (km)</label>
                        <input 
                            type="number" 
                            className="w-full border border-gray-300 rounded-lg p-2" 
                            placeholder="2"
                            value={newRange.maxKm}
                            onChange={e => setNewRange({...newRange, maxKm: parseFloat(e.target.value)})}
                        />
                    </div>
                    <div className="flex-1 min-w-[100px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Valor (R$)</label>
                        <input 
                            type="number" 
                            className="w-full border border-gray-300 rounded-lg p-2" 
                            placeholder="5.00"
                            value={newRange.price}
                            onChange={e => setNewRange({...newRange, price: parseFloat(e.target.value)})}
                        />
                    </div>
                    <button 
                        onClick={addRange}
                        className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="space-y-2">
                    {(!formData.deliveryRanges || formData.deliveryRanges.length === 0) && (
                        <p className="text-gray-400 text-sm text-center italic py-2">Nenhuma regra configurada. O frete será R$ 0,00.</p>
                    )}
                    {formData.deliveryRanges?.map(range => (
                        <div key={range.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-gray-700 text-sm">
                                <strong>{range.minKm} km</strong> até <strong>{range.maxKm} km</strong>
                            </span>
                            <div className="flex items-center gap-4">
                                <span className="text-indigo-600 font-bold">R$ {range.price.toFixed(2)}</span>
                                <button onClick={() => removeRange(range.id)} className="text-red-400 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* DRIVER Fee Ranges */}
          <div className="space-y-4 md:col-span-2">
             <h3 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                <Wallet size={18} /> Taxa de Pagamento ao Entregador (Custo Interno)
            </h3>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex flex-wrap items-end gap-3 mb-4">
                    <div className="flex-1 min-w-[100px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">De (km)</label>
                        <input 
                            type="number" 
                            className="w-full border border-gray-300 rounded-lg p-2" 
                            placeholder="0"
                            value={newDriverRange.minKm}
                            onChange={e => setNewDriverRange({...newDriverRange, minKm: parseFloat(e.target.value)})}
                        />
                    </div>
                    <div className="flex-1 min-w-[100px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Até (km)</label>
                        <input 
                            type="number" 
                            className="w-full border border-gray-300 rounded-lg p-2" 
                            placeholder="2"
                            value={newDriverRange.maxKm}
                            onChange={e => setNewDriverRange({...newDriverRange, maxKm: parseFloat(e.target.value)})}
                        />
                    </div>
                    <div className="flex-1 min-w-[100px]">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Pagar (R$)</label>
                        <input 
                            type="number" 
                            className="w-full border border-gray-300 rounded-lg p-2" 
                            placeholder="4.00"
                            value={newDriverRange.price}
                            onChange={e => setNewDriverRange({...newDriverRange, price: parseFloat(e.target.value)})}
                        />
                    </div>
                    <button 
                        onClick={addDriverRange}
                        className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="space-y-2">
                    {(!formData.driverFeeRanges || formData.driverFeeRanges.length === 0) && (
                        <p className="text-gray-400 text-sm text-center italic py-2">Nenhuma regra de pagamento configurada.</p>
                    )}
                    {formData.driverFeeRanges?.map(range => (
                        <div key={range.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <span className="text-gray-700 text-sm">
                                <strong>{range.minKm} km</strong> até <strong>{range.maxKm} km</strong>
                            </span>
                            <div className="flex items-center gap-4">
                                <span className="text-blue-600 font-bold">R$ {range.price.toFixed(2)}</span>
                                <button onClick={() => removeDriverRange(range.id)} className="text-red-400 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                 <p className="text-xs text-blue-800 mt-2">
                   * Este valor é usado apenas para calcular o acerto do motoboy e não aparece para o cliente.
                </p>
            </div>
          </div>

          {/* Integrations */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                <Globe size={18} /> Integrações & Delivery
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${formData.integrations?.ifoodEnabled ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-red-700 flex items-center gap-2">iFood</span>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input 
                                type="checkbox" 
                                name="toggle" 
                                id="ifood-toggle" 
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                style={{ right: formData.integrations?.ifoodEnabled ? '0' : 'auto', left: formData.integrations?.ifoodEnabled ? 'auto' : '0', borderColor: formData.integrations?.ifoodEnabled ? '#ef4444' : '#d1d5db' }}
                                checked={formData.integrations?.ifoodEnabled}
                                onChange={e => setFormData({
                                    ...formData, 
                                    integrations: { ...formData.integrations!, ifoodEnabled: e.target.checked }
                                })}
                            />
                            <label htmlFor="ifood-toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${formData.integrations?.ifoodEnabled ? 'bg-red-500' : 'bg-gray-300'}`}></label>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Sincroniza pedidos automaticamente da plataforma.</p>
                </div>

                <div className={`p-4 rounded-lg border ${formData.integrations?.whatsappEnabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-green-700 flex items-center gap-2"><MessageCircle size={16}/> WhatsApp Bot</span>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input 
                                type="checkbox" 
                                name="toggle-wa" 
                                id="wa-toggle" 
                                className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                style={{ right: formData.integrations?.whatsappEnabled ? '0' : 'auto', left: formData.integrations?.whatsappEnabled ? 'auto' : '0', borderColor: formData.integrations?.whatsappEnabled ? '#22c55e' : '#d1d5db' }}
                                checked={formData.integrations?.whatsappEnabled}
                                onChange={e => setFormData({
                                    ...formData, 
                                    integrations: { ...formData.integrations!, whatsappEnabled: e.target.checked }
                                })}
                            />
                            <label htmlFor="wa-toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${formData.integrations?.whatsappEnabled ? 'bg-green-500' : 'bg-gray-300'}`}></label>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Ativa o bot de auto-atendimento.</p>
                </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                <Lock size={18} /> Segurança e Gerência
            </h3>
            
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-red-800">Senha do Gerente</label>
                    <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-xs text-red-600 hover:underline"
                    >
                        {showPassword ? 'Ocultar' : 'Mostrar'}
                    </button>
                </div>
                <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full border border-red-200 rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none bg-white"
                    value={formData.managerPassword || ''}
                    onChange={e => setFormData({...formData, managerPassword: e.target.value})}
                    placeholder="Defina uma senha para cancelamentos"
                />
                <p className="text-xs text-red-600 mt-2">
                    Esta senha será solicitada para <strong>cancelar pedidos</strong> e realizar ações administrativas sensíveis. Deixe em branco para desativar.
                </p>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t">
          {savedMessage && <span className="text-green-600 font-medium animate-pulse">{savedMessage}</span>}
          {onLogout && (
             <button 
                onClick={onLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-800 px-4 py-3 rounded-xl font-bold hover:bg-red-50 transition mr-auto"
            >
                <LogOut size={20} /> Sair
            </button>
          )}
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            <Save size={20} /> Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};
