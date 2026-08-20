export function renderNavbar({ totalValue, itemCount, zombieCount, onOpenWASimulator, onOpenZombieRadar, onOpenShareModal, onOpenPricingModal }) {
  const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalValue);

  return `
    <header class="bg-[#00261a] text-white border-b-4 border-[#fed255] shadow-lg sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
          
          <!-- Logo & Brand Header -->
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-[#fed255] text-[#00261a] rounded-lg flex items-center justify-center font-mono font-bold text-2xl shadow-inner border border-white/20">
              H
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-mono font-extrabold text-xl tracking-wider text-[#fed255]">HARTAKU</span>
                <span class="bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 text-xs px-2 py-0.5 rounded font-mono font-bold">PASSBOOK v1.0</span>
              </div>
              <p class="text-xs text-emerald-200/80 font-sans hidden sm:block">AI Home Inventory & Detektor Barang Zombie</p>
            </div>
          </div>

          <!-- Total Wealth Summary Badge -->
          <div class="hidden md:flex items-center gap-4 bg-[#0f3d2e] px-4 py-2 rounded-xl border border-emerald-500/30">
            <div>
              <div class="text-[10px] font-mono uppercase tracking-widest text-emerald-300">TOTAL NILAI HARTAKU</div>
              <div class="text-xl font-mono font-bold text-white tracking-tight">${formattedTotal}</div>
            </div>
            <div class="h-8 w-px bg-emerald-700/50"></div>
            <div class="text-center">
              <div class="text-[10px] font-mono uppercase text-emerald-300">TOTAL BARANG</div>
              <div class="text-lg font-mono font-bold text-[#fed255]">${itemCount} Item</div>
            </div>
          </div>

          <!-- Navigation Action Buttons -->
          <div class="flex items-center gap-2 sm:gap-3">
            <!-- Direct AI Scan Button -->
            <button id="btn-direct-scan-nav" class="bg-[#10b981] hover:bg-[#059669] text-[#00261a] font-bold px-3 sm:px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all transform hover:scale-[1.02] shadow-md border border-emerald-300">
              <span class="material-symbols-outlined text-lg">add_a_photo</span>
              <span class="hidden sm:inline">Scan Barang AI</span>
              <span class="sm:hidden">Scan AI</span>
            </button>

            <!-- Zombie Radar Quick Button -->
            <button id="btn-open-zombie-nav" class="relative bg-[#93000a] hover:bg-[#710511] text-white font-bold px-3 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-all border border-red-400">
              <span class="material-symbols-outlined text-lg">coronavirus</span>
              <span class="hidden md:inline">Barang Zombie</span>
              ${zombieCount > 0 ? `<span class="bg-[#fed255] text-[#93000a] font-mono text-xs px-1.5 py-0.2 rounded-full font-black">${zombieCount}</span>` : ''}
            </button>

            <!-- Share & Pro Upgrade Buttons -->
            <button id="btn-open-share-nav" title="Bagikan Passbook Hartaku" class="bg-[#0f3d2e] hover:bg-emerald-900 text-emerald-200 p-2.5 rounded-lg border border-emerald-600/40 flex items-center justify-center transition-all">
              <span class="material-symbols-outlined text-xl">share</span>
            </button>

            <button id="btn-open-pricing-nav" class="bg-[#fed255] hover:bg-yellow-400 text-[#755b00] font-bold text-xs px-2.5 py-2 rounded-lg border border-yellow-600/30 flex items-center gap-1">
              <span class="material-symbols-outlined text-base">workspace_premium</span>
              <span class="hidden lg:inline">Hartaku Pro</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  `;
}
