import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";
import LoginIcon from "@mui/icons-material/Login";
import ProfileCard from "./ProfileCard";
import GroupIcon from "@mui/icons-material/Group";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ChatIcon from "@mui/icons-material/Chat";
const settings = [
  { label: "Profile", icon: <PersonIcon /> },
  { label: "Logout", icon: <LogoutIcon /> },
];

function Header({ setIsAuthenticated, userData, onSearch }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileCardOpen, setProfileCardOpen] = useState(false);

  useEffect(() => {
    if (userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  }, [userData]);

  const storedUserData =
    JSON.parse(localStorage.getItem("userData")) || userData;

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleOpenUser = () => {
    navigate("/signup-list");
  };
  const handleOpenChat = () => {
    navigate("/user-chat");
  };
  const handleOpenAdUser = () => {
    navigate("/adduser");
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("userData");
    localStorage.removeItem("UserDetails");
    localStorage.removeItem("token");
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    if (onSearch) {
      onSearch(event.target.value);
    }
  };

  const baseURL = "http://localhost:3939/";

  const handleProfileUpdate = (updatedData) => {
    console.log("Updated profile data:", updatedData);
  };

  return (
    <nav className="navbar bg-body-tertiary">
      <div className="container-fluid">
        <NavLink
          className="navbar-brand"
          to="/student-list"
          style={{
            marginLeft: "3rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="https://www.pngplay.com/wp-content/uploads/7/Customer-Logo-Transparent-PNG.png"
            alt="Logo"
            width="50"
            height="35"
            className="d-inline-block align-text-top"
            style={{ marginRight: "0.5rem" }}
          />
          <span style={{ fontWeight: "bold", fontSize: "1.5rem" }}>CMS</span>
        </NavLink>

        {location.pathname != "/" &&
          location.pathname != "/login" &&
          location.pathname != "/student-list" && (
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              sx={{ marginLeft: "auto", marginRight: "1rem" }}
              onClick={() => navigate("/student-list")}
            >
              <span className="hide-text">Home</span>
            </Button>
          )}

        {location.pathname === "/" && (
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            sx={{ marginLeft: "auto", marginRight: "1rem" }}
            onClick={() => navigate("/login")}
          >
            <span className="hide-text">Login</span>
          </Button>
        )}
        {location.pathname === "/login" && (
          <Button
            variant="contained"
            startIcon={<LoginIcon />}
            sx={{ marginLeft: "auto", marginRight: "1rem" }}
            onClick={() => navigate("/")}
          >
            <span className="hide-text">Signup</span>
          </Button>
        )}

        <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center" }}>
          {location.pathname === "/student-list" && (
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              autoComplete="off"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ marginRight: "1rem" }}
            />
          )}
          {location.pathname != "/" && location.pathname != "/login" && (
            <Box>
              {location.pathname != "/user-chat" && (
                <Tooltip title="Chat">
                  <IconButton
                    sx={{
                      backgroundColor: "#1976d2",
                      borderRadius: "50%",
                      marginRight: "1rem",
                    }}
                    onClick={handleOpenChat}
                  >
                    <ChatIcon sx={{ color: "#fff" }} />
                  </IconButton>
                </Tooltip>
              )}
              {location.pathname != "/signup-list" && (
                <Tooltip title="All Users">
                  <IconButton
                    sx={{
                      backgroundColor: "#1976d2",
                      borderRadius: "50%",
                      marginRight: "1rem",
                    }}
                    onClick={handleOpenUser}
                  >
                    <GroupIcon sx={{ color: "#fff" }} />
                  </IconButton>
                </Tooltip>
              )}

              {location.pathname != "/adduser" && (
                <Tooltip title="Add Client">
                  <IconButton
                    sx={{
                      backgroundColor: "#1976d2",
                      borderRadius: "50%",
                      marginRight: "1rem",
                    }}
                    onClick={handleOpenAdUser}
                  >
                    <PersonAddIcon sx={{ color: "#fff" }} />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    src={
                      storedUserData
                        ? `${baseURL}${storedUserData}?t=${new Date().getTime()}`
                        : "/man.png"
                    }
                    alt="User Avatar"
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => {
                      if (setting.label === "Logout") {
                        handleLogout();
                      } else if (setting.label === "Profile") {
                        setProfileCardOpen(true);
                      }
                      handleCloseUserMenu();
                    }}
                  >
                    <ListItemIcon>{setting.icon}</ListItemIcon>
                    <Typography textAlign="center">{setting.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Box>
      </div>

      <ProfileCard
        open={profileCardOpen}
        onClose={() => setProfileCardOpen(false)}
        userData={storedUserData}
        onUpdate={handleProfileUpdate}
      />
    </nav>
  );
}

export default Header;
