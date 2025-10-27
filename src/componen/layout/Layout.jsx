/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import Backdrop from '@mui/material/Backdrop';

// Styled Components for better visual appeal
const StyledMainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  position: 'relative',
  width: '100%',
  maxWidth: '100vw',
  overflowX: 'hidden',
}));

const StyledContentArea = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  width: '100%',
  maxWidth: '100%',
  overflowX: 'hidden',
}));

const StyledNavbar = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1400,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)'
}));

const StyledContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  backgroundColor: '#f8fafc',
  padding: theme.spacing(3),
  position: 'relative',
  minHeight: 'calc(100vh - 64px)',
  width: '100%',
  maxWidth: '100%',
  overflowX: 'hidden',
  
  // Responsive padding
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
  
  // Custom scrollbar
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f5f9',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#cbd5e1',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: '#94a3b8',
    },
  },
}));

const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  top: 12,
  left: 12,
  zIndex: 1500,
  backgroundColor: '#0A5EB0',
  color: 'white',
  width: 48,
  height: 48,
  boxShadow: '0 4px 12px rgba(10, 94, 176, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    backgroundColor: '#0849A0',
    transform: 'scale(1.05)',
    boxShadow: '0 6px 16px rgba(10, 94, 176, 0.4)',
  },
  
  [theme.breakpoints.up('lg')]: {
    display: 'none',
  },
}));

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 250,
  flexShrink: 0,
  position: 'fixed',
  top: 0,
  left: 0,
  height: '100vh',
  zIndex: 1200,
  
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

export const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(false);
    }
  }, [isDesktop]);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <StyledMainContainer>
      {isDesktop && (
        <SidebarContainer>
          <Sidebar />
        </SidebarContainer>
      )}

      <Drawer
        anchor="left"
        open={isSidebarOpen && !isDesktop}
        onClose={handleSidebarClose}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: 250,
            backgroundColor: '#0A5EB0',
            border: 'none',
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
          },
        }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Sidebar />
      </Drawer>

      {!isDesktop && (
        <MobileMenuButton onClick={handleSidebarToggle}>
          <MenuIcon />
        </MobileMenuButton>
      )}
    
      <StyledContentArea
        sx={{
          marginLeft: { lg: '250px' },
          width: { lg: 'calc(100% - 250px)' },
          pl: { lg: 3 },
        }}
      >
        <StyledNavbar>
          <NavBar />
        </StyledNavbar>

        <StyledContent>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '200px',
              background: 'linear-gradient(135deg, rgba(10, 94, 176, 0.03) 0%, rgba(177, 240, 247, 0.05) 100%)',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
          
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: '1400px',
              margin: '0 auto',
            }}
          >
            {children}
          </Box>
        </StyledContent>
      </StyledContentArea>

      <Backdrop
        open={isSidebarOpen && !isDesktop}
        onClick={handleSidebarClose}
        sx={{
          zIndex: 1200,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: { xs: 'block', lg: 'none' },
        }}
      />
    </StyledMainContainer>
  );
};

export default Layout;
