import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import axios from "axios";
import {
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { ToastContainer, toast } from "react-toastify";
import ScaleLoader from "react-spinners/ScaleLoader";

function SignupList({ setIsAuthenticated }) {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editData, setEditData] = useState({
    name: "",
    username: "",
    contact: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const token = localStorage.getItem("token");
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const storedUserDetails = JSON.parse(localStorage.getItem("UserDetails"));
    setUserDetails(storedUserDetails);
    setIsAdmin(storedUserDetails?._id === "66dffe193dd605ebfff3190e");
  }, []);

  useEffect(() => {
    if (token) {
      setLoading(true);
      axios
        .get("http://localhost:3939/get-user-data", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const allRows = response.data;
          const ownRow = allRows.filter((row) => row._id === userDetails?._id);
          const otherRows = allRows.filter(
            (row) => row._id !== userDetails?._id
          );
          setRows([...ownRow, ...otherRows]);
          setLoading(false);
        })
        .catch((error) => {
          if (
            error.response &&
            error.response.data.message === "Invalid token"
          ) {
            toast.error("Session expired. Please log in again.");
            localStorage.removeItem("userData");
            localStorage.removeItem("UserDetails");
            localStorage.removeItem("token");
            localStorage.removeItem("isAuthenticated");
            navigate("/login");
          } else {
            console.error("Error fetching data:", error);
          }
          setLoading(false);
        });
    }
  }, [token, userDetails]);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setEditData((prevState) => ({
        ...prevState,
        image: file,
      }));
    }
  };

  const handleEdit = (row) => {
    setSelectedRow(row);
    setEditData({
      name: row.name,
      username: row.username,
      contact: row.contact,
      image: row.image,
    });
    if (row.image) {
      setPreviewImage(`http://localhost:3939/${row.image}`);
    } else {
      setPreviewImage(null);
    }
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleEditSubmit = () => {
    if (selectedRow) {
      const formData = new FormData();
      formData.append("name", editData.name);
      formData.append("username", editData.username);
      formData.append("contact", editData.contact);

      if (editData.image && editData.image !== selectedRow.image) {
        formData.append("image", editData.image);
      }

      setLoading(true);
      axios
        .put(
          `http://localhost:3939/update-user-data/${selectedRow._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then(() => {
          axios
            .get("http://localhost:3939/get-user-data", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then((response) => {
              setRows(response.data);
              toast.success("Updated successfully!");
              setEditOpen(false);
              setLoading(false);
            })
            .catch((error) => {
              console.error("Error fetching updated data:", error);
              toast.error("Error fetching updated data");
              setLoading(false);
            });
        })
        .catch((error) => {
          console.error("Error updating item:", error);
          toast.error("Error updating item");
          setLoading(false);
        });
    }
  };

  const handleClickOpen = (id) => {
    setSelectedId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      setLoading(true);
      axios
        .delete(`http://localhost:3939/delete-user-data/${selectedId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          setRows(rows.filter((row) => row._id !== selectedId));
          toast.success("Deleted successfully!");
          handleClose();
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error deleting item:", error);
          toast.error("Error deleting item");
          handleClose();
          setLoading(false);
        });
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            zIndex: 10,
          }}
        >
          <ScaleLoader color="#36d7b7" />
        </div>
      )}
      <TableContainer
        component={Paper}
        style={{ width: "100%", maxWidth: "100%" }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>S.no</TableCell>
              <TableCell>Profile</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>UserName</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              const isOwnRow = userDetails?._id === row._id;

              return (
                <TableRow key={row._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Avatar
                      alt={row.name}
                      src={
                        row.imageUrl
                          ? `${row.imageUrl}?t=${new Date().getTime()}`
                          : `http://localhost:3939/${
                              row.image
                            }?t=${new Date().getTime()}`
                      }
                      sx={{ width: "3rem", height: "3rem" }}
                    />
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.username}</TableCell>
                  <TableCell>{row.contact}</TableCell>

                  <TableCell>
                    {isAdmin || isOwnRow ? (
                      <IconButton
                        aria-label="edit"
                        style={{ color: "blue" }}
                        onClick={() => handleEdit(row)}
                      >
                        <EditIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        aria-label="edit"
                        style={{ color: "gray" }}
                        disabled
                      >
                        <EditIcon />
                      </IconButton>
                    )}

                    {isAdmin || isOwnRow ? (
                      <IconButton
                        aria-label="delete"
                        style={{ color: "red" }}
                        onClick={() => handleClickOpen(row._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        aria-label="delete"
                        style={{ color: "gray" }}
                        disabled
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={editData.name}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="username"
            label="Username"
            type="text"
            fullWidth
            variant="standard"
            value={editData.username}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="contact"
            label="Contact"
            type="text"
            fullWidth
            variant="standard"
            value={editData.contact}
            onChange={handleEditChange}
          />
          <input accept="image/*" type="file" onChange={handleImageChange} />
          {previewImage && (
            <img
              src={previewImage}
              alt="Profile"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                marginTop: "16px",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SignupList;
