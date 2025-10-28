/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
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
  TablePagination,
  Modal,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Plus, PencilSimple, Trash, X, Eye } from '@phosphor-icons/react';

const MySwal = withReactContent(Swal);
const API_URL = getApiBaseUrl();

const fetcherTransaksi = url => axios.get(url, { withCredentials: true }).then(res => res.data);
const fetcherBarang = url => axios.get(url, { withCredentials: true }).then(res => res.data.data);

const Transaksi = () => {
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
  
  const { user } = useSelector((state) => state.auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  const [formData, setFormData] = useState({
    order_id: '',
    pembayaran: 'cash',
    items: [],
  });

  const { data: transaksiData = {}, error: transaksiError, isLoading: isLoadingTransaksi, mutate: mutateTransaksi } = useSWR(
    `${API_URL}/gettransaksi?page=${page + 1}&limit=${rowsPerPage}`,
    fetcherTransaksi
  );

  const transaksis = transaksiData.data || [];
  const totalItems = transaksiData.totalItems || 0;
  const totalPages = transaksiData.totalPages || 0;



  const { data: barangs = [], error: barangError, isLoading: isLoadingBarang } = useSWR(
    `${API_URL}/getbarang`,
    fetcherBarang
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetailModal = (transaksi) => {
    setSelectedTransaksi(transaksi);
    setOpenDetailModal(true);
  };
  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedTransaksi(null);
  };
  const handleOpenEditModal = (transaksi) => {
    setSelectedTransaksi(transaksi);
    const detailItems = (transaksi.details || transaksi.TransaksiDetails || []).map(d => ({
      barangId: d.barangId,
      jumlahbarang: d.jumlahbarang,
    }));
    setFormData({
      order_id: transaksi.order_id,
      pembayaran: transaksi.pembayaran || 'cash',
      items: detailItems,
    });
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    resetForm();
    setSelectedTransaksi(null);
  };

  const resetForm = () => {
    setFormData({
      order_id: '',
      pembayaran: 'cash',
      items: [],
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: field === 'jumlahbarang' ? Number(value) : Number(value) };
      return { ...prev, items: updated };
    });
  };

  const addItemRow = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, { barangId: barangs[0]?.id || 0, jumlahbarang: 1 }] }));
  };

  const removeItemRow = (index) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  // CRUD 
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {};
      if (formData.items && formData.items.length > 0) {
        payload.items = formData.items.map(it => ({
          barangId: Number(it.barangId),
          jumlahbarang: Number(it.jumlahbarang)
        }));
        payload.pembayaran = formData.pembayaran;
      }
      await axios.put(`${API_URL}/updatetransaksi/${selectedTransaksi.id}`, payload, { withCredentials: true });

      MySwal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Transaksi berhasil diperbarui!',
        showConfirmButton: false,
        timer: 1500
      });
      handleCloseEditModal();
      mutateTransaksi();
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.message || 'Terjadi kesalahan saat memperbarui transaksi.',
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
          await axios.delete(`${API_URL}/deletetransaksi/${id}`, { withCredentials: true });
          MySwal.fire(
            'Dihapus!',
            'Transaksi berhasil dihapus.',
            'success'
          );
          mutateTransaksi();
        } catch (error) {
          MySwal.fire({
            icon: 'error',
            title: 'Gagal',
            text: error.response?.data?.message || 'Terjadi kesalahan saat menghapus transaksi.',
          });
        }
      }
    });
  };

  const renderDetailModal = () => {
    if (!selectedTransaksi) return null;

    const details = selectedTransaksi.TransaksiDetails || selectedTransaksi.details || [];

    return (
      <Modal open={openDetailModal} onClose={handleCloseDetailModal}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Detail Transaksi</Typography>
            <IconButton onClick={handleCloseDetailModal}>
              <X size={24} />
            </IconButton>
          </Box>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Order ID:</Typography>
              <Typography>{selectedTransaksi.order_id}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Tanggal:</Typography>
              <Typography>{new Date(selectedTransaksi.tanggal).toLocaleDateString()}</Typography>
            </Grid>
           
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Status Pembayaran:</Typography>
              <Chip
                label={selectedTransaksi.status_pembayaran}
                color={selectedTransaksi.status_pembayaran === 'settlement' ? 'success' : 'warning'}
              />
            </Grid>
             <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Subtotal:</Typography>
              <Typography>Rp {parseFloat(selectedTransaksi.subtotal || 0).toLocaleString('id-ID')}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">PPN:</Typography>
              <Typography>Rp {parseFloat(selectedTransaksi.ppn_amount || 0).toLocaleString('id-ID')}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">Total Jual:</Typography>
              <Typography>Rp {parseFloat(selectedTransaksi.totaljual).toLocaleString('id-ID')}</Typography>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Daftar Barang</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nama Barang</TableCell>
                  <TableCell>Jumlah</TableCell>
                  <TableCell>Harga Satuan</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {details.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.Barang?.namabarang || item.barang?.namabarang || 'N/A'}</TableCell>
                    <TableCell>{item.jumlahbarang}</TableCell>
                    <TableCell>Rp {parseFloat(item.harga).toLocaleString('id-ID')}</TableCell>
                    <TableCell>Rp {parseFloat(item.total).toLocaleString('id-ID')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>
    );
  };

  // Component untuk modal update transaksi
  const renderEditModal = () => (
    <Modal open={openEditModal} onClose={handleCloseEditModal}>
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Edit Transaksi</Typography>
          <IconButton onClick={handleCloseEditModal}>
            <X size={24} />
          </IconButton>
        </Box>
        <form onSubmit={handleUpdate}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Order ID"
                name="order_id"
                value={formData.order_id}
                onChange={handleInputChange}
                disabled // Order ID tidak boleh diubah
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipe Pembayaran</InputLabel>
                <Select
                  name="pembayaran"
                  value={formData.pembayaran}
                  label="Tipe Pembayaran"
                  onChange={handleInputChange}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  {/* <MenuItem value="qris">QRIS</MenuItem> */}
                </Select>
              </FormControl>
            </Grid>
           
            {/* Daftar Item */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Item Transaksi</Typography>
              {formData.items.map((item, idx) => (
                <Grid container spacing={1} key={idx} sx={{ mb: 1 }}>
                  <Grid item xs={7} sm={7}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Barang</InputLabel>
                      <Select
                        label="Barang"
                        value={item.barangId || ''}
                        onChange={(e) => handleItemChange(idx, 'barangId', e.target.value)}
                        disabled={isLoadingBarang}
                      >
                        {isLoadingBarang ? (
                          <MenuItem disabled>Memuat Barang...</MenuItem>
                        ) : (
                          barangs.map((b) => (
                            <MenuItem key={b.id} value={b.id}>{b.namabarang}</MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3} sm={3}>
                    <TextField
                      label="Qty"
                      type="number"
                      size="small"
                      value={item.jumlahbarang}
                      onChange={(e) => handleItemChange(idx, 'jumlahbarang', e.target.value)}
                      inputProps={{ min: 1 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2} sm={2}>
                    <Button color="error" variant="outlined" onClick={() => removeItemRow(idx)} sx={{ height: '100%' }}>
                      Hapus
                    </Button>
                  </Grid>
                </Grid>
              ))}
              <Button variant="contained" onClick={addItemRow} disabled={isLoadingBarang}>
                Tambah Item
              </Button>
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

  const renderContent = () => {
    if (isLoadingTransaksi) {
      return (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (transaksiError || !transaksis || transaksis.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {transaksiError ? 'Gagal memuat data.' : 'Belum ada data transaksi.'}
          </Typography>
        </Box>
      );
    }

    return (
      <>
        {isMobile ? (
          <>
            <Grid container spacing={2}>
              {transaksis.map((transaksi) => (
                <Grid item xs={12} key={transaksi.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">ID Transaksi: {transaksi.id}</Typography>
                      <Typography variant="body2" color="text.secondary">Order ID: {transaksi.order_id}</Typography>
                      <Typography variant="body2" color="text.secondary">Total Jual: {transaksi.totaljual}</Typography>
                   
                     
                       <Typography variant="body2" color="text.secondary">Status: {transaksi.status_pembayaran}</Typography>
                   
                      <Typography variant="body2" color="text.secondary">Customer Name: {transaksi.customer_name}</Typography>

                      <Box sx={{ mt: 2 }}>
                        <IconButton onClick={() => handleOpenDetailModal(transaksi)}>
                          <Eye size={24} color="#007bff" />
                        </IconButton>
                        {isAdmin && (
                          <>
                            <IconButton onClick={() => handleOpenEditModal(transaksi)}>
                              <PencilSimple size={24} />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(transaksi.id)}>
                              <Trash size={24} />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {/* Mobile Pagination */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <TablePagination
                component="div"
                count={totalItems}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Per halaman:"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
                }
              />
            </Box>
          </>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Total Jual</TableCell>
                  <TableCell>Total PPN</TableCell>
                  <TableCell>Transaksi Meja</TableCell>
                  <TableCell>Kasir Accepted</TableCell>
                   <TableCell>Status</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transaksis.map((transaksi, index) => (
                  <TableRow key={transaksi.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{transaksi.order_id}</TableCell>
                    <TableCell>Rp {parseFloat(transaksi.totaljual).toLocaleString('id-ID')}</TableCell>
                    <TableCell>Rp {parseFloat(transaksi.ppn_amount || 'Na').toLocaleString('id-ID')}</TableCell>
                    <TableCell>{transaksi.ordermeja || 'Tidak'}</TableCell>
                    <TableCell>{transaksi.cashier_accepted}</TableCell>
                    <TableCell> <Chip
                label={transaksi.status_pembayaran || 'N/A'}
                color={transaksi.status_pembayaran === 'settlement' ? 'success' : 'warning'}
              /></TableCell>
                    <TableCell>{transaksi.Customer?.nama || transaksi.customer_name || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenDetailModal(transaksi)}>
                        <Eye size={24} color="#007bff" />
                      </IconButton>
                      {isAdmin && (
                        <>
                          <IconButton onClick={() => handleOpenEditModal(transaksi)}>
                            <PencilSimple size={24} color="#3f51b5" />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(transaksi.id)}>
                            <Trash size={24} color="#f44336" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
     

      {renderContent()}

      {renderDetailModal()}
      {isAdmin && renderEditModal()}
    </Container>
  );
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500, md: 700 },
  maxHeight: '90%',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

export default Transaksi;
