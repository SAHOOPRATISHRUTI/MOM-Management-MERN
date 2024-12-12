import React, { useState, useRef } from "react";
import { useEffect } from "react";
import "./AdminDashboard.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { TextField, MenuItem, Button, InputLabel, Select, FormControl, FormHelperText, Switch, FormControlLabel } from "@mui/material";
import Grid from "@mui/material/Grid";
import { addEmployee, listEmployee, activateEmployee, deactiveEmployee, importfromcsv } from "../../services/api";
import { getEmployeeById } from "../../services/api";
import { jwtDecode } from 'jwt-decode';
import Navbar from '../Navbar/Navbar'
import Sidebar from '../Sidebar/Sidebar'
import logo from "../../assets/logo.png";
import Fileupload from '../CSVFileUpload/Fileupload'

const MeetingPage = ({ showModal }) => {


    const [employeeName, setEmployeeName] = useState('');
    const [employees, setEmployees] = useState([]);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [searchKey, setSearchKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [employeeData, setEmployeeData] = useState(null);
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [employeeId, setEmployeeId] = useState(null);
    const [employeeProfilePicture, setemployeeProfilePicture] = useState('');
    const [employeeEmail, setEmployeeEmail] = useState('');
    const [employeeRole, setEmployeeRole] = useState('');



    const navigate = useNavigate();


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


    const fetchEmployeeById = async () => {
        try {
            const token = localStorage.getItem('authToken');
            console.log(token);

            if (token) {
                const decodedToken = jwtDecode(token);
                console.log("decodedToken", decodedToken);

                const employeeId = decodedToken.id;

                const response = await getEmployeeById(employeeId);

                setEmployeeData(response);
                console.log("tttttttttt", response);


                // Assuming response has profilePicture
                const baseUrl = 'http://localhost:5000/';
                let formattedProfilePicture = null;
                if (response.profilePicture) {
                    if (response.profilePicture.startsWith('https://lh3.googleusercontent.com/a')) {
                        formattedProfilePicture = response.profilePicture;
                    } else {
                        formattedProfilePicture = `${baseUrl}${response.profilePicture}`;
                    }
                }
                console.log("rrrrrrrrr", response);

                setEmployeeName(response.employeeName);
                setEmployeeEmail(response.employeeEmail);
                setEmployeeRole(response.employeeRole);
                setEmployeeId(employeeId);
                setEmployeeData({ ...response, profilePicture: formattedProfilePicture });
                setemployeeProfilePicture(formattedProfilePicture);

            }
        } catch (error) {
            console.error("Error fetching employee by ID:", error);
        }
    };


    const fetchEmployees = async (page, searchKey = "") => {
        try {
            setLoading(true);

            const response = await listEmployee(page, 5, '-1', searchKey);
            const baseUrl = 'http://localhost:5000/';

            const employeesWithFullImageUrls = response.data.employeeData.map(employee => {
                let formattedProfilePicture = null;

                if (employee.profilePicture) {
                    if (employee.profilePicture.startsWith('https://lh3.googleusercontent.com/a')) {
                        formattedProfilePicture = employee.profilePicture;
                    } else {
                        formattedProfilePicture = `${baseUrl}${employee.profilePicture}`;
                    }
                }

                return {
                    ...employee,
                    profilePicture: formattedProfilePicture
                };
            });

            setEmployees(employeesWithFullImageUrls);
            console.log("fffffffff", employeesWithFullImageUrls);
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
        if (showModal) {
            fetchEmployeeById();
        }
    }, [showModal]);

    useEffect(() => {
        fetchEmployees(page, searchKey);

        fetchEmployeeById();
    }, [page, searchKey]);


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

    const handlePageChange = (newPage) => {
        setPage(newPage);
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
            console.log(response);


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


    const handleFileUpload = async (event) => {
        const file = event.target.files[0]; // Get the first file selected

        if (file) {
            try {
                
                await importfromcsv(file);
                console.log('CSV file uploaded successfully');
            } catch (error) {
                console.error('File upload failed:', error.message);
            }
        } else {
            console.log('No file selected');
        }
    };

    return (
        <>
            <Navbar />
            <Sidebar />
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
                                            <InputLabel id="designation-label">Designation</InputLabel>
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

                                {/* CSV Import Button */}
                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                <Fileupload/>
                                </div>

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
                                        <th>Profile Picture</th>
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
                                                <td>
                                                    {employee.profilePicture ? (
                                                        <img
                                                            src={employee.profilePicture}
                                                            alt="Profile"
                                                            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                                                        />
                                                    ) : (
                                                        <span><img 
                                                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                                                        src={logo}/></span> 
                                                    )}
                                                </td>


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
