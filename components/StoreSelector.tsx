
import React, { useState, useEffect } from 'react';
import { StoreAccount, StoreSettings } from '../types';
import { Search, ShoppingBag, ArrowRight, MapPin, Star } from 'lucide-react';

interface StoreSelectorProps {
  onSelectStore: (storeId: string) => void;
  onBackToLogin: () => void;
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({ onSelectStore, onBackToLogin }) => {
  const [stores, setStores] = useState<StoreAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load stores from SaaS accounts
    const accountsStr = localStorage.getItem('dm_accounts');
    if (accountsStr) {
      const accounts: StoreAccount[] = JSON.parse(accountsStr);
      // Only active stores
      setStores(accounts.filter(a => a.isActive));
    } else {
        // Fallback for demo if no accounts exist
        setStores([{ 
            id: 'demo_store', 
            name: 'Loja Demonstração', 
            username: 'demo', 
            password: '', 
            isActive: true, 
            createdAt: new Date().toISOString() 
        }]);
    }
  }, []);

  // Helper to get store specific settings (like logo)
  const getStoreLogo = (storeId: string) => {
      const settingsStr = localStorage.getItem(`dm_${storeId}_settings`);
      if (settingsStr) {
          const settings: StoreSettings = JSON.parse(settingsStr);
          return settings.logoUrl;
      }
      return null;
  };
  
  const getStoreAddress = (storeId: string) => {
      const settingsStr = localStorage.getItem(`dm_${storeId}_settings`);
      if (settingsStr) {
          const settings: StoreSettings = JSON.parse(settingsStr);
          return settings.address;
      }
      return null;
  };

  const filteredStores = stores.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
             <div className="flex items-center gap-2">
                 <div className="bg-indigo-600 p-2 rounded-lg text-white">
                     <ShoppingBag size={20} />
                 </div>
                 <h1 className="font-bold text-gray-800 text-lg">DeliveryMaster</h1>
             </div>
             <button onClick={onBackToLogin} className="text-sm text-indigo-600 font-medium hover:underline">
                 Sou Lojista
             </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md mx-auto w-full p-4">
         <div className="text-center mb-6 mt-4">
            <h2 className="text-2xl font-bold text-gray-800">O que vamos pedir hoje?</h2>
            <p className="text-gray-500 text-sm">Escolha um estabelecimento para ver o cardápio.</p>
         </div>

         {/* Search */}
         <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar restaurante..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         {/* Store List */}
         <div className="space-y-4">
            {filteredStores.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <p>Nenhum estabelecimento encontrado.</p>
                </div>
            ) : (
                filteredStores.map(store => {
                    const logo = getStoreLogo(store.id);
                    const address = getStoreAddress(store.id);

                    return (
                        <button 
                            key={store.id}
                            onClick={() => onSelectStore(store.id)}
                            className="w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition flex items-center gap-4 text-left group"
                        >
                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                                {logo ? (
                                    <img src={logo} alt={store.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ShoppingBag size={24} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800 group-hover:text-indigo-600 transition">{store.name}</h3>
                                {address ? (
                                    <p className="text-xs text-gray-500 line-clamp-1 flex items-center gap-1 mt-1">
                                        <MapPin size={12}/> {address}
                                    </p>
                                ) : (
                                    <p className="text-xs text-green-600 font-medium mt-1">Aberto agora</p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <Star size={8} fill="currentColor" /> 4.8
                                    </span>
                                    <span className="text-[10px] text-gray-400">• Lanches • Bebidas</span>
                                </div>
                            </div>
                            <div className="text-gray-300 group-hover:text-indigo-600">
                                <ArrowRight size={20} />
                            </div>
                        </button>
                    );
                })
            )}
         </div>
      </main>
      
      <footer className="p-6 text-center text-xs text-gray-400">
          Powered by DeliveryMaster
      </footer>
    </div>
  );
};
