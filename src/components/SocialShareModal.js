export function renderSocialShareModal({ isOpen, totalValue, itemCount, zombieCount, onCopyShareLink, onClose }) {
  if (!isOpen) return '';

  const formattedTotal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalValue);

  return `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div class="bg-[#f7f3e8] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-2 border-[#00261a]">
        
        <!-- Header -->
        <div class="bg-[#00261a] text-white p-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#fed255] text-2xl">share</span>
            <div>
              <h2 class="font-mono font-bold text-base text-[#fed255]">BAGIKAN "TOTAL HARTAKU"</h2>
              <p class="text-xs text-emerald-200 font-sans">Tantangan Viral #BerapaTotalHartamu</p>
            </div>
          </div>
          <button id="btn-close-share-modal" class="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div class="p-5 space-y-4">
          
          <!-- Shareable Card Container -->
          <div id="shareable-certificate-card" class="passbook-cover rounded-2xl p-6 text-white text-center relative overflow-hidden shadow-xl border-4 border-[#fed255]">
            <div class="text-[10px] font-mono uppercase tracking-widest text-[#fed255] font-bold mb-1">
              • CERTIFIED HARTAKU PASSBOOK •
            </div>
            
            <h3 class="text-lg font-extrabold text-white mb-3">Tantangan: Berapa Total Hartamu?</h3>
            
            <div class="bg-[#0f3d2e] rounded-xl p-4 border border-emerald-500/40 my-3 shadow-inner">
              <div class="text-[11px] font-mono text-emerald-300 uppercase">TOTAL VALUE INVENTARIS</div>
              <div class="text-3xl font-mono font-bold text-[#fed255] my-1">${formattedTotal}</div>
              <div class="text-xs font-mono text-emerald-100 flex items-center justify-center gap-3">
                <span>📦 ${itemCount} Barang</span>
                <span>•</span>
                <span>🧟 ${zombieCount} Zombie</span>
              </div>
            </div>

            <!-- Green verification stamp -->
            <div class="green-stamp my-2 text-xs bg-[#beedd7] text-[#006c49]">
              <span class="material-symbols-outlined text-sm">verified</span>
              <span>VERIFIED BY HARTAKU AI</span>
            </div>

            <p class="text-[11px] text-emerald-200/80 font-sans italic mt-2">
              "Jangan sampai ada barang zombie mengendap di kos/rumahmu!"
            </p>
          </div>

          <!-- Share Actions -->
          <div class="space-y-2 pt-2">
            <button id="btn-copy-share-link" class="w-full bg-[#10b981] hover:bg-[#059669] text-[#00261a] font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow transition-all">
              <span class="material-symbols-outlined text-lg">link</span>
              <span>Salin Link Kartu Challenge</span>
            </button>

            <a href="https://api.whatsapp.com/send?text=Halo!%20Lihat%20rekap%20Total%20Hartaku%20di%20kosan%20sebesar%20${encodeURIComponent(formattedTotal)}.%20Coba%20hitung%20punyamu%20pake%20AI%20Hartaku%20di%20sini!" target="_blank" class="w-full bg-[#25d366] hover:bg-[#128c7e] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow transition-all">
              <span class="material-symbols-outlined text-lg">chat</span>
              <span>Kirim ke Grup WhatsApp</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  `;
}
