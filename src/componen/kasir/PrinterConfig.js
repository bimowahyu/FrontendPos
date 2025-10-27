// Thermal Printer Configuration
// ESC/POS Commands for different printer types

export const PRINTER_TYPES = {
  BLUETOOTH: 'bluetooth',
  USB: 'usb',
  NETWORK: 'network',
  CLOUD: 'cloud'
};

export const PAPER_SIZES = {
  '58mm': {
    width: 32,
    maxChars: 32,
    description: '58mm Thermal Paper'
  },
  '80mm': {
    width: 48,
    maxChars: 48,
    description: '80mm Thermal Paper'
  },
  '110mm': {
    width: 64,
    maxChars: 64,
    description: '110mm Thermal Paper'
  }
};

export const FONT_SIZES = {
  small: {
    width: 1,
    height: 1,
    command: '\x1B\x21\x00'
  },
  normal: {
    width: 1,
    height: 1,
    command: '\x1B\x21\x00'
  },
  large: {
    width: 2,
    height: 2,
    command: '\x1B\x21\x11'
  },
  double: {
    width: 2,
    height: 1,
    command: '\x1B\x21\x20'
  }
};

export const ALIGNMENT = {
  left: '\x1B\x61\x00',
  center: '\x1B\x61\x01',
  right: '\x1B\x61\x02'
};

export const ESC_POS_COMMANDS = {
  // Initialize printer
  INIT: '\x1B\x40',
  
  // Text formatting
  BOLD_ON: '\x1B\x45\x01',
  BOLD_OFF: '\x1B\x45\x00',
  UNDERLINE_ON: '\x1B\x2D\x01',
  UNDERLINE_OFF: '\x1B\x2D\x00',
  
  // Alignment
  ALIGN_LEFT: '\x1B\x61\x00',
  ALIGN_CENTER: '\x1B\x61\x01',
  ALIGN_RIGHT: '\x1B\x61\x02',
  
  // Font size
  FONT_SMALL: '\x1B\x21\x00',
  FONT_NORMAL: '\x1B\x21\x00',
  FONT_LARGE: '\x1B\x21\x11',
  FONT_DOUBLE: '\x1B\x21\x20',
  
  // Line spacing
  LINE_SPACING_0: '\x1B\x33\x00',
  LINE_SPACING_1: '\x1B\x33\x01',
  LINE_SPACING_2: '\x1B\x33\x02',
  
  // Paper cutting
  CUT_PARTIAL: '\x1B\x69',
  CUT_FULL: '\x1B\x6D',
  
  // Paper feed
  FEED_LINE: '\x0A',
  FEED_LINES: (n) => `\x1B\x64${String.fromCharCode(n)}`,
  
  // Buffer management
  FLUSH_BUFFER: '\x1B\x40',
  
  // Barcode
  BARCODE_HEIGHT: (height) => `\x1B\x68${String.fromCharCode(height)}`,
  BARCODE_WIDTH: (width) => `\x1B\x77${String.fromCharCode(width)}`,
  BARCODE_CODE39: '\x1B\x6B\x04',
  BARCODE_CODE128: '\x1B\x6B\x49',
  
  // QR Code
  QR_SIZE: (size) => `\x1B\x28\x6B\x03\x00\x31\x43${String.fromCharCode(size)}`,
  QR_ERROR_CORRECTION: (level) => `\x1B\x28\x6B\x03\x00\x31\x45${String.fromCharCode(level)}`,
  QR_STORE: (data) => {
    const len = data.length + 3;
    const p1 = String.fromCharCode(len & 0xFF);
    const p2 = String.fromCharCode((len >> 8) & 0xFF);
    return `\x1B\x28\x6B${p1}${p2}\x31\x50\x30${data}`;
  },
  QR_PRINT: '\x1B\x28\x6B\x03\x00\x31\x51\x30',
  
  // Paper status
  PAPER_STATUS: '\x1B\x76\x00',
  
  // Reset
  RESET: '\x1B\x40'
};

