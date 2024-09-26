import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  TextField,
  Button,
  Dialog,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { toast } from "react-toastify";

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  margin: "auto",
  padding: theme.spacing(3),
  borderRadius: "16px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
}));

const StyledAvatar = styled(Avatar)({
  width: 120,
  height: 120,
  borderRadius: "50%",
  margin: "auto",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
});

const baseURL = "http://localhost:3939/";
const token = localStorage.getItem("token");

const ProfileCard = ({ open, onClose, onUpdate }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    profileImage: "/default-avatar.png",
    contact: "",
  });

  useEffect(() => {
    if (open) {
      const storedUserData =
        JSON.parse(localStorage.getItem("UserDetails")) || {};
      setUserData({
        name: storedUserData.name || "User Name",
        email: storedUserData.username || "user@example.com",
        profileImage: storedUserData.image || "/default-avatar.png",
        contact: storedUserData.contact || "1234512345",
      });
    }
  }, [open]);

  const handleSave = async () => {
    // Form validation
    if (!oldPassword || !newPassword) {
      toast.error("Please fill in all the fields.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await axios.post(
        `${baseURL}user-change-password`,
        {
          oldPassword,
          newPassword,
          userData,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        onUpdate();
        toast.success(
          response.data.message || "Password updated successfully!"
        );
        setOldPassword("");
        setNewPassword("");
        onClose();
      }
    } catch (error) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message || "Failed to update the password.";
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("No response from the server. Please try again later.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleCancel = () => {
    setOldPassword("");
    setNewPassword("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel}>
      <StyledCard>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <StyledAvatar
              src={`${baseURL}${
                userData.profileImage
              }?t=${new Date().getTime()}`}
              alt="User Avatar"
            />
            <Typography variant="h5" component="div" sx={{ mt: 2 }}>
              {userData.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {userData.email} | {userData.contact}
            </Typography>
          </Box>
          <Box sx={{ mt: 3 }}>
            <TextField
              label="Old Password"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <TextField
              label="New Password"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button variant="outlined" onClick={handleCancel} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </CardContent>
      </StyledCard>
    </Dialog>
  );
};

export default ProfileCard;
