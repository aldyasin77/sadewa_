// Database layer for SADEWA (Sistem Aplikasi Data & Evaluasi Sewa Aset)
// Persisted in localStorage with relational integrity and automatic constraints

const KEY_OPD = 'sadewa_opd';
const KEY_SKEMA = 'sadewa_skema';
const KEY_RUANGAN = 'sadewa_ruangan';

const SEED_OPD = [
  { id: 1, nama_opd: "Dinas Pendidikan" },
  { id: 2, nama_opd: "Dinas Kesehatan" },
  { id: 3, nama_opd: "Dinas Perhubungan" },
  { id: 4, nama_opd: "Bapenda" },
  { id: 5, nama_opd: "Dinas Sosial" }
];

const SEED_SKEMA = [
  { id: 1, nama_skema: "Standard Kios Flat", tipe_ruangan: "Kios", jenis_tarif: "Flat Rate", harga_dasar: 1500000, status_aktif: true },
  { id: 2, nama_skema: "Kantin Cluster Utama", tipe_ruangan: "Kantin", jenis_tarif: "Cluster", harga_dasar: 2000000, status_aktif: true },
  { id: 3, nama_skema: "Fotocopy Per Meter", tipe_ruangan: "Fotocopy", jenis_tarif: "Per Meter Persegi", harga_dasar: 50000, status_aktif: true },
  { id: 4, nama_skema: "Skema Kios Nonaktif", tipe_ruangan: "Kios", jenis_tarif: "Flat Rate", harga_dasar: 1200000, status_aktif: false }
];

const SEED_RUANGAN = [
  { id: 1, opd_id: 1, skema_tarif_id: 1, nama_ruangan: "Kios A1 - Disdik", tipe_ruangan: "Kios", luas: 15, harga_bulan: 1500000, status_ruangan: "Tersedia" },
  { id: 2, opd_id: 2, skema_tarif_id: 2, nama_ruangan: "Kantin B3 - Dinkes", tipe_ruangan: "Kantin", luas: 20, harga_bulan: 2000000, status_ruangan: "Disewa" },
  { id: 3, opd_id: 3, skema_tarif_id: 3, nama_ruangan: "Fotocopy C1 - Dishub", tipe_ruangan: "Fotocopy", luas: 12, harga_bulan: 600000, status_ruangan: "Disewa" },
  { id: 4, opd_id: 4, skema_tarif_id: 1, nama_ruangan: "Kios D1 - Bapenda", tipe_ruangan: "Kios", luas: 10, harga_bulan: 1500000, status_ruangan: "Maintenance" }
];

// Helper to initialize and retrieve items
const getItem = (key, defaultVal) => {
  const val = localStorage.getItem(key);
  if (!val) {
    localStorage.setItem(key, JSON.stringify(defaultVal));
    return defaultVal;
  }
  try {
    return JSON.parse(val);
  } catch (e) {
    console.error("Failed parsing localStorage", key, e);
    return defaultVal;
  }
};

const saveItem = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
  notifySubscribers();
};

// Subscription model for reactive components
let subscribers = [];
export const subscribe = (callback) => {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter(sub => sub !== callback);
  };
};

const notifySubscribers = () => {
  subscribers.forEach(sub => {
    try { sub(); } catch (e) { console.error("Error in DB subscriber", e); }
  });
};

// Core Tables API
export const getOPDs = () => getItem(KEY_OPD, SEED_OPD);

export const getSkemaTarif = () => getItem(KEY_SKEMA, SEED_SKEMA);

export const getRuangan = () => getItem(KEY_RUANGAN, SEED_RUANGAN);

// Write Operations with Validation and Calculations
export const addSkemaTarif = (skema) => {
  // Validate
  if (!skema.nama_skema || !skema.nama_skema.trim()) throw new Error("Nama skema wajib diisi.");
  if (!skema.tipe_ruangan) throw new Error("Tipe ruangan wajib diisi.");
  if (!skema.jenis_tarif) throw new Error("Jenis tarif wajib diisi.");
  if (skema.harga_dasar === undefined || skema.harga_dasar === null || isNaN(skema.harga_dasar) || skema.harga_dasar < 0) {
    throw new Error("Harga dasar tidak boleh kosong atau negatif.");
  }

  const skemas = getSkemaTarif();
  const nextId = skemas.length > 0 ? Math.max(...skemas.map(s => s.id)) + 1 : 1;
  const newSkema = {
    id: nextId,
    nama_skema: skema.nama_skema.trim(),
    tipe_ruangan: skema.tipe_ruangan,
    jenis_tarif: skema.jenis_tarif,
    harga_dasar: Number(skema.harga_dasar),
    status_aktif: skema.status_aktif !== undefined ? !!skema.status_aktif : true
  };

  skemas.push(newSkema);
  saveItem(KEY_SKEMA, skemas);
  return newSkema;
};

