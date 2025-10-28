/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import {
  Bluetooth,
  Printer,
  CheckCircle,
  XCircle,
  TestTube,
} from '@phosphor-icons/react';

const ThermalPrinterPage = ({ open, onClose, onPrinterConnected, onPrinterDisconnected, currentPrinter, connectionStatus }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [printerDevice, setPrinterDevice] = useState(null);
  const [printerName, setPrinterName] = useState('');
  const [printerType, setPrinterType] = useState('bluetooth');
  const [printerSettings, setPrinterSettings] = useState({
    paperWidth: 58,
    fontSize: 'normal',
    alignment: 'left',
    autoCut: true,
    autoOpen: false,
    heartbeatInterval: 30000,
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    autoReconnect: true,
  });
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    // Check if Web Bluetooth is supported
    if (!navigator.bluetooth) {
      setNotification({
        open: true,
        message: 'Web Bluetooth tidak didukung di browser ini. Gunakan Chrome atau Edge.',
        severity: 'warning'
      });
    }
  }, []);

  const connectBluetoothPrinter = async () => {
    if (!navigator.bluetooth) {
      setNotification({
        open: true,
        message: 'Web Bluetooth tidak didukung di browser ini. Gunakan Chrome, Edge, atau Opera.',
        severity: 'error'
      });
      return;
    }

    setIsConnecting(true);
    try {
      console.log('Requesting Bluetooth device...');
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

      console.log('Device selected:', device.name);
      const { ThermalPrinter: PrinterClass } = await import('./PrinterConfig');
      const printer = new PrinterClass(device);
      
      await printer.connect();
      
      setPrinterDevice(printer);
      setPrinterName(device.name || 'Unknown Device');
      setIsConnected(true);
      
      onPrinterConnected?.(printer);
      
      setNotification({
        open: true,
        message: `Printer "${device.name}" berhasil terhubung!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error connecting to printer:', error);
      let errorMessage = 'Gagal menghubungkan printer';
      
      if (error.name === 'NotFoundError') {
        errorMessage = 'Tidak ada perangkat yang dipilih';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Bluetooth harus diakses melalui HTTPS';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectPrinter = async () => {
    try {
      if (printerDevice && printerDevice.disconnect) {
        await printerDevice.disconnect();
      }
      setPrinterDevice(null);
      setPrinterName('');
      setIsConnected(false);
      setTestResult(null);
      
      onPrinterDisconnected?.();
      
      setNotification({
        open: true,
        message: 'Printer berhasil diputuskan',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error disconnecting printer:', error);
      setNotification({
        open: true,
        message: `Error saat memutuskan koneksi: ${error.message}`,
        severity: 'warning'
      });
    }
  };

  const sendPrintCommand = async (commands) => {
    if (!isConnected || !printerDevice) {
      setNotification({
        open: true,
        message: 'Printer belum terhubung!',
        severity: 'error'
      });
      return false;
    }

    try {
      console.log('Sending print command to printer...');
      await printerDevice.sendCommand(commands);
      
      console.log('Print command sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending print command:', error);
      setNotification({
        open: true,
        message: `Gagal mengirim perintah cetak: ${error.message}`,
        severity: 'error'
      });
      return false;
    }
  };

  const testPrint = async () => {
    if (!isConnected || !printerDevice) {
      setNotification({
        open: true,
        message: 'Printer belum terhubung!',
        severity: 'error'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    
    try {
      console.log('Starting test print...');
      await printerDevice.printTest();
      
      setTestResult('success');
      setNotification({
        open: true,
        message: 'Test print berhasil dikirim ke printer!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Test print error:', error);
      setTestResult('failed');
      setNotification({
        open: true,
        message: `Test print gagal: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const printReceipt = async (transactionData) => {
    const receipt = `
      \x1B\x40
      \x1B\x61\x01
      KASIR SYSTEM
      \x1B\x61\x00
      ====================
      Tanggal: ${new Date().toLocaleString('id-ID')}
      Kasir: ${transactionData.cashier || 'Unknown'}
      Order: ${transactionData.orderId || 'N/A'}
      ====================
      
      ${transactionData.items?.map(item => `
      ${item.name}
      ${item.quantity}x ${item.price} = ${item.total}
      `).join('')}
      
      ====================
      Subtotal: ${transactionData.subtotal}
      PPN: ${transactionData.ppn || 0}
      Total: ${transactionData.total}
      ====================
      Pembayaran: ${transactionData.paymentMethod}
      Status: ${transactionData.status}
      
      Terima Kasih!
      \x1B\x61\x01
      Powered by FullMobile
      \x1B\x61\x00
      \x0A\x0A\x0A
    `;

    return await sendPrintCommand(receipt);
  };

  const handleSettingsChange = (field, value) => {
    setPrinterSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderConnectionStatus = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Status Koneksi
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {isConnected ? (
            <Chip
              icon={<CheckCircle />}
              label="Terhubung"
              color="success"
            />
          ) : (
            <Chip
              icon={<XCircle />}
              label="Tidak Terhubung"
              color="error"
            />
          )}
        </Box>
        
        {isConnected && (
          <Typography variant="body2" color="text.secondary">
            Printer: {printerName}
          </Typography>
        )}
        
        {/* Connection Status Details */}
        {connectionStatus && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Device: {connectionStatus.deviceName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reconnect Attempts: {connectionStatus.reconnectAttempts}/5
            </Typography>
            {connectionStatus.lastHeartbeat && (
              <Typography variant="body2" color="text.secondary">
                Last Heartbeat: {new Date(connectionStatus.lastHeartbeat).toLocaleString()}
              </Typography>
            )}
            {connectionStatus.isReconnecting && (
              <Chip label="Reconnecting..." color="warning" size="small" sx={{ mt: 1 }} />
            )}
          </Box>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={isConnecting ? <CircularProgress size={16} /> : <Bluetooth />}
            onClick={connectBluetoothPrinter}
            disabled={isConnecting || isConnected}
          >
            {isConnecting ? 'Menghubungkan...' : 'Hubungkan'}
          </Button>
          
          {isConnected && (
            <Button
              variant="outlined"
              color="error"
              onClick={disconnectPrinter}
            >
              Putuskan
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const renderTestSection = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Test Printer
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={isTesting ? <CircularProgress size={16} /> : <TestTube />}
          onClick={testPrint}
          disabled={!isConnected || isTesting}
          sx={{ mb: 2 }}
        >
          {isTesting ? 'Testing...' : 'Test Print'}
        </Button>
        
        {testResult && (
          <Alert 
            severity={testResult === 'success' ? 'success' : 'error'}
            sx={{ mt: 2 }}
          >
            {testResult === 'success' ? 'Test print berhasil!' : 'Test print gagal!'}
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderSettings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Pengaturan Printer
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipe Printer</InputLabel>
              <Select
                value={printerType}
                onChange={(e) => setPrinterType(e.target.value)}
              >
                <MenuItem value="bluetooth">Bluetooth</MenuItem>
                <MenuItem value="usb">USB</MenuItem>
                <MenuItem value="network">Network</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Lebar Kertas</InputLabel>
              <Select
                value={printerSettings.paperWidth}
                onChange={(e) => handleSettingsChange('paperWidth', e.target.value)}
              >
                <MenuItem value={58}>58mm (Thermal)</MenuItem>
                <MenuItem value={80}>80mm (Thermal)</MenuItem>
                <MenuItem value={110}>110mm (Thermal)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Ukuran Font</InputLabel>
              <Select
                value={printerSettings.fontSize}
                onChange={(e) => handleSettingsChange('fontSize', e.target.value)}
              >
                <MenuItem value="small">Kecil</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="large">Besar</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Pengaturan Koneksi
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Heartbeat Interval (ms)"
              type="number"
              value={printerSettings.heartbeatInterval}
              onChange={(e) => handleSettingsChange('heartbeatInterval', parseInt(e.target.value))}
              helperText="Interval untuk memeriksa koneksi (default: 30000ms)"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Max Reconnect Attempts"
              type="number"
              value={printerSettings.maxReconnectAttempts}
              onChange={(e) => handleSettingsChange('maxReconnectAttempts', parseInt(e.target.value))}
              helperText="Maksimal percobaan reconnect (default: 5)"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Reconnect Delay (ms)"
              type="number"
              value={printerSettings.reconnectDelay}
              onChange={(e) => handleSettingsChange('reconnectDelay', parseInt(e.target.value))}
              helperText="Delay antar percobaan reconnect (default: 1000ms)"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={printerSettings.autoReconnect}
                  onChange={(e) => handleSettingsChange('autoReconnect', e.target.checked)}
                />
              }
              label="Auto-Reconnect (Otomatis reconnect saat koneksi terputus)"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (currentPrinter) {
                  currentPrinter.updateConnectionSettings({
                    heartbeatInterval: printerSettings.heartbeatInterval,
                    maxReconnectAttempts: printerSettings.maxReconnectAttempts,
                    reconnectDelay: printerSettings.reconnectDelay,
                    autoReconnect: printerSettings.autoReconnect
                  });
                  setNotification({
                    open: true,
                    message: 'Pengaturan koneksi berhasil diterapkan!',
                    severity: 'success'
                  });
                }
              }}
              disabled={!currentPrinter}
            >
              Terapkan Pengaturan Koneksi
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Alignment</InputLabel>
              <Select
                value={printerSettings.alignment}
                onChange={(e) => handleSettingsChange('alignment', e.target.value)}
              >
                <MenuItem value="left">Kiri</MenuItem>
                <MenuItem value="center">Tengah</MenuItem>
                <MenuItem value="right">Kanan</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={printerSettings.autoCut}
                  onChange={(e) => handleSettingsChange('autoCut', e.target.checked)}
                />
              }
              label="Auto Cut (Potong Otomatis)"
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={printerSettings.autoOpen}
                  onChange={(e) => handleSettingsChange('autoOpen', e.target.checked)}
                />
              }
              label="Auto Open (Buka Otomatis)"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderConnectionTips = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Tips Koneksi Stabil
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            • Pastikan printer dalam mode pairing sebelum menghubungkan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Jaga jarak printer maksimal 3 meter dari perangkat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Hindari gangguan dari perangkat Bluetooth lain
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Gunakan heartbeat interval yang lebih pendek untuk deteksi cepat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Tingkatkan max reconnect attempts jika koneksi sering terputus
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Printer />
          <Typography variant="h6">
            Pengaturan Thermal Printer
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            {renderConnectionStatus()}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderTestSection()}
          </Grid>
          
          <Grid item xs={12}>
            {renderSettings()}
          </Grid>
          
          <Grid item xs={12}>
            {renderConnectionTips()}
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Tutup
        </Button>
      </DialogActions>
      
      {/* Notification Snackbar */}
      {notification.open && (
        <Alert 
          severity={notification.severity}
          sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      )}
    </Dialog>
  );
};

export default ThermalPrinterPage;
