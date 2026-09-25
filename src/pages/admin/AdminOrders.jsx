import React, { useEffect, useState } from "react";
import {
    Search,
    Eye,
    ChevronDown,
    X,
    Package,
    User,
    Store,
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
} from "lucide-react";

import "../../pages_styles/admin-styles/admin-orders.css";

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_OPTIONS = [
    "pending",
    "confirmed",
    "processing",
    "ready_for_delivery",
    "assigned",
    "picked_up",
    "out_for_delivery",
    "delivered",
    "cancelled",
];

const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-TZ", {
        style: "currency",
        currency: "TZS",
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));
};

const getStatusClass = (status) => {
    switch (status) {
        case "pending":
            return "status-pending";

        case "confirmed":
            return "status-confirmed";

        case "processing":
            return "status-processing";

        case "ready_for_delivery":
            return "status-ready";

        case "assigned":
        case "picked_up":
        case "out_for_delivery":
            return "status-delivery";

        case "delivered":
            return "status-delivered";

        case "cancelled":
            return "status-cancelled";

        default:
            return "status-default";
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case "delivered":
            return <CheckCircle size={15} />;

        case "cancelled":
            return <XCircle size={15} />;

        case "assigned":
        case "picked_up":
        case "out_for_delivery":
            return <Truck size={15} />;

        default:
            return <Clock size={15} />;
    }
};

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const token = localStorage.getItem("token");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();

            if (search.trim()) {
                params.append("search", search.trim());
            }

            if (status) {
                params.append("status", status);
            }

            const query = params.toString()
                ? `?${params.toString()}`
                : "";

            const response = await fetch(
                `${API_URL}/admin/orders${query}`,
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
                    result.message || "Failed to load orders."
                );
            }

            const orderData =
                Array.isArray(result.data)
                    ? result.data
                    : result.data?.data || [];

            setOrders(orderData);
        } catch (err) {
            setError(err.message || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [status]);

    const handleSearch = (event) => {
        event.preventDefault();
        fetchOrders();
    };

    const handleViewOrder = async (orderId) => {
        try {
            setError("");

            const response = await fetch(
                `${API_URL}/admin/orders/${orderId}`,
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
                    result.message || "Failed to load order."
                );
            }

            setSelectedOrder(result.data);
            setShowDetails(true);
        } catch (err) {
            setError(err.message || "Failed to load order details.");
        }
    };

    const getItemsCount = (order) => {
        return (order.items || []).reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        );
    };

    return (
        <div className="admin-orders-page">

            {/* HEADER */}
            <div className="admin-orders-header">
                <div>
                    <h1>Orders</h1>
                    <p>
                        Manage customer orders, sellers and delivery status.
                    </p>
                </div>

                <div className="admin-orders-count">
                    <Package size={18} />
                    <span>{orders.length} Orders</span>
                </div>
            </div>

            {/* FILTERS */}
            <div className="admin-orders-filters">

                <form
                    className="admin-orders-search"
                    onSubmit={handleSearch}
                >
                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Search order ID, customer name or email..."
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                    <button type="submit">
                        Search
                    </button>
                </form>

                <div className="admin-orders-status-filter">
                    <select
                        value={status}
                        onChange={(event) =>
                            setStatus(event.target.value)
                        }
                    >
                        <option value="">
                            All Statuses
                        </option>

                        {STATUS_OPTIONS.map((item) => (
                            <option
                                key={item}
                                value={item}
                            >
                                {formatStatus(item)}
                            </option>
                        ))}
                    </select>

                    <ChevronDown size={17} />
                </div>
            </div>

            {/* ERROR */}
            {error && (
                <div className="admin-orders-error">
                    {error}
                </div>
            )}

            {/* TABLE */}
            <div className="admin-orders-card">

                {loading ? (
                    <div className="admin-orders-loading">
                        <div className="admin-orders-spinner"></div>
                        <p>Loading orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="admin-orders-empty">
                        <Package size={42} />

                        <h3>No orders found</h3>

                        <p>
                            There are no orders matching your search.
                        </p>
                    </div>
                ) : (
                    <div className="admin-orders-table-wrapper">

                        <table className="admin-orders-table">

                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>

                                {orders.map((order) => (
                                    <tr key={order.id}>

                                        {/* ORDER */}
                                        <td>
                                            <strong>
                                                #{order.id}
                                            </strong>
                                        </td>

                                        {/* CUSTOMER */}
                                        <td>

                                            <div className="admin-order-customer">

                                                <div className="admin-order-avatar">
                                                    <User size={17} />
                                                </div>

                                                <div>

                                                    <strong>
                                                        {order.user?.name ||
                                                            "Unknown Customer"}
                                                    </strong>

                                                    <span>
                                                        {order.user?.email ||
                                                            "No email"}
                                                    </span>

                                                </div>

                                            </div>

                                        </td>

                                        {/* ITEMS */}
                                        <td>

                                            <span className="admin-order-items-count">
                                                {getItemsCount(order)} item
                                                {getItemsCount(order) !== 1
                                                    ? "s"
                                                    : ""}
                                            </span>

                                        </td>

                                        {/* TOTAL */}
                                        <td>

                                            <strong className="admin-order-total">
                                                {formatCurrency(
                                                    order.total_amount
                                                )}
                                            </strong>

                                        </td>

                                        {/* STATUS - READ ONLY */}
                                        <td>

                                            <span
                                                className={`admin-order-status ${getStatusClass(
                                                    order.status
                                                )}`}
                                            >

                                                {getStatusIcon(
                                                    order.status
                                                )}

                                                {formatStatus(
                                                    order.status
                                                )}

                                            </span>

                                        </td>

                                        {/* DATE */}
                                        <td>

                                            <span className="admin-order-date">

                                                {order.created_at
                                                    ? new Date(
                                                        order.created_at
                                                    ).toLocaleDateString(
                                                        "en-TZ",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )
                                                    : "—"}

                                            </span>

                                        </td>

                                        {/* ACTION */}
                                        <td>

                                            <button
                                                type="button"
                                                className="admin-order-view-btn"
                                                onClick={() =>
                                                    handleViewOrder(
                                                        order.id
                                                    )
                                                }
                                            >

                                                <Eye size={16} />

                                                View

                                            </button>

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* ORDER DETAILS MODAL */}
            {showDetails && selectedOrder && (

                <div
                    className="admin-order-modal-overlay"
                    onClick={() => setShowDetails(false)}
                >

                    <div
                        className="admin-order-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}
                        <div className="admin-order-modal-header">

                            <div>

                                <span>
                                    Order Details
                                </span>

                                <h2>
                                    Order #{selectedOrder.id}
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="admin-order-modal-close"
                                onClick={() =>
                                    setShowDetails(false)
                                }
                            >
                                <X size={21} />
                            </button>

                        </div>

                        {/* CUSTOMER */}
                        <div className="admin-order-detail-section">

                            <div className="admin-order-section-title">

                                <User size={18} />

                                <h3>
                                    Customer Information
                                </h3>

                            </div>

                            <div className="admin-order-customer-details">

                                <div>

                                    <span>
                                        Name
                                    </span>

                                    <strong>
                                        {selectedOrder.user?.name ||
                                            "Unknown"}
                                    </strong>

                                </div>

                                <div>

                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {selectedOrder.user?.email ||
                                            "No email"}
                                    </strong>

                                </div>

                            </div>

                        </div>

                        {/* ORDER STATUS - READ ONLY */}
                        <div className="admin-order-detail-section">

                            <div className="admin-order-section-title">

                                <Truck size={18} />

                                <h3>
                                    Order Status
                                </h3>

                            </div>

                            <div className="admin-order-status-control">

                                <span
                                    className={`admin-order-status ${getStatusClass(
                                        selectedOrder.status
                                    )}`}
                                >

                                    {getStatusIcon(
                                        selectedOrder.status
                                    )}

                                    {formatStatus(
                                        selectedOrder.status
                                    )}

                                </span>

                            </div>

                            <small className="admin-order-status-note">
                                Order status is updated automatically
                                according to the order workflow.
                            </small>

                        </div>

                        {/* PRODUCTS */}
                        <div className="admin-order-detail-section">

                            <div className="admin-order-section-title">

                                <Package size={18} />

                                <h3>
                                    Products
                                </h3>

                            </div>

                            <div className="admin-order-products">

                                {(selectedOrder.items || []).map(
                                    (item) => (

                                        <div
                                            className="admin-order-product"
                                            key={item.id}
                                        >

                                            <div className="admin-order-product-image">

                                                {item.product?.image_url ||
                                                item.product?.image ? (

                                                    <img
                                                        src={
                                                            item.product
                                                                ?.image_url ||
                                                            item.product
                                                                ?.image
                                                        }
                                                        alt={
                                                            item.product
                                                                ?.name ||
                                                            "Product"
                                                        }
                                                    />

                                                ) : (

                                                    <Package
                                                        size={25}
                                                    />

                                                )}

                                            </div>

                                            <div className="admin-order-product-info">

                                                <strong>
                                                    {item.product?.name ||
                                                        "Unknown Product"}
                                                </strong>

                                                <span>
                                                    Quantity:{" "}
                                                    {item.quantity}
                                                </span>

                                                <span>
                                                    Unit Price:{" "}
                                                    {formatCurrency(
                                                        item.unit_price
                                                    )}
                                                </span>

                                            </div>

                                            <strong className="admin-order-product-total">

                                                {formatCurrency(
                                                    item.total_price
                                                )}

                                            </strong>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                        {/* SELLERS */}
                        <div className="admin-order-detail-section">

                            <div className="admin-order-section-title">

                                <Store size={18} />

                                <h3>
                                    Sellers
                                </h3>

                            </div>

                            <div className="admin-order-sellers">

                                {(selectedOrder.seller_orders ||
                                    selectedOrder.sellerOrders ||
                                    []
                                ).map(
                                    (sellerOrder) => (

                                        <div
                                            className="admin-order-seller"
                                            key={sellerOrder.id}
                                        >

                                            <div>

                                                <strong>
                                                    {sellerOrder.seller
                                                        ?.name ||
                                                        "Unknown Seller"}
                                                </strong>

                                                <span>
                                                    Seller Order #
                                                    {sellerOrder.id}
                                                </span>

                                            </div>

                                            {/* SELLER STATUS - READ ONLY */}
                                            <div>

                                                <span
                                                    className={`admin-order-status ${getStatusClass(
                                                        sellerOrder.status
                                                    )}`}
                                                >

                                                    {getStatusIcon(
                                                        sellerOrder.status
                                                    )}

                                                    {formatStatus(
                                                        sellerOrder.status
                                                    )}

                                                </span>

                                            </div>

                                            <strong>
                                                {formatCurrency(
                                                    sellerOrder.seller_total
                                                )}
                                            </strong>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                        {/* PAYMENT / TOTAL */}
                        <div className="admin-order-summary">

                            <div className="admin-order-summary-row">

                                <span>

                                    <CreditCard size={16} />

                                    Order Total

                                </span>

                                <strong>

                                    {formatCurrency(
                                        selectedOrder.total_amount
                                    )}

                                </strong>

                            </div>

                            {selectedOrder.payments?.length > 0 && (

                                <div className="admin-order-payment-info">

                                    <strong>
                                        Payment
                                    </strong>

                                    <span>
                                        {
                                            selectedOrder
                                                .payments[0]
                                                ?.method ||
                                            "—"
                                        }
                                    </span>

                                    <span>
                                        {
                                            selectedOrder
                                                .payments[0]
                                                ?.status ||
                                            "—"
                                        }
                                    </span>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default AdminOrders;