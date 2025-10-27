/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { styled, useTheme } from "@mui/system";
import axios from 'axios';
import { getApiBaseUrl } from '../api';
import { useSelector } from "react-redux";
import useSWR from 'swr';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  useMediaQuery,
  Skeleton,
  IconButton,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  TextField,
} from "@mui/material";
import { Plus, PencilSimple, Trash, X } from '@phosphor-icons/react';

const MySwal = withReactContent(Swal);
const API_URL = getApiBaseUrl();
const fetcher = url => axios.get(url, { withCredentials: true }).then(res => res.data.data);

export const Kategori = () => {
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState(null);

  const [formData, setFormData] = useState({
    namakategori: '',
  });

  const { data: kategoris = [], error: kategoriError, isLoading: isLoadingKategori, mutate: mutateKategori } = useSWR(
    `${API_URL}/getkategori`,
    fetcher
  );

  const handleOpenCreateModal = () => setOpenCreateModal(true);
  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    resetForm();
  };

  const handleOpenEditModal = (kategori) => {
    setSelectedKategori(kategori);
    setFormData({ namakategori: kategori.namakategori });
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    resetForm();
    setSelectedKategori(null);
  };

  const resetForm = () => {
    setFormData({ namakategori: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/createkategori`, formData, {
        withCredentials: true,
      });

      MySwal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data kategori berhasil ditambahkan!',
        showConfirmButton: false,
        timer: 1500
      });
      handleCloseCreateModal();
      mutateKategori();
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan saat menambahkan data.',
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/updatekategori/${selectedKategori.id}`, formData, {
        withCredentials: true,
      });

      MySwal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data kategori berhasil diperbarui!',
        showConfirmButton: false,
        timer: 1500
      });
      handleCloseEditModal();
      mutateKategori();
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan saat memperbarui data.',
      });
    }
  };

  const handleDelete = (id) => {
    MySwal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Data yang dihapus tidak bisa dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/deletekategori/${id}`, { withCredentials: true });
          MySwal.fire(
            'Dihapus!',
            'Data kategori berhasil dihapus.',
            'success'
          );
          mutateKategori();
        } catch (error) {
          MySwal.fire({
            icon: 'error',
            title: 'Gagal',
            text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus data.',
          });
        }
      }
    });
  };

  const renderContent = () => {
    if (isLoadingKategori) {
      return (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (kategoriError || !kategoris || kategoris.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {kategoriError ? 'Gagal memuat data.' : 'Belum ada data kategori.'}
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Nama Kategori</TableCell>
              <TableCell align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {kategoris.map((kategori, index) => (
              <TableRow key={kategori.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{kategori.namakategori}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenEditModal(kategori)}>
                    <PencilSimple size={24} color="#3f51b5" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(kategori.id)}>
                    <Trash size={24} color="#f44336" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderFormModal = (isEdit) => {
    const title = isEdit ? 'Edit Kategori' : 'Tambah Kategori';
    const handleSubmit = isEdit ? handleUpdate : handleCreate;
    const openModal = isEdit ? openEditModal : openCreateModal;
    const handleCloseModal = isEdit ? handleCloseEditModal : handleCloseCreateModal;

    return (
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{title}</Typography>
            <IconButton onClick={handleCloseModal}>
              <X size={24} />
            </IconButton>
          </Box>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Nama Kategori"
                  name="namakategori"
                  value={formData.namakategori}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                  Simpan
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* <Typography variant="h4" component="h1">
          Manajemen Kategori
        </Typography> */}
        {/* <Button
          variant="contained"
          startIcon={<Plus size={24} />}
          onClick={handleOpenCreateModal}
        > */}
         <Button
          variant="contained"
          color="primary"
          startIcon={<i className="fa-solid fa-plus" />}
          onClick={handleOpenCreateModal}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            }
          }}
        >
          Tambah Kategori
        </Button>
      </Box>

      {renderContent()}

      {renderFormModal(false)}
      {renderFormModal(true)}
    </Container>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};
