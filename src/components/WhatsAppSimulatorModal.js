import { PRESET_SCAN_ITEMS } from '../data/sampleItems.js';

export function renderWhatsAppSimulatorModal({ isOpen, messages, isScanning, onSendMessage, onAddPresetItem, onClose }) {
  if (!isOpen) return '';

  const presetButtonsHTML = PRESET_SCAN_ITEMS.map((item, idx) => `
    <button data-preset-idx="${idx}" class="btn-preset-item bg-[#f7f3e8] hover:bg-[#fed255]/30 text-[#00261a] border border-[#c0c8c3] px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all text-left">
      <img src="${item.imageUrl}" alt="${item.title}" class="w-8 h-8 rounded object-cover border border-[#c0c8c3]" />
      <div class="truncate max-w-[150px]">
        <div class="font-bold truncate">${item.title}</div>
        <div class="text-[10px] text-gray-500">${item.category}</div>
      </div>
    </button>
  `).join('');

  const chatMessagesHTML = messages.map(msg => {
    if (msg.sender === 'user') {
      return `
        <div class="flex justify-end mb-3">
          <div class="bg-[#d9fdd3] text-[#111b21] p-3 rounded-2xl rounded-tr-none max-w-[85%] sm:max-w-[75%] shadow-sm border border-emerald-200">
            ${msg.image ? `<img src="${msg.image}" alt="Upload" class="w-full max-h-48 object-cover rounded-xl mb-2 border border-emerald-300" />` : ''}
            <p class="text-sm font-sans whitespace-pre-line">${msg.text}</p>
            <div class="text-[10px] text-gray-500 text-right mt-1 font-mono">${msg.time} • Sent</div>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="flex justify-start mb-4">
          <div class="bg-white text-[#111b21] p-3.5 rounded-2xl rounded-tl-none max-w-[90%] sm:max-w-[80%] shadow border border-gray-200">
            <div class="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-[#006c49]">
              <span class="material-symbols-outlined text-base">smart_toy</span>
              <span>Hartaku AI Bot</span>
            </div>
            <div class="text-sm font-sans leading-relaxed whitespace-pre-line">${msg.text}</div>
            ${msg.itemData ? `
              <div class="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                <div class="text-xs font-mono text-[#755b00]">
                  Est. Pasar: <b>Rp ${new Intl.NumberFormat('id-ID').format(msg.itemData.estimatedPrice)}</b>
                </div>
                <button data-add-item-id="${msg.itemData.id}" class="btn-confirm-add-item bg-[#00261a] hover:bg-[#063d2b] text-[#fed255] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all">
                  <span class="material-symbols-outlined text-sm">bookmark_add</span>
                  <span>+ Simpan ke Buku</span>
                </button>
              </div>
            ` : ''}
            <div class="text-[10px] text-gray-400 text-right mt-1 font-mono">${msg.time}</div>
          </div>
        </div>
      `;
    }
  }).join('');

  return `
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div class="bg-[#efeae2] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[700px] border-2 border-[#00261a]">
        
        <!-- WA Header -->
        <div class="bg-[#075e54] text-white p-3.5 flex items-center justify-between shadow-md">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-[#25d366] rounded-full flex items-center justify-center font-bold text-white shadow-inner">
              <span class="material-symbols-outlined text-2xl">center_focus_strong</span>
            </div>
            <div>
              <div class="font-bold text-base flex items-center gap-2">
                <span>Hartaku AI Bot (WhatsApp)</span>
                <span class="bg-emerald-800 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded font-mono">OFFICIAL</span>
              </div>
              <p class="text-xs text-emerald-100 flex items-center gap-1">
                <span class="w-2 h-2 bg-emerald-400 rounded-full inline-block animate-pulse"></span>
                Online — Zero Friction Inventory Bot
              </p>
            </div>
          </div>
          <button id="btn-close-wa-modal" class="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-all">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <!-- Presets quick pick bar -->
        <div class="bg-[#f0f2f5] p-2.5 border-b border-gray-300">
          <div class="text-[11px] font-mono font-bold text-gray-600 mb-1.5 flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">touch_app</span>
            <span>SIMULASI SCAN CEPAT (Klik preset barang di bawah):</span>
          </div>
          <div class="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            ${presetButtonsHTML}
          </div>
        </div>

        <!-- Chat messages container -->
        <div id="wa-chat-container" class="flex-1 p-4 overflow-y-auto custom-scrollbar bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
          ${chatMessagesHTML}
          ${isScanning ? `
            <div class="flex justify-start mb-3">
              <div class="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow flex items-center gap-2 text-sm text-emerald-800 font-mono">
                <span class="material-symbols-outlined animate-spin text-emerald-600">sync</span>
                <span>AI Vision sedang mendeteksi barang & riset harga pasar...</span>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- WA Input bar -->
        <form id="form-wa-send" class="bg-[#f0f2f5] p-3 flex items-center gap-2 border-t border-gray-300">
          <label class="cursor-pointer text-gray-600 hover:text-emerald-700 p-2 rounded-full hover:bg-gray-200 transition-all" title="Upload Foto Barang">
            <input type="file" id="file-upload-input" accept="image/*" class="hidden" />
            <span class="material-symbols-outlined text-2xl">photo_camera</span>
          </label>
          <input type="text" id="wa-input-text" placeholder="Ketik nama barang atau deskripsi foto..." class="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#075e54]" />
          <button type="submit" class="bg-[#075e54] hover:bg-[#064e46] text-white p-2.5 rounded-full flex items-center justify-center transition-all shadow">
            <span class="material-symbols-outlined text-xl">send</span>
          </button>
        </form>

      </div>
    </div>
  `;
}
