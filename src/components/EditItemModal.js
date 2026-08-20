export function renderEditItemModal({ isOpen, item }) {
  if (!isOpen || !item) return '';

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
    <option value="${cat}" ${item.category === cat ? 'selected' : ''}>${cat}</option>
  `).join('');

  return `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div class="bg-[#f7f3e8] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border-2 border-[#00261a] flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="bg-[#00261a] text-white p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#fed255] text-[#00261a] rounded-xl flex items-center justify-center font-bold">
              <span class="material-symbols-outlined text-2xl">edit_note</span>
            </div>
            <div>
              <h2 class="font-mono font-bold text-base text-[#fed255]">EDIT BARANG INVENTARIS</h2>
              <p class="text-xs text-emerald-200 font-sans">Ubah detail barang ID: ${item.id}</p>
            </div>
          </div>
          <button id="btn-close-edit-modal" class="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <!-- Form Body -->
        <form id="form-edit-item" class="p-5 overflow-y-auto custom-scrollbar space-y-4">
          
          <!-- Item Card Header -->
          <div class="bg-white p-4 rounded-xl border border-[#c0c8c3] flex items-center gap-4 shadow-sm">
            <img src="${item.imageUrl}" alt="${item.name}" class="w-20 h-20 rounded-xl object-cover border-2 border-[#00261a]/20 shadow shrink-0" />
            <div class="flex-1">
              <div class="font-mono text-xs text-gray-500 font-bold">ID: ${item.id}</div>
              <div class="font-bold text-base text-[#00261a]">${item.name}</div>
              <div class="text-xs text-emerald-700 font-mono mt-0.5">${item.category} • ${item.location}</div>
            </div>
          </div>

          <!-- Input Fields Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <!-- Nama Barang -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-mono font-bold text-[#00261a] uppercase mb-1">
                Nama Barang <span class="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="edit-item-name" 
                value="${item.name}" 
                required
                class="w-full bg-white border border-[#c0c8c3] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#00261a] focus:outline-none focus:border-[#00261a] focus:ring-2 focus:ring-[#00261a]/20 shadow-inner"
              />
            </div>

            <!-- Merk / Brand -->
            <div>
              <label class="block text-xs font-mono font-bold text-[#00261a] uppercase mb-1">
                Merek / Brand
              </label>
              <input 
                type="text" 
                id="edit-item-brand" 
                value="${item.brand || ''}" 
                class="w-full bg-white border border-[#c0c8c3] rounded-xl px-3.5 py-2.5 text-sm text-[#00261a] focus:outline-none focus:border-[#00261a]"
              />
            </div>

            <!-- Kategori -->
            <div>
              <label class="block text-xs font-mono font-bold text-[#00261a] uppercase mb-1">
                Kategori
              </label>
              <select 
                id="edit-item-category"
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
                id="edit-item-location" 
                value="${item.location || 'Kamar Kos'}" 
                class="w-full bg-white border border-[#c0c8c3] rounded-xl px-3.5 py-2.5 text-sm text-[#00261a] focus:outline-none focus:border-[#00261a]"
              />
            </div>

            <!-- Kondisi Barang -->
            <div>
              <label class="block text-xs font-mono font-bold text-[#00261a] uppercase mb-1">
                Kondisi Fisik
              </label>
              <input 
                type="text" 
                id="edit-item-condition" 
                value="${item.condition || 'Fungsi 100% Normal'}" 
                class="w-full bg-white border border-[#c0c8c3] rounded-xl px-3.5 py-2.5 text-sm text-[#00261a] focus:outline-none focus:border-[#00261a]"
              />
            </div>

            <!-- Harga Beli -->
            <div>
              <label class="block text-xs font-mono font-bold text-[#00261a] uppercase mb-1">
                Harga Beli (IDR)
              </label>
              <input 
                type="number" 
                id="edit-item-purchase-price" 
                value="${item.purchasePrice || 0}" 
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
                id="edit-item-estimated-price" 
                value="${item.estimatedPrice || 0}" 
                required
                min="0"
                step="1000"
                class="w-full bg-white border border-[#c0c8c3] rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-[#00261a] focus:outline-none focus:border-[#00261a]"
              />
            </div>

            <!-- Status Zombie Checkbox & Days -->
            <div class="sm:col-span-2 bg-white p-3.5 rounded-xl border border-[#c0c8c3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label class="font-mono font-bold text-xs text-[#93000a] flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-outlined text-base">skull</span>
                  <span>Status Barang Zombie 🧟</span>
                </label>
                <p class="text-[11px] text-gray-500 font-sans">Tandai jika barang sudah lama mengendap/tidak dipakai</p>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1">
                  <span class="text-xs font-mono text-gray-600">Nganggur:</span>
                  <input 
                    type="number" 
                    id="edit-item-days" 
                    value="${item.lastUsedDaysAgo || 0}" 
                    min="0"
                    class="w-16 bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs font-mono text-center"
                  />
                  <span class="text-xs font-mono text-gray-600">Hari</span>
                </div>
                <input 
                  type="checkbox" 
                  id="edit-item-is-zombie" 
                  ${item.isZombie ? 'checked' : ''} 
                  class="w-5 h-5 accent-[#93000a] rounded cursor-pointer"
                />
              </div>
            </div>

            <!-- Catatan / Notes -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-mono font-bold text-[#00261a] uppercase mb-1">
                Catatan Lengkap
              </label>
              <textarea 
                id="edit-item-notes" 
                rows="2"
                class="w-full bg-white border border-[#c0c8c3] rounded-xl p-3 text-xs text-gray-800 focus:outline-none focus:border-[#00261a]"
              >${item.notes || ''}</textarea>
            </div>

          </div>

          <!-- Footer Action Buttons -->
          <div class="pt-3 border-t border-[#c0c8c3] flex items-center justify-end gap-3">
            <button 
              type="button" 
              id="btn-cancel-edit-item" 
              class="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-all"
            >
              Batal
            </button>
            <button 
              type="submit" 
              class="bg-[#00261a] hover:bg-[#063d2b] text-[#fed255] font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg transition-all border border-[#fed255]/40"
            >
              <span class="material-symbols-outlined text-base">save</span>
              <span>Simpan Perubahan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  `;
}
