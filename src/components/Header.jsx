import React from 'react';

export default function Header({ title, subtitle }) {
  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="header">
      <div className="header-title-container">
        <h1>{title}</h1>
        {subtitle && <span className="header-subtitle">{subtitle}</span>}
      </div>
      <div className="header-status-badge">
        <span className="header-pulse"></span>
        <span className="font-mono" style={{ fontSize: '12px' }}>{currentDate}</span>
      </div>
    </header>
  );
}
