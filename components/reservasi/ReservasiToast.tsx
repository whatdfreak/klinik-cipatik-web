"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface ReservasiToastProps {
  toast: { message: string; type: "info" | "success" | "error" } | null;
  onDismiss: () => void;
}

export default function ReservasiToast({ toast, onDismiss }: ReservasiToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: -16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl shadow-black/10 text-sm font-semibold border backdrop-blur-md max-w-sm w-[calc(100%-2rem)] ${toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-teal-50 text-teal-800 border-teal-200'
            }`}
        >
          {toast.type === 'success'
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            : toast.type === 'error'
            ? <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            : <Info className="w-5 h-5 text-teal-500 shrink-0" />}
          <span className="leading-snug">{toast.message}</span>
          <button onClick={onDismiss} className="ml-auto p-1 rounded-lg hover:bg-black/5 transition-colors" aria-label="Tutup notifikasi">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