export const updateSkemaTarif = (id, updatedFields) => {
  const skemas = getSkemaTarif();
  const index = skemas.findIndex(s => s.id === Number(id));
  if (index === -1) throw new Error("Skema tarif tidak ditemukan.");

  const merged = { ...skemas[index], ...updatedFields };

  // Validate
  if (!merged.nama_skema || !merged.nama_skema.trim()) throw new Error("Nama skema wajib diisi.");
  if (!merged.tipe_ruangan) throw new Error("Tipe ruangan wajib diisi.");
  if (!merged.jenis_tarif) throw new Error("Jenis tarif wajib diisi.");
  if (merged.harga_dasar === undefined || merged.harga_dasar === null || isNaN(merged.harga_dasar) || merged.harga_dasar < 0) {
    throw new Error("Harga dasar tidak boleh kosong atau negatif.");
  }

  skemas[index] = {
    ...skemas[index],
    nama_skema: merged.nama_skema.trim(),
    tipe_ruangan: merged.tipe_ruangan,
    jenis_tarif: merged.jenis_tarif,
    harga_dasar: Number(merged.harga_dasar),
    status_aktif: !!merged.status_aktif
  };

  saveItem(KEY_SKEMA, skemas);

  // If skema changes price or type, we must update ruangan monthly price
  recalculateAllRuanganPrices();

  return skemas[index];
};

export const deleteSkemaTarif = (id) => {
  const ruanganList = getRuangan();
  const isUsed = ruanganList.some(r => r.skema_tarif_id === Number(id));
  if (isUsed) {
    throw new Error("Skema tidak dapat dihapus karena sedang digunakan oleh data ruangan.");
  }

  const skemas = getSkemaTarif();
  const filtered = skemas.filter(s => s.id !== Number(id));
  saveItem(KEY_SKEMA, filtered);
};

export const addRuangan = (ruangan) => {
  // Validate
  if (!ruangan.nama_ruangan || !ruangan.nama_ruangan.trim()) throw new Error("Nama ruangan wajib diisi.");
  if (!ruangan.opd_id) throw new Error("OPD wajib dipilih.");
  if (!ruangan.skema_tarif_id) throw new Error("Skema tarif wajib dipilih.");
  if (!ruangan.status_ruangan) throw new Error("Status ruangan wajib dipilih.");

  // Check relationship
  const skemas = getSkemaTarif();
  const skema = skemas.find(s => s.id === Number(ruangan.skema_tarif_id));
  if (!skema) throw new Error("Skema tarif yang dipilih tidak valid.");
  if (!skema.status_aktif) throw new Error("Skema tarif yang dipilih tidak aktif.");

  const opds = getOPDs();
  const opd = opds.find(o => o.id === Number(ruangan.opd_id));
  if (!opd) throw new Error("OPD tidak valid.");

  // Area validation for per meter persegi
  let luas = 0;
  if (skema.jenis_tarif === "Per Meter Persegi") {
    if (ruangan.luas === undefined || ruangan.luas === null || isNaN(ruangan.luas) || ruangan.luas <= 0) {
      throw new Error("Luas ruangan harus bernilai positif untuk tarif Per Meter Persegi.");
    }
    luas = Number(ruangan.luas);
  } else {
    luas = ruangan.luas ? Number(ruangan.luas) : 0;
  }

  // Calculate Harga Bulan
  let harga_bulan = 0;
  if (skema.jenis_tarif === "Per Meter Persegi") {
    harga_bulan = skema.harga_dasar * luas;
  } else {
    harga_bulan = skema.harga_dasar;
  }

  const ruanganList = getRuangan();
  const nextId = ruanganList.length > 0 ? Math.max(...ruanganList.map(r => r.id)) + 1 : 1;

  const newRuangan = {
    id: nextId,
    opd_id: Number(ruangan.opd_id),
    skema_tarif_id: Number(ruangan.skema_tarif_id),
    nama_ruangan: ruangan.nama_ruangan.trim(),
    tipe_ruangan: skema.tipe_ruangan, // inherited from scheme standard
    luas: luas,
    harga_bulan: harga_bulan,
    status_ruangan: ruangan.status_ruangan
  };

  ruanganList.push(newRuangan);
  saveItem(KEY_RUANGAN, ruanganList);
  return newRuangan;
};

