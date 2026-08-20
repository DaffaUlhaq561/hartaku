import './style.css';
import { INITIAL_ITEMS, PRESET_SCAN_ITEMS } from './data/sampleItems.js';
import { renderNavbar } from './components/Navbar.js';
import { renderPassbookDashboard } from './components/PassbookDashboard.js';
import { renderZombieRadarSection } from './components/ZombieRadarSection.js';
import { renderWhatsAppSimulatorModal } from './components/WhatsAppSimulatorModal.js';
import { renderMarketplaceGeneratorModal } from './components/MarketplaceGeneratorModal.js';
import { renderSocialShareModal } from './components/SocialShareModal.js';
import { renderPricingModal } from './components/PricingModal.js';
import { renderScanVerificationModal } from './components/ScanVerificationModal.js';
import { renderEditItemModal } from './components/EditItemModal.js';

// ─── State Management ──────────────────────────────────────────────────────────

function loadInitialItems() {
  const saved = localStorage.getItem('hartaku_inventory_v1');
  if (saved) {
    try { return JSON.parse(saved); } catch {}
  }
  return INITIAL_ITEMS;
}
function saveItems(items) {
  localStorage.setItem('hartaku_inventory_v1', JSON.stringify(items));
}

const state = {
  items: loadInitialItems(),

  // Navigation
  activeView: 'dashboard', // 'dashboard' | 'zombie-radar'

  // Dashboard Filters
  activeRoomFilter: 'Semua Ruangan',
  activeCategoryFilter: 'Semua Kategori',
  searchQuery: '',
  onlyZombies: false,

  // Modals
  isWASimulatorOpen: false,
  isMarketplaceModalOpen: false,
  isShareModalOpen: false,
  isPricingModalOpen: false,
  selectedItemForListing: null,
  activePlatform: 'tokopedia',

  // Verification & Edit Modals
  isScanVerificationModalOpen: false,
  scannedPendingData: null,
  isEditModalOpen: false,
  editingItem: null,

  // Direct AI Scan State
  isScanning: false,

  // WA Simulator
  waScanningState: false,
  waMessages: [
    {
      sender: 'bot',
      text: `👋 Selamat datang di *Hartaku AI Bot*!\n\nKirimkan foto barang di kamar kos, lemari, atau gudangmu. AI kami akan otomatis kasih nama, kategori, estimasi harga pasar Tokopedia/Shopee, dan stempel *Barang Zombie*!`,
      time: '09:41'
    }
  ],

  toast: null
};

// ─── Toast Notification ─────────────────────────────────────────────────────────

function showToast(message, type = 'success') {
  state.toast = { message, type };
  renderApp();
  setTimeout(() => { state.toast = null; renderApp(); }, 3500);
}

function renderToast() {
  if (!state.toast) return '';
  const isSuccess = state.toast.type === 'success';
  return `
    <div class="fixed bottom-6 right-6 z-[100] ${isSuccess ? 'bg-[#00261a] text-[#fed255] border-[#10b981]' : 'bg-[#93000a] text-white border-red-400'} border-2 px-5 py-3.5 rounded-2xl shadow-2xl font-mono text-xs flex items-center gap-2 animate-bounce max-w-xs sm:max-w-sm">
      <span class="material-symbols-outlined text-lg">${isSuccess ? 'check_circle' : 'error'}</span>
      <span class="leading-snug">${state.toast.message}</span>
    </div>
  `;
}

// ─── Tab Navigation Bar ─────────────────────────────────────────────────────────

