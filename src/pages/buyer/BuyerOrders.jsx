import React, { useEffect, useState } from "react";
import {
    ShoppingBag,
    Package,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

import "../../pages_styles/buyer_styles/buyer-order.css";

const API_URL = import.meta.env.VITE_API_URL;

function BuyerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedOrder, setExpandedOrder] = useState(null);

    const fetchOrders = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "/login";
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API_URL}/orders`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to load orders."
                );
            }

            setOrders(result.data?.data || []);
        } catch (error) {
            console.error("Orders error:", error);

            setError(
                error.message || "Unable to load your orders."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const formatPrice = (price) => {
        return `TSh ${Number(price || 0).toLocaleString()}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-TZ", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const toggleOrder = (orderId) => {
        setExpandedOrder(
            expandedOrder === orderId ? null : orderId
        );
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "status-pending";

            case "confirmed":
                return "status-confirmed";

            case "processing":
                return "status-processing";

            case "shipped":
                return "status-shipped";

            case "delivered":
                return "status-delivered";

            case "cancelled":
                return "status-cancelled";

            default:
                return "status-default";
        }
    };

    if (loading) {
        return (
            <div className="buyer-orders-page">
                <div className="buyer-orders-state">
                    <div
                        className="spinner-border"
                        role="status"
                    ></div>

                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="buyer-orders-page">
            <div className="container">

                <div className="buyer-orders-header">
                    <div>
                        <span className="buyer-orders-label">
                            ORDERME
                        </span>

                        <h1>My Orders</h1>

                        <p>
                            View and track your orders.
                        </p>
                    </div>

                    <div className="orders-count">
                        <ShoppingBag size={18} />
                        <span>
                            {orders.length}{" "}
                            {orders.length === 1
                                ? "Order"
                                : "Orders"}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="buyer-orders-error">
                        {error}

                        <button
                            type="button"
                            onClick={fetchOrders}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!error && orders.length === 0 && (
                    <div className="buyer-orders-empty">
                        <Package size={50} />

                        <h3>No orders yet</h3>

                        <p>
                            Your orders will appear here after
                            you make a purchase.
                        </p>
                    </div>
                )}

                {!error && orders.length > 0 && (
                    <div className="orders-list">

                        {orders.map((order) => (
                            <div
                                className="order-card"
                                key={order.id}
                            >

                                <div className="order-card-header">

                                    <div>
                                        <span className="order-number">
                                            Order #{order.id}
                                        </span>

                                        <span className="order-date">
                                            {formatDate(
                                                order.created_at
                                            )}
                                        </span>
                                    </div>

                                    <span
                                        className={`order-status ${getStatusClass(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </span>

                                </div>

                                <div className="order-card-summary">

                                    <div>
                                        <span>Items</span>

                                        <strong>
                                            {order.items?.reduce(
                                                (sum, item) =>
                                                    sum +
                                                    Number(
                                                        item.quantity || 0
                                                    ),
                                                0
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Total</span>

                                        <strong>
                                            {formatPrice(
                                                order.total_amount
                                            )}
                                        </strong>
                                    </div>

                                    <button
                                        type="button"
                                        className="view-order-button"
                                        onClick={() =>
                                            toggleOrder(order.id)
                                        }
                                    >
                                        {expandedOrder ===
                                        order.id ? (
                                            <>
                                                Hide Details
                                                <ChevronUp
                                                    size={17}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                View Details
                                                <ChevronDown
                                                    size={17}
                                                />
                                            </>
                                        )}
                                    </button>

                                </div>

                                {expandedOrder ===
                                    order.id && (
                                    <div className="order-details">

                                        <h3>
                                            Order Items
                                        </h3>

                                        {order.items?.map(
                                            (item) => (
                                                <div
                                                    className="order-item"
                                                    key={item.id}
                                                >

                                                    <div className="order-item-image">
                                                        {item
                                                            .product
                                                            ?.image ? (
                                                            <img
                                                                src={
                                                                    item
                                                                        .product
                                                                        .image
                                                                }
                                                                alt={
                                                                    item
                                                                        .product
                                                                        .name
                                                                }
                                                            />
                                                        ) : (
                                                            <Package
                                                                size={
                                                                    28
                                                                }
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="order-item-info">
                                                        <h4>
                                                            {
                                                                item
                                                                    .product
                                                                    ?.name
                                                            }
                                                        </h4>

                                                        <span>
                                                            Quantity:{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>

                                                        <span>
                                                            Unit price:{" "}
                                                            {formatPrice(
                                                                item.unit_price
                                                            )}
                                                        </span>
                                                    </div>

                                                    <strong className="order-item-total">
                                                        {formatPrice(
                                                            item.total_price
                                                        )}
                                                    </strong>

                                                </div>
                                            )
                                        )}

                                    </div>
                                )}

                            </div>
                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}

export default BuyerOrders;