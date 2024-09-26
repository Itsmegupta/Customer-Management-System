import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScaleLoader from "react-spinners/ScaleLoader";

const Login = ({ setIsAuthenticated, setUserData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "admin@gmail.com",
    password: "admin@123",
  });
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (!validateEmail(formData.username)) {
      toast.error("Please enter a valid email!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3939/user-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setIsAuthenticated(true);
        localStorage.setItem("token", result.token);
        setUserData(result.user.image);
        toast.success("Login successful!");
        localStorage.setItem("UserDetails", JSON.stringify(result.user));
        setTimeout(() => {
          navigate("/student-list");
        }, 2000);
      } else {
        toast.error("Login Failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container">
      {loading && (
        <div className="loader-overlay">
          <ScaleLoader color="#36d7b7" />
        </div>
      )}
      <form onSubmit={handleSubmit} id="login-form">
        <h4 className="text-center mt-2">Login Here</h4>
        <div className="mb-3 mt-4">
          <label htmlFor="exampleInputEmail1" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputPassword1" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="exampleInputPassword1"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary mb-3"
          style={{ width: "100%" }}
        >
          LOG IN
        </button>
        <div className="sign-up mt-3 text-center">
          Don't have an account? <Link to="/">Create One</Link>
        </div>
      </form>

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
    </div>
  );
};

export default Login;