function renderTabNav() {
  const zombieCount = state.items.filter(i => i.isZombie).length;
  return `
    <div class="bg-[#0f3d2e] border-b border-emerald-900/60 sticky top-[80px] z-20 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-0 overflow-x-auto">
          <button id="tab-dashboard" data-view="dashboard" 
            class="tab-btn px-5 py-3.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap border-b-2 ${state.activeView === 'dashboard' ? 'text-[#fed255] border-[#fed255]' : 'text-emerald-200/70 border-transparent hover:text-emerald-200 hover:border-emerald-700'}">
            <span class="material-symbols-outlined text-base">menu_book</span>
            <span>Buku Inventaris</span>
            <span class="bg-[#fed255]/20 text-[#fed255] text-[10px] px-1.5 py-0.5 rounded font-mono">${state.items.length}</span>
          </button>
          <button id="tab-zombie" data-view="zombie-radar" 
            class="tab-btn px-5 py-3.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all whitespace-nowrap border-b-2 ${state.activeView === 'zombie-radar' ? 'text-[#fed255] border-[#fed255]' : 'text-emerald-200/70 border-transparent hover:text-emerald-200 hover:border-emerald-700'}">
            <span class="material-symbols-outlined text-base">skull</span>
            <span>Zombie Radar</span>
            ${zombieCount > 0 ? `<span class="bg-[#ba1a1a] text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-black animate-pulse">${zombieCount}</span>` : ''}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderScanningOverlay() {
  if (!state.isScanning) return '';
  return `
    <div class="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-[#00261a] border-2 border-[#fed255] rounded-3xl p-8 text-center text-white max-w-sm w-full shadow-2xl space-y-4">
        <div class="w-20 h-20 bg-[#fed255] text-[#00261a] rounded-full flex items-center justify-center mx-auto font-extrabold shadow-xl animate-bounce">
          <span class="material-symbols-outlined text-4xl animate-spin">center_focus_strong</span>
        </div>
        <div>
          <h3 class="text-xl font-bold font-mono text-[#fed255] tracking-wide">Memindai Gambar...</h3>
          <p class="text-xs text-emerald-200/90 font-sans mt-1">Menjalankan YOLO (best.pt) & OpenAI Vision AI...</p>
        </div>
        <div class="w-full bg-emerald-950 rounded-full h-2 overflow-hidden border border-emerald-700/50">
          <div class="bg-[#fed255] h-full animate-pulse w-3/4"></div>
        </div>
      </div>
    </div>
  `;
}

// ─── Core Render ──────────────────────────────────────────────────────────────

function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const totalValue = state.items.reduce((acc, c) => acc + c.estimatedPrice, 0);
  const zombieCount = state.items.filter(i => i.isZombie).length;

  const navbarHTML = renderNavbar({
    totalValue,
    itemCount: state.items.length,
    zombieCount,
  });

  const tabNavHTML = renderTabNav();

  let mainContentHTML = '';
  if (state.activeView === 'dashboard') {
    mainContentHTML = renderPassbookDashboard({
      items: state.items,
      activeRoomFilter: state.activeRoomFilter,
      activeCategoryFilter: state.activeCategoryFilter,
      searchQuery: state.searchQuery,
      onlyZombies: state.onlyZombies,
    });
  } else {
    mainContentHTML = renderZombieRadarSection({
      items: state.items,
    });
  }

  const waModalHTML = renderWhatsAppSimulatorModal({
    isOpen: state.isWASimulatorOpen,
    messages: state.waMessages,
    isScanning: state.waScanningState,
  });

  const marketplaceModalHTML = renderMarketplaceGeneratorModal({
    isOpen: state.isMarketplaceModalOpen,
    item: state.selectedItemForListing,
    activePlatform: state.activePlatform,
  });

  const shareModalHTML = renderSocialShareModal({
    isOpen: state.isShareModalOpen,
    totalValue,
    itemCount: state.items.length,
    zombieCount,
  });

  const pricingModalHTML = renderPricingModal({
    isOpen: state.isPricingModalOpen,
    itemCount: state.items.length,
  });

  const scanVerificationModalHTML = renderScanVerificationModal({
    isOpen: state.isScanVerificationModalOpen,
    scannedData: state.scannedPendingData,
  });

  const editModalHTML = renderEditItemModal({
    isOpen: state.isEditModalOpen,
    item: state.editingItem,
  });

  appContainer.innerHTML = `
    <div class="min-h-screen flex flex-col">
      <input type="file" id="direct-scan-input" accept="image/*" style="display:none;" />
      ${navbarHTML}
      ${tabNavHTML}
      <div class="flex-1">
        ${mainContentHTML}
      </div>
      ${waModalHTML}
      ${marketplaceModalHTML}
      ${shareModalHTML}
      ${pricingModalHTML}
      ${scanVerificationModalHTML}
      ${editModalHTML}
      ${renderScanningOverlay()}
      ${renderToast()}
    </div>
  `;

  attachEventListeners();
}

// ─── Direct AI Scan Handler ──────────────────────────────────────────────────

async function handleDirectScan(file) {
  if (!file) return;

  state.isScanning = true;
  renderApp();

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/scan', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Server HTTP error status ${response.status}`);
    }

    const data = await response.json();
    state.isScanning = false;

    if (data.success) {
      const itemName = data.detected_item && data.detected_item !== 'Tidak Terdeteksi' 
        ? data.detected_item 
        : 'Barang Terdeteksi';
        
      const category = data.openai_analysis?.category || 'Elektronik';
      const description = data.openai_analysis?.description || data.message || 'Hasil pemindaian otomatis AI Vision.';
      const randomPrice = Math.floor(300 + Math.random() * 4000) * 1000;
      const isZombie = Math.random() > 0.5;

      const previewUrl = URL.createObjectURL(file);
      const sourceBadge = data.source === 'openai_corrected' 
        ? 'Dikoreksi OpenAI Vision' 
        : (data.source.includes('yolo') ? 'Model YOLO (best.pt)' : 'OpenAI Vision');

      state.scannedPendingData = {
        name: itemName,
        brand: data.source === 'openai_corrected' ? 'Koreksi OpenAI' : (data.source.includes('yolo') ? 'Model YOLO' : 'AI Vision'),
        category: category,
        location: 'Kamar Kos',
        purchasePrice: Math.round(randomPrice * 1.35),
        estimatedPrice: randomPrice,
        isZombie: isZombie,
        notes: description,
        imageUrl: previewUrl,
        sourceBadge: sourceBadge
      };

      state.isScanVerificationModalOpen = true;
      showToast(`🔍 Hasil scan siap diverifikasi! Silakan periksa detailnya.`);
    } else {
      showToast('Gagal scan: ' + (data.message || 'Error tidak diketahui'), 'error');
    }
  } catch (err) {
    console.error('API Scan Error:', err);
    state.isScanning = false;
    showToast('⚠️ Gagal terhubung ke Backend FastAPI (http://localhost:8000/scan). Pastikan uvicorn berjalan.', 'error');
  }

  renderApp();
}

