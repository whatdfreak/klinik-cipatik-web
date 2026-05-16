import { supabase } from "@/lib/supabase";
import { StaffCarousel, StaffCarouselSkeleton } from "@/components/ui/StaffCarousel";
import { Suspense } from "react";

// Fetch data di Server Component — no useEffect, no client-side delay
// Next.js 15 cache: revalidate setiap 60 menit
async function getStaff() {
  const { data, error } = await supabase
    .from("staff")
    .select("id, nama, kategori, jabatan, status_karyawan, deskripsi, foto_url, lisensi")
    .order("id", { ascending: true });

  if (error) {
    // [StaffSection] Supabase error
    return [];
  }
  return data ?? [];
}

// Server Component — renders with data already available (SSR)
async function StaffData() {
  const staff = await getStaff();
  return <StaffCarousel staff={staff} />;
}

// This is what page.tsx imports
export default function StaffSection() {
  return (
    <Suspense fallback={<StaffCarouselSkeleton />}>
      <StaffData />
    </Suspense>
  );
}
