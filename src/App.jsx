// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from './componen/Login';
import DashboardAdminPages from './pages/admin/DashboardAdminPages';
import { BarangPages } from './pages/admin/BarangPages';
import KategoriPages from './pages/admin/KategoriPages';
import UserListPages from './pages/admin/UserListPages';
import TransaksiPages from './pages/admin/TransaksiPages';
import RekapPages from './pages/admin/RekapPages';

//=============KASIR==================
import DashboardKasirPages from './pages/Kasir/DashboardKasirPages';
import './App.css'

function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboardadmin" element={<DashboardAdminPages />} />
          <Route path="/barang" element={<BarangPages />} />
          <Route path="/kategori" element={<KategoriPages />} />
          <Route path="/user" element={<UserListPages />} />
          <Route path="/transaksi" element={<TransaksiPages />} />
          <Route path="/rekap" element={<RekapPages />} />

          <Route path="/dashboardkasir" element={<DashboardKasirPages />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;