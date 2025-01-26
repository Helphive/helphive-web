import React, { useState } from 'react';
import { useRequestProviderAccountMutation } from '../../../providers/providerApiSlice';
import { useNavigate } from 'react-router-dom';

const ProviderDetailsForm = () => {
    const navigate = useNavigate();
    const [providerDetails, setProviderDetails] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        state: '',
        city: '',
        street: '',
        id: null,
        dbs: null,
        resume: null,
        profile: null,
        jobTypes: {
            publicAreaAttendant: false,
            roomAttendant: false,
            linenPorter: false,
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [requestProviderAccount] = useRequestProviderAccountMutation();

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setProviderDetails((prev) => ({
                ...prev,
                jobTypes: {
                    ...prev.jobTypes,
                    [name]: checked,
                },
            }));
        } else {
            setProviderDetails((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setProviderDetails((prev) => ({
            ...prev,
            [name]: files[0],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSuccessMessage('');

        try {
            const formData = new FormData();
            Object.entries(providerDetails).forEach(([key, value]) => {
                if (key !== 'jobTypes') {
                    formData.append(key, value);
                }
            });
            formData.append('jobTypes', JSON.stringify(providerDetails.jobTypes));

            const response = await requestProviderAccount(formData).unwrap();
            setSuccessMessage('Your details have been submitted successfully!');
            navigate('/account-pending');
        } catch (error) {
            console.error('Error submitting provider details:', error);
            alert('An error occurred while submitting your details. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="provider-form-container">
            <div className="provider-details-form">
                <h2>Provider Details</h2>
                {successMessage && <p className="success-message">{successMessage}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>First Name:</label>
                        <input
                            type="text"
                            name="firstName"
                            value={providerDetails.firstName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Name:</label>
                        <input
                            type="text"
                            name="lastName"
                            value={providerDetails.lastName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={providerDetails.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone:</label>
                        <input
                            type="tel"
                            name="phone"
                            value={providerDetails.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Country:</label>
                        <input
                            type="text"
                            name="country"
                            value={providerDetails.country}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>State:</label>
                        <input
                            type="text"
                            name="state"
                            value={providerDetails.state}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>City:</label>
                        <input
                            type="text"
                            name="city"
                            value={providerDetails.city}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Street:</label>
                        <input
                            type="text"
                            name="street"
                            value={providerDetails.street}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>ID Document:</label>
                        <input type="file" name="id" onChange={handleFileChange} required />
                    </div>
                    <div className="form-group">
                        <label>DBS Document:</label>
                        <input type="file" name="dbs" onChange={handleFileChange} required />
                    </div>
                    <div className="form-group">
                        <label>Resume:</label>
                        <input type="file" name="resume" onChange={handleFileChange} required />
                    </div>
                    <div className="form-group">
                        <label>Profile Picture:</label>
                        <input type="file" name="profile" onChange={handleFileChange} required />
                    </div>
                    <div className="form-group">
                        <label>Job Types:</label>
                        <div className="job-types">
                            <label>
                                <input
                                    type="checkbox"
                                    name="publicAreaAttendant"
                                    checked={providerDetails.jobTypes.publicAreaAttendant}
                                    onChange={handleInputChange}
                                />
                                Public Area Attendant
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="roomAttendant"
                                    checked={providerDetails.jobTypes.roomAttendant}
                                    onChange={handleInputChange}
                                />
                                Room Attendant
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    name="linenPorter"
                                    checked={providerDetails.jobTypes.linenPorter}
                                    onChange={handleInputChange}
                                />
                                Linen Porter
                            </label>
                        </div>
                    </div>
                    <button className="submit-button" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>

            <style>{`
                .provider-form-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: linear-gradient(to right, #f7f7f7, #eaeaea);
                    padding: 20px;
                }

                .provider-details-form {
                    background: #fff;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    padding: 30px;
                    width: 100%;
                    max-width: 600px;
                }

                .provider-details-form h2 {
                    margin-bottom: 20px;
                    font-size: 1.8rem;
                    text-align: center;
                    color: #333;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #555;
                }

                .form-group input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 1rem;
                }

                .form-group input[type="file"] {
                    padding: 5px;
                }

                .job-types {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .job-types label {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .submit-button {
                    width: 100%;
                    padding: 12px;
                    background: #007bff;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background 0.3s;
                }

                .submit-button:hover {
                    background: #0056b3;
                }

                .success-message {
                    text-align: center;
                    color: green;
                    margin-bottom: 15px;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default ProviderDetailsForm;