export const updateRuangan = (id, updatedFields) => {
  const ruanganList = getRuangan();
  const index = ruanganList.findIndex(r => r.id === Number(id));
  if (index === -1) throw new Error("Ruangan tidak ditemukan.");

  const merged = { ...ruanganList[index], ...updatedFields };

  // Validate
  if (!merged.nama_ruangan || !merged.nama_ruangan.trim()) throw new Error("Nama ruangan wajib diisi.");
  if (!merged.opd_id) throw new Error("OPD wajib dipilih.");
  if (!merged.skema_tarif_id) throw new Error("Skema tarif wajib dipilih.");
  if (!merged.status_ruangan) throw new Error("Status ruangan wajib dipilih.");

  // Check relationship
  const skemas = getSkemaTarif();
  const skema = skemas.find(s => s.id === Number(merged.skema_tarif_id));
  if (!skema) throw new Error("Skema tarif yang dipilih tidak valid.");

  const opds = getOPDs();
  const opd = opds.find(o => o.id === Number(merged.opd_id));
  if (!opd) throw new Error("OPD tidak valid.");

  // Area validation for per meter persegi
  let luas = 0;
  if (skema.jenis_tarif === "Per Meter Persegi") {
    if (merged.luas === undefined || merged.luas === null || isNaN(merged.luas) || merged.luas <= 0) {
      throw new Error("Luas ruangan harus bernilai positif untuk tarif Per Meter Persegi.");
    }
    luas = Number(merged.luas);
  } else {
    luas = merged.luas ? Number(merged.luas) : 0;
  }

  // Calculate Harga Bulan
  let harga_bulan = 0;
  if (skema.jenis_tarif === "Per Meter Persegi") {
    harga_bulan = skema.harga_dasar * luas;
  } else {
    harga_bulan = skema.harga_dasar;
  }

  ruanganList[index] = {
    ...ruanganList[index],
    opd_id: Number(merged.opd_id),
    skema_tarif_id: Number(merged.skema_tarif_id),
    nama_ruangan: merged.nama_ruangan.trim(),
    tipe_ruangan: skema.tipe_ruangan,
    luas: luas,
    harga_bulan: harga_bulan,
    status_ruangan: merged.status_ruangan
  };

  saveItem(KEY_RUANGAN, ruanganList);
  return ruanganList[index];
};

export const deleteRuangan = (id) => {
  const ruanganList = getRuangan();
  const filtered = ruanganList.filter(r => r.id !== Number(id));
  saveItem(KEY_RUANGAN, filtered);
};

// Recalculates prices of all ruangan if standard schemas are modified
const recalculateAllRuanganPrices = () => {
  const ruanganList = getRuangan();
  const skemas = getSkemaTarif();
  let updated = false;

  const nextRuanganList = ruanganList.map(r => {
    const skema = skemas.find(s => s.id === r.skema_tarif_id);
    if (!skema) return r; // shouldn't happen, relational integrity enforced
    
    let expectedHargaBulan = 0;
    if (skema.jenis_tarif === "Per Meter Persegi") {
      expectedHargaBulan = skema.harga_dasar * r.luas;
    } else {
      expectedHargaBulan = skema.harga_dasar;
    }

    if (r.harga_bulan !== expectedHargaBulan || r.tipe_ruangan !== skema.tipe_ruangan) {
      updated = true;
      return {
        ...r,
        tipe_ruangan: skema.tipe_ruangan,
        harga_bulan: expectedHargaBulan
      };
    }
    return r;
  });

  if (updated) {
    saveItem(KEY_RUANGAN, nextRuanganList);
  }
};
