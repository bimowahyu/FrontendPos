import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { styled } from "@mui/system";
import axios from 'axios';
import { 
  FaBox, 
  FaShoppingCart, 
  FaMoneyBillWave,
  FaChartBar
} from 'react-icons/fa';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  useMediaQuery,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress
} from "@mui/material";
import { useSelector } from "react-redux";
import { getApiBaseUrl } from '../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler
);

// Main Dashboard Container
const DashboardContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8fafc',
  minHeight: '100vh',
  padding: theme.spacing(3),
}));

// Header Section
const HeaderSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

// Welcome Card with Revenue
const WelcomeRevenueCard = styled(Card)(({ theme }) => ({
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '150px',
    height: '150px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    transform: 'translate(50px, -50px)',
  }
}));

// Metric Cards
const MetricCard = styled(Card)(({ theme, bgcolor }) => ({
  borderRadius: '16px',
  padding: theme.spacing(2),
  height: '120px',
  backgroundColor: bgcolor || '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  }
}));

// Chart Container
const ChartCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(3),
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  height: '400px'
}));

// Table Card
const TableCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  overflow: 'hidden'
}));

// Progress Card
const ProgressCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(2),
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  height: '160px'
}));

const DashboardAdminPages = () => {
  const [dashboardData, setDashboardData] = useState({
    totalBarang: 0,
    totalKategori: 0,
    totalTransaksi: 0,
    totalRevenue: 0,
    barangData: [],
    kategoriData: [],
    transaksiData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth || {});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data dari semua API
      const [barangResponse, kategoriResponse, transaksiResponse] = await Promise.all([
        axios.get(`${getApiBaseUrl()}/getbarangmobile`,{withCredentials: true}),
         axios.get(`${getApiBaseUrl()}/getkategori`,{withCredentials: true}),
         axios.get(`${getApiBaseUrl()}/gettransaksi`,{withCredentials: true})
      ]);

      const barangData = barangResponse.data.data || [];
      const kategoriData = kategoriResponse.data.data || [];
      const transaksiData = transaksiResponse.data.data || [];

      // Hitung total revenue dari transaksi
      const totalRevenue = transaksiData.reduce((total, transaksi) => {
        return total + parseFloat(transaksi.totaljual || 0);
      }, 0);

      setDashboardData({
        totalBarang: barangData.length,
        totalKategori: kategoriData.length,
        totalTransaksi: transaksiData.length,
        totalRevenue: totalRevenue,
        barangData: barangData,
        kategoriData: kategoriData,
        transaksiData: transaksiData
      });

    } catch (err) {
      setError('Gagal memuat data dashboard');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Process transaction data untuk charts
  const processTransactionData = () => {
    const { transaksiData } = dashboardData;
    
    if (!transaksiData || transaksiData.length === 0) {
      return {
        dailyRevenue: [],
        paymentMethods: { cash: 0, qris: 0 },
        monthlyData: []
      };
    }

    // Data revenue 7 hari terakhir
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date,
        dateString: date.toLocaleDateString('id-ID', {
          month: 'short',
          day: 'numeric'
        }),
        fullDate: date.toISOString().split('T')[0]
      });
    }

    const dailyRevenueMap = transaksiData.reduce((acc, transaction) => {
      const transactionDate = new Date(transaction.tanggal);
      const dateKey = transactionDate.toISOString().split('T')[0]; 
      acc[dateKey] = (acc[dateKey] || 0) + parseFloat(transaction.totaljual || 0);
      return acc;
    }, {});

    const dailyRevenue = last7Days.map(day => ({
      date: day.dateString,
      amount: dailyRevenueMap[day.fullDate] || 0,
      fullDate: day.fullDate
    }));

    // Data metode pembayaran
    const paymentMethods = transaksiData.reduce((acc, transaction) => {
      const method = transaction.pembayaran?.toLowerCase() || 'cash';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, { cash: 0, qris: 0 });

    return {
      dailyRevenue,
      paymentMethods,
      monthlyData: dailyRevenue
    };
  };

  const chartData = processTransactionData();

  // Line Chart Data untuk Revenue
  const lineChartData = {
    labels: chartData.dailyRevenue.map(item => item.date),
    datasets: [
      {
        label: 'Revenue Harian',
        data: chartData.dailyRevenue.map(item => item.amount),
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#667eea',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
      },
    ],
  };

  // Doughnut Chart Data untuk Metode Pembayaran
  const totalTransactions = dashboardData.totalTransaksi;
  const cashCount = chartData.paymentMethods.cash;
  const qrisCount = chartData.paymentMethods.qris;
  
  const doughnutData = {
    labels: ['Cash', 'QRIS'],
    datasets: [
      {
        data: [cashCount, qrisCount],
        backgroundColor: ['#667eea', '#f093fb'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(0,0,0,0.05)',
        },
        border: {
          display: false,
        },
        beginAtZero: true,
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: '70%',
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'settlement': return '#43e97b';
      case 'pending': return '#ffa726';
      case 'cancel': return '#f56565';
      default: return '#94a3b8';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Box textAlign="center">
          <Box
            sx={{
              width: 60,
              height: 60,
              border: "3px solid #f0f0f0",
              borderTop: "3px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
          <Typography variant="h6" color="text.secondary">
            Loading Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px' }}>
          <Typography variant="h6" color="error" gutterBottom>
            {error}
          </Typography>
          <Button onClick={fetchDashboardData} variant="contained" sx={{ mt: 2 }}>
            Coba Lagi
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <DashboardContainer>
      {/* Header dengan Welcome dan Revenue */}
      <HeaderSection>
        <WelcomeRevenueCard>
          <Grid container spacing={3} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                Selamat datang kembali, {user?.username || "Admin"}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Selamat bekerja hari ini!
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                Total Revenue
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 50, mb: 1 }}>
                {formatCurrency(dashboardData.totalRevenue)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {dashboardData.totalTransaksi} transaksi
              </Typography>
            </Grid>
          </Grid>
        </WelcomeRevenueCard>
      </HeaderSection>

      <Grid container spacing={3}>
        {/* Metric Cards Row */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Total Barang Card */}
            <Grid item xs={6} md={3}>
              <MetricCard bgcolor="#fff">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '10px', 
                      background: 'rgba(102, 126, 234, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaBox color="#667eea" />
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                    {dashboardData.totalBarang}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Barang
                  </Typography>
                </CardContent>
              </MetricCard>
            </Grid>
            
            {/* Total Kategori Card */}
            <Grid item xs={6} md={3}>
              <MetricCard bgcolor="#fff">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '10px', 
                      background: 'rgba(240, 147, 251, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaChartBar color="#f093fb" />
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#f093fb' }}>
                    {dashboardData.totalKategori}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Kategori
                  </Typography>
                </CardContent>
              </MetricCard>
            </Grid>
            
            {/* Total Transaksi Card */}
            <Grid item xs={8} md={3}>
              <MetricCard bgcolor="#fff">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '10px', 
                      background: 'rgba(67, 233, 123, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaShoppingCart color="#43e97b" />
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#43e97b' }}>
                    {dashboardData.totalTransaksi}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transaksi
                  </Typography>
                </CardContent>
              </MetricCard>
            </Grid>
            
            {/* Revenue Card */}
            <Grid item xs={6} md={3}>
             <MetricCard bgcolor="#fff">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '10px', 
                      background: 'rgba(67, 233, 123, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaMoneyBillWave color="#ffa726" />
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffa726' }}>
                    {formatCurrency(dashboardData.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </CardContent>
              </MetricCard>
            </Grid>
          </Grid>
        </Grid>

        {/* Charts Row
       

        <Grid item xs={12} md={4}>
          <ChartCard>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Metode Pembayaran
            </Typography>
            <Box sx={{ height: '320px', position: 'relative' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {dashboardData.totalTransaksi}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#667eea', borderRadius: '50%' }} />
                <Typography variant="body2">Cash: {cashCount}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, backgroundColor: '#f093fb', borderRadius: '50%' }} />
                <Typography variant="body2">QRIS: {qrisCount}</Typography>
              </Box>
            </Box>
          </ChartCard>
        </Grid> */}

       
        </Grid>
         <Grid item xs={12} md={8}>
          <ChartCard>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Revenue 7 Hari Terakhir
            </Typography>
            <Box sx={{ height: '320px' }}>
              <Line data={lineChartData} options={chartOptions} />
            </Box>
          </ChartCard>
        </Grid>
         {/* Recent Transactions Table */}
      
          <TableCard>
            <Box sx={{ p: 3, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Transaksi Terbaru
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Metode</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tanggal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.transaksiData.slice(0, 5).map((transaction) => (
                    <TableRow key={transaction.uuid}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {transaction.order_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(parseFloat(transaction.totaljual || 0))}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {transaction.pembayaran}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.status_pembayaran}
                          sx={{ 
                            backgroundColor: getStatusColor(transaction.status_pembayaran),
                            color: 'white',
                            fontWeight: 600,
                            borderRadius: '6px'
                          }}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.tanggal).toLocaleDateString('id-ID')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TableCard>
     
    </DashboardContainer>
  );
};

export default DashboardAdminPages;