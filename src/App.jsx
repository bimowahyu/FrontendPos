// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from './componen/Login';
import DashboardAdminPages from './pages/admin/DashboardAdminPages';
import { BarangPages } from './pages/admin/BarangPages';
import KategoriPages from './pages/admin/KategoriPages';
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
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;