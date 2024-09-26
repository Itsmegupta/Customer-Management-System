import React, { useState } from "react";
import { Card, Form, Row, Button } from "react-bootstrap";
import Select from "react-select";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ScaleLoader from "react-spinners/ScaleLoader";
import { Link, useNavigate } from "react-router-dom";

const token = localStorage.getItem("token");
const UserDetails = JSON.parse(localStorage.getItem("UserDetails"));

function Adduser({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [inputdata, setInputData] = useState({
    fname: "",
    lname: "",
    email: "",
    mobile: "",
    gender: "",
    location: "",
  });
  const [status, setStatus] = useState(null);
  const [preview, setPreview] = useState("man.jpg");
  const [profile, setProfileState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const options = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  const setInputValue = (e) => {
    const { name, value } = e.target;

    setInputData({ ...inputdata, [name]: value });

    let error = "";

    switch (name) {
      case "fname":
        if (!value) error = "First name is required.";
        break;
      case "lname":
        if (!value) error = "Last name is required.";
        break;
      case "email":
        if (!value) {
          error = "Email is required.";
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          error = "Invalid email address.";
        }
        break;
      case "mobile":
        if (!value) {
          error = "Mobile number is required.";
        } else if (!/^\d{10}$/.test(value)) {
          error = "Mobile number must be 10 digits.";
        }
        break;
      case "gender":
        if (!value) error = "Gender is required.";
        break;
      case "location":
        if (!value) error = "Address is required.";
        break;
      default:
        break;
    }

    if (error) {
      setFormErrors({ ...formErrors, [name]: error });
    } else {
      const updatedErrors = { ...formErrors };
      delete updatedErrors[name];
      setFormErrors(updatedErrors);
    }
  };

  const setStatusValue = (selectedOption) => {
    setStatus(selectedOption);
    if (formErrors.status) {
      const updatedErrors = { ...formErrors };
      delete updatedErrors.status;
      setFormErrors(updatedErrors);
    }
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileState(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const errors = {};
    const { fname, lname, email, mobile, gender, location } = inputdata;
    if (!fname) errors.fname = "First name is required.";
    if (!lname) errors.lname = "Last name is required.";
    if (!email) errors.email = "Email is required.";
    if (!mobile) errors.mobile = "Mobile number is required.";
    if (!gender) errors.gender = "Gender is required.";
    if (!location) errors.location = "Location is required.";
    if (!status) errors.status = "Status is required.";

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const submitUserData = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("fname", inputdata.fname);
    formData.append("lname", inputdata.lname);
    formData.append("email", inputdata.email);
    formData.append("mobile", inputdata.mobile);
    formData.append("gender", inputdata.gender);
    formData.append("status", status ? status.value : "");
    formData.append("location", inputdata.location);
    formData.append("parentsId", UserDetails._id);
    if (profile) formData.append("profile", profile);

    try {
      const response = await axios.post(
        "http://localhost:3939/Add-student",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message === "successfully") {
        toast.success("Registration successful!");
        setInputData({
          fname: "",
          lname: "",
          email: "",
          mobile: "",
          gender: "",
          location: "",
        });
        setProfileState(null);
        setPreview("man.jpg");
        setStatus(null);
        setFormErrors({});
        setTimeout(() => {
          navigate("/student-list");
        }, 2000);
      } else {
        toast.error("Registration failed!");
      }
    } catch (error) {
      toast.error("Submission failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 className="text-center mt-1">Register Customer Details</h2>
      <Card className="shadow mt-3 p-3" style={{ position: "relative" }}>
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
        <div className="profile_div text-center">
          <img
            src={preview}
            alt="Profile"
            style={{ width: "100px", height: "55px", borderRadius: "50%" }}
          />
        </div>

        <Form onSubmit={submitUserData}>
          <Row>
            <Form.Group className="mb-3 col-lg-6" controlId="formBasicFname">
              <Form.Label>
                First Name <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="fname"
                value={inputdata.fname}
                onChange={setInputValue}
                placeholder="Enter First Name"
                isInvalid={!!formErrors.fname}
                autoComplete="off"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.fname}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 col-lg-6" controlId="formBasicLname">
              <Form.Label>
                Last Name <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="lname"
                value={inputdata.lname}
                onChange={setInputValue}
                placeholder="Enter Last Name"
                isInvalid={!!formErrors.lname}
                autoComplete="off"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.lname}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 col-lg-6" controlId="formBasicEmail">
              <Form.Label>
                Email Address <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={inputdata.email}
                onChange={setInputValue}
                placeholder="Enter Email"
                isInvalid={!!formErrors.email}
                autoComplete="off"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 col-lg-6" controlId="formBasicMobile">
              <Form.Label>
                Mobile <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="mobile"
                value={inputdata.mobile}
                onChange={setInputValue}
                placeholder="Enter Mobile"
                isInvalid={!!formErrors.mobile}
                autoComplete="off"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.mobile}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3 col-lg-6" controlId="formBasicGender">
              <Form.Label>
                Select Gender <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <div className="d-flex">
                <Form.Check
                  type="radio"
                  label="Male"
                  name="gender"
                  value="Male"
                  checked={inputdata.gender === "Male"}
                  onChange={setInputValue}
                  className="me-3"
                  isInvalid={!!formErrors.gender}
                  autoComplete="off"
                />
                <Form.Check
                  type="radio"
                  label="Female"
                  name="gender"
                  value="Female"
                  checked={inputdata.gender === "Female"}
                  onChange={setInputValue}
                  isInvalid={!!formErrors.gender}
                  autoComplete="off"
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.gender}
                </Form.Control.Feedback>
              </div>
            </Form.Group>

            <Form.Group className="mb-3 col-lg-6" controlId="formBasicStatus">
              <Form.Label>
                Select Status <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Select
                options={options}
                value={status}
                onChange={setStatusValue}
              />
              {formErrors.status && (
                <div className="text-danger">{formErrors.status}</div>
              )}
            </Form.Group>

            <Form.Group className="mb-3 col-lg-6" controlId="formBasicProfile">
              <Form.Label>Select Profile Picture</Form.Label>
              <Form.Control
                type="file"
                name="user_profile"
                onChange={handleProfileChange}
              />
            </Form.Group>

            <Form.Group className="mb-3 col-lg-6" controlId="formBasicLocation">
              <Form.Label>
                Enter Address <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={inputdata.location}
                onChange={setInputValue}
                placeholder="Enter Your Location"
                isInvalid={!!formErrors.location}
                autoComplete="off"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.location}
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Row>
        </Form>
      </Card>
      <ToastContainer />
    </div>
  );
}

export default Adduser;
