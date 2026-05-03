import { createClient } from "@supabase/supabase-js";
import { StaffCarousel, StaffCarouselSkeleton } from "@/components/ui/StaffCarousel";
import { Suspense } from "react";

// Supabase server-side client (tidak butuh auth, hanya baca publik)
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fetch data di Server Component — no useEffect, no client-side delay
// Next.js 15 cache: revalidate setiap 60 menit
async function getStaff() {
  const { data, error } = await supabaseServer
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
      {/* @ts-expect-error Server Component */}
      <StaffData />
    </Suspense>
  );
}
