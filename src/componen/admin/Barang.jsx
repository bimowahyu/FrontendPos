/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { styled, useTheme } from "@mui/system";
import axios from 'axios';
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
  Avatar,
  Paper,
  useMediaQuery,
  Skeleton,
  IconButton,
  Chip,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
} from "@mui/material";
import { Plus, PencilSimple, Trash, X } from '@phosphor-icons/react';
import { BiImageAdd } from 'react-icons/bi';
import { getApiBaseUrl } from '../api';

const MySwal = withReactContent(Swal);
const API_URL = getApiBaseUrl();

// Fetcher untuk barang (dengan pagination)
const barangFetcher = url => axios.get(url, { withCredentials: true }).then(res => ({
  data: res.data.data,
  totalItems: res.data.totalItems,
  totalPages: res.data.totalPages,
  page: res.data.page
}));

// Fetcher untuk kategori (tanpa pagination)
const kategoriFetcher = url => axios.get(url, { withCredentials: true }).then(res => res.data.data);

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

export const Barang = () => {
  const { user } = useSelector((state) => state.auth);
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));

  // State untuk data barang dan modal
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk form
  const [formData, setFormData] = useState({
    namabarang: '',
    harga: '',
    kategoriId: '',

    foto: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const { data: responseData, error: barangError, isLoading: isLoadingBarang, mutate: mutateBarang } = useSWR(
    `${API_URL}/getbarang?page=${page + 1}&limit=${rowsPerPage}`,
    barangFetcher
  );
  const { data: kategoris, error: kategoriError, isLoading: isLoadingKategori } = useSWR(
    `${API_URL}/getkategori`,
    kategoriFetcher
  );

  const barangs = responseData?.data || [];
  const totalItems = responseData?.totalItems || 0;
  const totalPages = responseData?.totalPages || 0;

  const kategoriList = Array.isArray(kategoris) ? kategoris : [];

  const validateForm = (isEdit = false) => {
    const errors = {};
    
    if (!formData.namabarang.trim()) errors.namabarang = 'Nama barang harus diisi';
    if (!formData.harga || formData.harga <= 0) errors.harga = 'Harga harus lebih dari 0';
    if (!formData.kategoriId) errors.kategoriId = 'Kategori harus dipilih';
  
    if (!isEdit && !formData.foto) {
      errors.foto = 'Foto barang harus diupload';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleOpenCreateModal = () => {
    setFormErrors({});
    setOpenCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    resetForm();
  };

  const handleOpenEditModal = (barang) => {
    setSelectedBarang(barang);
    setFormData({
      namabarang: barang.namabarang || '',
      harga: barang.harga || '',
      kategoriId: barang.kategoriId || '',
      foto: null,
    });
    setPreviewImage(barang.foto ? `${API_URL}/uploads/${barang.foto}` : null);
    setFormErrors({});
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    resetForm();
    setSelectedBarang(null);
  };

  const resetForm = () => {
    setFormData({
      namabarang: '',
      harga: '',
      kategoriId: '',
      foto: null,
    });
    setPreviewImage(null);
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          foto: 'File harus berupa gambar (JPEG, JPG, PNG)'
        }));
        return;
      }
      
      //  (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          foto: 'Ukuran file maksimal 5MB'
        }));
        return;
      }
      
      setFormData(prev => ({ ...prev, foto: file }));
      setPreviewImage(URL.createObjectURL(file));
      
      if (formErrors.foto) {
        setFormErrors(prev => ({
          ...prev,
          foto: ''
        }));
      }
    }
  };

  // CRUD Functions
  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!validateForm(false)) {
      MySwal.fire({
        icon: 'warning',
        title: 'Data tidak valid',
        text: 'Silakan periksa kembali form yang diisi',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('namabarang', formData.namabarang);
      formDataToSend.append('harga', formData.harga)
      formDataToSend.append('kategoriId', formData.kategoriId);
   
      if (formData.foto) {
        formDataToSend.append('file', formData.foto);
      }

      console.log("Data create yang akan dikirim:", {
        namabarang: formData.namabarang,
        harga: formData.harga,
        kategoriId: formData.kategoriId,
        hasFile: !!formData.foto
      });

      const response = await axios.post(`${API_URL}/createbarang`, formDataToSend, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      MySwal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data barang berhasil ditambahkan!',
        showConfirmButton: false,
        timer: 1500
      });
      
      handleCloseCreateModal();
      mutateBarang();
      
    } catch (error) {
      console.error("Error create barang:", error);
      MySwal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || error.response?.data?.msg || error.message || 'Terjadi kesalahan saat menambahkan data.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm(true)) {
      MySwal.fire({
        icon: 'warning',
        title: 'Data tidak valid',
        text: 'Silakan periksa kembali form yang diisi',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      formDataToSend.append('namabarang', formData.namabarang);
      formDataToSend.append('harga', formData.harga);
      formDataToSend.append('kategoriId', formData.kategoriId);
      formDataToSend.append('stok', formData.stok);
      if (formData.foto) {
        formDataToSend.append('file', formData.foto);
      }

      console.log("Data update yang akan dikirim:", {
        id: selectedBarang.id,
        namabarang: formData.namabarang,
        harga: formData.harga,
        kategoriId: formData.kategoriId,
        hasFile: !!formData.foto
      });

      const response = await axios.put(`${API_URL}/updatebarang/${selectedBarang.id}`, formDataToSend, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      MySwal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Data barang berhasil diperbarui!',
        showConfirmButton: false,
        timer: 1500
      });
      
      handleCloseEditModal();
      mutateBarang();
      
    } catch (error) {
      console.error("Error update barang:", error);
      MySwal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || error.response?.data?.msg || error.message || 'Terjadi kesalahan saat memperbarui data.',
      });
    } finally {
      setIsSubmitting(false);
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
          await axios.delete(`${API_URL}/deletebarang/${id}`, { withCredentials: true });
          MySwal.fire(
            'Dihapus!',
            'Data barang berhasil dihapus.',
            'success'
          );
          mutateBarang();
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

  // Komponen Pagination untuk mobile
  const MobilePagination = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        Menampilkan {barangs.length} dari {totalItems} barang
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          size="small"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outlined"
          size="small"
          disabled={page >= totalPages - 1}
          onClick={() => setPage(page + 1)}
        >
          Berikutnya
        </Button>
      </Box>
    </Box>
  );

  const renderContent = () => {
    if (isLoadingBarang) {
      return (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (barangError || !barangs || barangs.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {barangError ? 'Gagal memuat data.' : 'Belum ada data barang.'}
          </Typography>
        </Box>
      );
    }

    return (
      <>
        {isMobile ? (
          <>
            <Grid container spacing={2}>
              {barangs.map((barang) => (
                <Grid item xs={12} key={barang.id}>
                  <Card sx={{ display: 'flex' }}>
                    <Avatar
                      variant="rounded"
                      src={`${API_URL}/uploads/${barang.foto}`}
                      sx={{ width: 100, height: 100, m: 2 }}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <CardContent sx={{ flex: '1 0 auto' }}>
                      <Typography component="div" variant="h6">
                        {barang.namabarang}
                      </Typography>
                      <Chip 
                        label={barang.Kategori?.namakategori || 'Tidak ada kategori'} 
                        size="small" 
                        sx={{ mb: 1 }} 
                      />
                      <Typography variant="subtitle1" color="text.secondary">
                        Harga: {formatRupiah(barang.harga)}
                      </Typography>
                    
                      <Box sx={{ mt: 2 }}>
                        <IconButton onClick={() => handleOpenEditModal(barang)}>
                          <PencilSimple size={24} />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(barang.id)}>
                          <Trash size={24} />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <MobilePagination />
          </>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Foto</TableCell>
                    <TableCell>Nama Barang</TableCell>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Harga</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {barangs.map((barang, index) => (
                    <TableRow key={barang.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Avatar
                          src={`${API_URL}/uploads/${barang.foto}`}
                          variant="rounded"
                          sx={{ width: 50, height: 50 }}
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                      </TableCell>
                      <TableCell>{barang.namabarang}</TableCell>
                      <TableCell>{barang.Kategori?.namakategori || 'Tidak ada'}</TableCell>
                      <TableCell>{formatRupiah(barang.harga)}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleOpenEditModal(barang)}>
                          <PencilSimple size={24} color="#3f51b5" />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(barang.id)}>
                          <Trash size={24} color="#f44336" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalItems}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Baris per halaman:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
              }
            />
          </Paper>
        )}
      </>
    );
  };

  const renderFormModal = (isEdit) => {
    const title = isEdit ? 'Edit Barang' : 'Tambah Barang';
    const handleSubmit = isEdit ? handleUpdate : handleCreate;
    const openModal = isEdit ? openEditModal : openCreateModal;
    const handleCloseModal = isEdit ? handleCloseEditModal : handleCloseCreateModal;

    return (
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{title}</Typography>
            <IconButton onClick={handleCloseModal} disabled={isSubmitting}>
              <X size={24} />
            </IconButton>
          </Box>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Nama Barang"
                  name="namabarang"
                  value={formData.namabarang}
                  onChange={handleInputChange}
                  error={!!formErrors.namabarang}
                  helperText={formErrors.namabarang}
                  disabled={isSubmitting}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Harga"
                  name="harga"
                  type="number"
                  value={formData.harga}
                  onChange={handleInputChange}
                  error={!!formErrors.harga}
                  helperText={formErrors.harga}
                  disabled={isSubmitting}
                />
              </Grid>
             
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!formErrors.kategoriId} disabled={isSubmitting}>
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    label="Kategori"
                    name="kategoriId"
                    value={formData.kategoriId}
                    onChange={handleInputChange}
                  >
                    {isLoadingKategori && (
                      <MenuItem disabled>Memuat kategori...</MenuItem>
                    )}
                    {kategoriError && (
                      <MenuItem disabled>Gagal memuat kategori</MenuItem>
                    )}
                    {kategoriList.length === 0 && !isLoadingKategori && !kategoriError && (
                      <MenuItem disabled>Tidak ada kategori</MenuItem>
                    )}
                    {kategoriList.map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>
                        {cat.namakategori}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.kategoriId && (
                    <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                      {formErrors.kategoriId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: '1px dashed grey',
                    borderRadius: 1,
                    p: 2,
                    textAlign: 'center',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                  onClick={isSubmitting ? undefined : () => document.getElementById(`file-upload-${isEdit ? 'edit' : 'create'}`).click()}
                >
                  <input
                    type="file"
                    id={`file-upload-${isEdit ? 'edit' : 'create'}`}
                    hidden
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    disabled={isSubmitting}
                  />
                  {previewImage ? (
                    <Box>
                      <img
                        src={previewImage}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                      />
                      {!isEdit && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Klik untuk mengganti gambar
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <BiImageAdd size={48} color="gray" />
                      <Typography variant="body2" color="text.secondary">
                        Pilih Gambar atau Seret & Lepaskan
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (JPEG, JPG, PNG - Maks. 5MB)
                      </Typography>
                    </Box>
                  )}
                </Box>
                {formErrors.foto && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {formErrors.foto}
                  </Typography>
                )}
                {isEdit && !formData.foto && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Kosongkan jika tidak ingin mengubah gambar
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
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
        <Typography variant="h4" component="h1">
          Manajemen Barang
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={24} />}
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
          Tambah Barang
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
  width: { xs: '90%', sm: 500 },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: '90vh',
  overflowY: 'auto',
};