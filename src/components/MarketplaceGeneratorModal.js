export function renderMarketplaceGeneratorModal({ isOpen, item, activePlatform, onSelectPlatform, onCopyTitle, onCopyDescription, onClose }) {
  if (!isOpen || !item) return '';

  const platforms = [
    { id: 'tokopedia', name: 'Tokopedia', color: 'bg-[#03ac0e] text-white', icon: 'shopping_bag' },
    { id: 'shopee', name: 'Shopee', color: 'bg-[#ee4d2d] text-white', icon: 'local_mall' },
    { id: 'olx', name: 'OLX Indonesia', color: 'bg-[#002f34] text-white', icon: 'sell' },
    { id: 'fb', name: 'FB Marketplace', color: 'bg-[#1877f2] text-white', icon: 'groups' }
  ];

  const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.estimatedPrice);
  const formattedMinNego = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.resalePriceMin || Math.round(item.estimatedPrice * 0.9));
  const formattedMax = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.resalePriceMax || Math.round(item.estimatedPrice * 1.05));

  // Generated Title
  const titleText = `[BEKAS SANGAT RAWAT] ${item.name} - Kondisi Mulus Ready`;

  // Generated Copywriting Description
  const descriptionText = `📌 DILAPORKAN OLEH HARTAKU AI LISTING GENERATOR

Dijual barang milik pribadi: ${item.name} (${item.brand})
Kondisi: ${item.condition}
Lokasi Barang: ${item.location}

 SPESIFIKASI & CATATAN:
• Pemakaian: ${item.notes || 'Diperhatikan dengan baik, fungsi 100% normal.'}
• Garansi: ${item.warrantyUntil || 'Non-garansi (Garansi Toko / Cek Sepuasnya saat COD)'}
• Kelengkapan: Unit & aksesoris lengkap bawaan.

 HARGA & TRANSAKSI:
• Harga Buka: ${formattedPrice} (Nego Tipis Halus)
• Batas Nego Sehat: ${formattedMinNego}
• Siap Kirim / Instant Courier / COD area terdekat.

Siapa cepat dia dapat, minus pemakaian wajar. Langsung chat/checkout!`;

  const platformTabsHTML = platforms.map(p => `
    <button data-platform="${p.id}" class="btn-select-platform ${activePlatform === p.id ? `${p.color} font-bold shadow-md` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all">
      <span class="material-symbols-outlined text-base">${p.icon}</span>
      <span>${p.name}</span>
    </button>
  `).join('');

  return `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div class="bg-[#f7f3e8] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border-2 border-[#00261a] flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="bg-[#00261a] text-white p-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#fed255] text-2xl">auto_awesome</span>
            <div>
              <h2 class="font-mono font-bold text-base text-[#fed255]">1-TAP MARKETPLACE LISTING GENERATOR</h2>
              <p class="text-xs text-emerald-200 font-sans">AI otomatis buatkan judul, deskripsi, dan riset harga pasar</p>
            </div>
          </div>
          <button id="btn-close-marketplace-modal" class="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div class="p-5 overflow-y-auto custom-scrollbar space-y-5">
          
          <!-- Item Summary Header -->
          <div class="bg-white p-4 rounded-xl border border-[#c0c8c3] flex items-center gap-4 shadow-sm">
            <img src="${item.imageUrl}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover border border-gray-300 shadow-sm shrink-0" />
            <div class="flex-1">
              <div class="font-bold text-base text-[#00261a]">${item.name}</div>
              <div class="text-xs text-gray-500 font-mono mt-0.5">${item.category} • ${item.location}</div>
              <div class="text-xs text-emerald-700 font-mono font-bold mt-1">
                Estimasi Pasar: ${formattedPrice} (Rentang: ${formattedMinNego} - ${formattedMax})
              </div>
            </div>
          </div>

          <!-- Platform Selector Tabs -->
          <div>
            <label class="block text-xs font-mono font-bold text-gray-600 uppercase mb-2">Target Marketplace:</label>
            <div class="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              ${platformTabsHTML}
            </div>
          </div>

          <!-- Copyable Title Section -->
          <div class="bg-white p-4 rounded-xl border border-[#c0c8c3] shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-mono font-bold text-gray-700 uppercase">Judul Listing Optimasi SEO:</label>
              <button id="btn-copy-title" class="bg-[#00261a] hover:bg-[#063d2b] text-[#fed255] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all">
                <span class="material-symbols-outlined text-sm">content_copy</span>
                <span>Salin Judul</span>
              </button>
            </div>
            <div class="bg-[#f7f3e8] p-3 rounded-lg font-mono text-sm border border-gray-300 text-gray-800 font-bold">
              ${titleText}
            </div>
          </div>

          <!-- Copyable Description Section -->
          <div class="bg-white p-4 rounded-xl border border-[#c0c8c3] shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-mono font-bold text-gray-700 uppercase">Deskripsi Iklan Penjualan Formatted:</label>
              <button id="btn-copy-description" class="bg-[#10b981] hover:bg-[#059669] text-[#00261a] text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-all shadow">
                <span class="material-symbols-outlined text-sm">copy_all</span>
                <span>Salin Deskripsi Complete</span>
              </button>
            </div>
            <textarea id="marketplace-desc-textarea" readonly class="w-full h-44 bg-[#f7f3e8] border border-gray-300 rounded-lg p-3 text-xs font-mono text-gray-800 focus:outline-none leading-relaxed">${descriptionText}</textarea>
          </div>

        </div>

        <!-- Footer Modal Actions -->
        <div class="bg-[#f2eee3] p-4 border-t border-[#c0c8c3] flex items-center justify-between">
          <div class="text-xs text-gray-500 font-mono">
            💡 Tinggal buka aplikasi marketplace favoritmu & paste!
          </div>
          <button id="btn-done-marketplace" class="bg-[#00261a] text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-[#063d2b] transition-all">
            Selesai
          </button>
        </div>

      </div>
    </div>
  `;
}
