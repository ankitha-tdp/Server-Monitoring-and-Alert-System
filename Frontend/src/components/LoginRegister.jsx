import React from 'react';
import { Activity, Database, Terminal, Shield, User, Lock, ArrowRight, UserPlus, Check, AlertCircle } from 'lucide-react';

export default function LoginRegister({
  authMode, setAuthMode,
  loginIdentifier, setLoginIdentifier,
  loginPassword, setLoginPassword,
  regUsername, setRegUsername,
  regEmail, setRegEmail,
  regPassword, setRegPassword,
  regRole, setRegRole,
  authError, authSuccess,
  handleQuickFill, handleLoginSubmit, handleRegisterSubmit
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white">SysPulse</span>
            <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">v1.0 MVP</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />Node/Express API: Online</span>
          <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-cyan-400" />InfluxDB OSS: Ready</span>
        </div>
      </header>

      <main className="max-w-5xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
            <Terminal className="w-3.5 h-3.5" /> Custom JWT + SQLite Role-Based Telemetry
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Real-Time Hardware Telemetry & Edge Monitoring
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Monitor Windows target machines via lightweight Telegraf agents streaming metrics to your central InfluxDB server. Sign in as a <strong className="text-slate-200">User</strong> to deploy agents and inspect live charts, or as an <strong className="text-slate-200">Admin</strong> to oversee global infrastructure.
          </p>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Instant Demo Accounts (1-Click Fill)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => handleQuickFill('admin')} className="group text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400"><Shield className="w-3.5 h-3.5" />Admin Role</span>
                </div>
                <div className="text-xs font-mono text-slate-300">User: admin / Pass: admin123</div>
              </button>
              <button type="button" onClick={() => handleQuickFill('user')} className="group text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400"><User className="w-3.5 h-3.5" />Standard User</span>
                </div>
                <div className="text-xs font-mono text-slate-300">User: user / Pass: user123</div>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 mb-6">
              <button type="button" onClick={() => setAuthMode('login')} className={`py-2 text-sm font-medium rounded-lg transition-all ${authMode === 'login' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'}`}>Sign In</button>
              <button type="button" onClick={() => setAuthMode('register')} className={`py-2 text-sm font-medium rounded-lg transition-all ${authMode === 'register' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'}`}>Register</button>
            </div>

            {authError && <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4 text-rose-400" />{authError}</div>}
            {authSuccess && <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" />{authSuccess}</div>}

            {authMode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Username or Email</label>
                  <input type="text" required value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} placeholder="admin" className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                  <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-xl flex items-center justify-center gap-2">
                  <span>Authenticate & Route</span><ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div><label className="block text-xs font-medium text-slate-300 mb-1.5">Username</label><input type="text" required value={regUsername} onChange={(e) => setRegUsername(e.target.value)} placeholder="alex_ops" className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none" /></div>
                <div><label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label><input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="alex@syspulse.io" className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none" /></div>
                <div><label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label><input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••" className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none" /></div>
                <button type="submit" className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-xl flex items-center justify-center gap-2"><UserPlus className="w-4 h-4" /><span>Create Account</span></button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}