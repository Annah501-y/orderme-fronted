import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Settings2, RefreshCw } from "lucide-react";

import "../../pages_styles/seller_styles/seller-orders.css";

const API_URL = import.meta.env.VITE_API_URL;

const SellerOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/seller/orders`,
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
                    data.message || "Failed to fetch seller orders."
                );
            }

            setOrders(data.data?.data || []);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const formatStatus = (status) => {
        if (!status) return "Unknown";

        return status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "pending":
                return "seller-status-pending";

            case "confirmed":
                return "seller-status-confirmed";

            case "processing":
                return "seller-status-processing";

            case "ready_for_delivery":
                return "seller-status-ready";

            case "cancelled":
                return "seller-status-cancelled";

            default:
                return "seller-status-default";
        }
    };

    return (
        <div className="seller-orders-page">

            {/* HEADER */}
            <div className="seller-orders-header">
                <div>
                    <h2>Orders</h2>
                    <p>
                        Manage orders containing your products.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-dark seller-refresh-btn"
                    onClick={fetchOrders}
                    disabled={loading}
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "seller-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="seller-orders-state">
                    <div className="spinner-border text-dark" role="status">
                        <span className="visually-hidden">
                            Loading...
                        </span>
                    </div>

                    <p>Loading orders...</p>
                </div>
            )}

            {/* ERROR */}
            {!loading && error && (
                <div className="seller-orders-state seller-orders-error">
                    <p>{error}</p>

                    <button
                        type="button"
                        className="btn btn-dark"
                        onClick={fetchOrders}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* EMPTY */}
            {!loading && !error && orders.length === 0 && (
                <div className="seller-orders-state">
                    <h5>No Orders Yet</h5>
                    <p>
                        Orders containing your products will appear here.
                    </p>
                </div>
            )}

            {/* ORDERS TABLE */}
            {!loading && !error && orders.length > 0 && (
                <div className="seller-orders-card">

                    <div className="table-responsive">
                        <table className="table seller-orders-table align-middle">

                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Product</th>
                                    <th>Qty</th>
                                    <th>Your Total</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.map((sellerOrder) => {

                                    const items =
                                        sellerOrder.order?.items || [];

                                    return (
                                        <tr key={sellerOrder.id}>

                                            {/* ORDER */}
                                            <td>
                                                <span className="seller-order-number">
                                                    #{sellerOrder.order_id}
                                                </span>
                                            </td>

                                            {/* CUSTOMER */}
                                            <td>
                                                <span className="seller-customer-name">
                                                    {sellerOrder.order?.user?.name ||
                                                        "Unknown Customer"}
                                                </span>
                                            </td>

                                            {/* PRODUCT */}
                                            <td>
                                                {items.length > 0 ? (
                                                    <div className="seller-product-list">
                                                        {items.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="seller-product-item"
                                                            >
                                                                {item.product?.name ||
                                                                    "Unknown Product"}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted">
                                                        No product
                                                    </span>
                                                )}
                                            </td>

                                            {/* QUANTITY */}
                                            <td>
                                                {items.length > 0 ? (
                                                    <div className="seller-quantity-list">
                                                        {items.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="seller-quantity-item"
                                                            >
                                                                {item.quantity}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>

                                            {/* SELLER TOTAL */}
                                            <td>
                                                <span className="seller-order-total">
                                                    TZS{" "}
                                                    {Number(
                                                        sellerOrder.seller_total
                                                    ).toLocaleString()}
                                                </span>
                                            </td>

                                            {/* STATUS */}
                                            <td>
                                                <span
                                                    className={`seller-order-status ${getStatusClass(
                                                        sellerOrder.status
                                                    )}`}
                                                >
                                                    {formatStatus(
                                                        sellerOrder.status
                                                    )}
                                                </span>
                                            </td>

                                            {/* ACTION */}
                                            <td>
                                                <Link
                                                    to={`/seller/orders/${sellerOrder.id}`}
                                                    className="btn btn-sm seller-manage-order-btn"
                                                >
                                                    <Settings2 size={15} />
                                                    Manage
                                                </Link>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>
                    </div>

                </div>
            )}
        </div>
    );
};

export default SellerOrders;