/* eslint-disable no-unused-vars */
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
import { justifyContent, styled, useTheme } from "@mui/system";
import axios from 'axios';
import { 
  FaUsers, 
  FaBox, 
  FaShoppingCart, 
  FaMoneyBillWave,
  FaChartBar,
  FaCog,
  FaUserCog,
  FaBoxes,
  FaTable,
  FaBell,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaFilter,
  FaCalendarAlt
} from 'react-icons/fa';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress
} from "@mui/material";
import Me from "../../fitur/AuthSlice"
import { getApiBaseUrl } from '../api';
import { useSelector } from "react-redux";

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

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useSelector((state) => state.auth || {});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats and transactions simultaneously
      const [statsResponse, transactionsResponse] = await Promise.all([
        axios.get(`${getApiBaseUrl()}/total`, {withCredentials: true}),
        axios.get(`${getApiBaseUrl()}/gettransaksi?page=1&limit=1000`, {withCredentials: true})
      ]);
      
      setStats(statsResponse.data);
      setTransactions(transactionsResponse.data.data || []);
    } catch (err) {
      setError('Gagal memuat data dashboard');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
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
            Try Again
          </Button>
        </Card>
      </Box>
    );
  }

  // Process transaction data for charts
  const processTransactionData = () => {
    if (!transactions || transactions.length === 0) {
      return {
        dailyRevenue: [],
        paymentMethods: { cash: 0, qris: 0 },
        monthlyData: []
      };
    }

    // Create array of last 7 days
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
    const dailyRevenueMap = transactions.reduce((acc, transaction) => {
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
    const paymentMethods = transactions.reduce((acc, transaction) => {
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

  const lineChartData = {
    labels: chartData.dailyRevenue.map(item => item.date).slice(-7), 
    datasets: [
      {
        label: 'Revenue',
        data: chartData.dailyRevenue.map(item => item.amount / 1000).slice(-7),
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

  const totalTransactions = (stats?.cash_transactions || 0) + (stats?.qris_transactions || 0);
  const cashPercentage = totalTransactions > 0 ? (stats?.cash_transactions / totalTransactions) * 100 : 0;
  const qrisPercentage = totalTransactions > 0 ? (stats?.qris_transactions / totalTransactions) * 100 : 0;
  
  const doughnutData = {
    labels: ['Cash', 'QRIS'],
    datasets: [
      {
        data: [cashPercentage, qrisPercentage],
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

  return (
    <DashboardContainer>
      {/* Header with Welcome and Revenue */}
      <HeaderSection>
        <WelcomeRevenueCard>
          <Grid container spacing={3} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
               Selamat datang kembali, {user?.username || "Admin"}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Selamat bekerja
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                Total Revenue
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 50, mb: 1 }}>
                {formatCurrency(parseFloat(stats?.completed_sales || 0))}
              </Typography>
              {/* <Typography variant="body2" sx={{ opacity: 0.8 }}>
                +{stats?.total_transactions || 0} transactions this month
              </Typography> */}
            </Grid>
          </Grid>
        </WelcomeRevenueCard>
      </HeaderSection>

      <Grid container spacing={3}>
        {/* Metric Cards Row */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
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
                      <FaUsers color="#667eea" />
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                    {stats?.total_users || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </CardContent>
              </MetricCard>
            </Grid>
            
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
                      <FaBox color="#f093fb" />
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#f093fb' }}>
                    {stats?.total_products || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All Products
                  </Typography>
                </CardContent>
              </MetricCard>
            </Grid>
            
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
                      <FaShoppingCart color="#43e97b" />
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#43e97b' }}>
                    {stats?.total_transactions || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </CardContent>
              </MetricCard>
              
            </Grid>
            
            <Grid item xs={6} md={3}>
              <MetricCard bgcolor="#fff">
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '10px', 
                      background: 'rgba(255, 167, 38, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaUsers color="#ffa726" />
                    </Box>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#ffa726' }}>
                    {stats?.total_customers || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Customers
                  </Typography>
                </CardContent>
              </MetricCard>
            </Grid>
          </Grid>
             {/* Sales Performance Card - Moved below metric cards */}
             <Grid item xs={12} sx={{ mt: 5, mb: 3, px: 2 }}>
          <ProgressCard>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Peforma Penjualan
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Completed</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(parseFloat(stats?.completed_sales || 0))}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={90} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(67, 233, 123, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#43e97b',
                    borderRadius: 4
                  }
                }} 
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Pending</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(parseFloat(stats?.pending_sales || 0))}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={10} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 167, 38, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#ffa726',
                    borderRadius: 4
                  }
                }} 
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Today's Sales
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#667eea' }}>
                {formatCurrency(parseFloat(stats?.today_sales || 0))}
              </Typography>
            </Box>
          </ProgressCard>
        </Grid>
        </Grid>

     

        {/* Charts Row */}
 <Grid item xs={12} md={12} width={530}>
  <ChartCard>
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
      Penjualan
    </Typography>
    <Box sx={{ height: '320px' }}>
      <Line data={lineChartData} options={chartOptions} />
    </Box>
  </ChartCard>
</Grid>


        {/* Recent Sales Table */}
        <Grid item xs={12} md={8}>
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
                    <TableCell>Customer</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.slice(0, 5).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {transaction.order_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {transaction.Customer?.nama || 'N/A'}
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
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(parseFloat(transaction.totaljual || 0))}
                        </Typography>
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
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default Dashboard;