export function renderPassbookDashboard({
  items,
  activeRoomFilter,
  activeCategoryFilter,
  searchQuery,
  onlyZombies,
  onRoomSelect,
  onCategorySelect,
  onSearchChange,
  onToggleOnlyZombies,
  onOpenWASimulator,
  onGenerateListing,
  onMarkAsUsed,
  onDeleteItem
}) {
  const rooms = ["Semua Ruangan", "Kamar Kos", "Gudang", "Meja Kerja Kos", "Dapur Kos", "Lemari Pakaian", "Rak Sepatu & Helm"];
  const categories = ["Semua Kategori", "Elektronik", "Kamera & Fotografi", "Alat Rumah Tangga", "Pakaian & Fashion", "Otomotif & Riding"];

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRoom = activeRoomFilter === "Semua Ruangan" || item.location.toLowerCase().includes(activeRoomFilter.toLowerCase());
    const matchesCategory = activeCategoryFilter === "Semua Kategori" || item.category === activeCategoryFilter;
    const matchesZombie = !onlyZombies || item.isZombie;

    return matchesSearch && matchesRoom && matchesCategory && matchesZombie;
  });

  // Calculate totals
  const totalValue = items.reduce((acc, curr) => acc + curr.estimatedPrice, 0);
  const zombieItems = items.filter(i => i.isZombie);
  const totalZombieValue = zombieItems.reduce((acc, curr) => acc + curr.estimatedPrice, 0);
  const activeItemsCount = items.length - zombieItems.length;

  const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalValue);
  const formattedZombieTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalZombieValue);

  const roomFilterPills = rooms.map(r => `
    <button data-room="${r}" class="btn-filter-room ${activeRoomFilter === r ? 'bg-[#00261a] text-[#fed255] font-bold border-[#00261a]' : 'bg-[#f7f3e8] text-[#1c1c15] hover:bg-[#e6e2d8] border-[#c0c8c3]'} text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap">
      ${r}
    </button>
  `).join('');

  const categoryFilterPills = categories.map(c => `
    <button data-category="${c}" class="btn-filter-category ${activeCategoryFilter === c ? 'bg-[#755b00] text-white font-bold border-[#755b00]' : 'bg-[#f7f3e8] text-gray-700 hover:bg-[#e6e2d8] border-[#c0c8c3]'} text-xs px-3 py-1.5 rounded-full border transition-all whitespace-nowrap">
      ${c}
    </button>
  `).join('');

  const rowsHTML = filteredItems.length === 0 ? `
    <tr>
      <td colspan="7" class="py-12 text-center text-gray-500 font-mono">
        <span class="material-symbols-outlined text-4xl mb-2 text-gray-400">search_off</span>
        <p class="text-sm font-bold">Tidak ada barang yang cocok dengan filter kamu.</p>
        <button id="btn-reset-filters" class="mt-2 text-xs text-[#006c49] underline font-sans">Reset Filter</button>
      </td>
    </tr>
  ` : filteredItems.map((item, idx) => {
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.estimatedPrice);
    const formattedOriginal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.purchasePrice);

    return `
      <tr class="ledger-row group">
        <td class="py-3 px-3 font-mono text-xs text-gray-500 font-bold whitespace-nowrap">
          ${item.id}
        </td>
        <td class="py-3 px-3 font-mono text-xs text-gray-600 whitespace-nowrap">
          ${item.purchaseDate}
        </td>
        <td class="py-3 px-3">
          <div class="flex items-center gap-3">
            <img src="${item.imageUrl}" alt="${item.name}" class="w-12 h-12 rounded-lg object-cover border border-gray-300 shadow-sm shrink-0" />
            <div>
              <div class="font-bold text-sm text-[#00261a] group-hover:text-emerald-700 transition-colors">${item.name}</div>
              <div class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <span class="material-symbols-outlined text-xs">location_on</span>
                <span>${item.location}</span>
                <span class="text-gray-300">•</span>
                <span>${item.brand}</span>
              </div>
            </div>
          </div>
        </td>
        <td class="py-3 px-3">
          <span class="bg-[#f2eee3] text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium border border-gray-300 inline-block whitespace-nowrap">
            ${item.category}
          </span>
        </td>
        <td class="py-3 px-3 whitespace-nowrap">
          ${item.isZombie ? `
            <div class="red-stamp text-[10px]">
              <span class="material-symbols-outlined text-xs">skull</span>
              <span>BARANG ZOMBIE</span>
            </div>
            <div class="text-[10px] text-red-600 font-mono mt-1">Tak dipakai ${item.lastUsedDaysAgo} hari</div>
          ` : `
            <div class="green-stamp text-[10px]">
              <span class="material-symbols-outlined text-xs">verified</span>
              <span>TERPAKAI AKTIF</span>
            </div>
          `}
        </td>
        <td class="py-3 px-3 font-mono text-right whitespace-nowrap">
          <div class="font-bold text-sm text-[#00261a]">${formattedPrice}</div>
          <div class="text-[11px] text-gray-400 line-through">Beli: ${formattedOriginal}</div>
        </td>
        <td class="py-3 px-3 text-right whitespace-nowrap">
          <div class="flex items-center justify-end gap-1.5">
            ${item.isZombie ? `
              <button data-item-id="${item.id}" class="btn-jual-one-tap bg-[#93000a] hover:bg-[#710511] text-white text-xs font-bold px-2.5 py-1.5 rounded flex items-center gap-1 shadow-sm transition-all">
                <span class="material-symbols-outlined text-sm">storefront</span>
                <span>Jual 1-Tap</span>
              </button>
            ` : `
              <button data-item-id="${item.id}" class="btn-jual-one-tap bg-[#0f3d2e] hover:bg-[#00261a] text-white text-xs font-medium px-2 py-1.5 rounded flex items-center gap-1 transition-all">
                <span class="material-symbols-outlined text-sm">sell</span>
                <span>Draft Listing</span>
              </button>
            `}

            ${item.isZombie ? `
              <button data-mark-used-id="${item.id}" title="Tandai Sudah Dipakai Lagi" class="btn-mark-used text-emerald-700 hover:bg-emerald-100 p-1.5 rounded transition-all">
                <span class="material-symbols-outlined text-base">check_circle</span>
              </button>
            ` : ''}

            <button data-edit-id="${item.id}" title="Edit Barang" class="btn-edit-item text-emerald-800 hover:text-emerald-900 p-1.5 rounded hover:bg-emerald-100 transition-all">
              <span class="material-symbols-outlined text-base">edit</span>
            </button>

            <button data-delete-id="${item.id}" title="Hapus Barang" class="btn-delete-item text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-all">
              <span class="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </td>
        <td class="bg-[#f7f3e8]"></td>
      </tr>
    `;
  }).join('');

  return `
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      <!-- Top Passbook Cover Header Banner -->
      <div class="passbook-cover rounded-2xl p-6 sm:p-8 text-white mb-8 relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 opacity-10 text-white pointer-events-none">
          <span class="material-symbols-outlined text-[240px]">menu_book</span>
        </div>
        
        <div class="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div class="inline-flex items-center gap-2 bg-[#fed255] text-[#00261a] font-mono font-bold text-xs px-3 py-1 rounded-full mb-3 uppercase tracking-wider shadow">
              <span class="material-symbols-outlined text-sm">account_balance</span>
              <span>BUKU TABUNGAN BARANG & HARTA #882-990-2026</span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans text-white">
              Rekapitulasi "Total Hartaku"
            </h1>
            <p class="text-emerald-100 text-sm mt-1 max-w-2xl leading-relaxed">
              Jangan sampai ada barang zombie mengendap di kos atau rumahmu. Pantau nilai pasar real-time, deteksi barang terlupakan, dan langsung jual ke Tokopedia/Shopee dalam 1 klik.
            </p>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button id="btn-direct-scan-hero" class="w-full sm:w-auto bg-[#fed255] hover:bg-yellow-400 text-[#00261a] font-bold px-5 py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm">
              <span class="material-symbols-outlined text-xl">add_a_photo</span>
              <span>+ Scan Barang AI</span>
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Financial Summary Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <!-- Total Value KPI -->
        <div class="bg-[#f7f3e8] border border-[#c0c8c3] rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div class="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider mb-1">TOTAL PASAR HARTAKU</div>
          <div class="text-2xl font-mono font-bold text-[#00261a]">${formattedTotal}</div>
          <div class="text-[11px] text-emerald-700 font-medium mt-2 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">trending_up</span>
            <span>${items.length} item terdaftar</span>
          </div>
        </div>

        <!-- Barang Zombie KPI -->
        <div class="bg-[#ffdad6]/40 border border-[#93000a]/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div class="text-xs font-mono font-bold text-[#93000a] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>BARANG ZOMBIE 🧟</span>
            <span class="bg-[#93000a] text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">${zombieItems.length} Item</span>
          </div>
          <div class="text-2xl font-mono font-bold text-[#93000a]">${zombieItems.length} Barang</div>
          <div class="text-[11px] text-red-700 font-medium mt-2">
            Tak disentuh > 60 hari!
          </div>
        </div>

        <!-- Cash Mengendap KPI -->
        <div class="bg-[#fed255]/20 border border-[#755b00]/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div class="text-xs font-mono font-bold text-[#755b00] uppercase tracking-wider mb-1">CASH MENGENDAP</div>
          <div class="text-2xl font-mono font-bold text-[#755b00]">${formattedZombieTotal}</div>
          <div class="text-[11px] text-yellow-800 font-medium mt-2 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">savings</span>
            <span>Potensi uang tunai jika dijual</span>
          </div>
        </div>

        <!-- Active Items KPI -->
        <div class="bg-[#f7f3e8] border border-[#c0c8c3] rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div class="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider mb-1">BARANG AKTIF TERPAKAI</div>
          <div class="text-2xl font-mono font-bold text-[#006c49]">${activeItemsCount} Barang</div>
          <div class="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">check_circle</span>
            <span>Rutin digunakan minggu ini</span>
          </div>
        </div>

      </div>

      <!-- Controls & Filter Toolbar -->
      <div class="bg-[#f7f3e8] border border-[#c0c8c3] rounded-t-2xl p-4 sm:p-5 shadow-sm space-y-4">
        
        <!-- Search & Quick Toggles -->
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <!-- Search input -->
          <div class="relative flex-1">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">search</span>
            <input 
              type="text" 
              id="input-search-items" 
              value="${searchQuery}" 
              placeholder="Cari nama barang, merk (Asus, Sony, Uniqlo), atau lokasi..." 
              class="w-full bg-white border border-[#c0c8c3] rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#00261a] shadow-inner font-sans" 
            />
          </div>

          <!-- Zombie filter toggle -->
          <button id="btn-toggle-only-zombies" class="bg-white border ${onlyZombies ? 'border-[#93000a] text-[#93000a] bg-red-50 font-bold' : 'border-[#c0c8c3] text-gray-700'} px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm">
            <span class="material-symbols-outlined text-base ${onlyZombies ? 'text-[#93000a]' : 'text-gray-400'}">skull</span>
            <span>Filter Barang Zombie Saja</span>
            ${onlyZombies ? `<span class="bg-[#93000a] text-white text-[10px] px-1.5 rounded-full">AKTIF</span>` : ''}
          </button>
        </div>

        <!-- Filter Pills Bar -->
        <div class="space-y-2 pt-2 border-t border-[#c0c8c3]/60">
          <div class="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <span class="text-xs font-mono font-bold text-gray-500 uppercase shrink-0">LOKASI:</span>
            ${roomFilterPills}
          </div>
          <div class="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <span class="text-xs font-mono font-bold text-gray-500 uppercase shrink-0">KATEGORI:</span>
            ${categoryFilterPills}
          </div>
        </div>

      </div>

      <!-- Buku Tabungan Ledger Table -->
      <div class="passbook-page border-x border-b border-[#c0c8c3] rounded-b-2xl overflow-hidden shadow-md">
        <div class="overflow-x-auto custom-scrollbar" style="background-color: #00261a;">
          <table class="w-full min-w-full text-left border-collapse">
            <thead class="bg-[#00261a] text-emerald-200 font-mono text-xs uppercase tracking-wider border-b border-emerald-800">
              <tr class="bg-[#00261a]">
                <th class="py-3.5 px-3 bg-[#00261a] whitespace-nowrap">NO. SERI</th>
                <th class="py-3.5 px-3 bg-[#00261a] whitespace-nowrap">TGL SCAN</th>
                <th class="py-3.5 px-3 bg-[#00261a]">NAMA BARANG & LOKASI</th>
                <th class="py-3.5 px-3 bg-[#00261a] whitespace-nowrap">KATEGORI</th>
                <th class="py-3.5 px-3 bg-[#00261a] whitespace-nowrap">STATUS UNIFORM</th>
                <th class="py-3.5 px-3 text-right bg-[#00261a] whitespace-nowrap">ESTIMASI PASAR</th>
                <th class="py-3.5 px-3 text-right bg-[#00261a] whitespace-nowrap">AKSI</th>
                <th class="bg-[#00261a] w-full"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-dashed divide-[#c0c8c3] font-sans" style="background-color: #f7f3e8;">
              ${rowsHTML}
            </tbody>
          </table>
        </div>

        <!-- Perforated footer margin -->
        <div class="perforation-divider my-2"></div>
        <div class="p-4 bg-[#f2eee3] text-center font-mono text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#c0c8c3]">
          <div>Tercetak ${filteredItems.length} dari total ${items.length} catatan inventaris</div>
          <div class="text-[11px] text-[#006c49]">Hartaku Passbook System • Terenkripsi SSL 256-bit</div>
        </div>
      </div>

    </main>
  `;
}
