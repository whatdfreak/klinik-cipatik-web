/**
 * app/template.tsx
 *
 * Next.js Template — di-mount ulang di setiap navigasi (berbeda dengan layout.tsx
 * yang di-persist). File ini adalah titik yang tepat untuk page transition animations.
 *
 * Referensi: https://nextjs.org/docs/app/api-reference/file-conventions/template
 */
"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  // Hormati preferensi aksesibilitas OS pengguna (WCAG 2.1 AA — 2.3.3 Animation from Interactions).
  // Jika user mengaktifkan "Reduce Motion" di sistem, animasi geser (y) dinonaktifkan.
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      // Initial state: transparan dan sedikit turun
      initial={{
        opacity: 0,
        y: prefersReducedMotion ? 0 : 10,
      }}
      // Animate ke state normal
      animate={{
        opacity: 1,
        y: 0,
      }}
      // Transisi ringan: cukup cepat agar tidak terasa lambat,
      // tapi cukup halus untuk memberikan kesan profesional.
      transition={{
        duration: prefersReducedMotion ? 0.15 : 0.3,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier "ease" standar — terasa natural
      }}
    >
      {children}
    </motion.div>
  );
}
