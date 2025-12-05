
import React, { useState, useEffect } from 'react';
import { Product, StoreSettings, Order, OrderItem, PaymentMethod, ProductCategory, OrderStatus, Client } from '../types';
import { ShoppingBag, Minus, Plus, X, ChevronRight, MapPin, CheckCircle, User, ArrowRight } from 'lucide-react';

interface DigitalMenuProps {
  storeId: string;
}

export const DigitalMenu: React.FC<DigitalMenuProps> = ({ storeId }) => {
  // Load data from LocalStorage
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  
  // Session State
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [view, setView] = useState<'REGISTER' | 'MENU' | 'SUCCESS'>('REGISTER');

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [regDistrict, setRegDistrict] = useState('');
  
  // Cart State
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);

  useEffect(() => {
    // 1. Load Store Data
    const loadedProducts = localStorage.getItem(`dm_${storeId}_products`);
    const loadedSettings = localStorage.getItem(`dm_${storeId}_settings`);
    
    if (loadedProducts) setProducts(JSON.parse(loadedProducts));
    if (loadedSettings) setSettings(JSON.parse(loadedSettings));

    // 2. Check for Customer Session
    const savedClient = localStorage.getItem(`dm_customer_session_${storeId}`);
    if (savedClient) {
      setCurrentClient(JSON.parse(savedClient));
      setView('MENU');
    }
  }, [storeId]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone || !regAddress || !regNumber) {
      alert("Por favor, preencha os campos obrigatórios.");
      return;
    }

    const fullAddress = `${regAddress}, ${regNumber} - ${regDistrict}`;

    const newClient: Client = {
      id: `cli_${Date.now()}`,
      name: regName,
      phone: regPhone,
      email: '', // Optional for quick checkout
      address: {
        street: regAddress,
        number: regNumber,
        neighborhood: regDistrict,
        city: '', 
        formatted: fullAddress
      },
      distanceKm: 0, // Could be calculated via API later
      walletBalance: 0
    };

    // 1. Save Session
    localStorage.setItem(`dm_customer_session_${storeId}`, JSON.stringify(newClient));
    setCurrentClient(newClient);

    // 2. Add to Store's Client Database (Simulating Backend)
    const storeClientsStr = localStorage.getItem(`dm_${storeId}_clients`);
    const storeClients: Client[] = storeClientsStr ? JSON.parse(storeClientsStr) : [];
    
    // Check if phone already exists to update or add
    const existingIndex = storeClients.findIndex(c => c.phone === regPhone);
    let updatedClients;
    
    if (existingIndex >= 0) {
       updatedClients = [...storeClients];
       updatedClients[existingIndex] = { ...updatedClients[existingIndex], ...newClient, id: storeClients[existingIndex].id }; // Keep original ID if updating
    } else {
       updatedClients = [...storeClients, newClient];
    }

    localStorage.setItem(`dm_${storeId}_clients`, JSON.stringify(updatedClients));

    // 3. Move to Menu
    setView('MENU');
  };

  const handleLogout = () => {
    localStorage.removeItem(`dm_customer_session_${storeId}`);
    setCurrentClient(null);
    setView('REGISTER');
    setCart([]);
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
      setCart(cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { 
        productId: product.id, 
        productName: product.name, 
        quantity: 1, 
        unitPrice: product.price 
      }]);
    }
    setIsCartOpen(true);
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(i => i.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

  const handleSubmitOrder = () => {
    if (!currentClient) return;

    // Load existing orders to append
    const existingOrdersStr = localStorage.getItem(`dm_${storeId}_orders`);
    const existingOrders: Order[] = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
    
    // Generate sequential ID
    const existingIds = existingOrders.map(o => parseInt(o.id)).filter(n => !isNaN(n));
    const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;

    const newOrder: Order = {
      id: nextId.toString(),
      source: 'DIGITAL_MENU',
      clientId: currentClient.id,
      clientName: currentClient.name,
      clientPhone: currentClient.phone,
      deliveryAddress: currentClient.address.formatted || 'Endereço não informado',
      items: cart,
      subtotal: cartTotal,
      deliveryFee: 5.00, // Fixed for demo
      discount: 0,
      total: cartTotal + 5.00,
      status: OrderStatus.RECEIVED,
      paymentMethod,
      paymentStatus: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem(`dm_${storeId}_orders`, JSON.stringify(updatedOrders));
    
    // Trigger storage event for auto-update in admin panel
    window.dispatchEvent(new Event('storage'));

    setView('SUCCESS');
    setCart([]);
  };

  // --- RENDER VIEWS ---

  if (view === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-green-100 p-6 rounded-full text-green-600 mb-6 animate-in zoom-in">
          <CheckCircle size={64} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pedido Recebido!</h1>
        <p className="text-gray-600 mb-8 max-w-xs">A loja <strong>{settings?.name}</strong> já recebeu seu pedido e começará o preparo.</p>
        <button 
          onClick={() => setView('MENU')}
          className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200"
        >
          Fazer Novo Pedido
        </button>
      </div>
    );
  }

  if (view === 'REGISTER') {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto w-full">
           <div className="text-center mb-10">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
              ) : (
                <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                  <ShoppingBag size={32} />
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-800">Bem-vindo(a) ao<br/>{settings?.name || 'Nosso Cardápio'}</h1>
              <p className="text-gray-500 text-sm mt-2">Cadastre-se rapidinho para fazer seu pedido.</p>
           </div>

           <form onSubmit={handleRegister} className="w-full space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Seu Nome</label>
                <div className="relative">
                   <User className="absolute left-3 top-3 text-gray-400" size={18} />
                   <input 
                      type="text" 
                      required
                      placeholder="Como podemos te chamar?"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                   />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">WhatsApp / Telefone</label>
                <input 
                    type="tel" 
                    required
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                />
              </div>

              <div className="pt-2">
                 <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 flex items-center gap-1"><MapPin size={16}/> Onde vamos entregar?</label>
                 <div className="space-y-3">
                    <input 
                        type="text" 
                        required
                        placeholder="Nome da Rua / Avenida"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={regAddress}
                        onChange={e => setRegAddress(e.target.value)}
                    />
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            required
                            placeholder="Número"
                            className="w-1/3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={regNumber}
                            onChange={e => setRegNumber(e.target.value)}
                        />
                        <input 
                            type="text" 
                            required
                            placeholder="Bairro"
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={regDistrict}
                            onChange={e => setRegDistrict(e.target.value)}
                        />
                    </div>
                 </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 mt-6 flex items-center justify-center gap-2 group"
              >
                Acessar Cardápio <ArrowRight className="group-hover:translate-x-1 transition" />
              </button>
           </form>
        </div>
      </div>
    );
  }

  // --- MENU VIEW (Main Logic) ---

  const filteredProducts = activeCategory === 'Todos' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans max-w-md mx-auto shadow-2xl relative">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <ShoppingBag size={20} />
            </div>
          )}
          <div>
            <h1 className="font-bold text-gray-800 leading-tight">{settings?.name || 'Cardápio Digital'}</h1>
            <p className="text-xs text-gray-500 truncate max-w-[150px]">Olá, {currentClient?.name}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs text-red-500 font-medium hover:underline">
           Sair
        </button>
      </header>

      {/* Categories */}
      <div className="p-4 overflow-x-auto whitespace-nowrap no-scrollbar flex gap-2">
        <button 
          onClick={() => setActiveCategory('Todos')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition ${activeCategory === 'Todos' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
        >
          Todos
        </button>
        {Object.values(ProductCategory).map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${activeCategory === cat ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="px-4 space-y-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3 cursor-pointer hover:border-indigo-200 transition" onClick={() => addToCart(product)}>
             <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
             </div>
             <div className="flex-1 flex flex-col justify-between">
                <div>
                   <h3 className="font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                   <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>
                </div>
                <div className="flex justify-between items-end mt-2">
                   <span className="font-bold text-gray-900">R$ {product.price.toFixed(2)}</span>
                   <button className="bg-gray-100 text-gray-800 p-1.5 rounded-lg">
                      <Plus size={16} />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 p-4 max-w-md mx-auto z-20 animate-in slide-in-from-bottom-4">
           <button 
             onClick={() => setIsCartOpen(true)}
             className="w-full bg-indigo-600 text-white p-4 rounded-xl shadow-xl shadow-indigo-200 flex justify-between items-center font-bold"
           >
             <div className="flex items-center gap-2">
                <div className="bg-indigo-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                   {cart.reduce((acc, i) => acc + i.quantity, 0)}
                </div>
                <span>Ver Carrinho</span>
             </div>
             <span>R$ {cartTotal.toFixed(2)}</span>
           </button>
        </div>
      )}

      {/* Cart Modal / Checkout */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300 max-w-md mx-auto">
           <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg">Seu Pedido</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-white rounded-full text-gray-500"><X size={20}/></button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Items */}
              <div className="space-y-4">
                 {cart.map(item => (
                   <div key={item.productId} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                            <button onClick={() => updateQty(item.productId, -1)} className="p-1"><Minus size={14}/></button>
                            <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQty(item.productId, 1)} className="p-1"><Plus size={14}/></button>
                         </div>
                         <div>
                            <p className="font-medium text-sm text-gray-800">{item.productName}</p>
                            <p className="text-xs text-gray-500">R$ {item.unitPrice.toFixed(2)}</p>
                         </div>
                      </div>
                      <span className="font-bold text-gray-800">R$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
                   </div>
                 ))}
              </div>

              <hr className="border-gray-100" />

              {/* Delivery Info (Read Only or Edit) */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2 text-sm"><MapPin size={16}/> Entregar para:</h3>
                 <p className="font-bold text-gray-700">{currentClient?.name}</p>
                 <p className="text-sm text-gray-500">{currentClient?.address.formatted}</p>
                 <button onClick={handleLogout} className="text-xs text-indigo-600 font-bold mt-2 hover:underline">
                    Trocar Endereço / Cadastro
                 </button>
              </div>

              {/* Payment */}
              <div>
                 <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm"><DollarSignIcon size={16}/> Forma de Pagamento</h3>
                 <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setPaymentMethod(PaymentMethod.PIX)}
                      className={`p-3 rounded-lg border text-sm font-medium transition ${paymentMethod === PaymentMethod.PIX ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200'}`}
                    >
                       Pix
                    </button>
                    <button 
                      onClick={() => setPaymentMethod(PaymentMethod.CARD)}
                      className={`p-3 rounded-lg border text-sm font-medium transition ${paymentMethod === PaymentMethod.CARD ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200'}`}
                    >
                       Cartão
                    </button>
                    <button 
                      onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                      className={`p-3 rounded-lg border text-sm font-medium transition ${paymentMethod === PaymentMethod.CASH ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200'}`}
                    >
                       Dinheiro
                    </button>
                 </div>
              </div>

           </div>

           {/* Footer Checkout */}
           <div className="p-4 border-t bg-white">
              <div className="flex justify-between mb-2 text-sm">
                 <span className="text-gray-500">Subtotal</span>
                 <span>R$ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-4 text-sm">
                 <span className="text-gray-500">Taxa de Entrega</span>
                 <span>R$ 5.00</span>
              </div>
              <div className="flex justify-between mb-6 text-xl font-bold">
                 <span>Total</span>
                 <span>R$ {(cartTotal + 5).toFixed(2)}</span>
              </div>
              
              <button 
                onClick={handleSubmitOrder}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center justify-center gap-2"
              >
                 Confirmar Pedido <ChevronRight />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

// Helper icon
const DollarSignIcon = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
