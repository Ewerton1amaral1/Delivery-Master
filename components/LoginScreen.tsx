
import React, { useState } from 'react';
import { Bike, Lock, User, ShoppingBag, ArrowRight } from 'lucide-react';
import { StoreAccount, UserSession } from '../types';

interface LoginScreenProps {
  onLogin: (session: UserSession) => void;
  onEnterClientMode: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onEnterClientMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Check for Super Admin
    if (username === 'admin' && password === 'admin') {
      onLogin({ role: 'admin', username: 'Administrador' });
      return;
    }

    // 2. Check for Store Accounts
    const accountsStr = localStorage.getItem('dm_accounts');
    const accounts: StoreAccount[] = accountsStr ? JSON.parse(accountsStr) : [];
    
    // Default demo account if no accounts exist
    if (accounts.length === 0 && username === 'demo' && password === '123') {
       onLogin({ role: 'store', storeId: 'demo_store', storeName: 'Loja Demonstração', username: 'demo' });
       return;
    }

    const foundAccount = accounts.find(acc => acc.username === username && acc.password === password);

    if (foundAccount) {
      if (!foundAccount.isActive) {
        setError('Esta conta foi desativada. Contate o administrador.');
        return;
      }
      onLogin({ 
        role: 'store', 
        storeId: foundAccount.id, 
        storeName: foundAccount.name, 
        username: foundAccount.username 
      });
    } else {
      setError('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Bike size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">DeliveryMaster</h1>
          <p className="text-gray-500 text-sm">Sistema de Gestão Profissional</p>
        </div>

        {/* CLIENT MODE BUTTON */}
        <button 
          onClick={onEnterClientMode}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white p-4 rounded-xl shadow-lg shadow-orange-200 mb-8 flex items-center justify-between group hover:scale-[1.02] transition"
        >
          <div className="flex items-center gap-3">
             <div className="bg-white/20 p-2 rounded-lg">
                <ShoppingBag size={24} className="text-white" />
             </div>
             <div className="text-left">
                <p className="font-bold text-lg leading-tight">Fazer um Pedido</p>
                <p className="text-xs text-white/80">Acessar cardápio digital</p>
             </div>
          </div>
          <ArrowRight className="text-white/80 group-hover:translate-x-1 transition" />
        </button>

        <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">ÁREA DO LOJISTA</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="Seu usuário"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="Sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5"
          >
            Entrar no Sistema
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-gray-400">
          <p>Esqueceu sua senha? Contate o suporte.</p>
          <p className="mt-2">v1.4.0 • SaaS Edition</p>
        </div>
      </div>
    </div>
  );
};
