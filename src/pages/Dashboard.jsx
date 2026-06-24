import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Building2, Percent, TrendingUp, CheckSquare, Inbox } from 'lucide-react';
import { getRuangan, getOPDs, subscribe } from '../data/db';

export default function Dashboard() {
  const [ruanganList, setRuanganList] = useState(() => getRuangan());
  const [opds, setOpds] = useState(() => getOPDs());

  useEffect(() => {
    return subscribe(() => {
      setRuanganList(getRuangan());
      setOpds(getOPDs());
    });
  }, []);

  // 1. KPI Aggregations
  const totalRuangan = ruanganList.length;
  const totalDisewa = ruanganList.filter(r => r.status_ruangan === 'Disewa').length;
  const rasioUtilisasi = totalRuangan > 0 ? Math.round((totalDisewa / totalRuangan) * 100) : 0;
  
  const potensiPendapatan = ruanganList.reduce((sum, r) => sum + r.harga_bulan, 0);
  const realisasiPendapatan = ruanganList
    .filter(r => r.status_ruangan === 'Disewa')
    .reduce((sum, r) => sum + r.harga_bulan, 0);

  // 2. Chart Aggregations (Room Types)
  const categoryCounts = ruanganList.reduce((acc, r) => {
    acc[r.tipe_ruangan] = (acc[r.tipe_ruangan] || 0) + 1;
    return acc;
  }, {});

  const COLORS = {
    'Kios': '#0F3D3E',      /* Deep Emerald */
    'Kantin': '#D4AF37',    /* Soft Gold */
    'Fotocopy': '#05B169'   /* Medium Emerald */
  };

  const chartData = Object.keys(categoryCounts).map(key => ({
    name: key,
    value: categoryCounts[key],
    color: COLORS[key] || '#7C828A'
  })).filter(item => item.value > 0);

  // 3. OPD Aggregations
  const opdPerformance = opds.map(opd => {
    const opdRuangan = ruanganList.filter(r => r.opd_id === opd.id);
    const opdTotal = opdRuangan.length;
    const opdPotensi = opdRuangan.reduce((sum, r) => sum + r.harga_bulan, 0);
    const opdRealisasi = opdRuangan
      .filter(r => r.status_ruangan === 'Disewa')
      .reduce((sum, r) => sum + r.harga_bulan, 0);
    const opdCapaian = opdPotensi > 0 ? Math.round((opdRealisasi / opdPotensi) * 100) : 0;

    return {
      id: opd.id,
      nama_opd: opd.nama_opd,
      total_ruangan: opdTotal,
      potensi: opdPotensi,
      realisasi: opdRealisasi,
      capaian: opdCapaian
    };
  }).sort((a, b) => b.potensi - a.potensi); // Sort by Potential Revenue descending

  // Helper formatting functions
  const formatRupiah = (amount) => {
    return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-hairline)', padding: '8px 12px', borderRadius: 'var(--rounded-md)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <span style={{ fontWeight: '600', display: 'block', fontSize: '12px' }}>{data.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-primary)', fontWeight: '600' }}>
            {data.value} Ruangan ({Math.round((data.value / totalRuangan) * 100)}%)
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <span className="text-muted" style={{ fontSize: '12px', fontWeight: '500' }}>Ringkasan Eksekutif</span>
        <h2 style={{ marginTop: '4px' }}>Dashboard Monitoring Retribusi Aset</h2>
      </div>

      {/* KPI Widgets */}
      <div className="dashboard-kpi-grid">
        <div className="card kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">Total Aset Ruangan</span>
            <Building2 size={18} style={{ color: 'var(--color-muted)' }} />
          </div>
          <span className="kpi-value">{totalRuangan}</span>
          <span className="kpi-subtext">Unit terdata lintas OPD</span>
        </div>

        <div className="card kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">Rasio Utilisasi</span>
            <Percent size={18} style={{ color: 'var(--color-muted)' }} />
          </div>
          <span className="kpi-value">{rasioUtilisasi}%</span>
          <span className="kpi-subtext">{totalDisewa} Ruangan aktif disewa</span>
        </div>

        <div className="card kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">Potensi Pendapatan</span>
            <TrendingUp size={18} style={{ color: 'var(--color-muted)' }} />
          </div>
          <span className="kpi-value">{formatRupiah(potensiPendapatan)}</span>
          <span className="kpi-subtext">Target PAD jika 100% disewa</span>
        </div>

        <div className="card kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="kpi-title">Realisasi Pendapatan</span>
            <CheckSquare size={18} style={{ color: 'var(--color-semantic-up)' }} />
          </div>
          <span className="kpi-value realized">{formatRupiah(realisasiPendapatan)}</span>
          <span className="kpi-subtext" style={{ color: 'var(--color-semantic-up)', fontWeight: '500' }}>
            Kontribusi PAD aktual saat ini
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="dashboard-details-grid">
        {/* OPD Contribution Table */}
        <div className="card" style={{ padding: '24px 0' }}>
          <div style={{ padding: '0 24px 16px', borderBottom: '1px solid var(--color-hairline)' }}>
            <h2>Kontribusi & Ketercapaian Target OPD</h2>
            <p className="text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
              Agregasi performa penyewaan aset ruangan per instansi pemerintah
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ margin: 0, border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: 'transparent', paddingLeft: '24px' }}>Nama OPD</th>
                  <th style={{ backgroundColor: 'transparent', textAlign: 'center' }}>Total Unit</th>
                  <th style={{ backgroundColor: 'transparent', textAlign: 'right' }}>Potensi (Rp)</th>
                  <th style={{ backgroundColor: 'transparent', textAlign: 'right' }}>Realisasi (Rp)</th>
                  <th style={{ backgroundColor: 'transparent', textAlign: 'right', paddingRight: '24px' }}>Capaian</th>
                </tr>
              </thead>
              <tbody>
                {opdPerformance.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '600', paddingLeft: '24px' }}>{item.nama_opd}</td>
                    <td className="cell-number" style={{ textAlign: 'center' }}>{item.total_ruangan}</td>
                    <td className="cell-number">{formatRupiah(item.potensi)}</td>
                    <td className="cell-number" style={{ color: item.realisasi > 0 ? 'var(--color-semantic-up)' : 'inherit' }}>
                      {formatRupiah(item.realisasi)}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                      <span 
                        className="font-mono" 
                        style={{ 
                          fontWeight: '600',
                          color: item.capaian === 100 
                            ? 'var(--color-semantic-up)' 
                            : item.capaian > 0 
                              ? 'var(--color-accent)' 
                              : 'var(--color-muted)'
                        }}
                      >
                        {item.capaian}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Card */}
        <div className="card chart-card">
          <div className="chart-title-container">
            <h2>Distribusi Kategori</h2>
            <p className="text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
              Sebaran aset ruangan terdaftar
            </p>
          </div>

          {totalRuangan === 0 ? (
            <div style={{ height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>
              <Inbox size={32} style={{ marginBottom: '8px' }} />
              <span style={{ fontSize: '13px' }}>Tidak ada data aset</span>
            </div>
          ) : (
            <div style={{ width: '100%', height: '220px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none'
              }}>
                <span className="font-mono" style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-primary)' }}>
                  {totalRuangan}
                </span>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                  Aset
                </span>
              </div>
            </div>
          )}

          {/* Chart Legends */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '16px', borderTop: '1px solid var(--color-hairline)', paddingTop: '16px' }}>
            {['Kios', 'Kantin', 'Fotocopy'].map(category => {
              const count = categoryCounts[category] || 0;
              const pct = totalRuangan > 0 ? Math.round((count / totalRuangan) * 100) : 0;
              return (
                <div key={category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[category] }}></span>
                    <span style={{ fontWeight: '500' }}>{category}</span>
                  </div>
                  <span className="font-mono text-muted">
                    {count} Unit ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
