import React, { useEffect, useState } from "react";

function AdminSellerRequests() {
    const [sellerRequests, setSellerRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [selectedSeller, setSelectedSeller] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);

    const getToken = () => localStorage.getItem("token");

    const fetchSellerRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                setError("Your session has expired. Please log in again.");
                return;
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/seller-requests`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setError(
                    data.message ||
                        "Unable to load seller applications."
                );
                return;
            }

            setSellerRequests(
                data.data?.seller_requests || []
            );
        } catch (err) {
            console.error(err);

            setError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellerRequests();
    }, []);

    const handleApprove = async (sellerProfileId) => {
        const confirmed = window.confirm(
            "Are you sure you want to approve this seller?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setActionLoading(sellerProfileId);
            setError("");
            setSuccess("");

            const token = getToken();

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/seller-requests/${sellerProfileId}/approve`,
                {
                    method: "PATCH",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                setError(
                    data.message ||
                        "Unable to approve seller application."
                );
                return;
            }

            setSuccess(
                data.message ||
                    "Seller application approved successfully."
            );

            await fetchSellerRequests();
        } catch (err) {
            console.error(err);

            setError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const openRejectModal = (seller) => {
        setSelectedSeller(seller);
        setRejectionReason("");
        setError("");
        setSuccess("");
        setShowRejectModal(true);
    };

    const closeRejectModal = () => {
        if (actionLoading) {
            return;
        }

        setShowRejectModal(false);
        setSelectedSeller(null);
        setRejectionReason("");
    };

    const handleReject = async (e) => {
        e.preventDefault();

        if (!selectedSeller) {
            return;
        }

        try {
            setActionLoading(selectedSeller.id);
            setError("");
            setSuccess("");

            const token = getToken();

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/admin/seller-requests/${selectedSeller.id}/reject`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        rejection_reason: rejectionReason,
                    }),
                }
            );

            const data = await response.json().catch(() => ({}));

            if (response.status === 422) {
                const validationErrors =
                    data.errors || {};

                const firstError = Object.values(
                    validationErrors
                )[0];

                setError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : "Please provide a valid rejection reason."
                );

                return;
            }

            if (!response.ok) {
                setError(
                    data.message ||
                        "Unable to reject seller application."
                );
                return;
            }

            setSuccess(
                data.message ||
                    "Seller application rejected."
            );

            closeRejectModal();

            await fetchSellerRequests();
        } catch (err) {
            console.error(err);

            setError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved":
                return (
                    <span className="badge bg-success">
                        Approved
                    </span>
                );

            case "rejected":
                return (
                    <span className="badge bg-danger">
                        Rejected
                    </span>
                );

            default:
                return (
                    <span className="badge bg-warning text-dark">
                        Pending
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div
                        className="spinner-border"
                        role="status"
                        aria-label="Loading"
                    />
                    <p className="mt-3 text-muted">
                        Loading seller applications...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-1">
                        Seller Applications
                    </h1>

                    <p className="text-muted mb-0">
                        Review and manage seller applications.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={fetchSellerRequests}
                    disabled={actionLoading !== null}
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div
                    className="alert alert-danger"
                    role="alert"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    className="alert alert-success"
                    role="alert"
                >
                    {success}
                </div>
            )}

            {sellerRequests.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <h4>No Seller Applications</h4>

                        <p className="text-muted mb-0">
                            There are currently no seller
                            applications to review.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="card border-0 shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Store</th>
                                    <th>Seller</th>
                                    <th>Phone</th>
                                    <th>District</th>
                                    <th>Status</th>
                                    <th className="text-end">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {sellerRequests.map((seller) => (
                                    <tr key={seller.id}>
                                        <td>
                                            <strong>
                                                {seller.store_name}
                                            </strong>

                                            {seller.store_description && (
                                                <div className="small text-muted">
                                                    {seller.store_description}
                                                </div>
                                            )}
                                        </td>

                                        <td>
                                            {seller.user?.name || "—"}

                                            {seller.user?.email && (
                                                <div className="small text-muted">
                                                    {seller.user.email}
                                                </div>
                                            )}
                                        </td>

                                        <td>
                                            {seller.phone || "—"}
                                        </td>

                                        <td>
                                            {seller.district}
                                        </td>

                                        <td>
                                            {getStatusBadge(
                                                seller.status
                                            )}
                                        </td>

                                        <td className="text-end">
                                            {seller.status ===
                                                "pending" && (
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-success"
                                                        onClick={() =>
                                                            handleApprove(
                                                                seller.id
                                                            )
                                                        }
                                                        disabled={
                                                            actionLoading !==
                                                            null
                                                        }
                                                    >
                                                        {actionLoading ===
                                                        seller.id
                                                            ? "Processing..."
                                                            : "Approve"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() =>
                                                            openRejectModal(
                                                                seller
                                                            )
                                                        }
                                                        disabled={
                                                            actionLoading !==
                                                            null
                                                        }
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}

                                            {seller.status ===
                                                "rejected" &&
                                                seller.rejection_reason && (
                                                    <div className="small text-danger">
                                                        {
                                                            seller.rejection_reason
                                                        }
                                                    </div>
                                                )}

                                            {seller.status ===
                                                "approved" && (
                                                <span className="text-muted small">
                                                    No action required
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showRejectModal && selectedSeller && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    role="dialog"
                    style={{
                        backgroundColor:
                            "rgba(0, 0, 0, 0.5)",
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={handleReject}>
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Reject Seller Application
                                    </h5>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={
                                            closeRejectModal
                                        }
                                        disabled={
                                            actionLoading !== null
                                        }
                                        aria-label="Close"
                                    />
                                </div>

                                <div className="modal-body">
                                    <p>
                                        You are rejecting:
                                        <strong className="ms-1">
                                            {
                                                selectedSeller.store_name
                                            }
                                        </strong>
                                    </p>

                                    <label
                                        htmlFor="rejection_reason"
                                        className="form-label"
                                    >
                                        Rejection Reason
                                    </label>

                                    <textarea
                                        id="rejection_reason"
                                        className="form-control"
                                        rows="4"
                                        value={rejectionReason}
                                        onChange={(e) =>
                                            setRejectionReason(
                                                e.target.value
                                            )
                                        }
                                        disabled={
                                            actionLoading !== null
                                        }
                                        placeholder="Explain why this seller application is being rejected..."
                                        required
                                    />
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={
                                            closeRejectModal
                                        }
                                        disabled={
                                            actionLoading !== null
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-danger"
                                        disabled={
                                            actionLoading !== null
                                        }
                                    >
                                        {actionLoading !== null
                                            ? "Rejecting..."
                                            : "Reject Application"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminSellerRequests;