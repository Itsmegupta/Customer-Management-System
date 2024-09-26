import { Button, Avatar, Box } from "@mui/material";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import ScaleLoader from "react-spinners/ScaleLoader";
import { registerRoute } from "../utils/APIRoutes";
const Signup = ({ setUserImage }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    contact: "",
    password: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    username: "",
    contact: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "image" && files) {
      setFormData((prevState) => ({
        ...prevState,
        [name]: files[0],
      }));
      setImagePreview(URL.createObjectURL(files[0]));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));

      if (name === "username" && value.trim() !== "") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: emailPattern.test(value)
            ? ""
            : "Please enter a valid email address",
        }));
      } else if (name === "contact" && value.trim() !== "") {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: value.length === 10 ? "" : "Contact number must be 10 digits",
        }));
      } else if (name === "password" && value.trim() !== "") {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]:
            value.length >= 6
              ? ""
              : "Password must be atleast 6 char or digits",
        }));
      } else if (value.trim() !== "") {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: "",
        }));
      }
    }
  };

  const validateForm = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const newErrors = {
      name: formData.name.trim() === "" ? "Full Name is required" : "",
      username:
        formData.username.trim() === ""
          ? "Email address is required"
          : !emailPattern.test(formData.username)
          ? "Please enter a valid email address"
          : "",
      contact:
        formData.contact.trim() === ""
          ? "Contact No is required"
          : formData.contact.length !== 10
          ? "Contact number must be 10 digits"
          : "",
      password:
        formData.password.trim() === ""
          ? "Password is required"
          : formData.password.length < 6
          ? "Password must be atleast 6 char or digits"
          : "",
    };

    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some(Boolean);
    // if (hasErrors) {
    //   toast.error("All fields are mandatory except image");
    // }
    return !hasErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    setLoading(true);

    try {
      const response = await fetch(registerRoute, {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Signup successful!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(`Signup Failed: ${error.message}`);
      }
    } catch (error) {
      toast.error("Signup Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 150px)",
        position: "relative",
      }}
    >
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
            zIndex: 10,
          }}
        >
          <ScaleLoader color="#36d7b7" />
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
          filter: loading ? "blur(3px)" : "none",
          transition: "filter 0.3s ease",
        }}
      >
        <h4 className="text-center mt-2">Sign Up Here</h4>
        {imagePreview && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Avatar
              src={imagePreview}
              alt="Image Preview"
              sx={{ width: 100, height: 100 }}
            />
          </Box>
        )}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Full Name <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="text"
            className="form-control"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="off"
            style={{
              borderColor: errors.name ? "red" : "",
            }}
          />
          {errors.name && <span style={{ color: "red" }}>{errors.name}</span>}
        </div>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Email address <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="email"
            className="form-control"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="off"
            style={{
              borderColor: errors.username ? "red" : "",
            }}
          />
          {errors.username && (
            <span style={{ color: "red" }}>{errors.username}</span>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="contact" className="form-label">
            Contact No <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="number"
            className="form-control"
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            autoComplete="off"
            style={{
              borderColor: errors.contact ? "red" : "",
            }}
          />
          {errors.contact && (
            <span style={{ color: "red" }}>{errors.contact}</span>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password <span style={{ color: "red" }}>*</span>
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="off"
            style={{ borderColor: errors.password ? "red" : "" }}
          />
          {errors.password && (
            <span style={{ color: "red" }}>{errors.password}</span>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="image" className="form-label">
            Image
          </label>
          <input
            type="file"
            className="form-control"
            name="image"
            id="image"
            onChange={handleChange}
            style={{}}
          />
        </div>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          style={{ width: "100%" }}
        >
          CREATE USER
        </Button>
        <div className="sign-up mt-3 text-center">
          Have an account? <Link to="/login">Create One</Link>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Signup;
