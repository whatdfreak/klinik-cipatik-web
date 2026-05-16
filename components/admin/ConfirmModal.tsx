"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  label: string;
  color: string;
  onOk: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, label, color, onOk, onCancel }: ConfirmModalProps) {
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!open) setBusy(false); }, [open]);
  if (!open) return null;
  const isDanger = color.includes("red") || color.includes("rose");
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center px-4">
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={()=>!busy&&onCancel()}/>
      <motion.div
        initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
        transition={{type:"spring",stiffness:300,damping:30}}
        className="relative z-10 bg-white w-full max-w-sm rounded-[1.5rem] shadow-2xl overflow-hidden">
        <div className={`h-1.5 w-full ${isDanger?"bg-rose-500":"bg-teal-500"}`}/>
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${isDanger?"bg-rose-50 text-rose-500":"bg-teal-50 text-teal-600"}`}>
              {isDanger ? <AlertCircle className="w-6 h-6"/> : <CheckCircle2 className="w-6 h-6"/>}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-base leading-tight">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mt-1.5">{message}</p>
            </div>
          </div>
        </div>
        <div className="px-6 pt-5 pb-6 flex gap-3">
          <button onClick={onCancel} disabled={busy}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50">
            Batal
          </button>
          <button onClick={async()=>{ setBusy(true); await Promise.resolve(onOk()); onCancel(); }} disabled={busy}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 ${color}`}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin"/> : label}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
