import React, { useState, useRef } from "react";
import { useEffect } from "react";
import "./Userdashboard.css";
import logo1 from "../../assets/logo1.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { logoutUser, listEmployee,} from "../../services/api";
import AuthService from "../AuthService/Authservice";
import { Link ,useLocation} from "react-router-dom";
import logo from "../../assets/logo.png";
import meetingicon from "../../assets/meetingicon.png"
import action from '../../assets/double-tap.png'
import manage from "../../assets/management.png"

function UserDashboard() {
    const [employeeName, setEmployeeName] = useState('');

    const [employees, setEmployees] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate();

    const location = useLocation();

    const { profilePicture } = location.state || {};
    const baseUrl = 'http://localhost:5000/';
    let formattedProfilePicture;
    
    // Check if `profilePicture` exists and apply the condition
    if (profilePicture) {
        if (profilePicture.startsWith('https://lh3.googleusercontent.com/a')) {
            formattedProfilePicture = profilePicture;
        } else {
            formattedProfilePicture = `${baseUrl}${profilePicture}`;
        }
    } else {
        //formattedProfilePicture = `${baseUrl}default-profile-picture.png`; // Fallback to a default profile picture if none is provided
    }
    

    const [addEmployeeForm, setAddEmployeeForm] = useState({
        employeeName: "",
        employeeId: "",
        email: "",
        designation: "",
        department: "",
        unit: "",
    });

    const [errors, setErrors] = useState({
        employeeName: "",
        employeeId: "",
        email: "",
        designation: "",
        department: "",
        unit: "",
    });

    const searchTimeout = useRef(null);


    const fetchEmployees = async (page, searchKey = "") => {
        try {
            setLoading(true);
            const response = await listEmployee(page, 5, '-1', searchKey);  
            setEmployees(response.data.employeeData || []);
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

    // Handle search input changes with debounce
    const handleSearchChange = (e) => {
        const searchValue = e.target.value;
        setSearchKey(searchValue);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        searchTimeout.current = setTimeout(() => {
            fetchEmployees(page, searchValue);
        }, 500);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    // Get the employee's name after login and fetch employees
    useEffect(() => {
        fetchEmployees(page, searchKey);
        const name = AuthService.getEmployeeName();  // Fetch employee name from AuthService
        console.log('Fetched Employee Name:', name); 
        setEmployeeName(name);  // Set the employee name in state
    }, [page, searchKey]);  // Re-run the effect on page or searchKey change


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
        Welcome {employeeName}
            <header className="navbar-container">
                <nav className="navbar navbar-expand-lg navbar-light">
                    <div className="container">
                        <a className="navbar-brand" href="#">
                            <img
                                src="assets/images/Ntspl-Logo-white.png"
                                alt="Logo"
                                className="logo-img"
                            />
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
                                            src={formattedProfilePicture || logo}
                                            alt="Profile"
                                            width="50"
                                            height="50"
                                        />
                                        {employeeName || 'guest'}
                                    </a>
                                    <ul
                                        className="dropdown-menu"
                                        aria-labelledby="navbarDropdown"
                                    >
                                        <li>
                                            <a className="dropdown-item">
                                              <Link to='/profile'>Account</Link>
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                className="dropdown-item"
                                                href="#"
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </header>

            <div className="sidebar">
                <div className="logo">
                    <img src={logo1} alt="Logo" />
                </div>
                <ul className="navbar-nav me-auto mt-5">
                    <li className="nav-item">
                        <a className="nav-link text-white d-flex gap-2 align-items-center">
                            <img src={meetingicon} alt="Meetings" />
                            <span className="nav-link-label">Meetings</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link text-white d-flex gap-2 align-items-center">
                            <img src={action} alt="Action" />
                            <span className="nav-link-label">Action</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link text-white d-flex gap-2 align-items-center">
                            <img src={manage} alt="Manage" />
                            <span className="nav-link-label">Manage</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="main-content">
                <div className="Action-list-page">
                    <div className="table-header">
                        <h4 className="h4 mb-3">Manage Employee</h4>
                        <div className="employee-list-container p-3 border rounded bg-white">
                            <div className="tbl-text-search d-flex justify-content-between mb-3">
                                <div className="left-tbl-text">
                                    Showing {((page - 1) * 5) + 1} - {Math.min(page * 5, totalEmployees)} Employees out of {totalEmployees}
                                </div>

                                <div className="search-box d-flex align-items-center">
                                    <input
                                        type="search"
                                        placeholder="Search"
                                        value={searchKey}
                                        onChange={handleSearchChange}
                                        className="form-control me-2"
                                    />
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="#4F2CC8"
                                        viewBox="0 0 16 16"
                                        className="bi bi-search"
                                    >
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"></path>
                                    </svg>
                                </div>
                            </div>

                            <table className="table table-bordered table-striped mb-3">
                                <thead>
                                    <tr>
                                        <th>Employee Name</th>
                                        <th>Employee ID</th>
                                        <th>Designation</th>
                                        <th>Department</th>
                                        <th>Unit</th>
                                        <th>Updated At</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {employees?.length > 0 ? (
                                        employees.map((employee) => (
                                            <tr key={employee._id}>
                                                <td>{employee.employeeName}</td>
                                                <td>{employee.employeeId}</td>
                                                <td>{employee.designation}</td>
                                                <td>{employee.department}</td>
                                                <td>{employee.unit}</td>
                                                <td>{new Date(employee.updatedAt).toLocaleString()}</td>

                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center">
                                                No employees found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Pagination Controls */}
                            <div className="pagination">
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePageChange(index + 1)}
                                        className={`page-btn ${page === index + 1 ? "active" : ""}`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </>

    )
}

export default UserDashboard;

