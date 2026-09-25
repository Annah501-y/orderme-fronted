import React, { useEffect, useState } from "react";

import {
    Search,
    RefreshCw,
    UserRound,
    Store,
    Phone,
    Mail,
    MapPin,
    Eye,
    CheckCircle,
    XCircle,
    MoreVertical,
    X,
    AlertCircle,
} from "lucide-react";

import "../../pages_styles/admin-styles/admin-seller-application.css";

const API_URL = import.meta.env.VITE_API_URL;

const AdminSellerApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [selectedApplication, setSelectedApplication] =
        useState(null);

    const [openActionId, setOpenActionId] = useState(null);

    const [showDetailsModal, setShowDetailsModal] =
        useState(false);

    const [showRejectModal, setShowRejectModal] =
        useState(false);

    const [rejectionReason, setRejectionReason] =
        useState("");

    const [processingId, setProcessingId] =
        useState(null);

    const [rejecting, setRejecting] =
        useState(false);
    const [downloadingLicense, setDownloadingLicense] = useState(false);
    const [licenseError, setLicenseError] = useState("");

    const downloadBusinessLicense = async () => {
        if (!selectedApplication) return;
        setDownloadingLicense(true);
        setLicenseError("");
        try {
            const response = await fetch(`${API_URL}/admin/seller-requests/${selectedApplication.id}/business-license`, {
                headers: { Accept: "application/octet-stream", Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (!response.ok) {
                const result = await response.json().catch(() => ({}));
                throw new Error(result.message || "Unable to download the business licence.");
            }
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = `seller-${selectedApplication.id}-business-license`;
            link.click();
            URL.revokeObjectURL(objectUrl);
        } catch (downloadError) {
            setLicenseError(downloadError.message);
        } finally {
            setDownloadingLicense(false);
        }
    };

    /* ==========================================
       FETCH SELLER APPLICATIONS
    ========================================== */

    const fetchApplications = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const params = new URLSearchParams();

            if (status) {
                params.append("status", status);
            }

            const query = params.toString();

            const response = await fetch(
                `${API_URL}/admin/seller-requests${
                    query ? `?${query}` : ""
                }`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Failed to retrieve seller applications."
                );
            }

            setApplications(
                result.data?.seller_requests || []
            );
        } catch (err) {
            setError(
                err.message ||
                    "Something went wrong while loading applications."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ==========================================
       LOAD APPLICATIONS
    ========================================== */

    useEffect(() => {
        fetchApplications();
    }, [status]);

    /* ==========================================
       REFRESH
    ========================================== */

    const handleRefresh = () => {
        fetchApplications();
    };

    /* ==========================================
       GET USER
    ========================================== */

    const getUser = (application) => {
        return application?.user || {};
    };

    /* ==========================================
       GET DEFAULT ADDRESS
    ========================================== */

    const getAddress = (application) => {
        const user = getUser(application);

        const addresses = user.addresses || [];

        return (
            addresses.find(
                (address) => address.is_default
            ) ||
            addresses[0] ||
            null
        );
    };

    /* ==========================================
       FORMAT ADDRESS
    ========================================== */

    const formatAddress = (application) => {
        const address = getAddress(application);

        if (!address) {
            return "No address provided";
        }

        const parts = [
            address.address_line,
            address.district,
            address.city,
            address.region,
            address.country,
        ].filter(Boolean);

        return parts.length
            ? parts.join(", ")
            : "No address provided";
    };

    /* ==========================================
       FORMAT STATUS
    ========================================== */

    const formatStatus = (value) => {
        if (!value) {
            return "Pending";
        }

        return value
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

    /* ==========================================
       SEARCH
    ========================================== */

    const filteredApplications =
        applications.filter((application) => {
            const user = getUser(application);

            const searchValue =
                `${user.name || ""} ${
                    user.email || ""
                } ${
                    application.store_name || ""
                }`.toLowerCase();

            return searchValue.includes(
                search.trim().toLowerCase()
            );
        });

    /* ==========================================
       VIEW DETAILS
    ========================================== */

    const handleViewDetails = async (application) => {
        setOpenActionId(null);

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/admin/seller-requests/${application.id}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Failed to retrieve application details."
                );
            }

            setSelectedApplication(
                result.data?.seller_request ||
                    application
            );

            setShowDetailsModal(true);
        } catch (err) {
            alert(
                err.message ||
                    "Failed to retrieve application details."
            );
        }
    };

    /* ==========================================
       APPROVE APPLICATION
    ========================================== */

    const handleApprove = async (application) => {
        const user = getUser(application);

        const confirmed = window.confirm(
            `Are you sure you want to approve ${user.name}'s seller application?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setProcessingId(application.id);
            setOpenActionId(null);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/admin/seller-requests/${application.id}/approve`,
                {
                    method: "PATCH",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Failed to approve seller application."
                );
            }

            const updatedApplication =
                result.data?.seller_profile;

            if (updatedApplication) {
                setApplications((current) =>
                    current.map((item) =>
                        item.id === updatedApplication.id
                            ? {
                                  ...item,
                                  ...updatedApplication,
                              }
                            : item
                    )
                );

                setSelectedApplication((current) =>
                    current?.id === updatedApplication.id
                        ? {
                              ...current,
                              ...updatedApplication,
                          }
                        : current
                );
            } else {
                await fetchApplications();
            }

            alert(
                result.message ||
                    "Seller application approved successfully."
            );
        } catch (err) {
            alert(
                err.message ||
                    "Failed to approve seller application."
            );
        } finally {
            setProcessingId(null);
        }
    };

    /* ==========================================
       OPEN REJECT MODAL
    ========================================== */

    const handleOpenReject = (application) => {
        setSelectedApplication(application);
        setRejectionReason("");
        setShowRejectModal(true);
        setOpenActionId(null);
    };

    /* ==========================================
       REJECT APPLICATION
    ========================================== */

    const handleReject = async (e) => {
        e.preventDefault();

        if (!selectedApplication) {
            return;
        }

        if (rejectionReason.trim().length < 5) {
            alert(
                "The rejection reason must be at least 5 characters."
            );
            return;
        }

        try {
            setRejecting(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/admin/seller-requests/${selectedApplication.id}/reject`,
                {
                    method: "PATCH",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        rejection_reason:
                            rejectionReason.trim(),
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                if (result.errors) {
                    const firstError =
                        Object.values(
                            result.errors
                        )[0]?.[0];

                    throw new Error(
                        firstError ||
                            result.message ||
                            "Failed to reject application."
                    );
                }

                throw new Error(
                    result.message ||
                        "Failed to reject seller application."
                );
            }

            const updatedApplication =
                result.data?.seller_profile;

            if (updatedApplication) {
                setApplications((current) =>
                    current.map((item) =>
                        item.id === updatedApplication.id
                            ? {
                                  ...item,
                                  ...updatedApplication,
                              }
                            : item
                    )
                );

                setSelectedApplication((current) =>
                    current
                        ? {
                              ...current,
                              ...updatedApplication,
                          }
                        : current
                );
            } else {
                await fetchApplications();
            }

            setShowRejectModal(false);
            setRejectionReason("");

            alert(
                result.message ||
                    "Seller application rejected."
            );
        } catch (err) {
            alert(
                err.message ||
                    "Failed to reject seller application."
            );
        } finally {
            setRejecting(false);
        }
    };

    /* ==========================================
       CLOSE DETAILS
    ========================================== */

    const closeDetails = () => {
        setShowDetailsModal(false);
        setSelectedApplication(null);
    };

    /* ==========================================
       CLOSE REJECT MODAL
    ========================================== */

    const closeRejectModal = () => {
        if (rejecting) {
            return;
        }

        setShowRejectModal(false);
        setRejectionReason("");
    };

    /* ==========================================
       COUNTS
    ========================================== */

    const pendingCount = applications.filter(
        (application) =>
            application.status === "pending"
    ).length;

    const approvedCount = applications.filter(
        (application) =>
            application.status === "approved"
    ).length;

    const rejectedCount = applications.filter(
        (application) =>
            application.status === "rejected"
    ).length;

    return (
        <div className="admin-seller-applications-page">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="admin-seller-applications-header">

                <div>
                    <span className="admin-seller-applications-label">
                        ADMINISTRATION
                    </span>

                    <h1>Seller Applications</h1>

                    <p>
                        Review and manage seller applications
                        submitted to OrderMe.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-seller-refresh-btn"
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? "admin-seller-spin"
                                : ""
                        }
                    />

                    Refresh
                </button>

            </div>

            {/* ==========================================
                SUMMARY CARDS
            ========================================== */}

            <div className="admin-seller-summary-grid">

                <div className="admin-seller-summary-card">

                    <div className="admin-seller-summary-icon">
                        <Store size={19} />
                    </div>

                    <div>
                        <span>Total Applications</span>

                        <strong>
                            {applications.length}
                        </strong>
                    </div>

                </div>

                <div className="admin-seller-summary-card">

                    <div className="admin-seller-summary-icon pending">
                        <AlertCircle size={19} />
                    </div>

                    <div>
                        <span>Pending</span>

                        <strong>
                            {pendingCount}
                        </strong>
                    </div>

                </div>

                <div className="admin-seller-summary-card">

                    <div className="admin-seller-summary-icon approved">
                        <CheckCircle size={19} />
                    </div>

                    <div>
                        <span>Approved</span>

                        <strong>
                            {approvedCount}
                        </strong>
                    </div>

                </div>

                <div className="admin-seller-summary-card">

                    <div className="admin-seller-summary-icon rejected">
                        <XCircle size={19} />
                    </div>

                    <div>
                        <span>Rejected</span>

                        <strong>
                            {rejectedCount}
                        </strong>
                    </div>

                </div>

            </div>

            {/* ==========================================
                FILTERS
            ========================================== */}

            <div className="admin-seller-filters">

                <div className="admin-seller-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search seller or store..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>

                <select
                    className="admin-seller-status-filter"
                    value={status}
                    onChange={(e) =>
                        setStatus(e.target.value)
                    }
                >
                    <option value="">
                        All Applications
                    </option>

                    <option value="pending">
                        Pending
                    </option>

                    <option value="approved">
                        Approved
                    </option>

                    <option value="rejected">
                        Rejected
                    </option>
                </select>

            </div>

            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (
                <div className="admin-seller-error">
                    <AlertCircle size={18} />

                    {error}
                </div>
            )}

            {/* ==========================================
                LOADING
            ========================================== */}

            {loading ? (

                <div className="admin-seller-loading">

                    <RefreshCw
                        size={23}
                        className="admin-seller-spin"
                    />

                    <span>
                        Loading seller applications...
                    </span>

                </div>

            ) : filteredApplications.length === 0 ? (

                <div className="admin-seller-empty">

                    <Store size={40} />

                    <h3>
                        No seller applications found
                    </h3>

                    <p>
                        There are no applications matching
                        your current filters.
                    </p>

                </div>

            ) : (

                /* ==========================================
                   TABLE
                ========================================== */

                <div className="admin-seller-table-wrapper">

                    <table className="admin-seller-table">

                        <thead>

                            <tr>
                                <th>SELLER</th>
                                <th>STORE</th>
                                <th>CONTACT</th>
                                <th>ADDRESS</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>

                        </thead>

                        <tbody>

                            {filteredApplications.map(
                                (application) => {

                                    const user =
                                        getUser(
                                            application
                                        );

                                    return (

                                        <tr
                                            key={
                                                application.id
                                            }
                                        >

                                            {/* SELLER */}

                                            <td>

                                                <div className="admin-seller-user">

                                                    <div className="admin-seller-avatar">
                                                        <UserRound
                                                            size={19}
                                                        />
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {user.name ||
                                                                "Unknown Seller"}
                                                        </strong>

                                                        <span>
                                                            ID: #
                                                            {
                                                                user.id
                                                            }
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* STORE */}

                                            <td>

                                                <div className="admin-seller-store">

                                                    <Store
                                                        size={16}
                                                    />

                                                    <span>
                                                        {application.store_name ||
                                                            "No store name"}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* CONTACT */}

                                            <td>

                                                <div className="admin-seller-contact">

                                                    <span>
                                                        <Mail
                                                            size={14}
                                                        />

                                                        {user.email ||
                                                            "No email"}
                                                    </span>

                                                    <span>
                                                        <Phone
                                                            size={14}
                                                        />

                                                        {application.phone ||
                                                            "No phone"}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* ADDRESS */}

                                            <td>

                                                <div className="admin-seller-address">

                                                    <MapPin
                                                        size={15}
                                                    />

                                                    <span>
                                                        {formatAddress(
                                                            application
                                                        )}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`admin-seller-status ${
                                                        application.status ||
                                                        "pending"
                                                    }`}
                                                >

                                                    {application.status ===
                                                        "approved" && (
                                                        <CheckCircle
                                                            size={14}
                                                        />
                                                    )}

                                                    {application.status ===
                                                        "rejected" && (
                                                        <XCircle
                                                            size={14}
                                                        />
                                                    )}

                                                    {(!application.status ||
                                                        application.status ===
                                                            "pending") && (
                                                        <AlertCircle
                                                            size={14}
                                                        />
                                                    )}

                                                    {formatStatus(
                                                        application.status
                                                    )}

                                                </span>

                                            </td>

                                            {/* ACTION */}

                                            <td className="admin-seller-action-cell">

                                                <button
                                                    type="button"
                                                    className="admin-seller-action-btn"
                                                    onClick={() =>
                                                        setOpenActionId(
                                                            openActionId ===
                                                                application.id
                                                                ? null
                                                                : application.id
                                                        )
                                                    }
                                                >
                                                    <MoreVertical
                                                        size={18}
                                                    />
                                                </button>

                                                {openActionId ===
                                                    application.id && (

                                                    <div className="admin-seller-action-menu">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleViewDetails(
                                                                    application
                                                                )
                                                            }
                                                        >
                                                            <Eye
                                                                size={15}
                                                            />

                                                            View Details
                                                        </button>

                                                        {application.status !==
                                                            "approved" && (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        application
                                                                    )
                                                                }
                                                                disabled={
                                                                    processingId ===
                                                                    application.id
                                                                }
                                                            >
                                                                <CheckCircle
                                                                    size={15}
                                                                />

                                                                Approve
                                                            </button>

                                                        )}

                                                        {application.status !==
                                                            "approved" && (

                                                            <button
                                                                type="button"
                                                                className="admin-seller-danger-action"
                                                                onClick={() =>
                                                                    handleOpenReject(
                                                                        application
                                                                    )
                                                                }
                                                            >
                                                                <XCircle
                                                                    size={15}
                                                                />

                                                                Reject
                                                            </button>

                                                        )}

                                                    </div>

                                                )}

                                            </td>

                                        </tr>

                                    );
                                }
                            )}

                        </tbody>

                    </table>

                </div>

            )}

            {/* ==========================================
                DETAILS MODAL
            ========================================== */}

            {showDetailsModal &&
                selectedApplication && (

                    <div
                        className="admin-seller-modal-backdrop"
                        onClick={closeDetails}
                    >

                        <div
                            className="admin-seller-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="admin-seller-modal-header">

                                <div>

                                    <span>
                                        SELLER APPLICATION
                                    </span>

                                    <h3>
                                        {
                                            selectedApplication.store_name
                                        }
                                    </h3>

                                </div>

                                <button
                                    type="button"
                                    onClick={closeDetails}
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <div className="admin-seller-modal-body">

                                <div className="admin-seller-detail-section">

                                    <h4>
                                        Seller Information
                                    </h4>

                                    <div className="admin-seller-detail-row">
                                        <span>Name</span>

                                        <strong>
                                            {
                                                getUser(
                                                    selectedApplication
                                                ).name
                                            }
                                        </strong>
                                    </div>

                                    <div className="admin-seller-detail-row">
                                        <span>Email</span>

                                        <strong>
                                            {
                                                getUser(
                                                    selectedApplication
                                                ).email
                                            }
                                        </strong>
                                    </div>

                                    <div className="admin-seller-detail-row">
                                        <span>Phone</span>

                                        <strong>
                                            {
                                                selectedApplication.phone ||
                                                "Not provided"
                                            }
                                        </strong>
                                    </div>

                                </div>

                                <div className="admin-seller-detail-section">

                                    <h4>
                                        Store Information
                                    </h4>

                                    <div className="admin-seller-detail-row">
                                        <span>Store Name</span>

                                        <strong>
                                            {
                                                selectedApplication.store_name
                                            }
                                        </strong>
                                    </div>

                                    <div className="admin-seller-description">

                                        <span>
                                            Store Description
                                        </span>

                                        <p>
                                            {
                                                selectedApplication.store_description ||
                                                "No description provided."
                                            }
                                        </p>

                                    </div>

                                </div>

                                <div className="admin-seller-detail-section">

                                    <h4>
                                        Store Address
                                    </h4>

                                    <div className="admin-seller-full-address">

                                        <MapPin size={17} />

                                        <span>
                                            {formatAddress(
                                                selectedApplication
                                            )}
                                        </span>

                                    </div>

                                </div>

                                <div className="admin-seller-detail-section">

                                    <h4>Business Licence</h4>
                                    <button type="button" className="admin-seller-modal-approve" onClick={downloadBusinessLicense} disabled={downloadingLicense}>
                                        {downloadingLicense ? "Downloading…" : "Download Business Licence"}
                                    </button>
                                    {licenseError && <p className="text-danger mt-2" role="alert">{licenseError}</p>}

                                </div>

                                <div className="admin-seller-detail-section">

                                    <h4>
                                        Application Status
                                    </h4>

                                    <span
                                        className={`admin-seller-status ${
                                            selectedApplication.status ||
                                            "pending"
                                        }`}
                                    >
                                        {formatStatus(
                                            selectedApplication.status
                                        )}
                                    </span>

                                    {selectedApplication.status ===
                                        "rejected" &&
                                        selectedApplication.rejection_reason && (

                                            <div className="admin-seller-rejection-reason">

                                                <strong>
                                                    Rejection Reason
                                                </strong>

                                                <p>
                                                    {
                                                        selectedApplication.rejection_reason
                                                    }
                                                </p>

                                            </div>

                                        )}

                                </div>

                            </div>

                            <div className="admin-seller-modal-footer">

                                {selectedApplication.status !==
                                    "approved" && (

                                    <>
                                        <button
                                            type="button"
                                            className="admin-seller-modal-reject"
                                            onClick={() =>
                                                handleOpenReject(
                                                    selectedApplication
                                                )
                                            }
                                        >
                                            <XCircle
                                                size={15}
                                            />

                                            Reject
                                        </button>

                                        <button
                                            type="button"
                                            className="admin-seller-modal-approve"
                                            onClick={() =>
                                                handleApprove(
                                                    selectedApplication
                                                )
                                            }
                                        >
                                            <CheckCircle
                                                size={15}
                                            />

                                            Approve
                                        </button>
                                    </>

                                )}

                                <button
                                    type="button"
                                    className="admin-seller-modal-close"
                                    onClick={closeDetails}
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                )}

            {/* ==========================================
                REJECT MODAL
            ========================================== */}

            {showRejectModal &&
                selectedApplication && (

                    <div
                        className="admin-seller-modal-backdrop"
                        onClick={closeRejectModal}
                    >

                        <div
                            className="admin-seller-modal admin-seller-reject-modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >

                            <div className="admin-seller-modal-header">

                                <div>

                                    <span>
                                        REJECT APPLICATION
                                    </span>

                                    <h3>
                                        {
                                            selectedApplication.store_name
                                        }
                                    </h3>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeRejectModal
                                    }
                                    disabled={rejecting}
                                >
                                    <X size={20} />
                                </button>

                            </div>

                            <form
                                onSubmit={
                                    handleReject
                                }
                            >

                                <div className="admin-seller-modal-body">

                                    <div className="admin-seller-reject-warning">

                                        <AlertCircle
                                            size={20}
                                        />

                                        <p>
                                            Please provide a
                                            clear reason for
                                            rejecting this
                                            seller application.
                                        </p>

                                    </div>

                                    <div className="admin-seller-form-group">

                                        <label htmlFor="rejection_reason">
                                            Rejection Reason
                                        </label>

                                        <textarea
                                            id="rejection_reason"
                                            value={
                                                rejectionReason
                                            }
                                            onChange={(e) =>
                                                setRejectionReason(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Enter the reason for rejecting this application..."
                                            rows="5"
                                            minLength="5"
                                            maxLength="1000"
                                            required
                                        />

                                        <small>
                                            {
                                                rejectionReason.length
                                            }{" "}
                                            / 1000
                                        </small>

                                    </div>

                                </div>

                                <div className="admin-seller-modal-footer">

                                    <button
                                        type="button"
                                        className="admin-seller-modal-close"
                                        onClick={
                                            closeRejectModal
                                        }
                                        disabled={
                                            rejecting
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="admin-seller-modal-reject"
                                        disabled={
                                            rejecting
                                        }
                                    >
                                        <XCircle
                                            size={15}
                                        />

                                        {rejecting
                                            ? "Rejecting..."
                                            : "Reject Application"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

        </div>
    );
};

export default AdminSellerApplications;
