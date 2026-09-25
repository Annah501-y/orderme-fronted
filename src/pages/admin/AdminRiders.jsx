import React, { useEffect, useState } from "react";
import TanzaniaPhoneInput from "../../components/TanzaniaPhoneInput";
import { getTanzaniaNationalNumber } from "../../utils/tanzaniaPhone";
import "../../pages_styles/admin-styles/admin-riders.css";

const API_URL = import.meta.env.VITE_API_URL;

const AdminRiders = () => {
    const [applications, setApplications] = useState([]);
    const [applicationsLoading, setApplicationsLoading] = useState(true);
    const [applicationsError, setApplicationsError] = useState("");
    const [invitingId, setInvitingId] = useState(null);
    const [invitationMessage, setInvitationMessage] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const fetchApplications = async () => {
        setApplicationsLoading(true);
        setApplicationsError("");
        try {
            const response = await fetch(`${API_URL}/admin/rider-applications`, {
                headers: { Accept: "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || "Unable to load rider applications.");
            setApplications(Array.isArray(result.data) ? result.data : []);
        } catch (fetchError) {
            setApplicationsError(fetchError.message || "Unable to load rider applications.");
        } finally {
            setApplicationsLoading(false);
        }
    };

    useEffect(() => { fetchApplications(); }, []);

    const sendInvitation = async (application) => {
        setInvitingId(application.id);
        setInvitationMessage("");
        setApplicationsError("");
        try {
            const response = await fetch(`${API_URL}/admin/rider-applications/${application.id}/invite`, {
                method: "POST",
                headers: { Accept: "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.message || "Unable to send this invitation.");
            setApplications((current) => current.map((item) => item.id === application.id ? { ...item, status: result.data?.status || "invited" } : item));
            setInvitationMessage(result.message || `Invitation sent to ${application.email}.`);
        } catch (inviteError) {
            setApplicationsError(inviteError.message || "Unable to send this invitation.");
        } finally {
            setInvitingId(null);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSuccess("");
        setError("");

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${API_URL}/admin/riders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, phone: getTanzaniaNationalNumber(formData.phone) }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const validationErrors = Object.values(data.errors)
                        .flat()
                        .join(" ");

                    throw new Error(validationErrors);
                }

                throw new Error(
                    data.message || "Failed to create rider."
                );
            }

            setSuccess(
                data.message ||
                    "Rider created successfully. An invitation has been sent."
            );

            setFormData({
                name: "",
                email: "",
                phone: "",
            });
        } catch (err) {
            setError(
                err.message ||
                    "Something went wrong while creating the rider."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-riders">
            <div className="admin-riders-header">
                <div>
                    <h2>Riders</h2>
                    <p>
                        Create and manage OrderMe delivery riders.
                    </p>
                </div>
            </div>

            <section className="admin-rider-applications-card">
                <div className="admin-rider-card-header">
                    <h3>Rider Applications</h3>
                    <p>Review applicants and email an invitation when you are ready.</p>
                </div>
                {applicationsError && <div className="admin-rider-alert error" role="alert">{applicationsError}</div>}
                {invitationMessage && <div className="admin-rider-alert success" role="status">{invitationMessage}</div>}
                {applicationsLoading ? <p className="admin-rider-muted">Loading applications…</p> : applications.length === 0 ? (
                    <p className="admin-rider-muted">No rider applications yet.</p>
                ) : (
                    <div className="admin-rider-applications-table-wrap">
                        <table className="admin-rider-applications-table">
                            <thead><tr><th>Applicant</th><th>Email</th><th>Phone</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>{applications.map((application) => {
                                const canInvite = ["pending", "invited"].includes(application.status);
                                return <tr key={application.id}>
                                    <td>{application.name}</td>
                                    <td>{application.email}</td>
                                    <td>{application.phone}</td>
                                    <td><span className={`admin-rider-application-status ${application.status}`}>{application.status}</span></td>
                                    <td><button type="button" className="admin-rider-invite-button" disabled={!canInvite || invitingId === application.id} onClick={() => sendInvitation(application)}>{invitingId === application.id ? "Sending…" : application.status === "invited" ? "Resend Invitation" : canInvite ? "Send Invitation" : "Invitation Accepted"}</button></td>
                                </tr>;
                            })}</tbody>
                        </table>
                    </div>
                )}
            </section>

            <div className="admin-rider-card">
                <div className="admin-rider-card-header">
                    <h3>Add New Rider</h3>
                    <p>
                        Enter the rider's details to create their account.
                    </p>
                </div>

                {success && (
                    <div className="admin-rider-alert success">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="admin-rider-alert error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="admin-rider-form-group">
                        <label htmlFor="rider-name">
                            Full Name
                        </label>

                        <input
                            id="rider-name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter rider's full name"
                            required
                        />
                    </div>

                    <div className="admin-rider-form-group">
                        <label htmlFor="rider-email">
                            Email Address
                        </label>

                        <input
                            id="rider-email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter rider's email address"
                            required
                        />
                    </div>

                    <div className="admin-rider-form-group">
                        <label htmlFor="rider-phone">
                            Phone Number
                        </label>

                        <TanzaniaPhoneInput
                            id="rider-phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="admin-rider-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Rider..."
                            : "Create Rider"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminRiders;
