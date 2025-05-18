import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import NotificationToast from '../NotificationToast';
import { XCircleFill } from 'react-bootstrap-icons';

function ManageProfileBody() {
    const [faculty, setFaculty] = useState({});
    const [validated, setValidated] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [originalPassword, setOriginalPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [message, setMessage] = useState('');
    const [signature, setSignature] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState('');
    const [originalSignature, setOriginalSignature] = useState('');
    const [isUploadingSignature, setIsUploadingSignature] = useState(false);
    const [isSignatureUploaded, setIsSignatureUploaded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("jwt");
            if (token) {
                const decodedToken = jwtDecode(token);
                const { id } = decodedToken;
                try {
                    const response = await fetch(`http://localhost:5173/api/admin/${id}`);
                    if (response.ok) {
                        const facultyData = await response.json();
                        setFaculty(facultyData);
                        setName(facultyData.name || '');
                        setEmail(facultyData.email || '');
                        setPassword(facultyData.password || '');
                        setOriginalPassword(facultyData.password || '');
                        if (facultyData.signature) {
                            setSignaturePreview(facultyData.signature);
                            setOriginalSignature(facultyData.signature);
                            setIsSignatureUploaded(true);
                        }
                    }
                } catch (error) {
                    setMessage("Something went wrong");
                    handleShowToast();
                }
            }
        };
        fetchData();
    }, []);

    const handleShowToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Update file type validation to accept jpg/jpeg/png
    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
        setMessage("Only PNG, JPG, or JPEG images are allowed");
        handleShowToast();
        return;
    }

    if (file.size > 100000) {
        setMessage("Signature image must be less than 100KB");
        handleShowToast();
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        setSignaturePreview(reader.result);
        setSignature(reader.result.split(',')[1]);
        setIsSignatureUploaded(false); // Reset upload status when new file is selected
    };
    reader.readAsDataURL(file);
};

    const removeSignature = () => {
        setSignaturePreview('');
        setSignature(null);
        setIsSignatureUploaded(false);
    };

    const uploadSignature = async () => {
    if (!signature) return;
    setIsUploadingSignature(true);
    try {
        // Just simulate upload for preview
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsSignatureUploaded(true);
        setMessage("Signature ready to save");
        handleShowToast();
    } catch (error) {
        setMessage("Failed to prepare signature");
        handleShowToast();
    } finally {
        setIsUploadingSignature(false);
    }
};

    const handleSubmit = async (event) => {
    event.preventDefault();
    setValidated(true);
    setLoading(true);
    
    try {
        // Prepare update data
        const updateData = { password };
        if (hasNewSignature && isSignatureUploaded) {
            updateData.signature = signaturePreview;
        }

        const response = await fetch(`http://localhost:5173/api/admin/${faculty._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) throw new Error('Failed to update profile');
        
        // Reset states after successful save
        setOriginalPassword(password);
        if (hasNewSignature) {
            setOriginalSignature(signaturePreview);
        }
        setMessage("Profile updated successfully");
        handleShowToast();
    } catch (error) {
        setMessage("Something went wrong");
        handleShowToast();
    } finally {
        setLoading(false);
        setValidated(false);
    }
};

    const hasPasswordChanges = password !== originalPassword;
    const hasNewSignature = signaturePreview && signaturePreview !== originalSignature;
    const hasChanges = hasPasswordChanges || (hasNewSignature && isSignatureUploaded);

    return (
        <div className="d-flex justify-content-center">
            <div className='mb-5'>
                <Form
                    noValidate
                    validated={validated}
                    onSubmit={handleSubmit}
                    className='border shadow rounded-3 p-4 m-5'
                    style={{ width: "40rem" }}
                >
                    {/* Name Field */}
                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom01">
                            <Form.Label>Full name</Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                disabled
                                style={{ 
                                    backgroundColor: '#f8f9fa',
                                    opacity: 1,
                                    cursor: 'not-allowed'
                                }}
                            />
                        </Form.Group>
                    </Row>

                    {/* Email Field */}
                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom02">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                disabled
                                style={{ 
                                    backgroundColor: '#f8f9fa',
                                    opacity: 1,
                                    cursor: 'not-allowed'
                                }}
                            />
                        </Form.Group>
                    </Row>

                    {/* Password Field */}
                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom03">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter your password"
                                required
                                value={password}
                                onChange={handlePasswordChange}
                            />
                            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        </Form.Group>
                    </Row>
                    
                    {/* Signature Upload Section */}
                    <Row className="mb-3">
                        <Form.Group as={Col} md="12" controlId="validationCustom04">
                            <Form.Label className="fw-bold">Digital Signature</Form.Label>
                            <div className="border rounded p-3 mb-3 position-relative" 
                                 style={{ backgroundColor: '#f8f9fa', minHeight: '120px' }}>
                                {signaturePreview ? (
                                    <>
                                        <Button 
                                            variant="link" 
                                            className="position-absolute top-0 end-0 p-1"
                                            onClick={removeSignature}
                                            style={{ zIndex: 1 }}
                                        >
                                            <XCircleFill color="red" size={20} />
                                        </Button>
                                        <div className="text-center">
                                            <p className="text-muted mb-2">Signature Preview:</p>
                                            <img 
                                                src={signaturePreview} 
                                                alt="Signature Preview" 
                                                style={{ 
                                                    maxWidth: '250px', 
                                                    maxHeight: '100px', 
                                                    border: '1px solid #dee2e6',
                                                    backgroundColor: 'white',
                                                    padding: '5px'
                                                }} 
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted text-center m-0">No signature uploaded</p>
                                )}
                            </div>
                            <div className="d-flex align-items-center">
                                <Form.Control
    type="file"
    accept=".png,.jpg,.jpeg"  // Updated to accept multiple image types
    onChange={handleSignatureChange}
    className="me-2"
    style={{ flex: 1 }}
/>
                                <Button 
                                    variant={signature ? "primary" : "outline-primary"} 
                                    onClick={uploadSignature}
                                    disabled={!signature || isUploadingSignature || (signaturePreview === originalSignature)}
                                    style={{ width: '150px' }}
                                >
                                    {isUploadingSignature ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : 'Upload Signature'}
                                </Button>
                            </div>
                            <Form.Text className="text-muted">
    Upload your signature (PNG, JPG, or JPEG - max 100KB)
</Form.Text>
                        </Form.Group>
                    </Row>

                    <div className='d-flex justify-content-end'>
                        <Button 
                            variant="success" 
                            type="submit" 
                            className='m-1'
                            disabled={!hasChanges || loading}
                            onClick={(e) => {
                                if (hasNewSignature && !isSignatureUploaded) {
                                    e.preventDefault();
                                    setMessage("Please click 'Upload Signature' first before saving");
                                    handleShowToast();
                                }
                            }}
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
                        </Button>
                    </div>
                </Form>
                <NotificationToast show={showToast} setShow={setShowToast} message={message} />
            </div>
        </div>
    )
}

export default ManageProfileBody;