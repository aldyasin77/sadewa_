import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, HelpCircle } from 'lucide-react';
import { 
  getRuangan, 
  getSkemaTarif, 
  getOPDs, 
  addRuangan, 
  updateRuangan, 
  deleteRuangan, 
  subscribe 
} from '../data/db';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Ruangan({ showToast }) {
  const [ruanganList, setRuanganList] = useState(() => getRuangan());
  const [skemas, setSkemas] = useState(() => getSkemaTarif());
  const [opds, setOpds] = useState(() => getOPDs());

  // Filter states
  const [filterOpd, setFilterOpd] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipe, setFilterTipe] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRuangan, setEditingRuangan] = useState(null);

  // Form fields
  const [namaRuangan, setNamaRuangan] = useState('');
  const [opdId, setOpdId] = useState('');
  const [skemaTarifId, setSkemaTarifId] = useState('');
  const [luas, setLuas] = useState('');
  const [statusRuangan, setStatusRuangan] = useState('Tersedia');
  const [tipeRuanganFilter, setTipeRuanganFilter] = useState('Kios');

  // Form errors
  const [errors, setErrors] = useState({});

  // Confirmation Modals
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmSaveData, setConfirmSaveData] = useState(null);

  useEffect(() => {
    return subscribe(() => {
      setRuanganList(getRuangan());
      setSkemas(getSkemaTarif());
      setOpds(getOPDs());
    });
  }, []);

  const activeSkemas = skemas.filter(s => s.status_aktif);

  const selectedSkema = skemas.find(s => s.id === Number(skemaTarifId));
  const isPerMeter = selectedSkema?.jenis_tarif === 'Per Meter Persegi';

  const filteredRuanganList = ruanganList.filter(ruangan => {
    const matchesOpd = filterOpd === '' || ruangan.opd_id === Number(filterOpd);
    const matchesStatus = filterStatus === '' || ruangan.status_ruangan === filterStatus;
    const matchesTipe = filterTipe === '' || ruangan.tipe_ruangan === filterTipe;
    return matchesOpd && matchesStatus && matchesTipe;
  });

  // Automatically select the first active scheme when opening the add modal
  const openAddModal = () => {
    setEditingRuangan(null);
    setNamaRuangan('');
    setOpdId(opds[0]?.id.toString() || '');
    
    const firstActiveSkema = activeSkemas[0];
    if (firstActiveSkema) {
      setTipeRuanganFilter(firstActiveSkema.tipe_ruangan);
      setSkemaTarifId(firstActiveSkema.id.toString());
    } else {
      setTipeRuanganFilter('Kios');
      setSkemaTarifId('');
    }
    setLuas('');
    setStatusRuangan('Tersedia');
    setErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (ruangan) => {
    setEditingRuangan(ruangan);
    setNamaRuangan(ruangan.nama_ruangan);
    setOpdId(ruangan.opd_id.toString());
    
    const roomSkema = skemas.find(s => s.id === ruangan.skema_tarif_id);
    if (roomSkema) {
      setTipeRuanganFilter(roomSkema.tipe_ruangan);
      setSkemaTarifId(ruangan.skema_tarif_id.toString());
    } else {
      setTipeRuanganFilter(ruangan.tipe_ruangan || 'Kios');
      setSkemaTarifId(ruangan.skema_tarif_id.toString());
    }
    
    setLuas(ruangan.luas ? ruangan.luas.toString() : '');
    setStatusRuangan(ruangan.status_ruangan);
    setErrors({});
    setIsFormOpen(true);
  };

  const handleTipeRuanganFilterChange = (type) => {
    setTipeRuanganFilter(type);
    const filtered = activeSkemas.filter(s => s.tipe_ruangan === type);
    if (filtered.length > 0) {
      setSkemaTarifId(filtered[0].id.toString());
    } else {
      setSkemaTarifId('');
    }
  };

  const calculateProjection = () => {
    if (!selectedSkema) return 0;
    if (selectedSkema.jenis_tarif === 'Per Meter Persegi') {
      const area = Number(luas);
      if (isNaN(area) || area <= 0) return 0;
      return selectedSkema.harga_dasar * area;
    }
    return selectedSkema.harga_dasar;
  };

  const formatRupiah = (amount) => {
    return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!namaRuangan.trim()) {
      newErrors.namaRuangan = 'Nama ruangan wajib diisi';
    }
    if (!opdId) {
      newErrors.opdId = 'OPD wajib dipilih';
    }
    if (!skemaTarifId) {
      newErrors.skemaTarifId = 'Skema tarif wajib dipilih';
    }

    if (isPerMeter) {
      if (!luas || isNaN(luas) || Number(luas) <= 0) {
        newErrors.luas = 'Luas ruangan harus diisi dengan angka positif';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data = {
      nama_ruangan: namaRuangan,
      opd_id: Number(opdId),
      skema_tarif_id: Number(skemaTarifId),
      luas: isPerMeter ? Number(luas) : 0,
      status_ruangan: statusRuangan
    };

    setConfirmSaveData(data);
  };

  const handleConfirmSave = () => {
    try {
      if (editingRuangan) {
        updateRuangan(editingRuangan.id, confirmSaveData);
        showToast('Data ruangan berhasil diperbarui!', 'success');
      } else {
        addRuangan(confirmSaveData);
        showToast('Ruangan baru berhasil terdaftar!', 'success');
      }
      setIsFormOpen(false);
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan data ruangan.', 'error');
    } finally {
      setConfirmSaveData(null);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = () => {
    try {
      deleteRuangan(confirmDeleteId);
      showToast('Data ruangan berhasil dihapus.', 'success');
    } catch (err) {
      showToast(err.message || 'Gagal menghapus data ruangan.', 'error');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Tersedia': return 'badge-success';
      case 'Disewa': return 'badge-warning';
      case 'Maintenance': return 'badge-danger';
      default: return 'badge-muted';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
        <div>
          <span className="text-muted" style={{ fontSize: '12px', fontWeight: '500' }}>Master Data / Inventaris Ruangan</span>
          <h2 style={{ marginTop: '4px' }}>Daftar Aset Ruangan OPD</h2>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" disabled={activeSkemas.length === 0}>
          <Plus size={16} />
          <span>Tambah Ruangan</span>
        </button>
      </div>

      {activeSkemas.length === 0 && (
        <div className="card" style={{ marginBottom: 'var(--spacing-md)', backgroundColor: 'var(--color-semantic-down-soft)', borderColor: 'var(--color-semantic-down)', padding: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-semantic-down)', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              Peringatan:
            </span>
            <p style={{ color: 'var(--color-semantic-down)', fontSize: '13px' }}>
              Tidak ada <strong>Skema Tarif Aktif</strong> yang tersedia. Daftarkan dan aktifkan minimal satu skema tarif sewa terlebih dahulu untuk menambahkan ruangan.
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      {ruanganList.length > 0 && (
        <div style={{ 
          padding: '16px 20px', 
          marginBottom: 'var(--spacing-md)', 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '16px', 
          alignItems: 'flex-end',
          backgroundColor: 'var(--color-surface-card)',
          borderRadius: 'var(--rounded-lg)',
          border: '1px solid var(--color-hairline)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ flex: '1 1 200px' }}>
            <label htmlFor="filter_opd" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--color-body)', marginBottom: '6px' }}>Filter OPD</label>
            <select
              id="filter_opd"
              className="form-control"
              value={filterOpd}
              onChange={(e) => setFilterOpd(e.target.value)}
            >
              <option value="">Semua OPD</option>
              {opds.map(opd => (
                <option key={opd.id} value={opd.id.toString()}>{opd.nama_opd}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label htmlFor="filter_status" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--color-body)', marginBottom: '6px' }}>Filter Status</label>
            <select
              id="filter_status"
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="Tersedia">Tersedia</option>
              <option value="Disewa">Disewa</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label htmlFor="filter_tipe" style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--color-body)', marginBottom: '6px' }}>Filter Tipe Ruangan</label>
            <select
              id="filter_tipe"
              className="form-control"
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
            >
              <option value="">Semua Tipe</option>
              <option value="Kios">Kios</option>
              <option value="Kantin">Kantin</option>
              <option value="Fotocopy">Fotocopy</option>
            </select>
          </div>

          {(filterOpd || filterStatus || filterTipe) && (
            <button
              onClick={() => {
                setFilterOpd('');
                setFilterStatus('');
                setFilterTipe('');
              }}
              className="btn btn-secondary"
              style={{ padding: '10px 20px', height: '42px' }}
            >
              Reset Filter
            </button>
          )}
        </div>
      )}

      {ruanganList.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <div className="empty-state">
            <Plus size={40} />
            <h3>Belum Ada Ruangan Terdaftar</h3>
            <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto 16px' }}>
              Aset ruangan OPD belum didata. Klik tombol di bawah ini untuk mulai menambahkan data.
            </p>
            <button onClick={openAddModal} className="btn btn-primary" disabled={activeSkemas.length === 0}>
              Tambah Ruangan Pertama
            </button>
          </div>
        </div>
      ) : filteredRuanganList.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <div className="empty-state">
            <HelpCircle size={40} style={{ color: 'var(--color-muted)', marginBottom: '12px' }} />
            <h3>Tidak Ada Ruangan Ditemukan</h3>
            <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto 16px' }}>
              Tidak ada data aset ruangan yang cocok dengan filter pencarian Anda. Silakan ubah filter atau atur ulang.
            </p>
            <button 
              onClick={() => {
                setFilterOpd('');
                setFilterStatus('');
                setFilterTipe('');
              }} 
              className="btn btn-secondary"
            >
              Reset Filter
            </button>
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Nama / Kode</th>
                <th style={{ width: '20%' }}>OPD Pengelola</th>
                <th style={{ width: '12%' }}>Kategori</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Luas (m²)</th>
                <th style={{ width: '18%', textAlign: 'right' }}>Harga / Bulan</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                <th style={{ width: '8%', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuanganList.map((ruangan) => {
                const opd = opds.find(o => o.id === ruangan.opd_id);
                const skema = skemas.find(s => s.id === ruangan.skema_tarif_id);
                return (
                  <tr key={ruangan.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600' }}>{ruangan.nama_ruangan}</span>
                        <span className="text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                          Skema: {skema ? skema.nama_skema : 'Tidak Terdefinisi'}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-body)', fontSize: '13px' }}>
                      {opd ? opd.nama_opd : 'Tidak Terdefinisi'}
                    </td>
                    <td>{ruangan.tipe_ruangan}</td>
                    <td className="cell-number">
                      {ruangan.luas > 0 ? `${ruangan.luas} m²` : '-'}
                    </td>
                    <td className="cell-number" style={{ fontWeight: '600' }}>
                      {formatRupiah(ruangan.harga_bulan)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${getStatusBadgeClass(ruangan.status_ruangan)}`}>
                        <span className="badge-dot"></span>
                        {ruangan.status_ruangan}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button 
                        onClick={() => openEditModal(ruangan)} 
                        className="btn-edit-text"
                        title="Edit Ruangan"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(ruangan.id)} 
                        className="btn-danger-text"
                        title="Hapus Ruangan"
                        style={{ marginLeft: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal Add/Edit */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingRuangan ? 'Ubah Data Ruangan' : 'Tambah Ruangan Baru'}</h2>
              <button className="modal-close" onClick={() => setIsFormOpen(false)} aria-label="Tutup form">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="nama_ruangan">Nama / Kode Ruangan *</label>
                  <input
                    type="text"
                    id="nama_ruangan"
                    className={`form-control ${errors.namaRuangan ? 'error' : ''}`}
                    placeholder="Contoh: Kios Blok A Nomor 12"
                    value={namaRuangan}
                    onChange={(e) => {
                      setNamaRuangan(e.target.value);
                      if (errors.namaRuangan) setErrors(prev => ({ ...prev, namaRuangan: null }));
                    }}
                  />
                  {errors.namaRuangan && <span className="error-message">{errors.namaRuangan}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="opd_id">OPD Pengelola Aset *</label>
                  <select
                    id="opd_id"
                    className={`form-control ${errors.opdId ? 'error' : ''}`}
                    value={opdId}
                    onChange={(e) => {
                      setOpdId(e.target.value);
                      if (errors.opdId) setErrors(prev => ({ ...prev, opdId: null }));
                    }}
                  >
                    {opds.map(opd => (
                      <option key={opd.id} value={opd.id}>{opd.nama_opd}</option>
                    ))}
                  </select>
                  {errors.opdId && <span className="error-message">{errors.opdId}</span>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="filter_tipe_ruangan">Tipe Ruangan *</label>
                    <select
                      id="filter_tipe_ruangan"
                      className="form-control"
                      value={tipeRuanganFilter}
                      onChange={(e) => handleTipeRuanganFilterChange(e.target.value)}
                    >
                      <option value="Kios">Kios</option>
                      <option value="Kantin">Kantin</option>
                      <option value="Fotocopy">Fotocopy</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="skema_tarif_id">Skema Tarif *</label>
                    <select
                      id="skema_tarif_id"
                      className={`form-control ${errors.skemaTarifId ? 'error' : ''}`}
                      value={skemaTarifId}
                      onChange={(e) => {
                        setSkemaTarifId(e.target.value);
                        if (errors.skemaTarifId) setErrors(prev => ({ ...prev, skemaTarifId: null }));
                      }}
                    >
                      <option value="" disabled>-- Pilih Skema --</option>
                      {skemas.filter(s => {
                        const isCurrentEditing = editingRuangan && s.id === editingRuangan.skema_tarif_id;
                        return s.tipe_ruangan === tipeRuanganFilter && (s.status_aktif || isCurrentEditing);
                      }).map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nama_skema} ({s.jenis_tarif} - {formatRupiah(s.harga_dasar)})
                        </option>
                      ))}
                    </select>
                    {errors.skemaTarifId && <span className="error-message">{errors.skemaTarifId}</span>}
                  </div>
                </div>

                {selectedSkema && (
                  <div style={{ 
                    marginTop: '8px', 
                    padding: '16px', 
                    borderRadius: 'var(--rounded-lg)', 
                    border: '1px solid var(--color-hairline)',
                    backgroundColor: 'var(--color-surface-soft)',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '12px', letterSpacing: '0.8px' }}>
                      Proyeksi Harga Sewa
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Skema:</span>
                        <span style={{ fontWeight: '600' }}>{selectedSkema.nama_skema}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Jenis Tarif:</span>
                        <span style={{ fontWeight: '600' }}>{selectedSkema.jenis_tarif}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Harga Dasar:</span>
                        <span className="font-mono" style={{ fontWeight: '600' }}>
                          {formatRupiah(selectedSkema.harga_dasar)}{isPerMeter ? ' / m²' : ''}
                        </span>
                      </div>
                      
                      <hr style={{ border: 'none', borderTop: '1px dashed var(--color-hairline)', margin: '8px 0' }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>Total Harga Sewa:</span>
                        <span className="font-mono" style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-primary)' }}>
                          {formatRupiah(calculateProjection())}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Input Field based on rate type */}
                {isPerMeter && (
                  <div className="form-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    <label htmlFor="luas">Luas Ruangan (m²) *</label>
                    <input
                      type="number"
                      id="luas"
                      step="any"
                      min="0.01"
                      className={`form-control ${errors.luas ? 'error' : ''}`}
                      style={{ fontFamily: 'var(--font-mono)' }}
                      placeholder="Masukkan luas (contoh: 15.5)"
                      value={luas}
                      onChange={(e) => {
                        setLuas(e.target.value);
                        if (errors.luas) setErrors(prev => ({ ...prev, luas: null }));
                      }}
                    />
                    {errors.luas && <span className="error-message">{errors.luas}</span>}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="status_ruangan">Status Ruangan *</label>
                  <select
                    id="status_ruangan"
                    className="form-control"
                    value={statusRuangan}
                    onChange={(e) => setStatusRuangan(e.target.value)}
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Disewa">Disewa</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Ruangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Save */}
      <ConfirmationModal
        isOpen={confirmSaveData !== null}
        title={editingRuangan ? 'Simpan Perubahan Ruangan' : 'Daftarkan Ruangan'}
        message={`Apakah Anda yakin ingin menyimpan data ruangan "${namaRuangan}"? Perhitungan harga sewa bulanan akan dihitung secara otomatis berdasarkan skema tarif yang dipilih.`}
        confirmText="Ya, Simpan"
        onConfirm={handleConfirmSave}
        onCancel={() => setConfirmSaveData(null)}
      />

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={confirmDeleteId !== null}
        title="Hapus Aset Ruangan"
        message="Apakah Anda yakin ingin menghapus data ruangan ini? Aksi ini akan menghapus aset dari pelacakan retribusi."
        confirmText="Ya, Hapus"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
