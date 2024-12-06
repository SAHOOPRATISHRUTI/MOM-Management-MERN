import React, { useState} from "react";
import { useEffect } from "react";
import "./Navbar.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { logoutUser, listEmployee, getEmployeeStatus } from "../../services/api";
import { getEmployeeById } from "../../services/api";
import Profile from "../Profile/Profile";
import { jwtDecode } from "jwt-decode";

const Navbar = ({ showModal }) => {
  const [employeeName, setEmployeeName] = useState("");
  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeProfilePicture, setEmployeeProfilePicture] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const navigate = useNavigate();

  const handleOpenProfileModal = () => {
    setOpenProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setOpenProfileModal(false);
  };

 

  const fetchEmployeeById = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        const decodedToken = jwtDecode(token);
        const employeeId = decodedToken.id;

        const response = await getEmployeeById(employeeId);

        setEmployeeData(response);

        const baseUrl = "http://localhost:5000/";
        let formattedProfilePicture = null;
        if (response.profilePicture) {
          if (response.profilePicture.startsWith("https://lh3.googleusercontent.com/a")) {
            formattedProfilePicture = response.profilePicture;
          } else {
            formattedProfilePicture = `${baseUrl}${response.profilePicture}`;
          }
        }

        setEmployeeName(response.employeeName);
        setEmployeeEmail(response.employeeEmail); // Assuming these exist in the response
        setEmployeeRole(response.employeeRole); // Assuming these exist in the response
        setEmployeeId(employeeId); // Setting Employee ID for reference
        setEmployeeData({ ...response, profilePicture: formattedProfilePicture });
        setEmployeeProfilePicture(formattedProfilePicture);
      }
    } catch (error) {
      console.error("Error fetching employee by ID:", error);
    }
  };

  const fetchEmployees = async (page, searchKey = "") => {
    try {
      setLoading(true);

      const response = await listEmployee(page, 5, "-1", searchKey);
      const baseUrl = "http://localhost:5000/";

      const employeesWithFullImageUrls = response.data.employeeData.map((employee) => {
        let formattedProfilePicture = null;

        if (employee.profilePicture) {
          if (employee.profilePicture.startsWith("https://lh3.googleusercontent.com/a")) {
            formattedProfilePicture = employee.profilePicture;
          } else {
            formattedProfilePicture = `${baseUrl}${employee.profilePicture}`;
          }
        }

        return {
          ...employee,
          profilePicture: formattedProfilePicture,
        };
      });

      setEmployees(employeesWithFullImageUrls);
      setTotalEmployees(response.data.totalEmployees || 0);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
      setTotalEmployees(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (employeeId) {
    fetchEmployeeById(employeeId);
  }
}, [employeeId]);


useEffect(() => {
  if (employeeId) {
      console.log("Employee ID before fetching:", employeeId);  // Check if ID is available
      fetchEmployeeStatus(employeeId);
  } else {
      console.log("No employee ID available");
  }
}, [employeeId]);



  useEffect(() => {
    if (showModal) {
      fetchEmployeeById();
    }
  }, [showModal]);

  useEffect(() => {
    fetchEmployees(page, searchKey);
    fetchEmployeeById();
  }, [page, searchKey]);

  const fetchEmployeeStatus = async (employeeId) => {
    try {
      const response = await getEmployeeStatus(employeeId);
      console.log("respppppppppppp",response);
      console.log("ddddddddd",response.data.status);
      
      
      if (response.data.status.isActive === false) {
        toast.error(response.data.message);
        setTimeout(() => {
          navigate("/");
        });
      }
    } catch (error) {
      console.error("Error fetching employee status:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      toast.success(result.message);
      setTimeout(() => {
        navigate("/");
      }, 2500);
    } catch (error) {
      toast.error(error.message);
    }
  };



  return (
    <>
      <header className="navbar-container">
        <nav className="navbar navbar-expand-lg navbar-light">
          <div className="container">
            <a className="navbar-brand" href="#">
              <img src="assets/images/Ntspl-Logo-white.png" alt="Logo" className="logo-img" />
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item active">
                  <a className="nav-link" href="#">
                    <i className="bi bi-house-door"></i> Home
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <i className="bi bi-clock"></i> Timeline
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <i className="bi bi-person-circle"></i> Profile
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    <i className="bi bi-gear"></i> Settings
                  </a>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={employeeProfilePicture || "default-profile-picture.png"}
                      alt="Profile"
                      width="50"
                      height="50"
                    />
                    {employeeName}
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                    <li>
                      <a className="dropdown-item" onClick={handleOpenProfileModal}>
                        Account
                      </a>
                    </li>
                    <li>
                      <a className="dropdown-item" onClick={handleLogout}>
                        Logout
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        {openProfileModal && (
          <Profile
            open={openProfileModal}
            handleClose={handleCloseProfileModal}
            employeeData={employeeData}
          />
        )}
      </header>
    </>
  );
};

export default Navbar;