export const RECEIPT_TEMPLATE = {
  header: (konfigurasi) => {
    let header = `${ESC_POS_COMMANDS.INIT}${ESC_POS_COMMANDS.FLUSH_BUFFER}${ESC_POS_COMMANDS.ALIGN_CENTER}${ESC_POS_COMMANDS.FONT_LARGE}${ESC_POS_COMMANDS.BOLD_ON}${konfigurasi.namaToko || 'KASIR SYSTEM'}${ESC_POS_COMMANDS.BOLD_OFF}${ESC_POS_COMMANDS.FONT_NORMAL}`;
    
    if (konfigurasi.alamat && konfigurasi.alamat.trim()) {
      header += `${ESC_POS_COMMANDS.FEED_LINE}${konfigurasi.alamat}`;
    }
    
    if (konfigurasi.noTelp && konfigurasi.noTelp.trim()) {
      header += `${ESC_POS_COMMANDS.FEED_LINE}Telp: ${konfigurasi.noTelp}`;
    }
    
    header += `${ESC_POS_COMMANDS.ALIGN_LEFT}${ESC_POS_COMMANDS.FEED_LINE}=================================${ESC_POS_COMMANDS.FEED_LINE}`;
    
    return header;
  },
  
  transaction: (orderId, date, cashier, customerName) => `Order ID: ${orderId}${ESC_POS_COMMANDS.FEED_LINE}Customer: ${customerName}${ESC_POS_COMMANDS.FEED_LINE}Tanggal: ${date}${ESC_POS_COMMANDS.FEED_LINE}Kasir: ${cashier}${ESC_POS_COMMANDS.FEED_LINE}=================================${ESC_POS_COMMANDS.FEED_LINE}`,
  
  item: (name, qty, price, total) => `${name}${ESC_POS_COMMANDS.FEED_LINE}${qty}x ${price} = ${total}${ESC_POS_COMMANDS.FEED_LINE}`,
  
  footer: (subtotal, tax, total, paymentMethod, status) => `=================================${ESC_POS_COMMANDS.FEED_LINE}Subtotal: ${subtotal}${ESC_POS_COMMANDS.FEED_LINE}PPN: ${tax}${ESC_POS_COMMANDS.FEED_LINE}Total: ${total}${ESC_POS_COMMANDS.FEED_LINE}=================================${ESC_POS_COMMANDS.FEED_LINE}Pembayaran: ${paymentMethod}${ESC_POS_COMMANDS.FEED_LINE}Status: ${status}${ESC_POS_COMMANDS.FEED_LINE}=================================${ESC_POS_COMMANDS.FEED_LINE}${ESC_POS_COMMANDS.FEED_LINE}Terima Kasih!${ESC_POS_COMMANDS.FEED_LINE}${ESC_POS_COMMANDS.ALIGN_CENTER}Powered by FullMobile${ESC_POS_COMMANDS.ALIGN_LEFT}${ESC_POS_COMMANDS.FEED_LINE}${ESC_POS_COMMANDS.FEED_LINE}${ESC_POS_COMMANDS.CUT_PARTIAL}`
};

export class ThermalPrinter {
  constructor(device, settings = {}) {
    this.device = device;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.connected = false;
    this.settings = {
      paperWidth: '58mm',
      fontSize: 'normal',
      alignment: 'left',
      autoCut: true,
      autoOpen: false,
      heartbeatInterval: 30000,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      autoReconnect: true,
      ...settings
    };
    
    // Connection monitoring
    this.heartbeatTimer = null;
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.lastHeartbeat = null;
    this.connectionCallbacks = [];
    
    // Common Bluetooth printer service UUIDs
    this.SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb'; 
    this.CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb'; 
    

    this.ALTERNATIVE_SERVICES = [
      '000018f0-0000-1000-8000-00805f9b34fb',
      '0000ffe0-0000-1000-8000-00805f9b34fb',
      '49535343-fe7d-4ae5-8fa9-9fafd205e455',
      'e7810a71-73ae-499d-8c15-faa9aef0c3f2'
    ];
    
    this.ALTERNATIVE_CHARACTERISTICS = [
      '00002af1-0000-1000-8000-00805f9b34fb',
      '0000ffe1-0000-1000-8000-00805f9b34fb',
      '49535343-8841-43f4-a8d4-ecbe34729bb3',
      'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f'
    ];
  }