// ─── Event Handling ──────────────────────────────────────────────────────────

function handleSendMessage(text, image = null) {
  const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  state.waMessages.push({ sender: 'user', text, image, time });
  state.waScanningState = true;
  renderApp();
  const container = document.getElementById('wa-chat-container');
  if (container) container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    state.waScanningState = false;
    const newId = `HRT-${Math.floor(10000 + Math.random() * 90000)}`;
    const randomPrice = Math.floor(300 + Math.random() * 4500) * 1000;
    const isZombie = Math.random() > 0.5;
    const newItem = {
      id: newId,
      name: text.length > 5 ? text : 'Barang Elektronik Kamar Kos',
      brand: 'Lokal / Impors',
      category: 'Elektronik',
      location: 'Kamar Kos',
      purchasePrice: Math.round(randomPrice * 1.4),
      resalePriceMin: Math.round(randomPrice * 0.9),
      resalePriceMax: Math.round(randomPrice * 1.1),
      estimatedPrice: randomPrice,
      purchaseDate: new Date().toISOString().split('T')[0],
      lastUsedDaysAgo: isZombie ? 85 : 5,
      isZombie,
      warrantyUntil: 'Expired',
      condition: 'Fungsi 100% Normal Mulus',
      notes: 'Di-scan via WhatsApp AI Vision.',
      imageUrl: image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&q=80'
    };

    const formattedP = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(randomPrice);
    state.waMessages.push({
      sender: 'bot',
      text: `🔍 *BERHASIL TERDETEKSI VIA AI VISION!*\n\n• *Nama*: ${newItem.name}\n• *Kategori*: ${newItem.category}\n• *Lokasi*: ${newItem.location}\n• *Status*: ${newItem.isZombie ? '🧟 BARANG ZOMBIE (Nganggur 85 Hari)' : '✅ Terpakai Aktif'}\n• *Estimasi Pasar*: *${formattedP}*\n\nKlik tombol di bawah untuk langsung masukkan ke Buku Tabungan Hartaku!`,
      itemData: newItem,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });
    renderApp();
    const chatBox = document.getElementById('wa-chat-container');
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
  }, 1800);
}

