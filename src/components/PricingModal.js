export function renderPricingModal({ isOpen, itemCount, onClose, onJoinWaitlist }) {
  if (!isOpen) return '';

  return `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div class="bg-[#f7f3e8] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border-2 border-[#00261a]">
        
        <!-- Header -->
        <div class="bg-[#00261a] text-white p-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#fed255] text-2xl">workspace_premium</span>
            <div>
              <h2 class="font-mono font-bold text-base text-[#fed255]">HARTAKU PRO & PLAN SUBSCRIPTION</h2>
              <p class="text-xs text-emerald-200 font-sans">Bebaskan rumahmu dari barang zombie tanpa batas scan</p>
            </div>
          </div>
          <button id="btn-close-pricing-modal" class="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div class="p-6 space-y-6">
          
          <!-- Usage Progress Bar -->
          <div class="bg-white p-4 rounded-xl border border-[#c0c8c3] shadow-sm">
            <div class="flex items-center justify-between text-xs font-mono font-bold text-gray-700 mb-1.5">
              <span>FREEMIUM USAGE STATS:</span>
              <span class="text-[#00261a]">${itemCount} / 30 BARANG TERAWASI (GRATIS)</span>
            </div>
            <div class="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
              <div class="bg-[#10b981] h-full rounded-full transition-all" style="width: ${Math.min(100, (itemCount / 30) * 100)}%"></div>
            </div>
            <p class="text-[11px] text-gray-500 font-mono mt-1.5">
              💡 Masih tersisa ${Math.max(0, 30 - itemCount)} slot gratis untuk akun kamu. Upgrade ke Pro untuk scan tanpa batas.
            </p>
          </div>

          <!-- Pricing Tiers Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <!-- Freemium Tier -->
            <div class="bg-white p-5 rounded-2xl border-2 border-gray-300 shadow-sm flex flex-col justify-between">
              <div>
                <div class="font-mono font-bold text-xs text-gray-500 uppercase">AKUN BASIC</div>
                <div class="text-2xl font-mono font-extrabold text-[#00261a] my-1">GRATIS</div>
                <p class="text-xs text-gray-600 mb-4 font-sans">Cocok untuk anak kos yang baru mau inventaris kamar.</p>
                
                <ul class="text-xs space-y-2 text-gray-700 font-sans">
                  <li class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-600 text-base">check</span>
                    <span>Maksimal 30 barang scan</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-600 text-base">check</span>
                    <span>WhatsApp Bot Integration</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-600 text-base">check</span>
                    <span>Basic Barang Zombie Radar</span>
                  </li>
                </ul>
              </div>

              <div class="mt-6">
                <button class="w-full bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs cursor-default">
                  Plan Saat Ini
                </button>
              </div>
            </div>

            <!-- Pro Subscription Tier -->
            <div class="passbook-cover p-5 rounded-2xl border-2 border-[#fed255] text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div class="absolute -right-4 -top-4 bg-[#fed255] text-[#00261a] text-[10px] font-mono font-extrabold px-6 py-1 rotate-12 shadow">
                REKOMENDASI
              </div>

              <div>
                <div class="font-mono font-bold text-xs text-[#fed255] uppercase">HARTAKU PRO</div>
                <div class="text-2xl font-mono font-extrabold text-white my-1">
                  Rp 19.000 <span class="text-xs font-normal text-emerald-200">/ bulan</span>
                </div>
                <p class="text-xs text-emerald-100 mb-4 font-sans">Untuk penghuni rumah & kolektor yang mau hasil maksimal.</p>
                
                <ul class="text-xs space-y-2 text-emerald-50 font-sans">
                  <li class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#fed255] text-base">star</span>
                    <span><b>Unlimited Scan</b> Foto via WA</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#fed255] text-base">star</span>
                    <span>Automatic Listing Tokopedia/Shopee</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#fed255] text-base">star</span>
                    <span>Reminder Garansi & Servis Rutin</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#fed255] text-base">star</span>
                    <span>Export Laporan Asuransi (PDF/CSV)</span>
                  </li>
                </ul>
              </div>

              <div class="mt-6">
                <form id="form-join-waitlist" class="space-y-2">
                  <input type="email" id="waitlist-email" required placeholder="Masukkan Email atau WA Kamu..." class="w-full bg-white text-gray-900 border border-[#fed255] rounded-xl px-3 py-2 text-xs focus:outline-none font-sans" />
                  <button type="submit" class="w-full bg-[#fed255] hover:bg-yellow-400 text-[#00261a] font-bold py-2.5 rounded-xl text-xs shadow-md transition-all">
                    Gabung Waitlist Pro & Dapatkan Diskonto 50%
                  </button>
                </form>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  `;
}
