import React, { useEffect, useState } from "react";
import {
    Truck,
    RefreshCw,
    MapPin,
    User,
    CheckCircle,
    Clock,
    XCircle,
    Package,
    Eye,
    Phone,
    Store,
    Navigation,
    ShieldCheck,
    X,
} from "lucide-react";

import "../../pages_styles/admin-styles/admin-deliveries.css";

const API_URL =
    import.meta.env.VITE_API_URL;

const AdminDelivery= () => {
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [selectedDelivery, setSelectedDelivery] = useState(null);

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(`${API_URL}/admin/deliveries`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to retrieve deliveries."
                );
            }

            setDeliveries(data.data || []);
        } catch (err) {
            console.error("Delivery fetch error:", err);
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDeliveries();
    };

    const getPickupStops = (delivery) => {
        return (delivery?.deliveries_stops || [])
            .filter((stop) => stop.stop_type === "pickup")
            .sort((a, b) => a.sequence - b.sequence);
    };

    const getCustomerStop = (delivery) => {
        return (delivery?.deliveries_stops || []).find(
            (stop) =>
                stop.stop_type === "delivery" &&
                stop.seller_order_id === null
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Get only the products belonging to this seller
    |--------------------------------------------------------------------------
    */

    const getProductsForPickup = (stop) => {
        const sellerOrder = stop?.seller_order;

        if (!sellerOrder?.order?.items) {
            return [];
        }

        return sellerOrder.order.items.filter(
            (item) =>
                Number(item?.product?.seller_id) ===
                Number(sellerOrder.seller_id)
        );
    };

    const formatDateTime = (date) => {
        if (!date) {
            return "Not available";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) {
            return "TZS 0";
        }

        return `TZS ${Number(amount).toLocaleString("en-TZ")}`;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "completed":
                return "status-completed";

            case "assigned":
                return "status-assigned";

            case "accepted":
                return "status-accepted";

            case "started":
                return "status-started";

            case "cancelled":
            case "canceled":
                return "status-cancelled";

            default:
                return "status-pending";
        }
    };

    const getStatusLabel = (status) => {
        if (!status) {
            return "Unknown";
        }

        return status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const openDetails = (delivery) => {
        setSelectedDelivery(delivery);
    };

    const closeDetails = () => {
        setSelectedDelivery(null);
    };

    /*
    |--------------------------------------------------------------------------
    | Summary
    |--------------------------------------------------------------------------
    */

    const totalDeliveries = deliveries.length;

    const assignedDeliveries = deliveries.filter(
        (delivery) => delivery.status === "assigned"
    ).length;

    const inProgressDeliveries = deliveries.filter((delivery) =>
        ["accepted", "started"].includes(delivery.status)
    ).length;

    const completedDeliveries = deliveries.filter(
        (delivery) => delivery.status === "completed"
    ).length;

    if (loading) {
        return (
            <div className="admin-deliveries-page">
                <div className="deliveries-loading">
                    <RefreshCw size={25} className="loading-spinner" />
                    <p>Loading deliveries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-deliveries-page">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="deliveries-page-header">
                <div>
                    <h1>Deliveries</h1>

                    <p>
                        Monitor assigned riders, pickup locations, and
                        customer deliveries.
                    </p>
                </div>

                <button
                    type="button"
                    className="deliveries-refresh-btn"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw
                        size={17}
                        className={refreshing ? "loading-spinner" : ""}
                    />

                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* =====================================================
                ERROR
            ===================================================== */}

            {error && (
                <div className="deliveries-error">
                    <XCircle size={19} />
                    <span>{error}</span>
                </div>
            )}

            {/* =====================================================
                SUMMARY
            ===================================================== */}

            <div className="delivery-summary-grid">

                <div className="delivery-summary-card">
                    <div className="summary-card-icon">
                        <Truck size={21} />
                    </div>

                    <div>
                        <span>Total Deliveries</span>
                        <strong>{totalDeliveries}</strong>
                    </div>
                </div>

                <div className="delivery-summary-card">
                    <div className="summary-card-icon assigned">
                        <Clock size={21} />
                    </div>

                    <div>
                        <span>Assigned</span>
                        <strong>{assignedDeliveries}</strong>
                    </div>
                </div>

                <div className="delivery-summary-card">
                    <div className="summary-card-icon progress">
                        <Navigation size={21} />
                    </div>

                    <div>
                        <span>In Progress</span>
                        <strong>{inProgressDeliveries}</strong>
                    </div>
                </div>

                <div className="delivery-summary-card">
                    <div className="summary-card-icon completed">
                        <CheckCircle size={21} />
                    </div>

                    <div>
                        <span>Completed</span>
                        <strong>{completedDeliveries}</strong>
                    </div>
                </div>

            </div>

            {/* =====================================================
                TABLE
            ===================================================== */}

            <div className="deliveries-table-card">

                <div className="deliveries-table-header">
                    <div>
                        <h2>Delivery Management</h2>

                        <p>
                            View and monitor all deliveries assigned to
                            riders.
                        </p>
                    </div>
                </div>

                {deliveries.length === 0 ? (
                    <div className="deliveries-empty">
                        <Truck size={40} />

                        <h3>No deliveries found</h3>

                        <p>
                            There are currently no deliveries available.
                        </p>
                    </div>
                ) : (
                    <div className="deliveries-table-wrapper">

                        <table className="deliveries-table">

                            <thead>
                                <tr>
                                    <th>Delivery</th>
                                    <th>Customer</th>
                                    <th>Rider</th>
                                    <th>Pickup Stops</th>
                                    <th>Destination</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {deliveries.map((delivery) => {

                                    const pickupStops =
                                        getPickupStops(delivery);

                                    const customerStop =
                                        getCustomerStop(delivery);

                                    const customer =
                                        delivery.order?.user;

                                    const rider =
                                        delivery.rider?.user;

                                    return (
                                        <tr key={delivery.id}>

                                            {/* DELIVERY */}

                                            <td>
                                                <div className="delivery-number">

                                                    <div className="delivery-icon">
                                                        <Truck size={16} />
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            Delivery #
                                                            {delivery.id}
                                                        </strong>

                                                        <small>
                                                            Order #
                                                            {delivery.order_id}
                                                        </small>
                                                    </div>

                                                </div>
                                            </td>

                                            {/* CUSTOMER */}

                                            <td>
                                                <div className="delivery-person">

                                                    <div className="person-icon">
                                                        <User size={15} />
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {customer?.name ||
                                                                "Unknown customer"}
                                                        </strong>

                                                        <small>
                                                            {customer?.phone ||
                                                                "No phone"}
                                                        </small>
                                                    </div>

                                                </div>
                                            </td>

                                            {/* RIDER */}

                                            <td>
                                                <div className="delivery-rider">

                                                    <strong>
                                                        {rider?.name ||
                                                            "Not assigned"}
                                                    </strong>

                                                    <small>
                                                        {rider?.phone ||
                                                            "No phone"}
                                                    </small>

                                                </div>
                                            </td>

                                            {/* PICKUP */}

                                            <td>
                                                <div className="pickup-summary">

                                                    <div className="pickup-count">
                                                        <Package size={14} />

                                                        <strong>
                                                            {
                                                                pickupStops.length
                                                            }
                                                        </strong>

                                                        <span>
                                                            {pickupStops.length ===
                                                            1
                                                                ? "stop"
                                                                : "stops"}
                                                        </span>
                                                    </div>

                                                    <div className="pickup-sellers">

                                                        {pickupStops.map(
                                                            (stop) => (
                                                                <span
                                                                    key={
                                                                        stop.id
                                                                    }
                                                                >
                                                                    {stop
                                                                        .seller_order
                                                                        ?.seller
                                                                        ?.name ||
                                                                        "Unknown seller"}
                                                                </span>
                                                            )
                                                        )}

                                                    </div>

                                                </div>
                                            </td>

                                            {/* DESTINATION */}

                                            <td>
                                                <div className="delivery-destination">

                                                    <div className="destination-icon">
                                                        <MapPin size={15} />
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {customer?.name ||
                                                                "Customer"}
                                                        </strong>

                                                        <small>
                                                            {customerStop?.address ||
                                                                "Destination not available"}
                                                        </small>
                                                    </div>

                                                </div>
                                            </td>

                                            {/* STATUS */}

                                            <td>
                                                <span
                                                    className={`delivery-status ${getStatusClass(
                                                        delivery.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        delivery.status
                                                    )}
                                                </span>

                                                {delivery.completed_at && (
                                                    <small className="status-date">
                                                        Completed{" "}
                                                        {formatDateTime(
                                                            delivery.completed_at
                                                        )}
                                                    </small>
                                                )}
                                            </td>

                                            {/* CREATED */}

                                            <td>
                                                <span className="created-date">
                                                    {formatDateTime(
                                                        delivery.created_at
                                                    )}
                                                </span>
                                            </td>

                                            {/* ACTION */}

                                            <td>
                                                <button
                                                    type="button"
                                                    className="view-details-btn"
                                                    onClick={() =>
                                                        openDetails(delivery)
                                                    }
                                                >
                                                    <Eye size={15} />
                                                    View Details
                                                </button>
                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* =====================================================
                VIEW DETAILS
            ===================================================== */}

            {selectedDelivery && (

                <div
                    className="delivery-modal-overlay"
                    onClick={closeDetails}
                >

                    <div
                        className="delivery-details-modal"
                        onClick={(event) => event.stopPropagation()}
                    >

                        {/* MODAL HEADER */}

                        <div className="delivery-modal-header">

                            <div className="modal-title-row">

                                <div className="modal-truck-icon">
                                    <Truck size={20} />
                                </div>

                                <div>
                                    <h2>
                                        Delivery #
                                        {selectedDelivery.id}
                                    </h2>

                                    <p>
                                        Order #
                                        {selectedDelivery.order_id}
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={closeDetails}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* MODAL BODY */}

                        <div className="delivery-modal-body">

                            {/* =================================================
                                OVERVIEW
                            ================================================= */}

                            <section className="details-section">

                                <div className="details-section-heading">

                                    <h3>Delivery Overview</h3>

                                    <span
                                        className={`delivery-status ${getStatusClass(
                                            selectedDelivery.status
                                        )}`}
                                    >
                                        {getStatusLabel(
                                            selectedDelivery.status
                                        )}
                                    </span>

                                </div>

                                <div className="details-overview-grid">

                                    <div className="detail-info-item">
                                        <span>Order Total</span>

                                        <strong>
                                            {formatCurrency(
                                                selectedDelivery.order
                                                    ?.total_amount
                                            )}
                                        </strong>
                                    </div>

                                    <div className="detail-info-item">
                                        <span>Assigned</span>

                                        <strong>
                                            {formatDateTime(
                                                selectedDelivery.assigned_at
                                            )}
                                        </strong>
                                    </div>

                                    <div className="detail-info-item">
                                        <span>Accepted</span>

                                        <strong>
                                            {formatDateTime(
                                                selectedDelivery.accepted_at
                                            )}
                                        </strong>
                                    </div>

                                    <div className="detail-info-item">
                                        <span>Started</span>

                                        <strong>
                                            {formatDateTime(
                                                selectedDelivery.started_at
                                            )}
                                        </strong>
                                    </div>

                                </div>

                            </section>

                            {/* =================================================
                                RIDER
                            ================================================= */}

                            <section className="details-section">

                                <div className="details-section-heading">
                                    <h3>Assigned Rider</h3>
                                </div>

                                <div className="rider-details-card">

                                    <div className="rider-details-icon">
                                        <User size={21} />
                                    </div>

                                    <div className="rider-details-content">

                                        <strong>
                                            {selectedDelivery.rider?.user
                                                ?.name ||
                                                "Not assigned"}
                                        </strong>

                                        <span>
                                            <Phone size={13} />

                                            {selectedDelivery.rider?.user
                                                ?.phone ||
                                                "No phone number"}
                                        </span>

                                        <span>
                                            Rider status:{" "}
                                            <b>
                                                {getStatusLabel(
                                                    selectedDelivery.rider
                                                        ?.status
                                                )}
                                            </b>
                                        </span>

                                    </div>

                                </div>

                            </section>

                            {/* =================================================
                                PICKUPS
                            ================================================= */}

                            <section className="details-section">

                                <div className="details-section-heading">

                                    <div>
                                        <h3>Pickup Stops</h3>

                                        <p>
                                            Products collected from each
                                            seller before final delivery.
                                        </p>
                                    </div>

                                </div>

                                <div className="pickup-timeline">

                                    {getPickupStops(selectedDelivery).map(
                                        (stop, index) => {

                                            const sellerOrder =
                                                stop.seller_order;

                                            const seller =
                                                sellerOrder?.seller;

                                            const products =
                                                getProductsForPickup(stop);

                                            return (
                                                <div
                                                    className="pickup-stop-card"
                                                    key={stop.id}
                                                >

                                                    <div className="timeline-marker">
                                                        <span>
                                                            {index + 1}
                                                        </span>
                                                    </div>

                                                    <div className="pickup-stop-content">

                                                        {/* SELLER */}

                                                        <div className="pickup-stop-header">

                                                            <div className="pickup-seller">

                                                                <div className="pickup-seller-icon">
                                                                    <Store
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <h4>
                                                                        {seller?.name ||
                                                                            "Unknown seller"}
                                                                    </h4>

                                                                    <span>
                                                                        Pickup
                                                                        Stop{" "}
                                                                        {
                                                                            stop.sequence
                                                                        }
                                                                    </span>
                                                                </div>

                                                            </div>

                                                            <span
                                                                className={`stop-status ${getStatusClass(
                                                                    stop.status
                                                                )}`}
                                                            >
                                                                {getStatusLabel(
                                                                    stop.status
                                                                )}
                                                            </span>

                                                        </div>

                                                        {/* ADDRESS */}

                                                        <div className="pickup-address">

                                                            <MapPin size={16} />

                                                            <span>
                                                                {stop.address ||
                                                                    "Pickup address not available"}
                                                            </span>

                                                        </div>

                                                        {/* PRODUCTS */}

                                                        <div className="pickup-products">

                                                            <h5>
                                                                Products picked
                                                                up
                                                            </h5>

                                                            {products.length ===
                                                            0 ? (
                                                                <div className="no-products">
                                                                    <Package
                                                                        size={
                                                                            16
                                                                        }
                                                                    />

                                                                    <span>
                                                                        No
                                                                        products
                                                                        found
                                                                        for this
                                                                        seller.
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="product-list">

                                                                    {products.map(
                                                                        (
                                                                            item
                                                                        ) => (
                                                                            <div
                                                                                className="pickup-product"
                                                                                key={
                                                                                    item.id
                                                                                }
                                                                            >

                                                                                <div className="product-info">

                                                                                    <div className="product-image-placeholder">
                                                                                        <Package
                                                                                            size={
                                                                                                16
                                                                                            }
                                                                                        />
                                                                                    </div>

                                                                                    <div>
                                                                                        <strong>
                                                                                            {item
                                                                                                .product
                                                                                                ?.name ||
                                                                                                "Unknown product"}
                                                                                        </strong>

                                                                                        <small>
                                                                                            Unit
                                                                                            price:{" "}
                                                                                            {formatCurrency(
                                                                                                item.unit_price
                                                                                            )}
                                                                                        </small>
                                                                                    </div>

                                                                                </div>

                                                                                <div className="product-quantity">

                                                                                    <span>
                                                                                        Qty
                                                                                    </span>

                                                                                    <strong>
                                                                                        {
                                                                                            item.quantity
                                                                                        }
                                                                                    </strong>

                                                                                </div>

                                                                                <div className="product-total">

                                                                                    <span>
                                                                                        Total
                                                                                    </span>

                                                                                    <strong>
                                                                                        {formatCurrency(
                                                                                            item.total_price
                                                                                        )}
                                                                                    </strong>

                                                                                </div>

                                                                            </div>
                                                                        )
                                                                    )}

                                                                </div>
                                                            )}

                                                        </div>

                                                        {/* TIMES */}

                                                        <div className="stop-time-grid">

                                                            <div className="stop-time-item">

                                                                <Clock
                                                                    size={15}
                                                                />

                                                                <div>
                                                                    <span>
                                                                        Rider
                                                                        arrived
                                                                    </span>

                                                                    <strong>
                                                                        {formatDateTime(
                                                                            stop.arrived_at
                                                                        )}
                                                                    </strong>
                                                                </div>

                                                            </div>

                                                            <div className="stop-time-item">

                                                                <CheckCircle
                                                                    size={15}
                                                                />

                                                                <div>
                                                                    <span>
                                                                        Pickup
                                                                        completed
                                                                    </span>

                                                                    <strong>
                                                                        {formatDateTime(
                                                                            stop.completed_at
                                                                        )}
                                                                    </strong>
                                                                </div>

                                                            </div>

                                                        </div>

                                                    </div>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>

                            </section>

                            {/* =================================================
                                CUSTOMER DELIVERY
                            ================================================= */}

                            <section className="details-section">

                                <div className="details-section-heading">

                                    <div>
                                        <h3>Customer Delivery</h3>

                                        <p>
                                            Final destination and delivery
                                            confirmation.
                                        </p>
                                    </div>

                                </div>

                                {(() => {
                                    const customerStop =
                                        getCustomerStop(selectedDelivery);

                                    const customer =
                                        selectedDelivery.order?.user;

                                    return (
                                        <div className="customer-delivery-card">

                                            {/* CUSTOMER */}

                                            <div className="customer-details-header">

                                                <div className="customer-avatar">
                                                    <User size={20} />
                                                </div>

                                                <div>

                                                    <h4>
                                                        {customer?.name ||
                                                            "Unknown customer"}
                                                    </h4>

                                                    <span>
                                                        <Phone size={13} />

                                                        {customer?.phone ||
                                                            "No phone number"}
                                                    </span>

                                                </div>

                                            </div>

                                            {/* DESTINATION */}

                                            <div className="customer-destination">

                                                <div className="destination-detail-icon">
                                                    <MapPin size={18} />
                                                </div>

                                                <div>

                                                    <span>
                                                        Destination
                                                    </span>

                                                    <strong>
                                                        {customerStop?.address ||
                                                            "Destination not available"}
                                                    </strong>

                                                </div>

                                            </div>

                                            {/* TIMES */}

                                            <div className="customer-delivery-times">

                                                <div className="customer-time-item">

                                                    <Clock size={16} />

                                                    <div>
                                                        <span>
                                                            Rider arrived
                                                        </span>

                                                        <strong>
                                                            {formatDateTime(
                                                                customerStop?.arrived_at
                                                            )}
                                                        </strong>
                                                    </div>

                                                </div>

                                                <div className="customer-time-item otp-time">

                                                    <ShieldCheck size={16} />

                                                    <div>
                                                        <span>
                                                            OTP verified
                                                        </span>

                                                        <strong>
                                                            {formatDateTime(
                                                                selectedDelivery
                                                                    .otp
                                                                    ?.verified_at
                                                            )}
                                                        </strong>
                                                    </div>

                                                </div>

                                                <div className="customer-time-item completed-time">

                                                    <CheckCircle size={16} />

                                                    <div>
                                                        <span>
                                                            Delivery completed
                                                        </span>

                                                        <strong>
                                                            {formatDateTime(
                                                                selectedDelivery.completed_at
                                                            )}
                                                        </strong>
                                                    </div>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                })()}

                            </section>

                        </div>

                        {/* =================================================
                            FOOTER
                        ================================================= */}

                        <div className="delivery-modal-footer">

                            <button
                                type="button"
                                className="close-details-btn"
                                onClick={closeDetails}
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default AdminDelivery;