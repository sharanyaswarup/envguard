import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{
        marginLeft: 240,
        flex: 1,
        overflow: 'auto',
        background: 'var(--bg)',
        minHeight: '100vh',
      }}>
        <Outlet />
      </main>
    </div>
  );
}
