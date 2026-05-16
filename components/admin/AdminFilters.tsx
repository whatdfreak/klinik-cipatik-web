"use client";

import { CalendarDays, Search, ChevronDown, Settings, Download } from "lucide-react";

interface AdminFiltersProps {
  startDate: string;
  endDate: string;
  statusFilter: string;
  searchQuery: string;
  filteredCount: number;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onStatusFilterChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onOpenSettings: () => void;
  onExportCSV: () => void;
}

export default function AdminFilters(props: AdminFiltersProps) {
  const { startDate, endDate, statusFilter, searchQuery, filteredCount,
    onStartDateChange, onEndDateChange, onStatusFilterChange, onSearchChange,
    onOpenSettings, onExportCSV } = props;
  return (
    <div className="bg-white rounded-[1.5rem] p-3.5 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl w-full md:w-auto hover:border-teal-300 transition-colors">
        <CalendarDays className="w-4 h-4 text-slate-400"/>
        <input type="date" value={startDate} onChange={e=>onStartDateChange(e.target.value)} className="bg-transparent text-[13px] font-bold text-slate-700 outline-none w-[110px] cursor-pointer"/>
        <span className="text-slate-300 font-bold">-</span>
        <input type="date" value={endDate} onChange={e=>onEndDateChange(e.target.value)} className="bg-transparent text-[13px] font-bold text-slate-700 outline-none w-[110px] cursor-pointer"/>
      </div>
      <div className="relative w-full md:w-auto">
        <select value={statusFilter} onChange={e=>onStatusFilterChange(e.target.value)}
          className="w-full md:w-36 pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none appearance-none cursor-pointer hover:border-teal-300 transition-colors">
           <option value="Semua">Semua Status</option>
           <option value="Menunggu">Menunggu</option>
           <option value="Hadir">Hadir</option>
           <option value="Selesai">Selesai</option>
           <option value="Batal">Batal</option>
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-[11px] pointer-events-none"/>
      </div>
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-[11px] pointer-events-none"/>
        <input type="text" placeholder="Cari nama, kode, atau HP..." value={searchQuery} onChange={e=>onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none hover:border-teal-300 transition-colors placeholder:font-medium placeholder:text-slate-400"/>
      </div>
      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
        <button onClick={onOpenSettings} className="flex items-center justify-center p-2.5 bg-white border border-slate-200 shadow-sm rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all" title="Libur/Cuti" aria-label="Pengaturan Libur Cuti">
          <Settings className="w-5 h-5"/>
        </button>
        <button onClick={onExportCSV} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-2xl text-[13px] font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all flex-1 md:flex-none">
           <Download className="w-4 h-4"/> Export CSV
        </button>
        <span className="text-[12px] font-bold text-slate-400 whitespace-nowrap hidden lg:block mr-2">{filteredCount} data</span>
      </div>
    </div>
  );
}
