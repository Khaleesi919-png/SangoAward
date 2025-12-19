
import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (role: 'visitor' | 'admin') => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Obfuscated credentials
  const _k1 = atob('UQ=='); // "Q"
  const _k2 = atob('MDkxOQ=='); // "0919"

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === _k1 && password === _k2) {
      onLogin('admin');
    } else {
      setError('驗證失敗：無效的授權碼');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617] p-4 overflow-hidden">
      {/* Background visual effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      <div className="glass-panel w-full max-w-md rounded-2xl p-8 border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative animate-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-cyan-600 rounded-xl mx-auto mb-4 flex items-center justify-center neon-border">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-orbitron font-bold text-white glow-text tracking-tighter uppercase">Security Terminal</h1>
          <p className="text-[10px] text-cyan-400 mt-2 uppercase tracking-[0.3em] font-bold">霸業指揮中心存取</p>
        </div>

        {!isAdminMode ? (
          <div className="space-y-4">
            <button
              onClick={() => onLogin('visitor')}
              className="w-full py-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5 text-slate-500 group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              訪客登入 (唯讀)
            </button>
            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-slate-800 flex-1"></div>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Or</span>
              <div className="h-px bg-slate-800 flex-1"></div>
            </div>
            <button
              onClick={() => setIsAdminMode(true)}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              管理權限登入
            </button>
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Access ID</label>
              <input
                type="text"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-500/50 rounded-xl p-3 text-white outline-none transition-all"
                placeholder="Enter Username"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block ml-1">Secret Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-500/50 rounded-xl p-3 text-white outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="text-rose-500 text-[10px] font-bold text-center animate-bounce uppercase">
                {error}
              </div>
            )}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setIsAdminMode(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-white transition-colors"
              >
                返回
              </button>
              <button
                type="submit"
                className="flex-[2] py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all uppercase tracking-widest"
              >
                驗證
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
