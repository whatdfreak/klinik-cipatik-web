"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Loader2, Eye, EyeOff, AlertCircle, Hospital } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Login gagal.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err) {
      setError("Kesalahan koneksi ke server.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-teal-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Hospital className="w-16 h-16 text-teal-600 mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Admin</h1>
          <p className="text-slate-500 font-medium mt-2">Portal Manajemen Internal Klinik Pratama Cipatik</p>
        </div>
        
        <motion.div animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}} className="bg-white rounded-3xl border border-slate-200/60 shadow-2xl p-8 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-teal-500/10 blur-2xl pointer-events-none"></div>
          
          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-slate-700 mb-2">Username</label>
              <input 
                id="username" 
                type="text" 
                value={username} 
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="Masukkan username" 
                className={`w-full px-4 py-3 text-slate-900 rounded-xl border-2 outline-none transition-colors ${error ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-teal-500"}`} 
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••" 
                  className={`w-full px-4 py-3 pr-12 text-slate-900 rounded-xl border-2 outline-none transition-colors ${error ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-teal-500"}`} 
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-3.5 top-3.5 text-slate-400 hover:text-teal-600 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <p className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={!username || !password || loading}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-md shadow-teal-600/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
              {loading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>
        </motion.div>
        
        <p className="text-center text-xs font-semibold text-slate-400 mt-6 uppercase tracking-wider">Akses Terbatas Sistem Manajemen Klinik</p>
      </motion.div>
    </div>
  );
}
