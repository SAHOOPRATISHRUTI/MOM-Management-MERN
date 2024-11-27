import React, { useState, useRef } from "react";
import { useEffect } from "react";
import "./AdminDashboard.css";
import logo1 from "../../assets/logo1.png";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { TextField, MenuItem, Button, InputLabel, Select, FormControl, FormHelperText, Switch, FormControlLabel } from "@mui/material";
import Grid from "@mui/material/Grid";
import { logoutUser, addEmployee, listEmployee, activateEmployee, deactiveEmployee, } from "../../services/api";
import AuthService from "../AuthService/Authservice";
import logo from "../../assets/logo.png";

const MeetingPage = () => {
    const [employeeName, setEmployeeName] = useState('');
    const [employees, setEmployees] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [searchKey, setSearchKey] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const { profilePicture } = location.state || {};

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

    // Fetch employee data
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
        const name = AuthService.getEmployeeName();  // Make sure this function returns the correct employee name
        console.log('Fetched Employee Name:', name);
        setEmployeeName(name);
    }, [page, searchKey]); // Re-run the effect on page or searchKey change


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
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAddEmployeeForm((prev) => ({
            ...prev,
            [name]: value,
        }));


        validateField(name, value);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        let isValid = true;

        Object.keys(addEmployeeForm).forEach((key) => {
            if (!addEmployeeForm[key].trim()) {
                validateField(key, addEmployeeForm[key]);
                isValid = false;
            }
        });

        if (!isValid) {

            return;
        }

        try {
            const result = await addEmployee(
                addEmployeeForm.employeeName,
                addEmployeeForm.employeeId,
                addEmployeeForm.email,
                addEmployeeForm.designation,
                addEmployeeForm.department,
                addEmployeeForm.unit
            );
            console.log(result);
            toast.success(result.message);

            setAddEmployeeForm({
                employeeName: "",
                employeeId: "",
                email: "",
                designation: "",
                department: "",
                unit: "",
            });
            setErrors({});

            // Fetch the updated employee list to reflect the added employee
            fetchEmployees(page, searchKey);
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        }
    };

    const onStatusChange = async (employeeId, isActive) => {
        try {
            const action = isActive ? "active" : "deactive";
            const response = isActive
                ? await activateEmployee(employeeId)
                : await deactiveEmployee(employeeId);
            toast.success(response.message);

            setEmployees((prevEmployees) =>
                prevEmployees.map((employee) =>
                    employee._id === employeeId
                        ? { ...employee, isActive: isActive }
                        : employee
                )
            );
        } catch (error) {
            toast.error(error.message);
            console.error(
                `Error while ${isActive ? "activating" : "deactivating"} employee:`,
                error
            );
        }
    };


    const validateField = (name, value) => {
        let error = "";
        if (name === "employeeName") {
            if (value.trim() === "") {
                error = "Employee name is required.";
            } else if (value.trim().length < 3) {
                error = "Employee name must be at least 3 characters.";
            }
        }

        if (name === "employeeId" && value.trim() === "") {
            error = "Employee ID is required.";
        }
        if (name === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value.trim() === "") {
                error = "Email is required.";
            } else if (!emailRegex.test(value)) {
                error = "Enter a valid email address.";
            }
        }
        if (name === "designation" && value.trim() === "") {
            error = "Designation is required.";
        }
        if (name === "department" && value.trim() === "") {
            error = "Department is required.";
        }
        if (name === "unit" && value.trim() === "") {
            error = "Unit is required.";
        }

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: error,
        }));
    };


    return (
        <>
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
                                            src={profilePicture || logo}
                                            alt="Profile"
                                            width="50"
                                            height="50"
                                        />

                                        {employeeName}
                                    </a>
                                    <ul
                                        className="dropdown-menu"
                                        aria-labelledby="navbarDropdown"
                                    >
                                        <li>
                                            <a className="dropdown-item" href="#">
                                                Account
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
                            <img src="assets/images/meeting.png" alt="Meetings" />
                            <span className="nav-link-label">Meetings</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link text-white d-flex gap-2 align-items-center">
                            <img src="assets/images/clipboard.png" alt="Action" />
                            <span className="nav-link-label">Action</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link text-white d-flex gap-2 align-items-center">
                            <img src="assets/images/settings.png" alt="Manage" />
                            <span className="nav-link-label">Manage</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div className="main-content">
                <div className="Action-list-page">
                    <div className="meeting-header-text">
                        <h2>Add Employees</h2>
                    </div>
                    <div className="mt-2 table-box">
                        <div className="form-container mt-2">
                            <form onSubmit={handleSubmit}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            id="employeeName"
                                            name="employeeName"
                                            value={addEmployeeForm.employeeName}
                                            onChange={handleInputChange}
                                            label="Employee Name"
                                            variant="outlined"
                                            fullWidth
                                            error={!!errors.employeeName}
                                            helperText={errors.employeeName}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            id="employeeId"
                                            name="employeeId"
                                            value={addEmployeeForm.employeeId}
                                            onChange={handleInputChange}
                                            label="Employee ID"
                                            variant="outlined"
                                            fullWidth
                                            error={!!errors.employeeId}
                                            helperText={errors.employeeId}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            id="email"
                                            name="email"
                                            value={addEmployeeForm.email}
                                            onChange={handleInputChange}
                                            label="Email"
                                            type="email"
                                            variant="outlined"
                                            fullWidth
                                            error={!!errors.email}
                                            helperText={errors.email}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <FormControl fullWidth error={!!errors.designation}>
                                            <InputLabel id="designation-label">
                                                Designation
                                            </InputLabel>
                                            <Select
                                                id="designation"
                                                name="designation"
                                                value={addEmployeeForm.designation}
                                                onChange={handleInputChange}
                                            >
                                                <MenuItem value="Manager">Manager</MenuItem>
                                                <MenuItem value="Developer">Developer</MenuItem>
                                                <MenuItem value="Tester">Tester</MenuItem>
                                            </Select>
                                            <FormHelperText>{errors.designation}</FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <FormControl fullWidth error={!!errors.department}>
                                            <InputLabel id="department-label">Department</InputLabel>
                                            <Select
                                                id="department"
                                                name="department"
                                                value={addEmployeeForm.department}
                                                onChange={handleInputChange}
                                            >
                                                <MenuItem value="HR">HR</MenuItem>
                                                <MenuItem value="Engineering">Engineering</MenuItem>
                                                <MenuItem value="Marketing">Marketing</MenuItem>
                                            </Select>
                                            <FormHelperText>{errors.department}</FormHelperText>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <FormControl fullWidth error={!!errors.unit}>
                                            <InputLabel id="unit-label">Unit</InputLabel>
                                            <Select
                                                id="unit"
                                                name="unit"
                                                value={addEmployeeForm.unit}
                                                onChange={handleInputChange}
                                            >
                                                <MenuItem value="Sales">Sales</MenuItem>
                                                <MenuItem value="Support">Support</MenuItem>
                                                <MenuItem value="Development">Development</MenuItem>
                                            </Select>
                                            <FormHelperText>{errors.unit}</FormHelperText>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 3 }}
                                >
                                    Submit
                                </Button>
                            </form>
                        </div>
                    </div>

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
                                        <th>Status</th>
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
                                                <td className="status">
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={employee.isActive}
                                                                onChange={() => onStatusChange(employee._id, !employee.isActive)}
                                                                name="status"
                                                                color="primary"
                                                            />
                                                        }
                                                        label={employee.isActive ? "Active" : "Inactive"}
                                                    />
                                                </td>
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
    );
};

export default MeetingPage;
