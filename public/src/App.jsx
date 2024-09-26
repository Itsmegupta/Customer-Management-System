import { useState, useEffect } from "react";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "react-toastify/dist/ReactToastify.css";
import Header from "./pages/Header";
import SignupList from "./pages/SignupList";
import Chat from "./pages/Chat";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Adduser from "./pages/Adduser";
import StudentList from "./pages/StudentList";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
  const [userData, setUserData] = useState(null); 
  const [userImage, setUserImage] = useState(null);

  const UserDetails = JSON.parse(localStorage.getItem("UserDetails"));

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  return (
    <Router>
      <Header
        setIsAuthenticated={setIsAuthenticated}
        onSearch={handleSearch}
        userData={userData}
      />
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              setIsAuthenticated={setIsAuthenticated}
              setUserData={setUserData}
            />
          }
        />
        <Route
          path="/adduser"
          element={
            isAuthenticated ? (
              <Adduser setIsAuthenticated={setIsAuthenticated} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/student-list"
          element={
            isAuthenticated ? (
              <StudentList
                setIsAuthenticated={setIsAuthenticated}
                setUserImage={setUserImage}
                searchQuery={searchQuery}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/" element={<Signup />} />

        <Route
          path="/signup-list"
          element={isAuthenticated ? <SignupList /> : <Navigate to="/login" />}
        />
        <Route
          path="/user-chat"
          element={isAuthenticated ? <Chat UserDetails={UserDetails} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
