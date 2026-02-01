
import React, { useState } from 'react';
import { Mail, Lock, User, LayoutGrid, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';

interface AuthPageProps {
  onLogin: (user: { name: string, email: string }) => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;
        if (data.user) {
          onLogin({ name: data.user.user_metadata.name || 'Player', email: data.user.email! });
        }
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            },
          },
        });

        if (authError) throw authError;
        if (data.user) {
          alert("Registration successful! You can now login.");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    onLogin({ name: 'Flippa Guest', email: 'guest@sudokuhub.live' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <button onClick={onBack} className="absolute top-8 left-8 text-slate-400 font-black text-xs flex items-center gap-2 hover:text-indigo-600 uppercase tracking-widest transition-colors">
        <ArrowRight className="rotate-180" size={16} /> BACK TO HOME
      </button>

      <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl max-w-md w-full border border-slate-100 animate-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl rotate-6 overflow-hidden border border-slate-100">
            <img src="/favicon.png" alt="SudokuHub Logo" className="w-16 h-16 object-contain" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">{isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}</h2>
          <p className="text-slate-400 font-bold text-sm">{isLogin ? 'Login to continue your progress' : 'Sign up and get 50 free credits'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                required
                type="text"
                placeholder="Username"
                className="w-full pl-14 pr-6 py-5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input
              required
              type="email"
              placeholder="Email Address"
              className="w-full pl-14 pr-6 py-5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input
              required
              type="password"
              placeholder="Password"
              className="w-full pl-14 pr-6 py-5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold text-slate-700"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 animate-in shake duration-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest mt-4 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (isLogin ? 'LOGIN NOW' : 'CREATE ACCOUNT')}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
            <span className="bg-white px-4 text-slate-300">OR QUICK ACCESS</span>
          </div>
        </div>

        <button
          onClick={handleGuestLogin}
          className="w-full py-4 bg-slate-50 text-indigo-600 rounded-2xl font-black text-sm border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 group"
        >
          <Sparkles size={18} className="group-hover:animate-pulse" />
          TEST AS GUEST (FLIPPA DEMO)
        </button>

        <div className="mt-10 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