function handleAddPresetItem(presetIdx) {
  const preset = PRESET_SCAN_ITEMS[presetIdx];
  if (!preset) return;
  handleSendMessage(`Saya baru saja scan ${preset.title}`, preset.imageUrl);
}

function attachEventListeners() {

  // ── Tab Navigation ──
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeView = btn.dataset.view;
      renderApp();
    });
  });

  // ── Direct Scan File Input ──
  const fileInput = document.getElementById('direct-scan-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleDirectScan(e.target.files[0]);
        e.target.value = ''; // Reset input
      }
    });
  }

  // ── Trigger Direct Scan File Picker Buttons ──
  const triggerScan = () => {
    const input = document.getElementById('direct-scan-input');
    if (input) input.click();
  };

  document.getElementById('btn-direct-scan-nav')?.addEventListener('click', triggerScan);
  document.getElementById('btn-direct-scan-hero')?.addEventListener('click', triggerScan);
  document.getElementById('btn-open-wa-nav')?.addEventListener('click', triggerScan);
  document.getElementById('btn-open-wa-hero')?.addEventListener('click', triggerScan);
  document.getElementById('btn-open-zombie-nav')?.addEventListener('click', () => {
    state.activeView = 'zombie-radar';
    renderApp();
  });
  document.getElementById('btn-open-share-nav')?.addEventListener('click', () => { state.isShareModalOpen = true; renderApp(); });
  document.getElementById('btn-open-pricing-nav')?.addEventListener('click', () => { state.isPricingModalOpen = true; renderApp(); });

  // ── Dashboard Filters ──
  const searchInput = document.getElementById('input-search-items');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderApp();
      const newSearch = document.getElementById('input-search-items');
      if (newSearch) { newSearch.focus(); newSearch.setSelectionRange(newSearch.value.length, newSearch.value.length); }
    });
  }

  document.getElementById('btn-toggle-only-zombies')?.addEventListener('click', () => { state.onlyZombies = !state.onlyZombies; renderApp(); });
  document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
    state.searchQuery = '';
    state.activeRoomFilter = 'Semua Ruangan';
    state.activeCategoryFilter = 'Semua Kategori';
    state.onlyZombies = false;
    renderApp();
  });

  document.querySelectorAll('.btn-filter-room').forEach(btn => {
    btn.addEventListener('click', () => { state.activeRoomFilter = btn.dataset.room; renderApp(); });
  });
  document.querySelectorAll('.btn-filter-category').forEach(btn => {
    btn.addEventListener('click', () => { state.activeCategoryFilter = btn.dataset.category; renderApp(); });
  });

  // ── Table Row Actions (Dashboard) ──
  document.querySelectorAll('.btn-jual-one-tap').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedItemForListing = state.items.find(i => i.id === btn.dataset.itemId);
      state.isMarketplaceModalOpen = true;
      renderApp();
    });
  });
  document.querySelectorAll('.btn-mark-used').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.markUsedId;
      state.items = state.items.map(i => i.id === id ? { ...i, isZombie: false, lastUsedDaysAgo: 1 } : i);
      saveItems(state.items);
      showToast(`Stempel zombie dihapus — barang ${id} aktif terpakai!`);
    });
  });
  document.querySelectorAll('.btn-delete-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.deleteId;
      state.items = state.items.filter(i => i.id !== id);
      saveItems(state.items);
      showToast(`Barang ${id} berhasil dihapus dari Buku Tabungan.`);
    });
  });

  // ── Zombie Radar Actions ──
  document.querySelectorAll('.btn-zombie-jual').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedItemForListing = state.items.find(i => i.id === btn.dataset.jualItemId);
      state.isMarketplaceModalOpen = true;
      renderApp();
    });
  });
  document.querySelectorAll('.btn-zombie-kepake').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.kepakeItemId;
      state.items = state.items.map(i => i.id === id ? { ...i, isZombie: false, lastUsedDaysAgo: 1 } : i);
      saveItems(state.items);
      showToast(`Barang ${id} dilepas dari status zombie! Tandai dipakai.`);
    });
  });
  document.querySelectorAll('.btn-zombie-hibah').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.hibahItemId;
      state.items = state.items.filter(i => i.id !== id);
      saveItems(state.items);
      showToast(`Barang ${id} siap dihibahkan. Terima kasih berbagi! ❤️`);
    });
  });
  document.getElementById('btn-likuidasi-semua')?.addEventListener('click', () => {
    const zombies = state.items.filter(i => i.isZombie);
    if (zombies.length > 0) {
      state.selectedItemForListing = zombies[0];
      state.isMarketplaceModalOpen = true;
      renderApp();
      showToast(`Membuka listing generator untuk ${zombies[0].name}...`);
    }
  });

  // ── WA Simulator ──
  document.getElementById('btn-close-wa-modal')?.addEventListener('click', () => { state.isWASimulatorOpen = false; renderApp(); });
  document.querySelectorAll('.btn-preset-item').forEach(btn => {
    btn.addEventListener('click', () => handleAddPresetItem(parseInt(btn.dataset.presetIdx)));
  });
  document.getElementById('file-upload-input')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => handleSendMessage(`Upload foto barang: ${file.name}`, evt.target.result);
      reader.readAsDataURL(file);
    }
  });
  document.getElementById('form-wa-send')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('wa-input-text');
    if (input?.value.trim()) { handleSendMessage(input.value.trim()); input.value = ''; }
  });
  document.querySelectorAll('.btn-confirm-add-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.addItemId;
      const msg = state.waMessages.find(m => m.itemData?.id === id);
      if (msg?.itemData) {
        state.items.unshift(msg.itemData);
        saveItems(state.items);
        showToast(`✅ "${msg.itemData.name}" berhasil dicatat ke Buku Tabungan!`);
        state.isWASimulatorOpen = false;
        renderApp();
      }
    });
  });

  // ── Marketplace Modal ──
  document.getElementById('btn-close-marketplace-modal')?.addEventListener('click', () => { state.isMarketplaceModalOpen = false; renderApp(); });
  document.getElementById('btn-done-marketplace')?.addEventListener('click', () => { state.isMarketplaceModalOpen = false; renderApp(); });
  document.querySelectorAll('.btn-select-platform').forEach(btn => {
    btn.addEventListener('click', () => { state.activePlatform = btn.dataset.platform; renderApp(); });
  });
  document.getElementById('btn-copy-title')?.addEventListener('click', () => {
    if (state.selectedItemForListing) {
      navigator.clipboard.writeText(`[BEKAS SANGAT RAWAT] ${state.selectedItemForListing.name} - Kondisi Mulus Ready`);
      showToast('Judul listing berhasil disalin! 📋');
    }
  });
  document.getElementById('btn-copy-description')?.addEventListener('click', () => {
    const el = document.getElementById('marketplace-desc-textarea');
    if (el) { navigator.clipboard.writeText(el.value); showToast('Deskripsi lengkap berhasil disalin! Tinggal paste ke marketplace 📋'); }
  });

  // ── Share Modal ──
  document.getElementById('btn-close-share-modal')?.addEventListener('click', () => { state.isShareModalOpen = false; renderApp(); });
  document.getElementById('btn-copy-share-link')?.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link tantangan #BerapaTotalHartamu berhasil disalin! 🚀');
  });

  // ── Pricing Modal ──
  document.getElementById('btn-close-pricing-modal')?.addEventListener('click', () => { state.isPricingModalOpen = false; renderApp(); });
  document.getElementById('form-join-waitlist')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('waitlist-email');
    if (emailInput?.value) {
      showToast(`Terima kasih! ${emailInput.value} terdaftar ke Waitlist Pro 🌟`);
      state.isPricingModalOpen = false;
      renderApp();
    }
  });

  // ── Scan Verification Modal Form Submit ──
  document.getElementById('form-scan-verification')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('verify-item-name')?.value.trim();
    const category = document.getElementById('verify-item-category')?.value;
    const location = document.getElementById('verify-item-location')?.value.trim();
    const purchasePrice = parseFloat(document.getElementById('verify-item-purchase-price')?.value) || 0;
    const estimatedPrice = parseFloat(document.getElementById('verify-item-estimated-price')?.value) || 0;
    const isZombie = document.getElementById('verify-item-is-zombie')?.checked || false;
    const notes = document.getElementById('verify-item-notes')?.value.trim();

    if (name && state.scannedPendingData) {
      const newItem = {
        id: `HRT-${Math.floor(10000 + Math.random() * 90000)}`,
        name,
        brand: state.scannedPendingData.brand || 'Lokal',
        category: category || 'Elektronik',
        location: location || 'Kamar Kos',
        purchasePrice,
        resalePriceMin: Math.round(estimatedPrice * 0.85),
        resalePriceMax: Math.round(estimatedPrice * 1.15),
        estimatedPrice,
        purchaseDate: new Date().toISOString().split('T')[0],
        lastUsedDaysAgo: isZombie ? 75 : 2,
        isZombie,
        warrantyUntil: 'Expired',
        condition: 'Mulus 100% Normal',
        notes: notes || 'Verifikasi manual hasil scan AI.',
        imageUrl: state.scannedPendingData.imageUrl
      };

      state.items.unshift(newItem);
      saveItems(state.items);
      state.isScanVerificationModalOpen = false;
      state.scannedPendingData = null;
      showToast(`✅ "${newItem.name}" berhasil diverifikasi & ditambahkan!`);
      renderApp();
    }
  });

  const closeVerifyModal = () => {
    state.isScanVerificationModalOpen = false;
    state.scannedPendingData = null;
    renderApp();
  };
  document.getElementById('btn-cancel-verify-scan')?.addEventListener('click', closeVerifyModal);
  document.getElementById('btn-close-verify-modal')?.addEventListener('click', closeVerifyModal);

  // ── Edit Item Modal Handlers ──
  document.querySelectorAll('.btn-edit-item, .btn-zombie-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.editId || btn.dataset.editItemId;
      const targetItem = state.items.find(i => i.id === id);
      if (targetItem) {
        state.editingItem = { ...targetItem };
        state.isEditModalOpen = true;
        renderApp();
      }
    });
  });

  document.getElementById('form-edit-item')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.editingItem) return;

    const name = document.getElementById('edit-item-name')?.value.trim();
    const brand = document.getElementById('edit-item-brand')?.value.trim();
    const category = document.getElementById('edit-item-category')?.value;
    const location = document.getElementById('edit-item-location')?.value.trim();
    const condition = document.getElementById('edit-item-condition')?.value.trim();
    const purchasePrice = parseFloat(document.getElementById('edit-item-purchase-price')?.value) || 0;
    const estimatedPrice = parseFloat(document.getElementById('edit-item-estimated-price')?.value) || 0;
    const days = parseInt(document.getElementById('edit-item-days')?.value) || 0;
    const isZombie = document.getElementById('edit-item-is-zombie')?.checked || false;
    const notes = document.getElementById('edit-item-notes')?.value.trim();

    if (name) {
      state.items = state.items.map(item => {
        if (item.id === state.editingItem.id) {
          return {
            ...item,
            name,
            brand: brand || item.brand,
            category: category || item.category,
            location: location || item.location,
            condition: condition || item.condition,
            purchasePrice,
            estimatedPrice,
            resalePriceMin: Math.round(estimatedPrice * 0.85),
            resalePriceMax: Math.round(estimatedPrice * 1.15),
            lastUsedDaysAgo: days,
            isZombie,
            notes: notes || item.notes
          };
        }
        return item;
      });

      saveItems(state.items);
      state.isEditModalOpen = false;
      state.editingItem = null;
      showToast(`✅ Barang "${name}" berhasil diperbarui!`);
      renderApp();
    }
  });

  const closeEditModal = () => {
    state.isEditModalOpen = false;
    state.editingItem = null;
    renderApp();
  };
  document.getElementById('btn-close-edit-modal')?.addEventListener('click', closeEditModal);
  document.getElementById('btn-cancel-edit-item')?.addEventListener('click', closeEditModal);
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
