/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { styled, useTheme } from "@mui/system";
import axios from 'axios';
import { getApiBaseUrl } from '../api';
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
import { Plus, PencilSimple, Trash, X, QrCode } from '@phosphor-icons/react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
const API_URL = getApiBaseUrl();
const PlusIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor" {...props}>
    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
  </svg>
);

const PencilSimpleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor" {...props}>
    <path d="M229.66,61.66l-42.32-42.32a8,8,0,0,0-11.32,0L32,160V224a8,8,0,0,0,8,8H96l14.34-14.34,109-109A8,8,0,0,0,229.66,61.66ZM90.34,208H48V165.66L155.66,58.34,197.66,100.34ZM195.31,80.47l-41.88-41.88L158,48l41.88,41.88Z"></path>
  </svg>
);

const TrashIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor" {...props}>
    <path d="M216,48H176V40a24,24,0,0,0-24-24H104a24,24,0,0,0-24,24v8H40a8,8,0,0,0,0,16h8v144a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM200,208H56V64H200ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
  </svg>
);
// Main container styling
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  padding: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(0, 0, 0, 0.05)',
}));

// Modal styling
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', md: 500 },
  bgcolor: 'background.paper',
  borderRadius: '16px',
  boxShadow: 24,
  p: 4,
  outline: 'none',
};

// Main component
export const UserList = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confPassword: '',
    role: 'kasir'
  });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogContent, setDialogContent] = useState({});

  // Load users on component mount
  useEffect(() => {
    loadUsers();
   
  }, []);
  const handleOpenDialog = (title, message, actions) => {
    setDialogContent({ title, message, actions });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogContent({});
  };

  
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/getuser`, { withCredentials: true });
      if (response.data.status === 200 || response.data.message === 'success') {
      setUsers(response.data.data);
      }
      console.log("Loaded users:", response.data);
    } catch (err) {
      setError('Gagal memuat data pengguna');
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination change handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Modal handlers
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      username: '',
      password: '',
      confPassword: '',
      role: 'kasir'
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      confPassword: '',
      role: user.role
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // CRUD operations
  const handleSaveUser = async () => {
    if (formData.password !== formData.confPassword) {
      MySwal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Password dan Konfirmasi Password tidak cocok!',
      });
      return;
    }

    try {
      if (modalMode === 'create') {
        await axios.post(`${API_URL}/createuser`, formData, { withCredentials: true });
        MySwal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Pengguna berhasil ditambahkan.',
          showConfirmButton: false,
          timer: 1500
        });
      } else { // Edit mode
        await axios.put(`${API_URL}/updateuser/${selectedUser.id}`, formData, { withCredentials: true });
        MySwal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Data pengguna berhasil diperbarui.',
          showConfirmButton: false,
          timer: 1500
        });
      }
      handleCloseModal();
      loadUsers();
    } catch (err) {
      MySwal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.',
      });
    }
  };

  const handleDeleteUser = (user) => {
    MySwal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Anda tidak akan bisa mengembalikan data ini!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/deleteuser/${user.id}`, { withCredentials: true });
          MySwal.fire(
            'Dihapus!',
            'Pengguna berhasil dihapus.',
            'success'
          );
          loadUsers(); 
        } catch (err) {
          MySwal.fire({
            icon: 'error',
            title: 'Gagal!',
            text: err.response?.data?.message || 'Terjadi kesalahan saat menghapus.',
          });
        }
      }
    });
  };

  // Loading and error states
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        {/* <Typography variant="h4" gutterBottom>
          Manajemen Pengguna
        </Typography> */}
        <Skeleton variant="rectangular" height={50} sx={{ mb: 2, borderRadius: '12px' }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '16px' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button onClick={loadUsers} variant="contained" sx={{ mt: 2 }}>
          Coba Lagi
        </Button>
      </Box>
    );
  }

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PlusIcon size={20} />}
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
          Tambah Pengguna
        </Button>
      </Box>

      <StyledPaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(102, 126, 234, 0.05)' }}>
                <TableCell sx={{ fontWeight: 600 }}>No</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user, index) => (
                <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.02)' } }}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'rgba(102, 126, 234, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#667eea' }}>
                          {user.username.charAt(0).toUpperCase()}
                        </Typography>
                      </Box>
                      {user.username}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={user.role === 'admin' ? 'error' : user.role === 'kasir' ? 'primary' : 'default'}
                      size="small"
                      sx={{ borderRadius: '6px' }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleOpenEditModal(user)}
                      sx={{
                        color: '#3f51b5',
                        '&:hover': { backgroundColor: 'rgba(63, 81, 181, 0.1)' }
                      }}
                    >
                      <PencilSimpleIcon size={20} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteUser(user)}
                      sx={{
                        color: '#f44336',
                        '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                      }}
                    >
                      <TrashIcon size={20} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={users.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Baris per halaman:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
          />
        </TableContainer>
      </StyledPaper>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={style}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            {modalMode === 'create' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
          </Typography>

          <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={modalMode === 'create'}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Konfirmasi Password"
                  name="confPassword"
                  type="password"
                  value={formData.confPassword}
                  onChange={handleInputChange}
                  required={modalMode === 'create'}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    label="Role"
                  >
                    <MenuItem value="kasir">Kasir</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    
                  </Select>
                </FormControl>
              </Grid>

             

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={handleCloseModal}>
                    Batal
                  </Button>
                  <Button type="submit" variant="contained">
                    {modalMode === 'create' ? 'Tambah' : 'Update'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Modal>

      {/* Custom Dialog untuk alert/confirm */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>{dialogContent.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogContent.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {dialogContent.actions ? dialogContent.actions : (
            <Button onClick={handleCloseDialog}>Oke</Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default UserList;
