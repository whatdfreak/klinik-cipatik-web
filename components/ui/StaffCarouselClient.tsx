"use client";

import { useEffect, useState } from "react";
import { StaffCarousel, StaffCarouselSkeleton } from "@/components/ui/StaffCarousel";

interface Staff {
  id: string;
  nama: string;
  kategori: string;
  jabatan: string;
  status_karyawan: string;
  deskripsi: string;
  foto_url: string;
  lisensi?: string;
}

export default function StaffCarouselClient() {
  const [staff, setStaff] = useState<Staff[] | null>(null);

  useEffect(() => {
    // Check sessionStorage cache first (persists across scroll/re-render, cleared on tab close)
    const cached = sessionStorage.getItem("cipatik_staff_cache");
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        // Use cache if < 10 minutes old
        if (Date.now() - ts < 10 * 60 * 1000 && Array.isArray(data)) {
          setStaff(data);
          return;
        }
      } catch {}
    }

    // Fetch via Next.js route (SSR-cached on server, deduplicated)
    fetch("/api/staff")
      .then((r) => r.json())
      .then((json) => {
        const data: Staff[] = json.data ?? [];
        setStaff(data);
        sessionStorage.setItem(
          "cipatik_staff_cache",
          JSON.stringify({ data, ts: Date.now() })
        );
      })
      .catch(() => setStaff([]));
  }, []);

  if (staff === null) return <StaffCarouselSkeleton />;
  return <StaffCarousel staff={staff} />;
}
