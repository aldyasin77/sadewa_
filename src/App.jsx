import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import SkemaTarif from './pages/SkemaTarif';
import Ruangan from './pages/Ruangan';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'skema':
        return <SkemaTarif showToast={showToast} />;
      case 'ruangan':
        return <Ruangan showToast={showToast} />;
      default:
        return <Dashboard />;
    }
  };

  const pageInfo = {
    dashboard: {
      title: 'Dashboard Evaluasi',
      subtitle: 'Retribusi Sewa Aset OPD Pemprov Jawa Barat'
    },
    skema: {
      title: 'Manajemen Skema Tarif',
      subtitle: 'Standarisasi parameter tarif dasar sewa ruangan'
    },
    ruangan: {
      title: 'Manajemen Ruangan',
      subtitle: 'Pendataan inventaris ruangan dan status penyewaan'
    }
  };

  const currentInfo = pageInfo[activePage] || pageInfo.dashboard;

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="main-content">
        <Header title={currentInfo.title} subtitle={currentInfo.subtitle} />
        
        <main className="page-body">
          {renderPage()}
        </main>
      </div>

      {/* Global Toast Notifications Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