  async connect() {
    try {
      if (!this.device) {
        throw new Error('No device provided');
      }
      
      console.log('Connecting to device:', this.device.name);
      console.log('Device GATT:', this.device.gatt);
      console.log('Device GATT connected:', this.device.gatt?.connected);
      
      console.log('Attempting to connect to GATT server...');
      try {
        this.server = await this.device.gatt.connect();
        console.log('GATT server connected:', this.server);
        console.log('GATT server connected status:', this.server?.connected);
      } catch (error) {
        console.log( error);
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.server = await this.device.gatt.connect();
        console.log('GATT server connected on retry:', this.server);
      }
      
      if (this.device.name.includes('RPP02N')) {
        console.log('RPP02N detected, adding extra stabilization time...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      if (!this.server) {
        throw new Error('Failed to establish GATT server connection');
      }
      
      if (!this.server.connected) {
        throw new Error('GATT server is not connected');
      }
      this.device.addEventListener('gattserverdisconnected', this.handleDisconnect.bind(this));
      
      const stabilizationDelay = this.device.name.includes('RPP02N') ? 5000 : 2000;
      await new Promise(resolve => setTimeout(resolve, stabilizationDelay));
      if (!this.server || !this.server.connected) {
        console.log('GATT server disconnected during stabilization, attempting to reconnect...');
        try {
          this.server = await this.device.gatt.connect();
          console.log('GATT server reconnected after stabilization');
          if (this.device.name.includes('RPP02N')) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (reconnectError) {
          console.log('Failed to reconnect during stabilization:', reconnectError);
          throw new Error('GATT server disconnected during stabilization period and cannot reconnect');
        }
      }
      
      console.log('Attempting to get primary services...');
      
      let services;
      let retryCount = 0;
      const maxRetries = 5; 
      while (retryCount < maxRetries) {
        try {
          if (!this.server || !this.server.connected) {
            console.log('GATT server disconnected, attempting to reconnect...');
      this.server = await this.device.gatt.connect();
            console.log('GATT server reconnected');
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
          const servicesPromise = this.server.getPrimaryServices();
          const timeoutDuration = this.device.name.includes('RPP02N') ? 15000 : 10000;
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Services request timeout')), timeoutDuration)
          );
          
          services = await Promise.race([servicesPromise, timeoutPromise]);
      console.log('Available services:', services.map(s => s.uuid));
          break;
        } catch (error) {
          retryCount++;
          console.log(`Attempt ${retryCount} to get services failed:`, error);
          
          if (error.message.includes('GATT Server is disconnected')) {
            console.log('GATT server disconnected, attempting to reconnect...');
            try {
              this.server = await this.device.gatt.connect();
              console.log('GATT server reconnected successfully');
              
              await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (reconnectError) {
              console.log('Failed to reconnect GATT server:', reconnectError);
            }
          }
          
          if (retryCount >= maxRetries) {
            if (this.device.name.includes('RPP02N')) {
              console.log('RPP02N detected, trying alternative connection method...');
              try {
                this.server = await this.device.gatt.connect();
                await new Promise(resolve => setTimeout(resolve, 1000));
                services = await this.server.getPrimaryServices();
                console.log('RPP02N alternative method successful');
                break;
              } catch (altError) {
                console.log('RPP02N alternative method failed:', altError);
              }
            }
            
            throw new Error(`Failed to get services after ${maxRetries} attempts: ${error.message}`);
          }
          
          const delay = this.device.name.includes('RPP02N') ? 5000 : 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      let foundService = null;
      let foundCharacteristic = null;
      for (const service of services) {
        try {
          if (!this.server || !this.server.connected) {
            console.log('GATT server disconnected, attempting to reconnect...');
            this.server = await this.device.gatt.connect();
            console.log('GATT server reconnected');
            if (this.device.name.includes('RPP02N')) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
          
          let characteristics;
          if (this.device.name.includes('RPP02N')) {
            const characteristicsPromise = service.getCharacteristics();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Characteristics request timeout')), 12000)
            );
            
            characteristics = await Promise.race([characteristicsPromise, timeoutPromise]);
          } else {
            characteristics = await service.getCharacteristics();
          }
          
          console.log(`Service ${service.uuid} characteristics:`, characteristics.map(c => c.uuid));
          
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              foundService = service;
              foundCharacteristic = char;
              console.log('Found writable characteristic:', char.uuid);
              break;
            }
          }
          
          if (foundCharacteristic) break;
        } catch (error) {
          console.log(`Error checking service ${service.uuid}:`, error);
          
          if (error.message.includes('GATT Server is disconnected')) {
            console.log('GATT server disconnected during service check, attempting to reconnect...');
            try {
              this.server = await this.device.gatt.connect();
              console.log('GATT server reconnected, retrying service check...');
              
              if (this.device.name.includes('RPP02N')) {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
              const characteristics = await service.getCharacteristics();
              console.log(`Service ${service.uuid} characteristics (retry):`, characteristics.map(c => c.uuid));
              
              for (const char of characteristics) {
                if (char.properties.write || char.properties.writeWithoutResponse) {
                  foundService = service;
                  foundCharacteristic = char;
                  console.log('Found writable characteristic (retry):', char.uuid);
                  break;
                }
              }
              
              if (foundCharacteristic) break;
            } catch (reconnectError) {
              console.log('Failed to reconnect during service check:', reconnectError);
            }
          }
        }
      }
      
      if (!foundCharacteristic) {
        console.log('No writable characteristic found, trying to find any characteristic...');
        for (const service of services) {
          try {
            if (!this.server || !this.server.connected) {
              this.server = await this.device.gatt.connect();
            }
            
            const characteristics = await service.getCharacteristics();
            console.log(`Service ${service.uuid} all characteristics:`, characteristics.map(c => ({
              uuid: c.uuid,
              properties: {
                read: c.properties.read,
                write: c.properties.write,
                writeWithoutResponse: c.properties.writeWithoutResponse,
                notify: c.properties.notify
              }
            })));
            
            for (const char of characteristics) {
              if (char.properties.write || char.properties.writeWithoutResponse || char.properties.notify) {
                foundService = service;
                foundCharacteristic = char;
                console.log('Using alternative characteristic:', char.uuid);
                break;
              }
            }
            
            if (foundCharacteristic) break;
          } catch (error) {
            console.log(`Error checking service ${service.uuid} for alternatives:`, error);
        }
      }
      
      if (!foundCharacteristic) {
          throw new Error('No suitable characteristic found. Your printer may not support Bluetooth LE or may not be in the correct mode.');
        }
      }
      
      this.service = foundService;
      this.characteristic = foundCharacteristic;
      this.connected = true;
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      
      this.startHeartbeat();
      
      console.log('Printer connected successfully');
      return true;
    } catch (error) {
      console.error('Connection failed:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        device: this.device?.name,
        gatt: this.device?.gatt,
        server: this.server
      });
      
      this.connected = false;
      this.server = null;
      this.service = null;
      this.characteristic = null;
      
      if (error.message.includes('getPrimaryServices')) {
        throw new Error('GATT server connection failed. Please ensure your printer is in pairing mode and try again.');
      } else if (error.message.includes('GATT server is not connected')) {
        throw new Error('Bluetooth connection lost. Please reconnect your printer.');
      } else if (error.message.includes('Failed to establish GATT server connection')) {
        throw new Error('Cannot connect to printer. Please check if the printer is turned on and in pairing mode.');
      } else if (error.message.includes('No suitable characteristic found')) {
        throw new Error('Printer tidak mendukung Bluetooth LE atau tidak dalam mode yang benar. Pastikan printer mendukung Bluetooth LE dan dalam mode pairing.');
      } else if (error.message.includes('GATT Server is disconnected')) {
        throw new Error('Koneksi Bluetooth terputus. Silakan reconnect printer dan coba lagi.');
      } else if (error.message.includes('Services request timeout')) {
        throw new Error('Timeout saat mengakses services printer. Printer mungkin tidak merespons dengan baik. Coba restart printer dan coba lagi.');
      } else if (error.message.includes('Characteristics request timeout')) {
        throw new Error('Timeout saat mengakses characteristics printer. Printer mungkin tidak merespons dengan baik. Coba restart printer dan coba lagi.');
      } else if (error.message.includes('Write timeout')) {
        throw new Error('Timeout saat mengirim data ke printer. Printer mungkin tidak merespons dengan baik. Coba restart printer dan coba lagi.');
      } else {
      throw error;
      }
    }
  }

  handleDisconnect() {
    console.log('Device disconnected unexpectedly');
    this.connected = false;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    this.stopHeartbeat();
    
    // Notify callbacks about disconnection
    this.connectionCallbacks.forEach(callback => {
      try {
        callback('disconnected');
      } catch (error) {
        console.error('Error in disconnect callback:', error);
      }
    });
    if (this.settings.autoReconnect !== false && 
        this.device && 
        this.device.gatt && 
        !this.isReconnecting &&
        this.reconnectAttempts < this.settings.maxReconnectAttempts) {
      this.attemptReconnect();
    }
  }

  async disconnect() {
    try {
      this.stopHeartbeat();
      this.isReconnecting = false;
      this.reconnectAttempts = 0;
      
      if (this.server && this.server.connected) {
        await this.server.disconnect();
      }
      this.server = null;
      this.service = null;
      this.characteristic = null;
      this.connected = false;
      console.log('Printer disconnected');
      return true;
    } catch (error) {
      console.error('Disconnection failed:', error);
      throw error;
    }
  }

  async sendCommand(command) {
    try {
    await this.ensureConnected();

    if (!this.connected || !this.characteristic) {
      throw new Error('Printer not connected');
    }
      const encoder = new TextEncoder();
      const data = encoder.encode(command);
      
      await new Promise(resolve => setTimeout(resolve, 100));

      const chunkSize = this.device.name.includes('RPP02N') ? 15 : 25;

      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, Math.min(i + chunkSize, data.length));

        try {
          if (!this.server || !this.server.connected) {
            console.log('GATT server disconnected during send, attempting to reconnect...');
            this.server = await this.device.gatt.connect();
            console.log('GATT server reconnected during send');
            if (this.device.name.includes('RPP02N')) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          
          if (this.device.name.includes('RPP02N')) {
            const writePromise = this.characteristic.properties.writeWithoutResponse 
              ? this.characteristic.writeValueWithoutResponse(chunk)
              : this.characteristic.writeValue(chunk);
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Write timeout')), 8000)
            );
            
            await Promise.race([writePromise, timeoutPromise]);
          } else {
          if (this.characteristic.properties.writeWithoutResponse) {
            await this.characteristic.writeValueWithoutResponse(chunk);
          } else {
            await this.characteristic.writeValue(chunk);
            }
          }
        } catch (error) {
          console.error('Error writing chunk:', error);
          
          if (error.message.includes('GATT Server is disconnected') || 
              error.message.includes('Device is not connected')) {
            console.log('Connection lost during send, attempting to reconnect...');
            this.connected = false;
            this.server = null;
            this.service = null;
            this.characteristic = null;
            await this.ensureConnected();
            
            if (this.device.name.includes('RPP02N')) {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            if (this.characteristic.properties.writeWithoutResponse) {
              await this.characteristic.writeValueWithoutResponse(chunk);
            } else {
              await this.characteristic.writeValue(chunk);
            }
          } else {
          throw error;
          }
        }
        if (i + chunkSize < data.length) {
          const delay = this.device.name.includes('RPP02N') ? 50 : 5;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      
      console.log('Command sent successfully');
      return true;
    } catch (error) {
      console.error('Send command failed:', error);
      this.connected = false;
      this.server = null;
      this.service = null;
      this.characteristic = null;
      throw error;
    }
  }

  async printReceipt(transactionData) {
    const {
      storeName = 'KASIR SYSTEM',
      storeAddress = '',
      storePhone = '',
      orderId,
      date,
      cashier,
      customerName = 'Walk-in Customer',
      items = [],
      subtotal,
      tax = 0,
      total,
      paymentMethod,
      status = 'Berhasil',
      reportData = null
    } = transactionData;

    let receipt = '';
    const konfigurasi = {
      namaToko: storeName,
      alamat: storeAddress,
      noTelp: storePhone
    };
    receipt += RECEIPT_TEMPLATE.header(konfigurasi);
    
    // Check if this is a daily report
    if (reportData && orderId.startsWith('REKAP-')) {
      receipt += this.generateDailyReportReceipt(reportData, date, cashier);
    } else {
      // Transaction info
      receipt += RECEIPT_TEMPLATE.transaction(orderId, date, cashier, customerName);
      
      // Items
      items.forEach(item => {
        receipt += RECEIPT_TEMPLATE.item(
          item.name,
          item.quantity,
          this.formatCurrency(item.price),
          this.formatCurrency(item.total)
        );
      });
      
      // Footer
      receipt += RECEIPT_TEMPLATE.footer(
        this.formatCurrency(subtotal),
        this.formatCurrency(tax),
        this.formatCurrency(total),
        paymentMethod,
        status
      );
    }

    return await this.sendCommand(receipt);
  }

  generateDailyReportReceipt(reportData, date, cashier) {
    let receipt = '';
    
    // Report header
    receipt += `${ESC_POS_COMMANDS.ALIGN_CENTER}${ESC_POS_COMMANDS.FONT_LARGE}${ESC_POS_COMMANDS.BOLD_ON}REKAP HARIAN${ESC_POS_COMMANDS.BOLD_OFF}${ESC_POS_COMMANDS.FONT_NORMAL}${ESC_POS_COMMANDS.FEED_LINE}`;
    receipt += `${ESC_POS_COMMANDS.ALIGN_LEFT}Tanggal: ${date}${ESC_POS_COMMANDS.FEED_LINE}`;
    receipt += `Kasir: ${cashier}${ESC_POS_COMMANDS.FEED_LINE}`;
    receipt += `=================================${ESC_POS_COMMANDS.FEED_LINE}`;
    
    // Summary
    receipt += `${ESC_POS_COMMANDS.BOLD_ON}RINGKASAN PENJUALAN${ESC_POS_COMMANDS.BOLD_OFF}${ESC_POS_COMMANDS.FEED_LINE}`;
    receipt += `Total Berhasil: ${this.formatCurrency(reportData.totalPenjualanSuccess)}${ESC_POS_COMMANDS.FEED_LINE}`;
    receipt += `Total Pending: ${this.formatCurrency(reportData.totalPenjualanPending)}${ESC_POS_COMMANDS.FEED_LINE}`;
    receipt += `Tunai Berhasil: ${this.formatCurrency(reportData.totalPenjualanCashSuccess)}${ESC_POS_COMMANDS.FEED_LINE}`;
    receipt += `QRIS Berhasil: ${this.formatCurrency(reportData.totalPenjualanQrisSuccess)}${ESC_POS_COMMANDS.FEED_LINE}`;
    receipt += `=================================${ESC_POS_COMMANDS.FEED_LINE}`;
    
    // Transaction details
    receipt += `${ESC_POS_COMMANDS.BOLD_ON}DETAIL TRANSAKSI${ESC_POS_COMMANDS.BOLD_OFF}${ESC_POS_COMMANDS.FEED_LINE}`;
    
    if (reportData.data && reportData.data.transaksiSuccess) {
      reportData.data.transaksiSuccess.forEach((transaction, index) => {
        receipt += `${index + 1}. ${transaction.order_id}${ESC_POS_COMMANDS.FEED_LINE}`;
        receipt += `   Customer: ${transaction.customer_name || 'Walk-in'}${ESC_POS_COMMANDS.FEED_LINE}`;
        receipt += `   Total: ${this.formatCurrency(transaction.totaljual)}${ESC_POS_COMMANDS.FEED_LINE}`;
        receipt += `   Payment: ${transaction.pembayaran === 'cash' ? 'Tunai' : 'QRIS'}${ESC_POS_COMMANDS.FEED_LINE}`;
        receipt += `${ESC_POS_COMMANDS.FEED_LINE}`;
      });
    }
    
    receipt += `=================================${ESC_POS_COMMANDS.FEED_LINE}`;
    receipt += `${ESC_POS_COMMANDS.FEED_LINE}Terima Kasih!${ESC_POS_COMMANDS.FEED_LINE}`;
    receipt += `${ESC_POS_COMMANDS.ALIGN_CENTER}Powered by FullMobile${ESC_POS_COMMANDS.ALIGN_LEFT}${ESC_POS_COMMANDS.FEED_LINE}`;
    receipt += `${ESC_POS_COMMANDS.FEED_LINE}${ESC_POS_COMMANDS.CUT_PARTIAL}`;
    
    return receipt;
  }

  async printTest() {
    const testReceipt = `${ESC_POS_COMMANDS.INIT}${ESC_POS_COMMANDS.FLUSH_BUFFER}${ESC_POS_COMMANDS.ALIGN_CENTER}${ESC_POS_COMMANDS.FONT_LARGE}${ESC_POS_COMMANDS.BOLD_ON}TEST PRINT${ESC_POS_COMMANDS.BOLD_OFF}${ESC_POS_COMMANDS.FONT_NORMAL}${ESC_POS_COMMANDS.FEED_LINE}=================================${ESC_POS_COMMANDS.FEED_LINE}Tanggal: ${new Date().toLocaleString('id-ID')}${ESC_POS_COMMANDS.FEED_LINE}Printer: ${this.device?.name || 'Unknown'}${ESC_POS_COMMANDS.FEED_LINE}=================================${ESC_POS_COMMANDS.FEED_LINE}${ESC_POS_COMMANDS.FEED_LINE}Ini adalah test print untuk${ESC_POS_COMMANDS.FEED_LINE}memastikan printer berfungsi${ESC_POS_COMMANDS.FEED_LINE}dengan baik.${ESC_POS_COMMANDS.FEED_LINE}${ESC_POS_COMMANDS.FEED_LINE}=================================${ESC_POS_COMMANDS.FEED_LINE}Test berhasil!${ESC_POS_COMMANDS.FEED_LINE}${ESC_POS_COMMANDS.ALIGN_CENTER}Powered by FullMobile${ESC_POS_COMMANDS.ALIGN_LEFT}${ESC_POS_COMMANDS.FEED_LINE}${ESC_POS_COMMANDS.FEED_LINE}${ESC_POS_COMMANDS.CUT_PARTIAL}`;

    return await this.sendCommand(testReceipt);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  async setSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    if (this.connected) {
      this.stopHeartbeat();
      this.startHeartbeat();
    }
  }

  getSettings() {
    return { ...this.settings };
  }
  updateConnectionSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    
    if (this.connected) {
      this.stopHeartbeat();
      this.startHeartbeat();
    }
    
    console.log('Connection settings updated:', settings);
  }

  async isConnectionAlive() {
    try {
      if (!this.device || !this.device.gatt) {
        return false;
      }
      if (!this.device.gatt.connected) {
        return false;
      }
      await this.device.gatt.getPrimaryServices();
      return true;
    } catch (error) {
      console.log('Connection check failed:', error);
      return false;
    }
  }

  async ensureConnected() {
    try {
      if (!this.device) {
        throw new Error('No device available for reconnection');
      }

      const isAlive = await this.isConnectionAlive();
      
      if (!isAlive) {
      console.log('Connection lost, attempting to reconnect...');
      this.connected = false;
        this.server = null;
        this.service = null;
        this.characteristic = null;

          await this.connect();
          console.log('Successfully reconnected');
          return true;
        }
      
      return true;
      } catch (error) {
        console.error('Reconnection failed:', error);
      this.connected = false;
      this.server = null;
      this.service = null;
      this.characteristic = null;
        throw new Error('Failed to reconnect to printer. Please reconnect manually.');
      }
    }

  startHeartbeat() {
    this.stopHeartbeat(); 
    
    this.heartbeatTimer = setInterval(async () => {
      try {
        if (this.connected && this.device && this.device.gatt) {
          // Check if device is still connected
          if (!this.device.gatt.connected) {
            console.log('Heartbeat detected disconnection');
            this.handleDisconnect();
            return;
          }
          
          // Try to get services to verify connection is active
          await this.device.gatt.getPrimaryServices();
          this.lastHeartbeat = new Date();
          
          // Notify callbacks about successful heartbeat
          this.connectionCallbacks.forEach(callback => {
            try {
              callback('heartbeat');
            } catch (error) {
              console.error('Error in heartbeat callback:', error);
            }
          });
        }
      } catch (error) {
        console.log('Heartbeat failed:', error);
        this.handleDisconnect();
      }
    }, this.settings.heartbeatInterval);
    
    console.log('Heartbeat monitoring started');
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
      console.log('Heartbeat monitoring stopped');
    }
  }

  // Automatic reconnection with exponential backoff
  async attemptReconnect() {
    if (this.isReconnecting) {
      console.log('Reconnection already in progress');
      return;
    }

    if (this.reconnectAttempts >= this.settings.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      this.connectionCallbacks.forEach(callback => {
        try {
          callback('reconnect_failed');
        } catch (error) {
          console.error('Error in reconnect failed callback:', error);
        }
      });
      return;
    }

    // Check if device is still available
    if (!this.device || !this.device.gatt) {
      console.log('Device no longer available for reconnection');
      this.connectionCallbacks.forEach(callback => {
        try {
          callback('reconnect_failed');
        } catch (error) {
          console.error('Error in reconnect failed callback:', error);
        }
      });
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.settings.maxReconnectAttempts}`);

    // Exponential backoff delay
    const delay = this.settings.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(async () => {
      try {
        // Check if device is still available before attempting connection
        if (!this.device || !this.device.gatt) {
          throw new Error('Device no longer available');
        }
        
        // Reset connection state before attempting reconnection
        this.connected = false;
        this.server = null;
        this.service = null;
        this.characteristic = null;
        
        await this.connect();
        console.log('Automatic reconnection successful');
        this.connectionCallbacks.forEach(callback => {
          try {
            callback('reconnected');
          } catch (error) {
            console.error('Error in reconnected callback:', error);
          }
        });
      } catch (error) {
        console.error('Automatic reconnection failed:', error);
        this.isReconnecting = false;
        
        // Only try again if device is still available and we haven't exceeded max attempts
        if (this.device && this.device.gatt && this.reconnectAttempts < this.settings.maxReconnectAttempts) {
          // Add a longer delay before retrying to prevent rapid reconnection attempts
          setTimeout(() => {
            this.attemptReconnect();
          }, delay * 2);
        } else {
          this.connectionCallbacks.forEach(callback => {
            try {
              callback('reconnect_failed');
            } catch (error) {
              console.error('Error in reconnect failed callback:', error);
            }
          });
        }
      }
    }, delay);
  }

  // Add connection status callback
  onConnectionChange(callback) {
    this.connectionCallbacks.push(callback);
  }

  // Remove connection status callback
  offConnectionChange(callback) {
    const index = this.connectionCallbacks.indexOf(callback);
    if (index > -1) {
      this.connectionCallbacks.splice(index, 1);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.connected,
      isReconnecting: this.isReconnecting,
      reconnectAttempts: this.reconnectAttempts,
      lastHeartbeat: this.lastHeartbeat,
      deviceName: this.device?.name || 'Unknown'
    };
  }
}

// Utility functions
export const formatReceiptText = (text, maxWidth = 32) => {
  if (text.length <= maxWidth) {
    return text;
  }
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    if ((currentLine + word).length <= maxWidth) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(word.substring(0, maxWidth));
        currentLine = word.substring(maxWidth);
      }
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.join('\n');
};

export const createDivider = (char = '=', length = 32) => {
  return char.repeat(Math.min(length, 32));
};

export const formatDateTime = (date = new Date()) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

export default ThermalPrinter;

