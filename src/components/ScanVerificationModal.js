export function renderScanVerificationModal({ isOpen, scannedData }) {
  if (!isOpen || !scannedData) return '';

  const categories = [
    "Elektronik",
    "Kamera & Fotografi",
    "Alat Rumah Tangga",
    "Pakaian & Fashion",
    "Otomotif & Riding",
    "Perabotan Kamar Kos",
    "Lain-lain"
  ];

  const categoryOptionsHTML = categories.map(cat => `
    <option value="${cat}" ${scannedData.category === cat ? 'selected' : ''}>${cat}</option>
  `).join('');

  return `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div class="bg-[#f7f3e8] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border-2 border-[#00261a] flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="bg-[#00261a] text-white p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#fed255] text-[#00261a] rounded-xl flex items-center justify-center font-bold">
              <span class="material-symbols-outlined text-2xl">verified</span>
            </div>
            <div>
              <h2 class="font-mono font-bold text-base text-[#fed255]">VERIFIKASI HASIL SCAN BARANG</h2>
              <p class="text-xs text-emerald-200 font-sans">Periksa & sesuaikan nama, kategori, serta harga sebelum disimpan</p>
            </div>
          </div>
          <button id="btn-cancel-verify-scan" class="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <!-- Body Form -->
        <form id="form-scan-verification" class="p-5 overflow-y-auto custom-scrollbar space-y-4">
          
          <!-- Image & AI Source Card -->
          <div class="bg-white p-4 rounded-xl border border-[#c0c8c3] flex flex-col sm:flex-row items-center gap-4 shadow-sm">
            <img src="${scannedData.imageUrl}" alt="${scannedData.name}" class="w-24 h-24 rounded-xl object-cover border-2 border-[#00261a]/20 shadow shrink-0" />
            <div class="flex-1 space-y-1 text-center sm:text-left">
              <div class="inline-flex items-center gap-1.5 bg-[#00261a] text-[#fed255] text-[11px] font-mono font-bold px-2.5 py-1 rounded-md">
                <span class="material-symbols-outlined text-sm">smart_toy</span>
                <span>Sumber: ${scannedData.sourceBadge || 'AI Scan'}</span>
              </div>
              <p class="text-xs text-gray-500 font-sans italic">
                "${scannedData.notes || 'Hasil pemindaian otomatis YOLO + OpenAI Vision API'}"
              </p>
            </div>
          </div>

          <!-- Input Fields -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <!-- Nama Barang -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-mono font-bold text-[#00261a] uppercase mb-1">
                Nama Barang <span class="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="verify-item-name" 
                value="${scannedData.name || ''}" 
                required
                class="w-full bg-white border border-[#c0c8c3] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#00261a] focus:outline-none focus:border-[#00261a] focus:ring-2 focus:ring-[#00261a]/20 shadow-inner"
                placeholder="Contoh: Kulkas Portable Aqua 1 Pintu"
              />
            </div>

            <!-- Kategori -->
            <div>
              <label class="block text-xs font-mono font-bold text-[#00261a] uppercase mb-1">
                Kategori
              </label>
              <select 
                id="verify-item-category"
                class="w-full bg-white border border-[#c0c8c3] rounded-xl px-3.5 py-2.5 text-sm text-[#00261a] font-medium focus:outline-none focus:border-[#00261a]"
              >
                ${categoryOptionsHTML}
              </select>
            </div>

            <!-- Lokasi Barang -->
            <div>
              <label class="block text-xs font-mono font-bold text-[#00261a] uppercase mb-1">
                Lokasi Penyimpanan
              </label>
              <input 
                type="text" 
                id="verify-item-location" 
                value="${scannedData.location || 'Kamar Kos'}" 
                class="w-full bg-white border border-[#c0c8c3] rounded-xl px-3.5 py-2.5 text-sm text-[#00261a] focus:outline-none focus:border-[#00261a]"
                placeholder="Contoh: Kamar Kos, Meja Kerja, Gudang"
              />
            </div>

            <!-- Estimasi Harga Beli -->
            <div>
              <label class="block text-xs font-mono font-bold text-[#00261a] uppercase mb-1">
                Harga Beli Awal (IDR)
              </label>
              <input 
                type="number" 
                id="verify-item-purchase-price" 
                value="${scannedData.purchasePrice || 0}" 
                min="0"
                step="1000"
                class="w-full bg-white border border-[#c0c8c3] rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-700 focus:outline-none focus:border-[#00261a]"
              />
            </div>

            <!-- Estimasi Harga Pasar -->
            <div>
              <label class="block text-xs font-mono font-bold text-[#00261a] uppercase mb-1">
                Estimasi Harga Pasar (IDR) <span class="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                id="verify-item-estimated-price" 
                value="${scannedData.estimatedPrice || 0}" 
                required
                min="0"
                step="1000"
                class="w-full bg-white border border-[#c0c8c3] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#00261a] focus:outline-none focus:border-[#00261a]"
              />
            </div>

            <!-- Status Zombie Checkbox -->
            <div class="sm:col-span-2 bg-white p-3.5 rounded-xl border border-[#c0c8c3] flex items-center justify-between">
              <div>
                <label class="font-mono font-bold text-xs text-[#93000a] flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-outlined text-base">skull</span>
                  <span>Tandai Sebagai Barang Zombie?</span>
                </label>
                <p class="text-[11px] text-gray-500 font-sans">Barang yang jarang/tidak pernah dipakai dalam > 60 hari terakhir</p>
              </div>
              <input 
                type="checkbox" 
                id="verify-item-is-zombie" 
                ${scannedData.isZombie ? 'checked' : ''} 
                class="w-5 h-5 accent-[#93000a] rounded cursor-pointer"
              />
            </div>

            <!-- Catatan / Deskripsi -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-mono font-bold text-[#00261a] uppercase mb-1">
                Catatan / Deskripsi Barang
              </label>
              <textarea 
                id="verify-item-notes" 
                rows="2"
                class="w-full bg-white border border-[#c0c8c3] rounded-xl p-3 text-xs text-gray-800 focus:outline-none focus:border-[#00261a]"
                placeholder="Catatan kondisi, kelengkapan, garansi..."
              >${scannedData.notes || ''}</textarea>
            </div>

          </div>

          <!-- Footer Action Buttons -->
          <div class="pt-3 border-t border-[#c0c8c3] flex items-center justify-end gap-3">
            <button 
              type="button" 
              id="btn-close-verify-modal" 
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-all"
            >
              Batal
            </button>
            <button 
              type="submit" 
              class="bg-[#00261a] hover:bg-[#063d2b] text-[#fed255] font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-all border border-[#fed255]/40"
            >
              <span class="material-symbols-outlined text-base">add_task</span>
              <span>Simpan Ke Buku Tabungan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  `;
}
