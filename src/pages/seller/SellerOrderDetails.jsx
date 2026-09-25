import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Package,
    User,
    RefreshCw,
    CheckCircle,
    Clock,
    Truck,
    XCircle,
} from "lucide-react";

import "../../pages_styles/seller_styles/sellerorderdetails.css";

const API_URL = import.meta.env.VITE_API_URL;

const SellerOrderDetails = () => {
    const { sellerOrderId } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /*
    |--------------------------------------------------------------------------
    | FETCH SELLER ORDER
    |--------------------------------------------------------------------------
    */

    const fetchOrder = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/seller/orders/${sellerOrderId}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load order."
                );
            }

            setOrder(data.data);
        } catch (err) {
            setError(
                err.message || "Something went wrong while loading the order."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [sellerOrderId]);

    /*
    |--------------------------------------------------------------------------
    | FORMAT STATUS
    |--------------------------------------------------------------------------
    */

    const formatStatus = (status) => {
        if (!status) return "Unknown";

        return status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    /*
    |--------------------------------------------------------------------------
    | STATUS CLASS
    |--------------------------------------------------------------------------
    */

    const getStatusClass = (status) => {
        switch (status) {
            case "pending":
                return "seller-detail-status-pending";

            case "confirmed":
                return "seller-detail-status-confirmed";

            case "processing":
                return "seller-detail-status-processing";

            case "ready_for_delivery":
                return "seller-detail-status-ready";

            case "cancelled":
                return "seller-detail-status-cancelled";

            default:
                return "seller-detail-status-default";
        }
    };

    /*
    |--------------------------------------------------------------------------
    | NEXT SELLER ACTION
    |--------------------------------------------------------------------------
    */

    const getNextAction = () => {
        if (!order) return null;

        switch (order.status) {
            case "pending":
                return {
                    status: "confirmed",
                    label: "Confirm Order",
                    icon: <CheckCircle size={18} />,
                };

            case "confirmed":
                return {
                    status: "processing",
                    label: "Start Processing",
                    icon: <Package size={18} />,
                };

            case "processing":
                return {
                    status: "ready_for_delivery",
                    label: "Mark Ready for Delivery",
                    icon: <Truck size={18} />,
                };

            default:
                return null;
        }
    };

    /*
    |--------------------------------------------------------------------------
    | UPDATE STATUS
    |--------------------------------------------------------------------------
    */

    const updateStatus = async (newStatus) => {
        try {
            setUpdating(true);
            setError("");
            setSuccess("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/seller/orders/${sellerOrderId}/status`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update order status."
                );
            }

            /*
             * Update the page immediately using the returned status.
             */
            setOrder((previousOrder) => ({
                ...previousOrder,
                status: data.data?.status || newStatus,
            }));

            setSuccess(
                data.message || "Order status updated successfully."
            );

        } catch (err) {
            setError(
                err.message || "Something went wrong while updating the order."
            );
        } finally {
            setUpdating(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="seller-order-detail-state">
                <div className="spinner-border text-dark" role="status">
                    <span className="visually-hidden">
                        Loading...
                    </span>
                </div>

                <p>Loading order details...</p>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ERROR
    |--------------------------------------------------------------------------
    */

    if (error && !order) {
        return (
            <div className="seller-order-detail-state seller-detail-error">
                <XCircle size={40} />

                <h5>Unable to Load Order</h5>

                <p>{error}</p>

                <button
                    type="button"
                    className="btn btn-dark"
                    onClick={fetchOrder}
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    const nextAction = getNextAction();

    return (
        <div className="seller-order-details-page">

            {/* ======================================================
                HEADER
            ====================================================== */}

            <div className="seller-order-details-header">

                <div>
                    <Link
                        to="/seller/orders"
                        className="seller-back-link"
                    >
                        <ArrowLeft size={17} />
                        Back to Orders
                    </Link>

                    <h2>
                        Manage Order #{order.order_id}
                    </h2>

                    <p>
                        Review the order and update its fulfillment status.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-dark seller-detail-refresh"
                    onClick={fetchOrder}
                    disabled={loading || updating}
                >
                    <RefreshCw size={16} />
                    Refresh
                </button>

            </div>


            {/* ======================================================
                SUCCESS / ERROR MESSAGE
            ====================================================== */}

            {success && (
                <div className="alert alert-success seller-detail-alert">
                    <CheckCircle size={18} />
                    {success}
                </div>
            )}

            {error && order && (
                <div className="alert alert-danger seller-detail-alert">
                    <XCircle size={18} />
                    {error}
                </div>
            )}


            <div className="seller-order-details-grid">

                {/* ==================================================
                    LEFT SIDE
                ================================================== */}

                <div className="seller-order-details-main">

                    {/* CUSTOMER */}

                    <div className="seller-detail-card">

                        <div className="seller-detail-card-header">
                            <div className="seller-detail-icon">
                                <User size={19} />
                            </div>

                            <div>
                                <h5>Customer</h5>
                                <p>Customer information</p>
                            </div>
                        </div>

                        <div className="seller-customer-details">
                            <strong>
                                {order.customer?.name ||
                                    "Unknown Customer"}
                            </strong>
                        </div>

                    </div>


                    {/* PRODUCTS */}

                    <div className="seller-detail-card">

                        <div className="seller-detail-card-header">
                            <div className="seller-detail-icon">
                                <Package size={19} />
                            </div>

                            <div>
                                <h5>Products</h5>
                                <p>
                                    Products included in your order
                                </p>
                            </div>
                        </div>


                        <div className="seller-products">

                            {order.items?.length > 0 ? (
                                order.items.map((item) => (

                                    <div
                                        className="seller-product-row"
                                        key={item.id}
                                    >

                                        <div className="seller-product-info">
                                            <strong>
                                                {item.product?.name ||
                                                    "Unknown Product"}
                                            </strong>

                                            <span>
                                                Quantity: {item.quantity}
                                            </span>
                                        </div>

                                        <div className="seller-product-price">
                                            TZS{" "}
                                            {Number(
                                                item.total_price || 0
                                            ).toLocaleString()}
                                        </div>

                                    </div>

                                ))
                            ) : (
                                <p className="text-muted">
                                    No products found.
                                </p>
                            )}

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    RIGHT SIDE
                ================================================== */}

                <div className="seller-order-details-sidebar">

                    {/* STATUS */}

                    <div className="seller-detail-card">

                        <div className="seller-detail-card-header">
                            <div className="seller-detail-icon">
                                <Clock size={19} />
                            </div>

                            <div>
                                <h5>Order Status</h5>
                                <p>Current fulfillment status</p>
                            </div>
                        </div>


                        <div className="seller-current-status">

                            <span
                                className={`seller-detail-status ${getStatusClass(
                                    order.status
                                )}`}
                            >
                                {formatStatus(order.status)}
                            </span>

                        </div>


                        {/* NEXT ACTION */}

                        {nextAction && (
                            <div className="seller-order-action">

                                <p className="seller-action-label">
                                    Next Action
                                </p>

                                <button
                                    type="button"
                                    className="seller-status-action-btn"
                                    onClick={() =>
                                        updateStatus(
                                            nextAction.status
                                        )
                                    }
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm"
                                                role="status"
                                            />

                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            {nextAction.icon}
                                            {nextAction.label}
                                        </>
                                    )}
                                </button>

                            </div>
                        )}


                        {/* READY FOR DELIVERY */}

                        {order.status === "ready_for_delivery" && (
                            <div className="seller-ready-message">
                                <Truck size={22} />

                                <div>
                                    <strong>
                                        Ready for Delivery
                                    </strong>

                                    <p>
                                        Your work on this order is
                                        complete. It can now be handled
                                        by the delivery process.
                                    </p>
                                </div>
                            </div>
                        )}


                        {/* CANCELLED */}

                        {order.status === "cancelled" && (
                            <div className="seller-cancelled-message">
                                <XCircle size={22} />

                                <div>
                                    <strong>
                                        Order Cancelled
                                    </strong>

                                    <p>
                                        No further action is required
                                        for this order.
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>


                    {/* SELLER TOTAL */}

                    <div className="seller-detail-card seller-total-card">

                        <span>Your Total</span>

                        <strong>
                            TZS{" "}
                            {Number(
                                order.seller_total || 0
                            ).toLocaleString()}
                        </strong>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default SellerOrderDetails;