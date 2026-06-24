import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { 
  getSkemaTarif, 
  getRuangan, 
  addSkemaTarif, 
  updateSkemaTarif, 
  deleteSkemaTarif, 
  subscribe 
} from '../data/db';
import ConfirmationModal from '../components/ConfirmationModal';

export default function SkemaTarif({ showToast }) {
  const [skemas, setSkemas] = useState(() => getSkemaTarif());
  const [ruanganList, setRuanganList] = useState(() => getRuangan());
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkema, setEditingSkema] = useState(null);
  
  // Form fields
  const [namaSkema, setNamaSkema] = useState('');
  const [tipeRuangan, setTipeRuangan] = useState('Kios');
  const [jenisTarif, setJenisTarif] = useState('Flat Rate');
  const [hargaDasarRaw, setHargaDasarRaw] = useState('');
  const [statusAktif, setStatusAktif] = useState(true);
  
  // Form errors
  const [errors, setErrors] = useState({});

  // Confirmation Modals
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmSaveData, setConfirmSaveData] = useState(null);

  useEffect(() => {
    return subscribe(() => {
      setSkemas(getSkemaTarif());
      setRuanganList(getRuangan());
    });
  }, []);

  const openAddModal = () => {
    setEditingSkema(null);
    setNamaSkema('');
    setTipeRuangan('Kios');
    setJenisTarif('Flat Rate');
    setHargaDasarRaw('');
    setStatusAktif(true);
    setErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (skema) => {
    setEditingSkema(skema);
    setNamaSkema(skema.nama_skema);
    setTipeRuangan(skema.tipe_ruangan);
    setJenisTarif(skema.jenis_tarif);
    setHargaDasarRaw(skema.harga_dasar.toString());
    setStatusAktif(skema.status_aktif);
    setErrors({});
    setIsFormOpen(true);
  };

  // Format currency display (Rp X.XXX.XXX)
  const formatRupiah = (amount) => {
    return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Format dynamic thousands separator in form input
  const formatThousands = (value) => {
    if (!value) return '';
    const clean = value.toString().replace(/\D/g, '');
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePriceInput = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setHargaDasarRaw(raw);
    if (errors.hargaDasar) {
      setErrors(prev => ({ ...prev, hargaDasar: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!namaSkema.trim()) {
      newErrors.namaSkema = 'Nama skema wajib diisi';
    }
    if (!hargaDasarRaw || isNaN(hargaDasarRaw) || Number(hargaDasarRaw) < 0) {
      newErrors.hargaDasar = 'Harga dasar harus berupa angka positif';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
      nama_skema: namaSkema,
      tipe_ruangan: tipeRuangan,
      jenis_tarif: jenisTarif,
      harga_dasar: Number(hargaDasarRaw),
      status_aktif: statusAktif
    };

    setConfirmSaveData(data);
  };

  const handleConfirmSave = () => {
    try {
      if (editingSkema) {
        updateSkemaTarif(editingSkema.id, confirmSaveData);
        showToast('Skema tarif berhasil diperbarui!', 'success');
      } else {
        addSkemaTarif(confirmSaveData);
        showToast('Skema tarif baru berhasil ditambahkan!', 'success');
      }
      setIsFormOpen(false);
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan skema tarif.', 'error');
    } finally {
      setConfirmSaveData(null);
    }
  };

  const handleDeleteClick = (id) => {
    // Check if referenced by any ruangan
    const isUsed = ruanganList.some(r => r.skema_tarif_id === id);
    if (isUsed) {
      showToast('Gagal menghapus! Skema ini masih digunakan oleh data ruangan.', 'error');
      return;
    }
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    try {
      deleteSkemaTarif(confirmDeleteId);
      showToast('Skema tarif berhasil dihapus.', 'success');
    } catch (err) {
      showToast(err.message || 'Gagal menghapus skema tarif.', 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <div>
          <span className="text-muted" style={{ fontSize: '12px', fontWeight: '500' }}>Master Data / Skema Tarif</span>
          <h2 style={{ marginTop: '4px' }}>Daftar Skema Tarif Sewa</h2>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={16} />
          <span>Tambah Skema Baru</span>
        </button>
      </div>

      {skemas.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <div className="empty-state">
            <Plus size={40} />
            <h3>Belum Ada Skema Tarif</h3>
            <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto 16px' }}>
              Daftarkan skema tarif terlebih dahulu sebelum menginput data ruangan.
            </p>
            <button onClick={openAddModal} className="btn btn-primary">
              Mulai Tambah Skema
            </button>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '25%' }}>Nama Skema</th>
                <th style={{ width: '15%' }}>Tipe Ruangan</th>
                <th style={{ width: '18%' }}>Jenis Tarif</th>
                <th style={{ width: '18%', textAlign: 'right' }}>Harga Dasar</th>
                <th style={{ width: '12%', textAlign: 'center' }}>Status</th>
                <th style={{ width: '12%', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {skemas.map((skema) => (
                <tr key={skema.id}>
                  <td style={{ fontWeight: '600' }}>{skema.nama_skema}</td>
                  <td>{skema.tipe_ruangan}</td>
                  <td>{skema.jenis_tarif}</td>
                  <td className="cell-number">{formatRupiah(skema.harga_dasar)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${skema.status_aktif ? 'badge-success' : 'badge-muted'}`}>
                      <span className="badge-dot"></span>
                      {skema.status_aktif ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button 
                      onClick={() => openEditModal(skema)} 
                      className="btn-edit-text"
                      title="Edit Skema"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(skema.id)} 
                      className="btn-danger-text"
                      title="Hapus Skema"
                      style={{ marginLeft: '4px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal Add/Edit */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingSkema ? 'Ubah Skema Tarif' : 'Tambah Skema Tarif Baru'}</h2>
              <button className="modal-close" onClick={() => setIsFormOpen(false)} aria-label="Tutup form">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="nama_skema">Nama Skema *</label>
                  <input
                    type="text"
                    id="nama_skema"
                    className={`form-control ${errors.namaSkema ? 'error' : ''}`}
                    placeholder="Contoh: Kios Pasar Baru Standar"
                    value={namaSkema}
                    onChange={(e) => {
                      setNamaSkema(e.target.value);
                      if (errors.namaSkema) setErrors(prev => ({ ...prev, namaSkema: null }));
                    }}
                  />
                  {errors.namaSkema && <span className="error-message">{errors.namaSkema}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="tipe_ruangan">Tipe Ruangan *</label>
                    <select
                      id="tipe_ruangan"
                      className="form-control"
                      value={tipeRuangan}
                      onChange={(e) => setTipeRuangan(e.target.value)}
                    >
                      <option value="Kios">Kios</option>
                      <option value="Kantin">Kantin</option>
                      <option value="Fotocopy">Fotocopy</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="jenis_tarif">Jenis Tarif *</label>
                    <select
                      id="jenis_tarif"
                      className="form-control"
                      value={jenisTarif}
                      onChange={(e) => setJenisTarif(e.target.value)}
                    >
                      <option value="Flat Rate">Flat Rate</option>
                      <option value="Cluster">Cluster</option>
                      <option value="Per Meter Persegi">Per Meter Persegi</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="harga_dasar">Harga Dasar (Rp) *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '10px', color: 'var(--color-muted)', fontWeight: '600' }}>
                      Rp
                    </span>
                    <input
                      type="text"
                      id="harga_dasar"
                      className={`form-control ${errors.hargaDasar ? 'error' : ''}`}
                      style={{ paddingLeft: '40px', fontFamily: 'var(--font-mono)', fontWeight: '500' }}
                      placeholder="0"
                      value={formatThousands(hargaDasarRaw)}
                      onChange={handlePriceInput}
                    />
                  </div>
                  {errors.hargaDasar && <span className="error-message">{errors.hargaDasar}</span>}
                  <span className="text-muted" style={{ fontSize: '11px', marginTop: '6px', display: 'block' }}>
                    * Untuk jenis tarif <strong>Per Meter Persegi</strong>, harga dasar dihitung per m².
                  </span>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                  <label className="switch" htmlFor="status_aktif_toggle">
                    <input
                      type="checkbox"
                      id="status_aktif_toggle"
                      checked={statusAktif}
                      onChange={(e) => setStatusAktif(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '13px', display: 'block' }}>Skema Aktif</span>
                    <span className="text-muted" style={{ fontSize: '11px' }}>Hanya skema aktif yang dapat ditautkan ke ruangan baru</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Skema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation for Save */}
      <ConfirmationModal
        isOpen={confirmSaveData !== null}
        title={editingSkema ? 'Simpan Perubahan Skema' : 'Simpan Skema Baru'}
        message={`Apakah Anda yakin ingin ${editingSkema ? 'memperbarui' : 'menyimpan'} skema tarif "${namaSkema}" dengan Harga Dasar ${formatRupiah(hargaDasarRaw || 0)}?`}
        confirmText="Ya, Simpan"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmSaveData(null)}
      />

      {/* Confirmation for Delete */}
      <ConfirmationModal
        isOpen={confirmDeleteId !== null}
        title="Hapus Skema Tarif"
        message="Apakah Anda yakin ingin menghapus skema tarif ini? Aksi ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
