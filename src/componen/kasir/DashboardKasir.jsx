/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { useTheme } from "@mui/system";
import axios from 'axios';
import { getApiBaseUrl } from '../api'
import { useSelector, useDispatch } from "react-redux";
import { Me } from '../../fitur/AuthSlice';
import useSWR from 'swr';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  Paper,
  useMediaQuery,
  IconButton,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer as MuiDrawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CssBaseline,
  Snackbar,
  InputAdornment,
  Badge,
  AppBar,
  Toolbar,
  
  Container,
  Fab,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import {
  LogoutOutlined,
  HomeOutlined,
  ReceiptOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import {
  Plus,
  Minus,
  Trash,
  X,
  ShoppingCart,
  User,
  Receipt,
  Bluetooth,
  CheckCircle,
  CreditCard,
  House,
  MagnifyingGlass,
  TestTube,
  QrCode,
  Coffee,
  Hamburger,
  Pizza,
  ForkKnife,
} from '@phosphor-icons/react';
import HistoryTransaksi from './HistoryTransaksi';
import ThermalPrinterPage from './ThermalPrinter';
import { ThermalPrinter as PrinterClass, formatDateTime } from './PrinterConfig';
import { useNavigate } from 'react-router-dom';
import { Logout, reset } from '../../fitur/AuthSlice';

// Styled Components
const ModernProductCard = styled(Card)(({ theme, disabled }) => ({
  cursor: disabled ? 'not-allowed' : 'pointer',
  borderRadius: '20px',
  overflow: 'hidden',
  backgroundColor: 'white',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  border: 'none',
  transition: 'all 0.3s ease',
  opacity: disabled ? 0.6 : 1,
  '&:hover': {
    transform: disabled ? 'none' : 'translateY(-4px)',
    boxShadow: disabled ? '0 2px 12px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.12)',
  },
}));

const CategoryChip = styled(Chip)(({ theme, selected }) => ({
  borderRadius: '20px',
  padding: '8px 16px',
  height: '40px',
  fontWeight: 600,
  fontSize: '14px',
  backgroundColor: selected ? '#1a1a1a' : 'white',
  color: selected ? 'white' : '#666',
  border: selected ? 'none' : '1px solid #e0e0e0',
  boxShadow: selected ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
  '&:hover': {
    backgroundColor: selected ? '#1a1a1a' : '#f5f5f5',
  },
}));

const StockBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '12px',
  padding: '4px 12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#666',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

const FloatingCartButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 80,
  right: 20,
  backgroundColor: '#FF6B00',
  color: 'white',
  boxShadow: '0 4px 20px rgba(255, 107, 0, 0.4)',
  '&:hover': {
    backgroundColor: '#E55D00',
  },
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

const CategoryIcon = ({ category }) => {
  const icons = {
    'Beverages': <Coffee size={20} weight="fill" />,
    'Food': <Hamburger size={20} weight="fill" />,
    'Snack': <Pizza size={20} weight="fill" />,
  };
  return icons[category] || <ForkKnife size={20} weight="fill" />;
};

const DashboardKasir = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerMoney, setCustomerMoney] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [printerConnected, setPrinterConnected] = useState(false);
  const [printerDevice, setPrinterDevice] = useState(null);
  const [printerInstance, setPrinterInstance] = useState(null);
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [currentView, setCurrentView] = useState('home');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isTestingPrinter, setIsTestingPrinter] = useState(false);
  const [konfigurasi, setKonfigurasi] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const pollingRef = useRef(null);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isError, user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    if (!user && !isLoading && !isError) {
      dispatch(Me())
        .unwrap()
        .catch(() => {
          navigate('/');
        });
    }
  }, [dispatch, navigate, user, isLoading, isError]);

  const handleLogout = () => {
    try {
      dispatch(reset());
      dispatch(Logout());
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  const { data: productsData, error: productsError, mutate: mutateProducts } = useSWR(
    `${apiBaseUrl}/getbarangmobile`,
    (url) => axios.get(url, { withCredentials: true }).then(res => res.data)
  );

  const products = productsData?.data || [];
  const categories = [...new Set(products.map(p => p.Kategori?.namakategori).filter(Boolean))];

  const filteredProducts = products.filter(product => {
  const matchesCategory = selectedCategory === 'all' ||
    (product.Kategori?.namakategori === selectedCategory) ||
    (selectedCategory === 'no-category' && !product.Kategori);
  const productName = product.namabarang?.toLowerCase() || '';
  const productCode = product.kode?.toLowerCase() || '';
  const searchLower = searchTerm.toLowerCase();
  
  const matchesSearch = productName.includes(searchLower) || 
    productCode.includes(searchLower);
  
  return matchesCategory && matchesSearch;
});

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const addToCart = (product) => {
    const productId = product.uuid || product.id;

    if (!productId) {
      setNotification({
        open: true,
        message: 'Produk tidak memiliki identifier yang valid',
        severity: 'error'
      });
      return;
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === productId);

      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1
        };
        return updatedCart;
      } else {
        return [...prevCart, {
          id: productId,
          uuid: product.uuid,
          kode: product.kode,
          namabarang: product.namabarang,
          harga: parseFloat(product.harga),
          quantity: 1
        }];
      }
    });

    setNotification({
      open: true,
      message: 'Item ditambahkan ke keranjang',
      severity: 'success'
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.harga * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateChange = () => {
    const money = parseFloat(customerMoney) || 0;
    const total = getCartTotal();
    return money - total;
  };

  const handleClosePaymentModal = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    setShowPaymentModal(false);
    setCustomerName('');
    setCustomerMoney('');
    setPaymentMethod('cash');
    setPaymentStatus('idle');
    setQrCodeUrl('');
    setOrderId('');
  };

  const connectPrinter = async () => {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Bluetooth tidak didukung di browser ini. Gunakan Chrome, Edge, atau Opera.');
      }

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
          '0000180a-0000-1000-8000-00805f9b34fb',
          '0000180f-0000-1000-8000-00805f9b34fb'
        ]
      });

      const printer = new PrinterClass(device, {
        autoReconnect: true,
        maxReconnectAttempts: 3,
        reconnectDelay: 2000,
        heartbeatInterval: 15000
      });

      await printer.connect();

      printer.onConnectionChange((status) => {
        if (status === 'disconnected') {
          setPrinterConnected(false);
          setPrinterDevice(null);
          setNotification({
            open: true,
            message: 'Koneksi printer terputus',
            severity: 'warning'
          });
        } else if (status === 'reconnected') {
          setPrinterConnected(true);
          setNotification({
            open: true,
            message: 'Printer terhubung kembali',
            severity: 'success'
          });
        }
      });

      setPrinterDevice(device);
      setPrinterInstance(printer);
      setPrinterConnected(true);
      setNotification({
        open: true,
        message: `Printer "${device.name}" terhubung`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error connecting to printer:', error);
      setNotification({
        open: true,
        message: 'Gagal menghubungkan printer',
        severity: 'error'
      });
    }
  };

  const printReceipt = async (transactionData) => {
    if (!printerConnected || !printerInstance) {
      return;
    }

    try {
      await printerInstance.ensureConnected();

      const receiptData = {
        storeName: konfigurasi?.namaToko || 'KASIR SYSTEM',
        storeAddress: konfigurasi?.alamat || '',
        storePhone: konfigurasi?.noTelp || '',
        orderId: transactionData.orderId || `ORDER-${Date.now()}`,
        date: formatDateTime(new Date()),
        cashier: user?.username || user?.name || 'Unknown',
        customerName: customerName || 'Walk-in Customer',
        items: transactionData.items.map(item => ({
          name: item.namabarang,
          quantity: item.quantity,
          price: item.harga,
          total: item.harga * item.quantity
        })),
        subtotal: transactionData.subtotal,
        tax: transactionData.ppn || 0,
        total: transactionData.total,
        paymentMethod: transactionData.paymentMethod === 'cash' ? 'Tunai' : 'QRIS',
        status: transactionData.status || 'Berhasil'
      };

      await printerInstance.printReceipt(receiptData);

      setNotification({
        open: true,
        message: 'Struk berhasil dicetak!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error printing:', error);
      setNotification({
        open: true,
        message: 'Gagal mencetak struk',
        severity: 'warning'
      });
    }
  };

  const processPayment = async () => {
    if (cart.length === 0) {
      setNotification({
        open: true,
        message: 'Keranjang kosong!',
        severity: 'error'
      });
      return;
    }

    if (paymentMethod === 'cash') {
      const money = parseFloat(customerMoney) || 0;
      const total = getCartTotal();

      if (money < total) {
        setNotification({
          open: true,
          message: 'Uang customer tidak mencukupi!',
          severity: 'error'
        });
        return;
      }
    }

    setIsProcessing(true);
    try {
      const items = cart.map(item => ({
        baranguuid: item.id,
        jumlahbarang: item.quantity
      }));

      const response = await axios.post(`${apiBaseUrl}/createtransaksi`, {
        pembayaran: paymentMethod,
        items: items,
        customer_name: customerName || null
      }, {
        withCredentials: true
      });

      if (response.data.status) {
        const transactionData = response.data.data;
        const transaksi = transactionData.transaksi;

        if (paymentMethod === 'qris' && transactionData.qris_data) {
          setQrCodeUrl(transactionData.qris_data.generated_image_url);
          setOrderId(transaksi.order_id);
          setPaymentStatus('pending');
        } else {
          setPaymentStatus('success');

          await printReceipt({
            orderId: transaksi.order_id,
            items: cart,
            subtotal: parseFloat(transaksi.subtotal || 0),
            ppn: parseFloat(transaksi.ppn_amount || 0),
            total: parseFloat(transaksi.totaljual || 0),
            paymentMethod: paymentMethod,
            status: 'Berhasil'
          });

          setTimeout(() => {
            setCart([]);
            handleClosePaymentModal();
          }, 1500);
        }

        setNotification({
          open: true,
          message: 'Transaksi berhasil!',
          severity: 'success'
        });

        mutateProducts();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('idle');
      setNotification({
        open: true,
        message: 'Gagal memproses pembayaran',
        severity: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderHome = () => (
    <Box>
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search menu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            backgroundColor: 'white',
            borderRadius: '16px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
              '& fieldset': {
                border: 'none',
              }
            },
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MagnifyingGlass size={20} color="#999" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Categories */}
      <Box sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        pb: 2,
        mb: 3,
        '&::-webkit-scrollbar': {
          display: 'none',
        }
      }}>
        <CategoryChip
          label="All Menu"
          selected={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
          icon={selectedCategory === 'all' ? <ForkKnife size={20} weight="fill" /> : undefined}
        />
        {categories.map(category => (
          <CategoryChip
            key={category}
            label={category}
            selected={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
            icon={selectedCategory === category ? <CategoryIcon category={category} /> : undefined}
          />
        ))}
      </Box>

      {/* Section Title */}
      {/* <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1a1a1a' }}>
        Menu
      </Typography> */}

      {/* Products Grid */}
      <Grid container spacing={2}>
        {filteredProducts.map((product) => (
          <Grid item xs={6} sm={4} md={3} key={product.id}>
            <ModernProductCard onClick={() => addToCart(product)}>
              <Box sx={{ position: 'relative' }}>
                <Box sx={{
                  width: '100%',
                  height: 160,
                  backgroundColor: '#f5f5f5',
                  borderRadius: '20px 20px 0 0',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {product.foto ? (
                    <img
                      src={`${apiBaseUrl}/uploads/${product.foto}`}
                      alt={product.namabarang}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <Box sx={{ fontSize: 48, color: '#ddd' }}>🍽️</Box>
                  )}
                </Box>
                {/* <StockBadge>
                  Stock: {product.stok || 23}
                </StockBadge> */}
              </Box>

              <CardContent sx={{ p: 2 }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: 40,
                    color: '#1a1a1a',
                  }}
                >
                  {product.namabarang}
                </Typography>

                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: '#1a1a1a', fontSize: '16px' }}
                >
                  Rp.{formatCurrency(product.harga)}
                </Typography>
              </CardContent>
            </ModernProductCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderCartDrawer = () => (
    <MuiDrawer
      anchor="right"
      open={showCart}
      onClose={() => setShowCart(false)}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 400,
          backgroundColor: '#f8f9fa',
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: 'white',
        }}>
          <Typography variant="h6" fontWeight={700}>
            Pesanan ({getCartItemCount()})
          </Typography>
          <IconButton onClick={() => setShowCart(false)}>
            <X size={24} />
          </IconButton>
        </Box>

        {/* Cart Items */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {cart.length === 0 ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}>
              <ShoppingCart size={64} color="#ccc" weight="light" />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Keranjang kosong
              </Typography>
            </Box>
          ) : (
            cart.map((item) => (
              <Box
                key={item.id}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  p: 2,
                  mb: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {item.namabarang}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeFromCart(item.id)}
                    sx={{ color: '#ff4444' }}
                  >
                    <Trash size={16} />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="primary" fontWeight={600}>
                    Rp {formatCurrency(item.harga)}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      sx={{
                        backgroundColor: '#f5f5f5',
                        width: 28,
                        height: 28,
                      }}
                    >
                      <Minus size={14} />
                    </IconButton>
                    <Typography variant="body2" fontWeight={700} sx={{ minWidth: 20, textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      sx={{
                        backgroundColor: '#FF6B00',
                        color: 'white',
                        width: 28,
                        height: 28,
                        '&:hover': {
                          backgroundColor: '#E55D00',
                        }
                      }}
                    >
                      <Plus size={14} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Footer */}
        {cart.length > 0 && (
          <Box sx={{ p: 2, backgroundColor: 'white', borderTop: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Total:
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                Rp {formatCurrency(getCartTotal())}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => {
                setShowCart(false);
                setShowPaymentModal(true);
              }}
              sx={{
                backgroundColor: '#FF6B00',
                fontWeight: 700,
                py: 1.5,
                borderRadius: '12px',
                '&:hover': {
                  backgroundColor: '#E55D00',
                },
              }}
            >
              Bayar Sekarang
            </Button>
          </Box>
        )}
      </Box>
    </MuiDrawer>
  );

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', pb: isMobile ? 8 : 0 }}>
      <CssBaseline />

      {/* Top Bar */}
   
<AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}>
  <Toolbar>
    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
      <Box sx={{ 
        width: 40, 
        height: 40, 
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mr: 1.5
      }}>
        <Coffee size={24} weight="fill" color="white" />
      </Box>
      <Typography variant="h6" fontWeight={700} sx={{ color: '#1a1a1a' }}>
        POS
      </Typography>
    </Box>

    {/* Printer Status di Navbar */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
      <Chip
        icon={<Bluetooth />}
        label={printerConnected ? "Printer Terhubung" : "Printer Offline"}
        color={printerConnected ? "success" : "default"}
        variant="outlined"
        size="small"
        onClick={connectPrinter}
        sx={{ 
          cursor: 'pointer',
          borderRadius: '8px',
          '&:hover': {
            backgroundColor: printerConnected ? '#e8f5e8' : '#f5f5f5',
          }
        }}
      />
    </Box>

    {/* Cart Icon */}
    <IconButton
      onClick={() => setShowCart(true)}
      sx={{ position: 'relative' }}
    >
      <Badge badgeContent={getCartItemCount()} color="error">
        <ShoppingCart size={24} />
      </Badge>
    </IconButton>
  </Toolbar>
</AppBar>

      {/* Main Content */}
    {/* Main Content */}
<Container 
  maxWidth="lg" 
  sx={{ 
    mt: 3, 
    mb: 3,
    ml: !isMobile ? '280px' : 0, // Beri margin left untuk desktop
    transition: 'margin 0.3s ease',
    width: !isMobile ? 'calc(100% - 280px)' : '100%'
  }}
>
  {currentView === 'home' && renderHome()}
  {currentView === 'history' && <HistoryTransaksi />}
  {currentView === 'profile' && (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Avatar sx={{ 
        width: 80, 
        height: 80, 
        mx: 'auto', 
        mb: 2, 
        bgcolor: '#FF6B00',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        {user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}
      </Avatar>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {user?.name || user?.username || 'User'}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {user?.role || 'kasir'}
      </Typography>
      <Button
        variant="outlined"
        startIcon={<Bluetooth />}
        onClick={connectPrinter}
        sx={{ mt: 2, borderRadius: '12px' }}
        color={printerConnected ? 'success' : 'primary'}
      >
        {printerConnected ? 'Printer Terhubung' : 'Hubungkan Printer'}
      </Button>
    </Box>
  )}
</Container>

      {/* Bottom Navigation - Mobile */}
      {isMobile && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, display: isMobile ? 'block' : 'none' }} elevation={3}>
          <BottomNavigation
            value={currentView}
            onChange={(event, newValue) => {
              if (newValue === 'logout') {
                handleLogout();
              } else {
                setCurrentView(newValue);
              }
            }}
            showLabels
          >
            <BottomNavigationAction
              label="Home"
              value="home"
              icon={<HomeOutlined />}
            />
            <BottomNavigationAction
              label="History"
              value="history"
              icon={<ReceiptOutlined />}
            />
            <BottomNavigationAction
              label="Profile"
              value="profile"
              icon={<PersonOutlined />}
            />
            <BottomNavigationAction
              label="Logout"
              value="logout"
              icon={<LogoutOutlined />}
            />
          </BottomNavigation>
        </Paper>
      )}
      {/* Desktop Sidebar/Navigation - Tampil di Desktop */}
{!isMobile && (
  <Paper
    sx={{
      position: 'fixed',
      left: 0,
      top: 64, // Sesuaikan dengan tinggi AppBar
      bottom: 0,
      width: 280, // Lebarkan sedikit untuk tampilan yang lebih baik
      zIndex: 1200,
      borderRight: '1px solid #e0e0e0',
      backgroundColor: 'white',
      borderRadius: 0,
      boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
    }}
    elevation={0}
  >
    {/* Header Sidebar */}
    <Box sx={{ 
      p: 3, 
      borderBottom: '1px solid #f0f0f0',
      backgroundColor: '#fafafa'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar 
          sx={{ 
            width: 48, 
            height: 48, 
            bgcolor: '#FF6B00',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {user?.name?.charAt(0) || user?.username?.charAt(0) || 'K'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600} color="#1a1a1a">
            {user?.name || user?.username || 'Kasir'}
          </Typography>
          <Typography variant="caption" color="#666">
            {user?.role || 'Staff Kasir'}
          </Typography>
        </Box>
      </Box>
    </Box>

    <List sx={{ pt: 2, px: 1 }}>
      <ListItemButton
        selected={currentView === 'home'}
        onClick={() => setCurrentView('home')}
        sx={{
          mx: 1,
          borderRadius: '12px',
          mb: 1,
          height: 52,
          '&.Mui-selected': {
            backgroundColor: '#FF6B00',
            color: 'white',
            '&:hover': {
              backgroundColor: '#E55D00',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            }
          },
          '&:hover': {
            backgroundColor: '#fff5e6',
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 45 }}>
          <HomeOutlined />
        </ListItemIcon>
        <ListItemText 
          primary="Home" 
          primaryTypographyProps={{
            fontWeight: currentView === 'home' ? 600 : 500,
            fontSize: '15px'
          }}
        />
      </ListItemButton>

      <ListItemButton
        selected={currentView === 'history'}
        onClick={() => setCurrentView('history')}
        sx={{
          mx: 1,
          borderRadius: '12px',
          mb: 1,
          height: 52,
          '&.Mui-selected': {
            backgroundColor: '#FF6B00',
            color: 'white',
            '&:hover': {
              backgroundColor: '#E55D00',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            }
          },
          '&:hover': {
            backgroundColor: '#fff5e6',
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 45 }}>
          <ReceiptOutlined />
        </ListItemIcon>
        <ListItemText 
          primary="History" 
          primaryTypographyProps={{
            fontWeight: currentView === 'history' ? 600 : 500,
            fontSize: '15px'
          }}
        />
      </ListItemButton>

      <ListItemButton
        selected={currentView === 'profile'}
        onClick={() => setCurrentView('profile')}
        sx={{
          mx: 1,
          borderRadius: '12px',
          mb: 1,
          height: 52,
          '&.Mui-selected': {
            backgroundColor: '#FF6B00',
            color: 'white',
            '&:hover': {
              backgroundColor: '#E55D00',
            },
            '& .MuiListItemIcon-root': {
              color: 'white',
            }
          },
          '&:hover': {
            backgroundColor: '#fff5e6',
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 45 }}>
          <PersonOutlined />
        </ListItemIcon>
        <ListItemText 
          primary="Profile" 
          primaryTypographyProps={{
            fontWeight: currentView === 'profile' ? 600 : 500,
            fontSize: '15px'
          }}
        />
      </ListItemButton>

      {/* Printer Connection Status */}
      <Box sx={{ px: 2, py: 1, mb: 1 }}>
        <Chip
          icon={<Bluetooth />}
          label={printerConnected ? "Printer Terhubung" : "Printer Offline"}
          color={printerConnected ? "success" : "default"}
          variant="outlined"
          size="small"
          sx={{ 
            width: '100%', 
            justifyContent: 'flex-start',
            borderRadius: '8px'
          }}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <ListItemButton
        onClick={handleLogout}
        sx={{
          mx: 1,
          borderRadius: '12px',
          height: 52,
          color: '#ff4444',
          '&:hover': {
            backgroundColor: '#ffebee',
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 45, color: '#ff4444' }}>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText 
          primary="Logout" 
          primaryTypographyProps={{
            fontWeight: 500,
            fontSize: '15px'
          }}
        />
      </ListItemButton>
    </List>

    {/* Footer Sidebar */}
    <Box sx={{ 
      p: 2, 
      position: 'absolute', 
      bottom: 0, 
      left: 0, 
      right: 0,
      borderTop: '1px solid #f0f0f0',
      backgroundColor: '#fafafa'
    }}>
      <Typography variant="caption" color="#666" align="center" display="block">
        KASIRKU
      </Typography>
       <Button
        variant="outlined"
        startIcon={<Bluetooth />}
        onClick={connectPrinter}
        sx={{ mt: 2, borderRadius: '12px' }}
        color={printerConnected ? 'success' : 'primary'}
      >
        {printerConnected ? 'Printer Terhubung' : 'Hubungkan Printer'}
      </Button>
    </Box>
  </Paper>
)}

      {/* Floating Cart Button - Mobile */}
      {isMobile && cart.length > 0 && (
        <FloatingCartButton onClick={() => setShowCart(true)}>
          <Badge badgeContent={getCartItemCount()} color="error">
            <ShoppingCart size={28} weight="fill" />
          </Badge>
        </FloatingCartButton>
      )}

      {/* Cart Drawer */}
      {renderCartDrawer()}

      {/* Payment Modal */}
      <Dialog
        open={showPaymentModal}
        onClose={handleClosePaymentModal}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { borderRadius: isMobile ? 0 : '20px' }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: '#FF6B00',
          color: 'white',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>Pembayaran</span>
          <IconButton onClick={handleClosePaymentModal} sx={{ color: 'white' }}>
            <X size={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nama Customer (Opsional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            sx={{ mb: 2 }}
            disabled={paymentStatus === 'pending'}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Metode Pembayaran</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                if (e.target.value === 'qris') {
                  setCustomerMoney('');
                }
              }}
              disabled={paymentStatus === 'pending'}
            >
              <MenuItem value="cash">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  💵 Tunai
                </Box>
              </MenuItem>
              {/* <MenuItem value="qris">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QrCode size={20} />
                  QRIS
                </Box>
              </MenuItem> */}
            </Select>
          </FormControl>

          {paymentMethod === 'cash' && paymentStatus !== 'pending' && (
            <>
              <TextField
                fullWidth
                label="Uang Customer"
                type="number"
                value={customerMoney}
                onChange={(e) => setCustomerMoney(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                }}
              />

              {customerMoney && (
                <Box sx={{
                  p: 2,
                  backgroundColor: calculateChange() >= 0 ? '#e8f5e9' : '#ffebee',
                  borderRadius: '12px',
                  mb: 2,
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Total Pembayaran:
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="error">
                        Rp {formatCurrency(getCartTotal())}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Uang Customer:
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        Rp {formatCurrency(parseFloat(customerMoney) || 0)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="body2" color="text.secondary">
                    Kembalian:
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color={calculateChange() >= 0 ? 'success.main' : 'error.main'}
                  >
                    Rp {formatCurrency(Math.abs(calculateChange()))}
                  </Typography>

                  {calculateChange() < 0 && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      Uang tidak mencukupi! Kurang Rp {formatCurrency(Math.abs(calculateChange()))}
                    </Alert>
                  )}
                </Box>
              )}
            </>
          )}

          {paymentStatus === 'pending' && qrCodeUrl && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography>
                    Menunggu pembayaran QRIS...
                  </Typography>
                </Box>
                <Box sx={{
                  p: 2,
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '2px dashed #FF6B00',
                }}>
                  <img src={qrCodeUrl} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Order ID: {orderId}
                </Typography>
              </Box>
            </Alert>
          )}

          {paymentStatus === 'success' && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
              icon={<CheckCircle size={24} weight="fill" />}
            >
              <Typography variant="h6" fontWeight={700}>
                Pembayaran Berhasil!
              </Typography>
              {paymentMethod === 'cash' && customerMoney && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Kembalian: Rp {formatCurrency(calculateChange())}
                </Typography>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            fullWidth
            onClick={processPayment}
            variant="contained"
            disabled={isProcessing || paymentStatus === 'pending' || paymentStatus === 'success'}
            startIcon={isProcessing ? <CircularProgress size={20} /> : null}
            sx={{
              backgroundColor: '#FF6B00',
              fontWeight: 700,
              py: 1.5,
              borderRadius: '12px',
              '&:hover': {
                backgroundColor: '#E55D00',
              }
            }}
          >
            {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
          sx={{ borderRadius: '12px' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardKasir;