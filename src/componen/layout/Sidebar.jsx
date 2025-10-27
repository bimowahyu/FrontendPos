/* eslint-disable no-irregular-whitespace */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useDispatch, useSelector } from "react-redux";
import { 
  LogoutOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  PeopleOutlined,
  InventoryOutlined,
  CategoryOutlined,
  TableRestaurantOutlined,
  ReceiptOutlined,
  Attachment,
  SettingsOutlined,
  PersonAddOutlined,
  AssessmentOutlined,
  Money,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { Logout, reset } from "../../fitur/AuthSlice";


export const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const auth = useSelector((state) => state.auth || {});
  const user = auth.user || null;

  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);


  const handleLogoutClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenConfirmDialog(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await dispatch(Logout()).unwrap();
      dispatch(reset());
      navigate("/");
    } catch (error) {
      // Jika logout gagal, tetap clear state dan redirect
      dispatch(reset());
      navigate("/");
    }
    setOpenConfirmDialog(false);
  };

  const handleCancelLogout = () => {
    setOpenConfirmDialog(false);
  };


  // Navigation items untuk aplikasi kasir
  const navItems = [
    { to: "/dashboardadmin", text: "Dashboard", icon: <DashboardOutlined /> },
    { to: "/transaksi", text: "Transaksi", icon: <ShoppingCartOutlined /> },
    { to: "/barang", text: "Barang", icon: <InventoryOutlined /> },
    { to: "/kategori", text: "Kategori", icon: <CategoryOutlined /> },
    { to: "/rekap", text: "Rekap Penjualan", icon: <AssessmentOutlined /> },
  ];
  const adminItems = [
    { to: "/user", text: "User Management", icon: <PersonAddOutlined /> },
    { to: "/settings", text: "Settings", icon: <SettingsOutlined /> },
  ];

  return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #0A5EB0 0%, #084B8A 100%)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100%",
        position: "relative",
        p: 2,
        overflowY: "auto",
        boxShadow: "4px 0 10px rgba(0, 0, 0, 0.2)",
        "&::-webkit-scrollbar": {
          width: "5px",
        },
        "&::-webkit-scrollbar-track": {
          background: "rgba(255, 255, 255, 0.05)",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#B1F0F7",
          borderRadius: "10px",
          "&:hover": {
            backgroundColor: "#90E0E7",
          },
        },
      }}
    >
      {/* Logo Section with Animation */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", 
          alignItems: "center",
          justifyContent: "center",
          py: 3,
          position: "relative",
          mb: 4,
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "10%",
            width: "80%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #B1F0F7, transparent)",
          },
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      >
        <Box
          sx={{
            width: "85px",
            height: "85px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "20px",
            marginBottom: "12px",
            backdropFilter: "blur(10px)",
            border: "2px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <ShoppingCartOutlined sx={{ fontSize: 40, color: "white" }} />
        </Box>
        
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            color: "#fff", 
            fontWeight: "bold",
            fontSize: "15px", 
            lineHeight: "1.4",
            letterSpacing: "0.5px",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        >
          Sistem Kasir Online <br />
          Point of Sale
        </Typography>
      </Box>

      {/* Navigation Links */}
      <Stack 
        spacing={1.5} 
        sx={{ 
          flex: 1,
          px: 0.5
        }}
      >
        {/* Regular menu items */}
        {navItems.map((item) => {
          if (item.isDropdown) {
            return (
              <Box key={item.to}>
                {/* Menu utama Presensi */}
                <Box
                  onClick={togglePresensiDropdown}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    color: isPresensiActive ? "#fff" : "rgba(255, 255, 255, 0.8)",
                    padding: "10px 16px",
                    borderRadius: "10px",
                    transition: "all 0.3s ease",
                    backgroundColor: isPresensiActive ? "rgba(177, 240, 247, 0.25)" : "transparent",
                    boxShadow: isPresensiActive ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
                    "&:hover": {
                      backgroundColor: "rgba(177, 240, 247, 0.15)",
                      color: "#fff",
                      transform: "translateX(5px)",
                    },
                  }}
                >
                  <Box sx={{ 
                    mr: 2, 
                    fontSize: "20px",
                    opacity: isPresensiActive ? 1 : 0.8,
                  }}>
                    {item.icon}
                  </Box>
                  <Typography 
                    sx={{ 
                      fontWeight: isPresensiActive ? 600 : 400, 
                      fontSize: "14px" 
                    }}
                  >
                    {item.text}
                  </Typography>
                  <Box sx={{ ml: "auto" }}>
                    {isPresensiDropdownOpen ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                </Box>

                {/* Dropdown Items */}
                {isPresensiDropdownOpen && (
                  <Stack spacing={1.5} sx={{ mt: 1, pl: 4 }}>
                    {presensiDropdownItems.map((dropdownItem) => (
                      <NavLink
                        to={dropdownItem.to}
                        key={dropdownItem.to}
                        style={{ textDecoration: "none" }}
                      >
                        {({ isActive }) => (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              color: isActive ? "#fff" : "rgba(255, 255, 255, 0.8)",
                              padding: "8px 16px",
                              borderRadius: "10px",
                              transition: "all 0.3s ease",
                              backgroundColor: isActive ? "rgba(177, 240, 247, 0.25)" : "transparent",
                              boxShadow: isActive ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
                              "&:hover": {
                                backgroundColor: "rgba(177, 240, 247, 0.15)",
                                color: "#fff",
                                transform: "translateX(5px)",
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: isActive ? 600 : 400,
                                fontSize: "13px"
                              }}
                            >
                              {dropdownItem.text}
                            </Typography>
                            {isActive && (
                              <Box
                                sx={{
                                  width: "4px",
                                  height: "70%",
                                  bgcolor: "#B1F0F7",
                                  borderRadius: "4px",
                                  ml: "auto",
                                }}
                              />
                            )}
                          </Box>
                        )}
                      </NavLink>
                    ))}
                  </Stack>
                )}
              </Box>
            );
          } else {
            return (
              <NavLink 
                to={item.to} 
                key={item.to}
                style={{ textDecoration: "none" }}
              >
                {({ isActive }) => (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: isActive ? "#fff" : "rgba(255, 255, 255, 0.8)",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      transition: "all 0.3s ease",
                      backgroundColor: isActive ? "rgba(177, 240, 247, 0.25)" : "transparent",
                      boxShadow: isActive ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
                      "&:hover": {
                        backgroundColor: "rgba(177, 240, 247, 0.15)",
                        color: "#fff",
                        transform: "translateX(5px)",
                      },
                    }}
                  >
                    <Box sx={{ 
                      mr: 2, 
                      fontSize: "20px",
                      opacity: isActive ? 1 : 0.8,
                    }}>
                      {item.icon}
                    </Box>
                    <Typography 
                      sx={{ 
                        fontWeight: isActive ? 600 : 400, 
                        fontSize: "14px" 
                      }}
                    >
                      {item.text}
                    </Typography>
                    {isActive && (
                      <Box
                        sx={{
                          width: "4px",
                          height: "70%",
                          bgcolor: "#B1F0F7",
                          borderRadius: "4px",
                          ml: "auto",
                        }}
                      />
                    )}
                  </Box>
                )}
              </NavLink>
            );
          }
        })}

    
        {/* Admin-only menus */}
        {user?.role === "admin" && (
          <>
            <Divider sx={{ 
              bgcolor: "rgba(177, 240, 247, 0.3)", 
              my: 1.5,
              position: "relative",
              "&::before": {
                content: "'Menu Admin'",
                position: "absolute",
                top: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#0A5EB0",
                padding: "0 10px",
                color: "#B1F0F7",
                fontSize: "12px",
                fontWeight: 500,
              }
            }} />

            {adminItems.map((item) => (
              <NavLink 
                to={item.to} 
                key={item.to}
                style={{ textDecoration: "none" }}
              >
                {({ isActive }) => (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: isActive ? "#fff" : "rgba(255, 255, 255, 0.8)",
                      padding: "10px 16px",
                      borderRadius: "10px",
                      transition: "all 0.3s ease",
                      backgroundColor: isActive ? "rgba(177, 240, 247, 0.25)" : "transparent",
                      boxShadow: isActive ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "none",
                      "&:hover": {
                        backgroundColor: "rgba(177, 240, 247, 0.15)",
                        color: "#fff",
                        transform: "translateX(5px)",
                      },
                    }}
                  >
                    <Box sx={{ 
                      mr: 2, 
                      fontSize: "20px",
                      opacity: isActive ? 1 : 0.8,
                    }}>
                      {item.icon}
                    </Box>
                    <Typography 
                      sx={{ 
                        fontWeight: isActive ? 600 : 400, 
                        fontSize: "14px" 
                      }}
                    >
                      {item.text}
                    </Typography>
                    {isActive && (
                      <Box
                        sx={{
                          width: "4px",
                          height: "70%",
                          bgcolor: "#B1F0F7",
                          borderRadius: "4px",
                          ml: "auto",
                        }}
                      />
                    )}
                  </Box>
                )}
              </NavLink>
            ))}
          </>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* User Info */}
        {user && (
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              {user.username}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                textTransform: "capitalize",
              }}
            >
              {user.role}
            </Typography>
          </Box>
        )}

        {/* Logout Button */}
        <Button
          onClick={handleLogoutClick}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            color: "rgba(255, 255, 255, 0.9)",
            padding: "10px 16px",
            borderRadius: "10px",
            backgroundColor: "rgba(251, 65, 65, 0.2)",
            transition: "all 0.3s ease",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "rgba(251, 65, 65, 0.4)",
              transform: "translateY(-2px)",
            },
          }}
          startIcon={
            <LogoutOutlined sx={{ fontSize: "20px" }} />
          }
        >
          <Typography 
            sx={{ 
              fontWeight: 500, 
              fontSize: "14px", 
              marginLeft: 1 
            }}
          >
            Log Out
          </Typography>
        </Button>
      </Stack>

      {/* Footer Section */}
      <Box
        sx={{
          mt: 2,
          pt: 2,
          pb: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderTop: "1px solid rgba(177, 240, 247, 0.3)",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            textAlign: "center",
            fontSize: "10px",
            lineHeight: 1.4,
          }}
        >
          © {new Date().getFullYear()} Sistem Kasir Online
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            textAlign: "center", 
            color: "rgba(255,255,255,0.5)", 
            mt: 1, 
            fontSize: "10px" 
          }}
        >
        
        </Typography>
      </Box>

      {/* Logout Dialog */}
      <Dialog 
        open={openConfirmDialog} 
        onClose={handleCancelLogout}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: "1.2rem", 
          fontWeight: 600,
          color: "#0A5EB0" 
        }}>
          Konfirmasi Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin keluar dari aplikasi?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button 
            onClick={handleCancelLogout} 
            sx={{
              color: "#5A5A5A",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.04)"
              }
            }}
          >
            Batal
          </Button>
          <Button 
            onClick={handleConfirmLogout} 
            variant="contained" 
            color="error" 
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              boxShadow: "0 4px 6px rgba(251, 65, 65, 0.2)",
              "&:hover": {
                boxShadow: "0 6px 8px rgba(251, 65, 65, 0.3)",
              }
            }}
            autoFocus
          >
            Keluar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sidebar;
