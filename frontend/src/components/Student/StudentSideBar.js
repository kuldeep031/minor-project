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
    const [projectStatus, setProjectStatus] = useState("");
    const [deadline, setDeadline] = useState("");

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
                    setDeadline(matchingGroup.deadline);
                    const now = new Date();
                    const deadlineDate = new Date(matchingGroup.deadline);
                    
                    // Reset time components to compare only dates
                    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    const deadlineDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
                    
                    const isDeadlinePassed = today > deadlineDay;
                    const isDeadlineToday = today.getTime() === deadlineDay.getTime();
                    
                    if (!matchingGroup.openWindow) {
                        setIsProjectOpen(false);
                        setProjectStatus("Project submission window is currently closed.");
                    } else if (isDeadlinePassed) {
                        setIsProjectOpen(false);
                        setProjectStatus("");
                    } else {
                        setIsProjectOpen(true);
                        setProjectStatus("");
                    }
                } else {
                    setIsProjectOpen(false);
                    setProjectStatus("No project settings found for your semester.");
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

                    <li className="nav-item p-1">
                        {isProjectOpen ? (
                            <Link to="/student/project" className="nav-link text-black">
                                <i className="bi bi-info-circle-fill me-2 fs-5 text-success"></i>
                                <span className="fs-5">Project Details</span>
                                <small className="d-block text-muted">Deadline: {new Date(deadline).toLocaleDateString()}</small>
                            </Link>
                        ) : (
                            <div className="text-center">
                                <span className="nav-link text-black disabled">
                                    <i className="bi bi-lock-fill me-2 fs-5 text-danger"></i>
                                    <span className="fs-5">Project Details</span>
                                    {deadline && (
                                        <small className="d-block text-muted">Deadline was: {new Date(deadline).toLocaleDateString()}</small>
                                    )}
                                </span>
                                {projectStatus && (
                                    <p className="text-danger mt-2 fw-bold">{projectStatus}</p>
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