import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TablePagination,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Eye,
  ArrowClockwise,
  CheckCircle,
  Clock,
  XCircle,
  CreditCard,
  Money,
  QrCode,
  Calendar,
  ChartLine,
  ShoppingCart,
  Package,
  CurrencyDollar,
} from '@phosphor-icons/react';
import axios from 'axios';
import { getApiBaseUrl } from '../api';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

const HistoryTransaksi = ({ open, onClose }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filterBy, setFilterBy] = useState('day');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rekapData, setRekapData] = useState(null);

  const user = useSelector(state => state.auth.user);
  const apiBaseUrl = getApiBaseUrl();

  // Fetch rekap data
  const { data: rekapResponse, mutate, error } = useSWR(
    `${apiBaseUrl}/getrekap?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&filterBy=${filterBy}`,
    (url) => axios.get(url, { withCredentials: true }).then(res => res.data),
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (rekapResponse && rekapResponse.success) {
      setRekapData(rekapResponse.data[0]); // Ambil data pertama dari array
    }
  }, [rekapResponse]);

  // Fungsi untuk handle perubahan halaman
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Fungsi untuk handle perubahan jumlah baris per halaman
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'settlement':
        return 'success';
      case 'pending':
        return 'warning';
      case 'expire':
      case 'cancel':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'settlement':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'expire':
      case 'cancel':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getPaymentIcon = (method) => {
    switch (method) {
      case 'cash':
        return <Money size={16} />;
      case 'qris':
        return <QrCode size={16} />;
      default:
        return <CreditCard size={16} />;
    }
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await mutate();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterChange = (value) => {
    setFilterBy(value);
    // Auto set date range based on filter
    const today = new Date().toISOString().split('T')[0];
    if (value === 'day') {
      setDateRange({ startDate: today, endDate: today });
    } else if (value === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      setDateRange({ 
        startDate: weekAgo.toISOString().split('T')[0], 
        endDate: today 
      });
    } else if (value === 'month') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      setDateRange({ 
        startDate: monthAgo.toISOString().split('T')[0], 
        endDate: today 
      });
    }
  };

  const renderSummaryCards = () => {
    if (!rekapData) return null;

    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {formatCurrency(rekapData.totalJualMurni)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Penjualan
                  </Typography>
                </Box>
                <CurrencyDollar size={32} color="#4caf50" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {formatCurrency(rekapData.totalKeuntungan)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Keuntungan
                  </Typography>
                </Box>
                <ChartLine size={32} color="#2196f3" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="warning.main" fontWeight="bold">
                    {rekapData.totalTransaksi}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transaksi
                  </Typography>
                </Box>
                <ShoppingCart size={32} color="#ff9800" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" color="info.main" fontWeight="bold">
                    {rekapData.totalItemTerjual}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Item Terjual
                  </Typography>
                </Box>
                <Package size={32} color="#00bcd4" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderTransactionDetails = () => {
    if (!selectedTransaction) return null;

    return (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informasi Transaksi
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="ID Transaksi" 
                      secondary={selectedTransaction.idTransaksi} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Tanggal" 
                      secondary={formatDate(selectedTransaction.tanggal)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Produk" 
                      secondary={selectedTransaction.namaBarang} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Kategori" 
                      secondary={selectedTransaction.kategori} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Detail Pembayaran
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Harga" 
                      secondary={formatCurrency(selectedTransaction.harga)} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Jumlah" 
                      secondary={selectedTransaction.jumlah} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Keuntungan" 
                      secondary={formatCurrency(selectedTransaction.keuntungan)} 
                    />
                  </ListItem>
                  <ListItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPaymentIcon(selectedTransaction.metodePembayaran)}
                      <ListItemText 
                        primary="Metode" 
                        secondary={selectedTransaction.metodePembayaran === 'cash' ? 'Tunai' : 'QRIS'} 
                      />
                    </Box>
                  </ListItem>
                  <ListItem>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(selectedTransaction.statusPembayaran)}
                      <Chip 
                        label={selectedTransaction.statusPembayaran.toUpperCase()}
                        color={getStatusColor(selectedTransaction.statusPembayaran)}
                        size="small"
                      />
                    </Box>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderTransactionTable = () => {
    if (!rekapData || !rekapData.details || rekapData.details.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Tidak ada data transaksi untuk periode yang dipilih.
        </Alert>
      );
    }

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detail Transaksi ({rekapData.details.length} item)
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Produk</TableCell>
                  <TableCell align="center">Kategori</TableCell>
                  <TableCell align="center">Qty</TableCell>
                  <TableCell align="right">Harga</TableCell>
                  <TableCell align="right">Keuntungan</TableCell>
                  <TableCell align="center">Metode</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rekapData.details
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((detail, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(detail.tanggal).toLocaleDateString('id-ID')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {detail.namaBarang}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={detail.kategori} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {detail.jumlah}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(detail.harga)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        {formatCurrency(detail.keuntungan)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        {getPaymentIcon(detail.metodePembayaran)}
                        <Typography variant="caption">
                          {detail.metodePembayaran === 'cash' ? 'Tunai' : 'QRIS'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={detail.statusPembayaran}
                        color={getStatusColor(detail.statusPembayaran)}
                        size="small"
                        icon={getStatusIcon(detail.statusPembayaran)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewDetails(detail)}
                        color="primary"
                      >
                        <Eye size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rekapData.details.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Baris per halaman:"
          />
        </CardContent>
      </Card>
    );
  };

   return (
    <Box sx={{ p: 2 }}>
      {/* Hapus Dialog wrapper dan ganti dengan Box biasa */}
      
      {/* Date Range Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Calendar size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Rekap Harian Transaksi
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Laporan Transaksi
            </Typography>
            <Button
              variant="outlined"
              startIcon={isLoading ? <CircularProgress size={16} /> : <ArrowClockwise />}
              onClick={handleRefresh}
              disabled={isLoading}
              size="small"
            >
              Refresh
            </Button>
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Periode</InputLabel>
                <Select
                  value={filterBy}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  label="Periode"
                >
                  <MenuItem value="day">Hari Ini</MenuItem>
                  <MenuItem value="week">7 Hari</MenuItem>
                  <MenuItem value="month">30 Hari</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Tanggal Mulai"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Tanggal Akhir"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Periode: {dateRange.startDate} sampai {dateRange.endDate}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Gagal memuat data rekap: {error.message}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Summary Cards */}
      {!isLoading && renderSummaryCards()}

      {/* Transactions Table */}
      {!isLoading && renderTransactionTable()}

      {/* Detail Modal - Tetap pakai Dialog untuk detail */}
      <Dialog
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detail Transaksi
          <IconButton
            onClick={() => setShowDetailModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <XCircle />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {renderTransactionDetails()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailModal(false)}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoryTransaksi;