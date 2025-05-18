import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

import "bootstrap-icons/font/bootstrap-icons.css";
import "../../styles/AdminSidebar.css";

const Sidebar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [userName, setUserName] = useState("");
    const [isProjectOpen, setIsProjectOpen] = useState(false);
    // const [message, setMessage] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // Logic to check if the window is open or closed
        // For example, we set the value of isProjectOpen here
        setIsProjectOpen(false);  // Simulating that the project window is closed
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("jwt");

        if (token) {
            const decodedToken = jwtDecode(token);
            const { id } = decodedToken;
            fetchStudentData(id);
        }
    }, []);

    const fetchStudentData = async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/students/${id}`);
            if (response.ok) {
                const studentData = await response.json();
                setUserName(studentData.name);

                // Fetch academicYear from student model
                const { academicYear, semester } = studentData;
                if (academicYear) {
                    const correctYear = calculateYear(academicYear, semester);
                    checkGroupSettings(semester, correctYear);
                }
            } else {
                console.error('Failed to fetch student data');
            }
        } catch (error) {
            console.error('Error fetching student data:', error.message);
        }
    };

    const calculateYear = (academicYear, semester) => {
        const [startYear, endYear] = academicYear.split("-").map(Number);
        return semester % 2 !== 0 ? startYear : endYear;
    };

    const checkGroupSettings = async (semester, year) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/groups`);
            if (response.ok) {
                const groups = await response.json();
                const matchingGroup = groups.find((group) => group.semester === semester && group.year === year);
                if (matchingGroup) {
                    setIsProjectOpen(matchingGroup.openWindow);
                } else {
                    setIsProjectOpen(false); 
                }
            } else {
                console.error('Failed to fetch group settings');
            }
        } catch (error) {
            console.error('Error fetching group settings:', error.message);
        }
    };
    

    const handleDropdownToggle = () => {
        setShowDropdown(!showDropdown);
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('isStudent');
        window.location.href = "/";
    };

    const handleProjectClick = () => {
        if (!isProjectOpen) {
            // Set error message when the project window is closed
            setErrorMessage("Project submission window is currently closed.");
        }
    };

    return (
        <div className="sidebar d-flex flex-column justify-content-between border-end p-3 vh-100" style={{ width: "18rem" }}>
            <div>
                <p className="user-select-none d-flex align-items-center text-black text-decoration-none">
                    <i className="bi bi-person-circle fs-4 me-2"></i>
                    <span className="fs-4">Welcome {userName}</span>
                </p>
                <hr className="text-black mt-2" />
                <ul className="nav nav-pills flex-column p-0 m-0">
                    <li className="nav-item p-1">
                        <Link to="/student/dashboard" className="nav-link text-black">
                            <i className="bi bi-speedometer me-2 fs-5"></i>
                            <span className="fs-5">Dashboard</span>
                        </Link>
                    </li>

                    <li className="nav-item p-1">
                        <Link to="/student/dashboard/manage-profile" className="nav-link text-black">
                            <i className="bi bi-person-gear me-2 fs-5"></i>
                            <span className="fs-5">Manage Profile</span>
                        </Link>
                    </li>

                    {/* <li className="nav-item p-1">
                        <Link to="/student/dashboard/view-attendance" className="nav-link text-black">
                            <i className="bi bi-person-workspace me-2 fs-5"></i>
                            <span className="fs-5">View Attendance</span>
                        </Link>
                    </li> */}

                    <li className="nav-item p-1">
                        {isProjectOpen ? (
                            <Link to="/student/project" className="nav-link text-black" onClick={handleProjectClick}>
                                <i className="bi bi-info-circle-fill me-2 fs-5"></i> {/* Green key for open */}
                                <span className="fs-5">Project Details</span>
                            </Link>
                        ) : (
                            <div className="text-center">
                                <span className="nav-link text-black" onClick={handleProjectClick}>
                                    <i className="bi bi-lock-fill me-2 fs-5 text-danger"></i> {/* Red lock for closed */}
                                    <span className="fs-5">Project Details</span>
                                </span>
                                {/* Display the error message */}
                                {errorMessage && (
                                    <p className="text-danger mt-2 fw-bold">{errorMessage}</p>
                                )}
                            </div>
                        )}
                    </li>



                    <li className="nav-item p-1">
                        <Link to="/student/help-support" className="nav-link text-black">
                            <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                            <span className="fs-5">Help & Support</span>
                        </Link>
                    </li>
                </ul>
            </div>

            <div>
                <hr className="text-black" />
                <Dropdown show={showDropdown} onToggle={handleDropdownToggle} align="end">
                    <Dropdown.Toggle className="your-profile d-flex align-items-center border-0 text-black" variant="light">
                        <span className="fs-5">
                            <i className="bi bi-person-circle me-2 fs-5" />
                            Your Profile
                        </span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={handleLogout}>
                            <span>Logout</span>
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>
    );
};

export default Sidebar;
