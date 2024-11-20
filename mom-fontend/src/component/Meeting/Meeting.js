import React, { useState } from 'react';
import './MeetingPage.css';
import { logoutUser } from '../../services/api';
import logo1 from '../../assets/logo1.png';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {TextField,MenuItem, Button, InputLabel,Select,FormControl} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Send } from '@mui/icons-material';
import { addEmployee } from '../../services/api';



const MeetingPage = () => {
    const [employees, setEmployees] = useState([]); // Assume you fetch this list from an API
    const [searchKey, setSearchKey] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [p, setP] = useState(1);
    const navigate = useNavigate();
    const [addEmployeeForm, setAddEmployeeForm] = useState({
        employeeName: '',
        employeeId: '',
        email: '',
        designation: '',
        department: '',
        unit: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAddEmployeeForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleLogout = async () => {
        try {
            const result = await logoutUser();
            toast.success(result.message);
            setTimeout(() => {
                navigate('/');
            }, 2500);

        } catch (error) {
            toast.error(error.message);
        }
    };
    // const handleStatusChange = (employeeId, status) => {
    //     // Handle employee status change (active/inactive)
    //     console.log(employeeId, status);
    // };
    // const showingRange = `Showing ${((p - 1) * itemsPerPage) + 1} to ${Math.min(p * itemsPerPage, filteredEmployees.length)} of ${filteredEmployees.length} entries`;
    // const handleSearchChange = (e) => {
    //     setSearchKey(e.target.value);
    // };

    // const handleItemsPerPageChange = (e) => {
    //     setItemsPerPage(Number(e.target.value));
    // };

    // const filteredEmployees = employees.filter((employee) => {
    //     return employee.employeeName.toLowerCase().includes(searchKey.toLowerCase());
    // });


    const handleSubmit = async (e) => {
        e.preventDefault();

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

            toast.success('Employee added successfully!');
            // Optionally, reset form or perform other actions
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        }
    };

   

    return (
        <>
            <header className="navbar-container">
                <nav className="navbar navbar-expand-lg navbar-light">
                    <div className="container">
                        {/* Logo Section */}
                        <a className="navbar-brand" href="#">
                            <img src="assets/images/Ntspl-Logo-white.png" alt="Logo" className="logo-img" />
                        </a>

                        {/* Navbar toggle button for mobile */}
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        {/* Navbar Items */}
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav ml-auto">
                                <li className="nav-item active">
                                    <a className="nav-link" href="#">
                                        <i className="bi bi-house-door"></i>
                                        Home
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#">
                                        <i className="bi bi-clock"></i>
                                        Timeline
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#">
                                        <i className="bi bi-person-circle"></i>
                                        Profile
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#">
                                        <i className="bi bi-gear"></i>
                                        Settings
                                    </a>
                                </li>
                                {/* Profile Dropdown */}
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link dropdown-toggle"
                                        href="#"
                                        id="navbarDropdown"
                                        role="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <img src="/assets/images/profile-image.jpg" alt="Profile" className="profile-avatar" />
                                        Priyanka
                                    </a>
                                    <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                        <li><a className="dropdown-item" href="#">Account</a></li>
                                        <li><a className="dropdown-item" href="#" onClick={handleLogout}>Logout</a></li>
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
                            {/* Employee Name */}
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    id="employeeName"
                                    name="employeeName"
                                    value={addEmployeeForm.employeeName}
                                    onChange={handleInputChange}
                                    label="Employee Name"
                                    placeholder="Enter Employee Name"
                                    variant="outlined"
                                    fullWidth
                                    required
                                    helperText={
                                        addEmployeeForm.employeeName.length < 2
                                            ? 'Must be at least 2 characters long'
                                            : ''
                                    }
                                    error={addEmployeeForm.employeeName.length > 0 && addEmployeeForm.employeeName.length < 2}
                                />
                            </Grid>

                            {/* Employee ID */}
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    id="employeeId"
                                    name="employeeId"
                                    value={addEmployeeForm.employeeId}
                                    onChange={handleInputChange}
                                    label="Employee ID"
                                    placeholder="Enter Employee ID"
                                    variant="outlined"
                                    fullWidth
                                    required
                                />
                            </Grid>

                            {/* Email */}
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    id="email"
                                    name="email"
                                    value={addEmployeeForm.email}
                                    onChange={handleInputChange}
                                    label="Email"
                                    placeholder="Enter Email"
                                    variant="outlined"
                                    fullWidth
                                    type="email"
                                    required
                                />
                            </Grid>

                            {/* Designation */}
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControl fullWidth required>
                                    <InputLabel id="designation-label">Designation</InputLabel>
                                    <Select
                                        id="designation"
                                        name="designation"
                                        value={addEmployeeForm.designation}
                                        onChange={handleInputChange}
                                        labelId="designation-label"
                                        label="Designation"
                                    >
                                        <MenuItem value="" disabled>Select Designation</MenuItem>
                                        <MenuItem value="Manager">Manager</MenuItem>
                                        <MenuItem value="Developer">Developer</MenuItem>
                                        <MenuItem value="Tester">Tester</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Department */}
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControl fullWidth required>
                                    <InputLabel id="department-label">Department</InputLabel>
                                    <Select
                                        id="department"
                                        name="department"
                                        value={addEmployeeForm.department}
                                        onChange={handleInputChange}
                                        labelId="department-label"
                                        label="Department"
                                    >
                                        <MenuItem value="" disabled>Select Department</MenuItem>
                                        <MenuItem value="HR">HR</MenuItem>
                                        <MenuItem value="Engineering">Engineering</MenuItem>
                                        <MenuItem value="Marketing">Marketing</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Unit */}
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControl fullWidth required>
                                    <InputLabel id="unit-label">Unit</InputLabel>
                                    <Select
                                        id="unit"
                                        name="unit"
                                        value={addEmployeeForm.unit}
                                        onChange={handleInputChange}
                                        labelId="unit-label"
                                        label="Unit"
                                    >
                                        <MenuItem value="" disabled>Select Unit</MenuItem>
                                        <MenuItem value="Sales">Sales</MenuItem>
                                        <MenuItem value="Support">Support</MenuItem>
                                        <MenuItem value="Development">Development</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            endIcon={<Send />}
                            className="Mom-btn"
                            disabled={
                                !addEmployeeForm.employeeName ||
                                !addEmployeeForm.employeeId ||
                                !addEmployeeForm.email ||
                                !addEmployeeForm.designation ||
                                !addEmployeeForm.department ||
                                !addEmployeeForm.unit
                            }
                            sx={{ mt: 3 }}
                        >
                            Submit
                        </Button>
                    </form>
                </div>

                        <div className="table-header">
                            <h2 className="h2 mb-3">Manage Employee</h2>
                        </div>

                        <div className="employee-list-container p-3 border rounded bg-white">
                            <div className="tbl-text-search d-flex justify-content-between mb-3">
                                <div className="left-tbl-text">
                                    {/* <p>{showingRange}</p> */}
                                </div>
                                <div className="search-box d-flex align-items-center">
                                    <input
                                        type="search"
                                        placeholder="Search"
                                        value={searchKey}
                                        //onChange={handleSearchChange}
                                        className="form-control me-2"
                                    />
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#4F2CC8" viewBox="0 0 16 16" className="bi bi-search">
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"></path>
                                    </svg>
                                </div>
                            </div>

                            <table className="table table-bordered table-striped mb-3">
                                <thead>
                                    <tr>
                                        <th>Employee Name</th>
                                        <th>Employee ID</th>
                                        <th>Updated At</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* {filteredEmployees.slice((p - 1) * itemsPerPage, p * itemsPerPage).map((employee) => (
                                        <tr key={employee.employeeId}>
                                            <td>{employee.employeeName}</td>
                                            <td>{employee.employeeId}</td>
                                            <td>{employee.formattedDate} <span>{employee.formattedTime}</span></td>
                                            <td className="status">
                                                {employee.isActive ? 'Active' : 'Inactive'}
                                                <input
                                                    type="checkbox"
                                                    checked={employee.isActive}
                                                   // onChange={() => handleStatusChange(employee.employeeId, !employee.isActive)}
                                                />
                                            </td>
                                        </tr>
                                    ))} */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default MeetingPage;
