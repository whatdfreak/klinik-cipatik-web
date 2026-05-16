"use client";

import { motion, AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react";
import type { ToastType } from "./types";

export default function ToastStack({ toasts, dismiss }: { toasts: ToastType[]; dismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[340px] pointer-events-none">
      <AnimatePresence>
        {toasts.map(t=>{
          const cfg = t.type==="success"
            ? {bar:"bg-emerald-500",icon:"✅",title:"text-emerald-700",ring:"ring-emerald-100"}
            : t.type==="error"
            ? {bar:"bg-rose-500",icon:"❌",title:"text-rose-700",ring:"ring-rose-100"}
            : {bar:"bg-blue-500",icon:"ℹ️",title:"text-blue-700",ring:"ring-blue-100"};
          return (
            <motion.div key={t.id}
              initial={{opacity:0,x:80,scale:0.95}} animate={{opacity:1,x:0,scale:1}} exit={{opacity:0,x:80,scale:0.95}}
              transition={{type:"spring",stiffness:300,damping:28}}
              className={`pointer-events-auto bg-white rounded-2xl shadow-xl ring-1 ${cfg.ring} overflow-hidden`}>
              <div className={`h-1 w-full ${cfg.bar}`}/>
              <div className="flex items-start gap-3 px-4 py-3">
                <span className="text-base shrink-0 mt-0.5">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${cfg.title}`}>{t.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{t.msg}</p>
                </div>
                <button onClick={()=>dismiss(t.id)} className="text-slate-300 hover:text-slate-500 shrink-0 mt-0.5 transition-colors" aria-label="Tutup notifikasi"><XCircle className="w-4 h-4"/></button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
