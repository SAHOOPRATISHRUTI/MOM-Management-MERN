import React, { useState, useRef } from "react";
import { useEffect } from "react";
import "./Userdashboard.css";
import logo1 from "../../assets/logo1.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { logoutUser, listEmployee, } from "../../services/api";
import { getEmployeeById } from "../../services/api";
import { jwtDecode } from 'jwt-decode';
import Navbar from '../Navbar/Navbar'
import Sidebar from '../Sidebar/Sidebar'

function UserDashboard({ showModal }) {
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



    const searchTimeout = useRef(null);


    const fetchEmployeeById = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                const decodedToken = jwtDecode(token);
                const employeeId = decodedToken.id;

                const response = await getEmployeeById(employeeId);

                setEmployeeData(response);

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

                setEmployeeName(response.employeeName);
                setEmployeeEmail(response.employeeEmail); // Assuming these exist in the response
                setEmployeeRole(response.employeeRole);   // Assuming these exist in the response
                setEmployeeId(employeeId); // Setting Employee ID for reference
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





    return (
        <>
            <Navbar />
            <Sidebar />

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
                                        <th>Profile Picture</th>
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
                                                <td>
                                                    {employee.profilePicture ? (
                                                        <img
                                                            src={employee.profilePicture}
                                                            alt="Profile"
                                                            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                                                        />
                                                    ) : (
                                                        <span>No Image</span>  // Display a fallback text if there's no image
                                                    )}
                                                </td>
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

