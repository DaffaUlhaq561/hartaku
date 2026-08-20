export function renderZombieRadarSection({ items, onGenerateListing, onMarkAsUsed, onHibahkan }) {
  const zombieItems = items.filter(i => i.isZombie);
  const totalZombieValue = zombieItems.reduce((acc, curr) => acc + curr.estimatedPrice, 0);
  const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalZombieValue);

  if (zombieItems.length === 0) {
    return `
      <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-[#f7f3e8] border-2 border-[#00261a] rounded-xl p-12 text-center shadow-[4px_4px_0px_0px_#1c1c15]">
          <span class="material-symbols-outlined text-5xl text-emerald-600 mb-4 block">sentiment_very_satisfied</span>
          <h2 class="font-mono font-bold text-2xl text-[#00261a] mb-2">Tidak Ada Barang Zombie!</h2>
          <p class="text-sm text-gray-600 font-sans">Semua barang di inventarismu masih aktif digunakan. Keren! 🎉</p>
        </div>
      </section>
    `;
  }

  const zombieRowsHTML = zombieItems.map((item, idx) => {
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.estimatedPrice);
    const urgencyColor = item.lastUsedDaysAgo > 100 ? 'text-[#ba1a1a]' : item.lastUsedDaysAgo > 60 ? 'text-orange-700' : 'text-yellow-700';
    const stampRotation = idx % 2 === 0 ? 'rotate(-5deg)' : 'rotate(6deg)';
    const stampText = item.lastUsedDaysAgo > 100 ? 'CRITICAL' : 'ZOMBIE';

    return `
      <div class="grid grid-cols-12 gap-3 px-4 py-4 border-b border-dashed border-[#c0c8c3] hover:bg-[#fed255]/10 transition-colors relative items-center group">
        
        <!-- Item image & info -->
        <div class="col-span-12 md:col-span-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div class="relative shrink-0">
            <img src="${item.imageUrl}" alt="${item.name}" class="w-14 h-14 object-cover border border-[#c0c8c3] rounded shadow-sm" />
            <!-- Zombie Stamp Overlay on Thumbnail -->
            <div class="absolute -top-2 -left-2 pointer-events-none z-10" style="transform: ${stampRotation};">
              <div class="border border-[#ba1a1a] text-[#ba1a1a] font-mono font-bold text-[9px] px-1.5 py-0.5 uppercase tracking-wider bg-red-100/90 shadow-sm rounded-sm whitespace-nowrap">
                ${stampText}
              </div>
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <h3 class="font-bold text-sm text-[#00261a] truncate">${item.name}</h3>
            <p class="text-xs text-gray-500 font-sans mt-0.5 truncate">${item.brand} • ${item.location}</p>
            <p class="text-xs text-gray-400 font-sans truncate">${item.condition}</p>
          </div>
        </div>

        <!-- Days idle -->
        <div class="col-span-6 md:col-span-2 flex items-center justify-center font-mono text-sm ${urgencyColor} font-bold whitespace-nowrap">
          ${item.lastUsedDaysAgo} hari
        </div>

        <!-- Estimated price -->
        <div class="col-span-6 md:col-span-2 flex items-center justify-end font-mono text-sm font-bold text-[#00261a] whitespace-nowrap">
          ${formattedPrice}
        </div>

        <!-- Action buttons -->
        <div class="col-span-12 md:col-span-4 flex items-center justify-end md:justify-center gap-1.5 mt-2 md:mt-0 z-10 relative">
          <button data-jual-item-id="${item.id}" title="Jual 1-Tap" class="btn-zombie-jual px-2.5 py-1.5 bg-[#ba1a1a] hover:bg-[#93000a] text-white border border-[#1c1c15] text-xs font-bold uppercase shadow-[1px_1px_0px_0px_#1c1c15] hover:translate-y-px hover:shadow-none transition-all flex items-center gap-1 rounded whitespace-nowrap shrink-0">
            <span class="material-symbols-outlined text-sm">storefront</span>
            <span>Jual 1-Tap</span>
          </button>
          <button data-kepake-item-id="${item.id}" title="Tandai Kepake" class="btn-zombie-kepake px-2.5 py-1.5 bg-[#00261a] hover:bg-[#063d2b] text-white border border-[#1c1c15] text-xs font-bold uppercase shadow-[1px_1px_0px_0px_#1c1c15] hover:translate-y-px hover:shadow-none transition-all flex items-center gap-1 rounded whitespace-nowrap shrink-0">
            <span class="material-symbols-outlined text-sm">check_circle</span>
            <span>Kepake</span>
          </button>
          <button data-edit-item-id="${item.id}" title="Edit Detail Barang" class="btn-zombie-edit p-1.5 bg-[#fed255] hover:bg-yellow-400 text-[#00261a] border border-[#1c1c15] text-xs font-bold shadow-[1px_1px_0px_0px_#1c1c15] hover:translate-y-px hover:shadow-none transition-all rounded shrink-0 flex items-center justify-center">
            <span class="material-symbols-outlined text-base">edit</span>
          </button>
          <button data-hibah-item-id="${item.id}" title="Hibahkan / Donasikan" class="btn-zombie-hibah p-1.5 bg-white hover:bg-gray-100 text-[#00261a] border border-[#1c1c15] text-xs shadow-[1px_1px_0px_0px_#1c1c15] hover:translate-y-px hover:shadow-none transition-all rounded shrink-0 flex items-center justify-center">
            <span class="material-symbols-outlined text-base">volunteer_activism</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <section class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Zombie Radar Header -->
      <div class="bg-[#f7f3e8] border-2 border-[#1c1c15] rounded-xl p-6 sm:p-8 mb-6 shadow-[4px_4px_0px_0px_#1c1c15] passbook-container relative overflow-hidden">
        
        <!-- Reference badge -->
        <div class="absolute top-3 left-3 text-[10px] font-mono text-gray-400 opacity-70">REF: ZMB-26-X${Math.floor(Math.random()*900+100)}</div>
        
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="text-center md:text-left">
            <h1 class="font-mono font-bold text-2xl sm:text-4xl text-[#00261a] uppercase tracking-tight mb-1">🧟 Radar Barang Zombie</h1>
            <p class="text-sm text-gray-600 font-sans max-w-xl">Identifikasi aset menganggur yang membebani dompetmu. Jangan biarkan uangmu mengendap!</p>
          </div>
          <div class="text-center bg-white border border-[#1c1c15] px-6 py-4 shadow-[2px_2px_0px_0px_#1c1c15] rounded">
            <div class="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">TOTAL KAS MENGENDAP</div>
            <div class="text-3xl font-mono font-bold text-[#ba1a1a]">${formattedTotal}</div>
            <div class="text-[10px] mt-1 font-mono uppercase text-gray-400">${zombieItems.length} BARANG IDLE</div>
          </div>
        </div>
      </div>

      <!-- Ledger Grid / Zombie Items -->
      <div class="bg-[#f7f3e8] border-2 border-[#1c1c15] rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_#1c1c15]">
        
        <!-- Table Header -->
        <div class="bg-[#00261a] text-emerald-200 grid grid-cols-12 gap-3 px-4 py-3 font-mono text-xs uppercase tracking-wider border-b-2 border-[#1c1c15]">
          <div class="col-span-12 md:col-span-4">Deskripsi Aset</div>
          <div class="col-span-6 md:col-span-2 text-center">Durasi Idle</div>
          <div class="col-span-6 md:col-span-2 text-right">Est. Nilai Jual</div>
          <div class="col-span-12 md:col-span-4 text-center hidden md:block">Tindakan</div>
        </div>

        <div class="px-4 divide-y-0">
          ${zombieRowsHTML}
        </div>

        <!-- Footer CTA -->
        <div class="bg-[#f2eee3] border-t-2 border-[#1c1c15] px-6 py-6 text-center">
          <h3 class="font-mono font-bold text-lg text-[#00261a] mb-3 uppercase">Bebaskan ${formattedTotal} dari Barang Zombie Sekarang</h3>
          <button id="btn-likuidasi-semua" class="inline-flex items-center gap-2 bg-[#00261a] text-[#fed255] px-8 py-3 border border-[#1c1c15] shadow-[4px_4px_0px_0px_#1c1c15] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all font-mono text-sm uppercase tracking-wider font-bold rounded">
            <span class="material-symbols-outlined">point_of_sale</span>
            <span>Likuidasi Semua Aset Zombie</span>
          </button>
        </div>
      </div>

    </section>
  `;
}
