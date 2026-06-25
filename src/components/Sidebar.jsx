import React from 'react';
import { LayoutDashboard, Receipt, Building2 } from 'lucide-react';
import Logo from '../assets/Logo.png';

export default function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'skema', label: 'Skema Tarif', icon: Receipt },
    { id: 'ruangan', label: 'Inventaris Ruangan', icon: Building2 },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={Logo} alt="Logo SADEWA" className="sidebar-logo-img" />
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">SADEWA</span>
          <span className="sidebar-logo-subtitle">Pemprov Jawa Barat</span>
        </div>
      </div>
      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <p>Retribusi Aset OPD</p>
        <p className="text-muted" style={{ fontSize: '10px', marginTop: '4px' }}>v1.0.0</p>
      </div>
    </aside>
  );
}
