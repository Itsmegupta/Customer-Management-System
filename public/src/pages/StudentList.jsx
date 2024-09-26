import React, { useEffect, useState } from "react";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from "@mui/icons-material";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  TextField,
  FormControlLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import ScaleLoader from "react-spinners/ScaleLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import Tooltip from "@mui/material/Tooltip";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { Link, useNavigate } from "react-router-dom";
function StudentList({ setIsAuthenticated, setUserImage, searchQuery }) {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const [filterStatus, setFilterStatus] = useState("All");
  const UserDetails = JSON.parse(localStorage.getItem("UserDetails"));
  const [previewImage, setPreviewImage] = useState(null);

  const navigate = useNavigate();

  const [editData, setEditData] = useState({
    fname: "",
    lname: "",
    email: "",
    mobile: "",
    gender: "",
    status: "",
    location: "",
    image: null,
  });

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3939/get-student-data",
        { parentsId: UserDetails._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRows(response.data);
      setFilteredRows(response.data);
    } catch (error) {
      if (error.response && error.response.data.message === "Invalid token") {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("userData");
        localStorage.removeItem("UserDetails");
        localStorage.removeItem("token");
        localStorage.removeItem("isAuthenticated");
        navigate("/login");
      } else {
        console.error("Error fetching data:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [setUserImage]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = rows;

      if (searchQuery) {
        filtered = filtered.filter(
          (row) =>
            row.fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.lname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (filterStatus !== "All") {
        filtered = filtered.filter((row) => row.status === filterStatus);
      }

      setFilteredRows(filtered);
    };

    applyFilters();
  }, [searchQuery, filterStatus, rows]);
  const handleEdit = (row) => {
    setSelectedRow(row);
    setEditData({
      fname: row.fname,
      lname: row.lname,
      email: row.email,
      mobile: row.mobile,
      gender: row.gender,
      status: row.status,
      location: row.location,
      image: row.profile,
    });
    console.log(row, "row.Image");

    if (row.profile) {
      setPreviewImage(`http://localhost:3939/${row.profile}`);
    } else {
      setPreviewImage(null);
    }
    setEditOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleGenderChange = (e) => {
    setEditData((prevState) => ({ ...prevState, gender: e.target.value }));
  };

  const handleStatusChange = (e) => {
    setEditData((prevState) => ({ ...prevState, status: e.target.value }));
  };

  const handleEditSubmit = async () => {
    setLoading(true);
    if (selectedRow) {
      const formData = new FormData();
      formData.append("fname", editData.fname);
      formData.append("lname", editData.lname);
      formData.append("email", editData.email);
      formData.append("mobile", editData.mobile);
      formData.append("gender", editData.gender);
      formData.append("status", editData.status);
      formData.append("location", editData.location);

      if (editData.image) {
        formData.append("profile", editData.image);
      }

      try {
        await axios.put(
          `http://localhost:3939/update-student-data/${selectedRow._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        fetchData();
        toast.success("Updated successfully!");
        setEditOpen(false);
      } catch (error) {
        console.error("Error updating item:", error);
        toast.error("Error updating item");
      } finally {
        setLoading(false);
      }
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

  const handleConfirmDelete = async () => {
    setLoading(true);
    if (selectedId) {
      try {
        await axios.delete(
          `http://localhost:3939/delete-student-data/${selectedId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRows(rows.filter((row) => row._id !== selectedId));
        toast.success("Deleted successfully!");
        handleClose();
      } catch (error) {
        console.error("Error deleting item:", error);
        handleClose();
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      "S.no",
      "Name",
      "Email",
      "Mobile",
      "Gender",
      "Status",
      "Location",
    ];
    const tableRows = [];

    filteredRows.forEach((row, index) => {
      const studentData = [
        index + 1,
        `${row.fname} ${row.lname}`,
        row.email,
        row.mobile,
        row.gender,
        row.status,
        row.location,
      ];
      tableRows.push(studentData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("student_data.pdf");
  };

  const exportToExcel = () => {
    const studentData = filteredRows.map((row, index) => ({
      "S.no": index + 1,
      Name: `${row.fname} ${row.lname}`,
      Email: row.email,
      Mobile: row.mobile,
      Gender: row.gender,
      Status: row.status,
      Location: row.location,
    }));

    const worksheet = XLSX.utils.json_to_sheet(studentData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    XLSX.writeFile(workbook, "student_data.xlsx");
  };

  return (
    <Box sx={{ p: 2 }}>
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
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 1100,
          }}
        >
          <ScaleLoader color="#36d7b7" />
        </div>
      )}

      <div
        className="StatusDropDown"
        style={{ mb: 2, display: "flex", justifyContent: "space-between" }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <h5>Total Records: {filteredRows.length}</h5>
        </Box>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
          <Tooltip title="Export to PDF">
            <IconButton
              onClick={exportToPDF}
              sx={{
                backgroundColor: "#f5f5f5",
                borderRadius: "50%",
                padding: "10px",
                marginRight: "1rem",
              }}
            >
              <FontAwesomeIcon
                icon={faFilePdf}
                size="sm"
                style={{ color: "#d32f2f" }}
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Export to Excel">
            <IconButton
              onClick={exportToExcel}
              sx={{
                backgroundColor: "#f5f5f5",
                borderRadius: "50%",
                padding: "10px",
                marginRight: "1rem",
              }}
            >
              <FontAwesomeIcon
                icon={faFileExcel}
                size="sm"
                style={{ color: "#388e3c" }}
              />
            </IconButton>
          </Tooltip>

          <Select
            sx={{ marginRight: "1rem" }}
            value={filterStatus}
            label="Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>

          <Box>
            <IconButton
              aria-label="list view"
              color={viewMode === "list" ? "primary" : "default"}
              onClick={() => setViewMode("list")}
            >
              <ViewListIcon />
            </IconButton>
            <IconButton
              aria-label="card view"
              color={viewMode === "card" ? "primary" : "default"}
              onClick={() => setViewMode("card")}
            >
              <ViewModuleIcon />
            </IconButton>
          </Box>
        </Box>
      </div>
      {viewMode === "list" ? (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: {
                xs: "40vh",
                sm: "60vh",
                md: "77vh",
              },
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            <Table
              stickyHeader
              sx={{ minWidth: 650 }}
              aria-label="Customer table"
            >
              <TableHead>
                <TableRow>
                  <TableCell align="center">
                    <strong>S.no</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Profile</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Name</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Email</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Mobile</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Gender</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell align="center">
                    <strong>Location</strong>
                  </TableCell>

                  <TableCell align="center">
                    <strong>Action</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow
                      key={row._id}
                      hover
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                      }}
                    >
                      <TableCell align="center">
                        {index + 1 + page * rowsPerPage}
                      </TableCell>
                      <TableCell align="center">
                        <Avatar
                          alt={row.fname}
                          src={
                            row.profile
                              ? `http://localhost:3939/${
                                  row.profile
                                }?t=${new Date().getTime()}`
                              : "/man.png"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        {row.fname} {row.lname}
                      </TableCell>
                      <TableCell align="center">{row.email}</TableCell>
                      <TableCell align="center">{row.mobile}</TableCell>
                      <TableCell align="center">{row.gender}</TableCell>
                      <TableCell align="center">
                        <span
                          style={{
                            color: row.status === "Active" ? "green" : "red",
                          }}
                        >
                          {row.status}
                        </span>
                      </TableCell>
                      <TableCell align="center">{row.location}</TableCell>

                      <TableCell align="center">
                        <IconButton
                          aria-label="edit"
                          style={{ color: "blue" }}
                          onClick={() => handleEdit(row)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          style={{ color: "red" }}
                          onClick={() => handleClickOpen(row._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={rows.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "white",
              }}
            />
          </TableContainer>
        </Paper>
      ) : (
        <Box
          sx={{
            maxHeight: {
              xs: "40vh",
              sm: "60vh",
              md: "77vh",
            },
            overflowY: "auto",
            padding: "1rem",
          }}
        >
          <Grid container spacing={2}>
            {filteredRows.map((row) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={row._id}>
                <Card sx={{ maxWidth: 345, boxShadow: 3 ,paddingTop:"15px"}}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 140,
                      backgroundImage: `url(${
                        row.profile
                          ? `http://localhost:3939/${
                              row.profile
                            }?t=${new Date().getTime()}`
                          : "/man.jpg"
                      })`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                    title={`${row.fname} ${row.lname}`}
                  />
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {row.fname} {row.lname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {row.email}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Mobile: {row.mobile}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gender: {row.gender}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status:{" "}
                      <span
                        style={{
                          color: row.status === "Active" ? "green" : "red",
                        }}
                      >
                        {row.status}
                      </span>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Location: {row.location}
                    </Typography>
                  </CardContent>
                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}
                  >
                    <IconButton
                      aria-label="edit"
                      style={{ color: "blue" }}
                      onClick={() => handleEdit(row)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete"
                      style={{ color: "red" }}
                      onClick={() => handleClickOpen(row._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Dialog
        open={open}
        keepMounted
        onClose={handleClose}
        style={{ zIndex: 1000 }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Are you sure you want to delete this record?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} style={{ color: "red" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        style={{ zIndex: 1000 }}
        fullWidth
      >
        <DialogTitle>Edit Customer Data</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="fname"
            label="First Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editData.fname}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="lname"
            label="Last Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editData.lname}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={editData.email}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="mobile"
            label="Mobile"
            type="text"
            fullWidth
            variant="outlined"
            value={editData.mobile}
            onChange={handleEditChange}
          />
          <RadioGroup
            name="gender"
            value={editData.gender}
            onChange={handleGenderChange}
          >
            <FormControlLabel value="Male" control={<Radio />} label="Male" />
            <FormControlLabel
              value="Female"
              control={<Radio />}
              label="Female"
            />
          </RadioGroup>
          <Select
            name="status"
            value={editData.status}
            onChange={handleStatusChange}
            fullWidth
            variant="outlined"
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <TextField
            margin="dense"
            name="location"
            label="Location"
            type="text"
            fullWidth
            variant="outlined"
            value={editData.location}
            onChange={handleEditChange}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginTop: "16px" }}
          />
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
          <Button onClick={handleEditSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StudentList;
