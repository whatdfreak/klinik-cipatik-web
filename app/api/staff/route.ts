import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cache headers: browser cache 5min, CDN/shared cache 30min
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("staff")
      .select("id, nama, kategori, jabatan, status_karyawan, deskripsi, foto_url, lisensi")
      .order("id", { ascending: true });

    if (error) throw error;

    return NextResponse.json(
      { data: data ?? [] },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ data: [], error: error.message }, { status: 500 });
  }
}
