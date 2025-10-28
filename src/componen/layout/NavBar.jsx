import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { List as ListIcon } from '@phosphor-icons/react/dist/ssr/List';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { ShoppingCart as ShoppingCartIcon } from '@phosphor-icons/react/dist/ssr/ShoppingCart';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';

export const NavBar = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const { user } = useSelector((state) => state.auth || {});

  const toggleDrawer = () => {
    setOpenDrawer((prev) => !prev);
  };

  return (
    <React.Fragment>
      {/* Navbar Container */}
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 1200,
          width: '100%',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            minHeight: '64px', 
            px: 2,
            width: '100%',
          }}
        >
          {/* Left Section */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            {/* Mobile Menu Button */}
            <IconButton
              onClick={toggleDrawer}
              sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>

            {/* App Title */}
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: '#0A5EB0',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Sistem Kasir Online
            </Typography>
          </Stack>

          {/* Center Section - Search (Optional) */}
          <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
          
          </Box>

          {/* Navbar Right Actions */}
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            {/* Quick Actions */}
            <Tooltip title="Transaksi Baru">
              <Link to="/transaksi" style={{ textDecoration: 'none' }}>
                <IconButton sx={{ color: '#0A5EB0' }}>
                  <ShoppingCartIcon />
                </IconButton>
              </Link>
            </Tooltip>

            <Tooltip title="User Management">
              <Link to="/user" style={{ textDecoration: 'none' }}>
                <IconButton sx={{ color: '#0A5EB0' }}>
                  <UsersIcon />
                </IconButton>
              </Link>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Notifikasi">
              <Badge badgeContent={0} color="error" variant="dot">
                <IconButton sx={{ color: 'text.secondary' }}>
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip>

            {/* User Avatar */}
            <Tooltip title={`${user?.username || 'User'} (${user?.role || 'User'})`}>
              {/* <Avatar
                sx={{
                  cursor: 'pointer',
                  width: 40,
                  height: 40,
                  bgcolor: '#0A5EB0',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '16px',
                }}
              >
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </Avatar> */}
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Sidebar for Mobile */}
      {openDrawer && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1300,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.3s ease',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 }
            }
          }}
          onClick={toggleDrawer}
        >
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: { xs: 200, lg: 250 },
              height: '100vh',
              '@keyframes slideIn': {
                from: { transform: 'translateX(-100%)' },
                to: { transform: 'translateX(0)' }
              },
              animation: {
                xs: 'slideIn 0.3s ease',
                lg: 'none'
              }
            }}
          >
            <Sidebar />
            </Box>
        </Box>
      )}
    </React.Fragment>
  );
};

export default NavBar;