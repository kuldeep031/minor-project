import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import SideBar from "./AdminSideBar";
import QuickMenu from "./QuickMenu";

function AdminProjectsView() {
    const currentYear = new Date().getFullYear();
    const pastYears = Array.from({ length: 3 }, (_, i) => currentYear - i);
    
    const [projects, setProjects] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState("");
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [batch, setBatch] = useState(null);
    const headerStyle = {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
        padding: '8px',
        textAlign: 'center',
    };

    const cellStyle = {
        padding: '8px',
        textAlign: 'center',
        border: '1px solid #ccc',
    };
    const fetchProjects = async () => {
        if (!selectedSemester) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch("http://localhost:5173/api/request/projects-by-year-semester", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    year: selectedYear, 
                    semester: selectedSemester
                })
            });

            if (!response.ok) {
                throw new Error("Failed to fetch projects");
            }

            const data = await response.json();
            setProjects(data);
            if (data.length > 0) {
                setBatch(data[0].batch);
            } else {
                setBatch(null);
            }
        } catch (err) {
            console.error("Error fetching projects:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedSemester) {
            fetchProjects();
        }
    }, [selectedYear, selectedSemester]);

    const handleSemesterChange = (e) => {
        setSelectedSemester(e.target.value);
    };

    const handleYearChange = (e) => {
        setSelectedYear(Number(e.target.value));
    };

    return (
    <div className="d-flex">
        {/* Sidebar */}
        <div>
            <SideBar />
        </div>

        {/* Main Content */}
        <div className="d-flex flex-column flex-grow-1 p-4">
            <h4 className="m-4 mt-3 text-success fw-bold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                View Projects
            </h4>
            <div className="mx-4 mb-4 border-bottom border-3 rounded-5" style={{ borderColor: '#dee2e6' }} />

            {/* Filters */}
            <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex gap-3">
                    <div className="w-50">
                        <label htmlFor="year-select" className="form-label fw-medium" style={{ color: '#495057' }}>Academic Year</label>
                        <select 
                            id="year-select"
                            className="form-select shadow-sm"
                            style={{ borderColor: '#adb5bd', borderRadius: '8px' }}
                            value={selectedYear}
                            onChange={handleYearChange}
                        >
                            {pastYears.map((year) => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="w-50">
                        <label htmlFor="semester-select" className="form-label fw-medium" style={{ color: '#495057' }}>Semester</label>
                        <select 
                            id="semester-select"
                            className="form-select shadow-sm"
                            style={{ borderColor: '#adb5bd', borderRadius: '8px' }}
                            value={selectedSemester}
                            onChange={handleSemesterChange}
                        >
                            <option value="">Select Semester</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Batch Display */}
            {batch && (
                <div className="mb-3 p-3 rounded" style={{ 
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    borderLeft: '4px solid #0d6efd',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                    <h5 className="m-0" style={{ 
                        color: '#212529',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span className="badge bg-primary">BATCH</span>
                        <span>{batch} - {batch + 4}</span>
                    </h5>
                </div>
            )}

            {/* Loading and Error States */}
            {loading && (
                <div className="text-center my-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-danger shadow-sm">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Error: {error}
                </div>
            )}

            {/* Projects Table */}
            {projects.length > 0 ? (
                <div className="table-responsive rounded-4 overflow-hidden shadow" style={{
                    border: '1px solid rgba(0,0,0,0.05)',
                    background: '#f9f9f9'
                }}>
                    <table className="table table-hover mb-0" style={{ userSelect: 'text' }}>
                        <thead style={{
                            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)'
                        }}>
                            <tr>
                                <th style={headerStyle}>Group No</th>
                                <th style={headerStyle}>Project Title</th>
                                <th style={headerStyle}>Supervisor</th>
                                <th style={headerStyle}>Team Members</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project, index) => (
                                <tr key={project._id} style={{
                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                    borderBottom: '1px solid #e9ecef',
                                    transition: 'all 0.2s ease-in-out'
                                }} className="hover-effect">
                                    <td style={cellStyle}>
                                        <span className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{
                                            width: '32px',
                                            height: '32px',
                                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        }}>
                                            {project.GroupNo}
                                        </span>
                                    </td>
                                    <td style={{
                                        ...cellStyle,
                                        background: index % 2 === 0 ? 'rgba(40, 167, 69, 0.03)' : 'rgba(40, 167, 69, 0.06)'
                                    }}>
                                        <div style={{
                                            color: '#198754',
                                            fontWeight: '600',
                                            position: 'relative',
                                            display: 'inline-block'
                                        }}>
                                            {project.Title}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-4px',
                                                left: '0',
                                                height: '2px',
                                                width: '40%',
                                                background: 'linear-gradient(90deg, #28a745 0%, transparent 100%)',
                                                borderRadius: '2px'
                                            }}></div>
                                        </div>
                                    </td>
                                    <td style={{
                                        ...cellStyle,
                                        background: index % 2 === 0 ? 'rgba(32, 201, 151, 0.03)' : 'rgba(32, 201, 151, 0.06)'
                                    }}>
                                        <div className="d-flex align-items-center">{project.facultyName}</div>
                                    </td>
                                    <td style={{
                                        ...cellStyle,
                                        background: index % 2 === 0 ? 'rgba(32, 201, 151, 0.03)' : 'rgba(32, 201, 151, 0.06)'
                                    }}>
                                        <ul className="list-unstyled mb-0">
                                            {project.teamMembers.map((member, i) => (
                                                <li key={i} className="mb-2 d-flex align-items-center">
                                                    <span className="d-inline-flex align-items-center justify-content-center rounded-circle me-2" style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        background: 'linear-gradient(135deg, #e9ecef 0%, #ced4da 100%)',
                                                        color: '#198754',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                    }}>
                                                        {i + 1}
                                                    </span>
                                                    <span style={{ fontWeight: '500' }}>{member.name}</span>
                                                    <span className="badge bg-light text-dark mx-2 px-2 py-1" style={{
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        border: '1px solid #dee2e6'
                                                    }}>{member.roll}</span>
                                                    <span className="badge bg-success bg-opacity-10 text-success" style={{
                                                        fontSize: '12px',
                                                        fontWeight: '500'
                                                    }}>{member.branch}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                !loading && (
                    <div className="alert alert-info shadow-sm">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        No projects found for the selected criteria.
                    </div>
                )
            )}
        </div>
        <div>
            <QuickMenu />
        </div>
    </div>);
}
export default AdminProjectsView;