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
  TextField,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import moment from 'moment';

const MySwal = withReactContent(Swal);
const API_URL = getApiBaseUrl();

const fetcher = url => axios.get(url, { withCredentials: true }).then(res => res.data);

const currencyFormatter = (value) => {
  if (value === null || typeof value === 'undefined') return 'Rp 0';
  return `Rp ${parseFloat(value).toLocaleString('id-ID')}`;
};

export const Rekap = () => {
  const isMobile = useMediaQuery(useTheme().breakpoints.down('sm'));
  const { user } = useSelector((state) => state.auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterBy, setFilterBy] = useState('day');
  const [rekapData, setRekapData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      const fetchData = async () => {
        setIsLoading(true);
        setIsError(false);
        try {
          const response = await axios.get(`${API_URL}/getrekap`, {
            params: {
              startDate: startDate,
              endDate: endDate,
              filterBy: filterBy,
            },
            withCredentials: true,
          });
          setRekapData(response.data);
          setIsLoading(false);
        } catch (error) {
          console.error("Failed to fetch rekap data:", error);
          setIsError(true);
          setIsLoading(false);
          setRekapData(null);
        }
      };
      fetchData();
    }
  }, [isAdmin, startDate, endDate, filterBy]);
  const renderContent = () => {
    if (!isAdmin) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Akses Ditolak. Halaman ini hanya untuk admin.
          </Typography>
        </Box>
      );
    }

    if (isLoading) {
      return (
        <Grid container spacing={3}>
          {[...Array(3)].map((_, index) => (
            <Grid item xs={12} key={index}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (isError || !rekapData || !rekapData.data || rekapData.data.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            {isError ? 'Gagal memuat data rekap.' : 'Tidak ada data rekap untuk periode ini.'}
          </Typography>
        </Box>
      );
    }

    const firstRekap = rekapData.data[0];

    return (
      <>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">Total Transaksi</Typography>
                <Typography variant="h5">{firstRekap.totalTransaksi}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">Total Penjualan</Typography>
                <Typography variant="h5" color="primary">{currencyFormatter(firstRekap.totalJualMurni)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">Total Keuntungan</Typography>
                <Typography variant="h5" color="success.main">{currencyFormatter(firstRekap.totalKeuntungan)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" color="text.secondary">Total Item Terjual</Typography>
                <Typography variant="h5">{firstRekap.totalItemTerjual}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Detail Transaksi
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
              <TableCell>No</TableCell>
                <TableCell>ID Transaksi</TableCell>
                <TableCell>Tanggal</TableCell>
                <TableCell>Nama Barang</TableCell>
                <TableCell>Jumlah</TableCell>
                 <TableCell>Harga</TableCell>
                <TableCell>Keuntungan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {firstRekap.details.map((detail, index) => (
                <TableRow key={detail.idTransaksi}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{detail.idTransaksi}</TableCell>
                  <TableCell>{moment(detail.tanggal).format('DD MMMM YYYY')}</TableCell>
                  <TableCell>{detail.namaBarang}</TableCell>
                  <TableCell>{detail.jumlah}</TableCell>
                   <TableCell>{currencyFormatter(detail.harga)}</TableCell>
                  <TableCell>{currencyFormatter(detail.keuntungan)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* <Typography variant="h4" component="h1" sx={{ mb: isMobile ? 2 : 0 }}>
          Laporan Rekap Penjualan
        </Typography> */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            label="Tanggal Mulai"
            type="date"
            variant="outlined"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            sx={{ mr: 2, mb: isMobile ? 2 : 0 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Tanggal Akhir"
            type="date"
            variant="outlined"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            sx={{ mr: 2, mb: isMobile ? 2 : 0 }}
            InputLabelProps={{ shrink: true }}
          />
          <FormControl sx={{ mr: 2, mb: isMobile ? 2 : 0, minWidth: 120 }} size="small">
            <InputLabel>Filter</InputLabel>
            <Select
              value={filterBy}
              label="Filter"
              onChange={(e) => setFilterBy(e.target.value)}
            >
              <MenuItem value="day">Harian</MenuItem>
              <MenuItem value="month">Bulanan</MenuItem>
              <MenuItem value="year">Tahunan</MenuItem>
            </Select>
          </FormControl>
          
        </Box>
      </Box>
      
      {renderContent()}
    </Container>
  );
};

export default Rekap;
