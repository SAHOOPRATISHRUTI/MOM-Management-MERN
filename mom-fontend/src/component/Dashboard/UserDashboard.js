
import React, { useState, useRef } from "react";
import { useEffect } from "react";
import "./Userdashboard.css";
import logo1 from "../../assets/logo1.png";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { TextField, MenuItem, Button, InputLabel, Select, FormControl, FormHelperText, Switch, FormControlLabel } from "@mui/material";
import Grid from "@mui/material/Grid";
import { logoutUser, addEmployee, listEmployee, activateEmployee, deactiveEmployee, } from "../../services/api";

function UserDashboard () {

  const [employees, setEmployees] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [searchKey, setSearchKey] = useState("");
  const [loading, setLoading] = useState(false)
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


  const fetchEmployees = async (page, searchKey = "") => {
      try {
          setLoading(true);
          const response = await listEmployee(page, 5, '-1', searchKey);
          console.log("API Response:", response.data.employeeData);
          setEmployees(response.data.employeeData || []);
          setTotalEmployees(response.data.totalEmployees || 0);
          setTotalPages(response.data.totalPages || 0);
          console.log("ffffffffffffffffff", response.data.totalEmployees)
          const totalEmployees = response.data.totalEmployees;
      } catch (error) {
          console.error("Error fetching employees:", error);
          setEmployees([]);
          setTotalEmployees(0);
          setTotalPages(0);
      } finally {
          setLoading(false);
      }
  };

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


  useEffect(() => {
      fetchEmployees(page, searchKey);
  }, [page, searchKey]);


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
  )
}

export default UserDashboard;

