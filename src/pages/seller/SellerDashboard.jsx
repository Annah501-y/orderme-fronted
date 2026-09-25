import React, { useEffect, useState } from "react";
import {
    Package,
    ShoppingBag,
    Clock,
    CheckCircle,
    Plus,
    Eye,
    Store,
    RefreshCw
} from "lucide-react";

import "../../pages_styles/seller_styles/seller-dashboard.css";

function SellerDashboard() {

    const API_URL = import.meta.env.VITE_API_URL;

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [seller, setSeller] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");


    /*
     * Fetch seller dashboard data
     */
    const fetchDashboardData = async () => {

        try {

            setLoading(true);
            setError("");

            const headers = {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            };


            /*
             * Fetch seller orders
             */
            const ordersResponse = await fetch(
                `${API_URL}/seller/orders`,
                {
                    method: "GET",
                    headers
                }
            );

            if (!ordersResponse.ok) {
                throw new Error("Unable to load seller orders.");
            }

            const ordersResult = await ordersResponse.json();


            /*
             * Handle possible pagination structure
             */
            const ordersData =
                ordersResult?.data?.data ||
                ordersResult?.data ||
                [];

            setOrders(
                Array.isArray(ordersData)
                    ? ordersData
                    : []
            );


            /*
             * Fetch products
             */
            const productsResponse = await fetch(
                `${API_URL}/seller/products`,
                {
                    method: "GET",
                    headers
                }
            );

            if (!productsResponse.ok) {
                throw new Error("Unable to load products.");
            }

            const productsResult =
                await productsResponse.json();

            const productsData =
                productsResult?.data?.data ||
                productsResult?.data ||
                [];

            setProducts(
                Array.isArray(productsData)
                    ? productsData
                    : []
            );


            /*
             * Fetch seller profile
             */
            const profileResponse = await fetch(
                `${API_URL}/seller/profile`,
                {
                    method: "GET",
                    headers
                }
            );

            if (profileResponse.ok) {

                const profileResult =
                    await profileResponse.json();

                setSeller(
                    profileResult?.data ||
                    profileResult?.data?.seller ||
                    null
                );
            }

        } catch (err) {

            console.error(
                "Seller dashboard error:",
                err
            );

            setError(
                err.message ||
                "Unable to load dashboard data."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        if (token) {
            fetchDashboardData();
        } else {
            setLoading(false);
            setError("You are not authenticated.");
        }

    }, []);


    /*
     * Order status helper
     */
    const getOrderStatus = (order) => {

        return (
            order?.status ||
            order?.order_status ||
            "pending"
        )
            .toString()
            .toLowerCase();
    };


    /*
     * Dashboard statistics
     */
    const totalOrders = orders.length;

    const pendingOrders = orders.filter((order) => {

        const status = getOrderStatus(order);

        return [
            "pending",
            "processing",
            "confirmed",
            "paid",
            "preparing"
        ].includes(status);

    }).length;


    const completedOrders = orders.filter((order) => {

        const status = getOrderStatus(order);

        return [
            "completed",
            "delivered"
        ].includes(status);

    }).length;


    const activeProducts = products.filter((product) => {

        return (
                product?.is_active === true ||
                product?.is_active === 1
        );

    }).length;


    /*
     * Recent orders
     */
    const recentOrders = [...orders]
        .sort((a, b) => {

            const dateA = new Date(
                a.created_at || 0
            );

            const dateB = new Date(
                b.created_at || 0
            );

            return dateB - dateA;

        })
        .slice(0, 5);


    /*
     * Products with low stock
     */
    const lowStockProducts = products
        .filter((product) => {

            const stock = Number(
                product?.stock_quantity ??
                0
            );

            return stock <= 5;

        })
        .slice(0, 5);


    /*
     * Format currency
     */
    const formatCurrency = (amount) => {

        const value = Number(amount || 0);

        return new Intl.NumberFormat(
            "en-TZ",
            {
                style: "currency",
                currency: "TZS",
                maximumFractionDigits: 0
            }
        ).format(value);
    };


    /*
     * Format date
     */
    const formatDate = (date) => {

        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-TZ",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    /*
     * Customer name
     */
    const getCustomerName = (order) => {

        return (
            order?.user?.name ||
            order?.customer?.name ||
            order?.buyer?.name ||
            "Customer"
        );
    };


    /*
     * Store name
     */
    const storeName =
        seller?.store_name ||
        seller?.name ||
        "Your Store";


    if (loading) {

        return (
            <div className="seller-dashboard">

                <div className="dashboard-loading">

                    <RefreshCw
                        size={22}
                        className="loading-icon"
                    />

                    <span>
                        Loading dashboard...
                    </span>

                </div>

            </div>
        );

    }


    return (

        <div className="seller-dashboard">

            {/* =================================
                HEADER
            ================================= */}

            <div className="seller-dashboard-header">

                <div>

                    <p className="dashboard-label">
                        Seller Dashboard
                    </p>

                    <h1>
                        Welcome to {storeName}
                    </h1>

                    <p className="dashboard-subtitle">
                        Manage your products, orders and store performance.
                    </p>

                </div>


                <button
                    type="button"
                    className="refresh-dashboard-button"
                    onClick={fetchDashboardData}
                    title="Refresh dashboard"
                >
                    <RefreshCw size={18} />
                    Refresh
                </button>

            </div>


            {/* =================================
                ERROR
            ================================= */}

            {error && (

                <div className="dashboard-error">
                    {error}
                </div>

            )}


            {/* =================================
                STATISTICS
            ================================= */}

            <div className="seller-statistics">


                {/* PRODUCTS */}

                <div className="seller-stat-card">

                    <div className="stat-icon">
                        <Package size={21} />
                    </div>

                    <div className="stat-content">

                        <span>
                            Products
                        </span>

                        <strong>
                            {activeProducts}
                        </strong>

                    </div>

                </div>


                {/* ORDERS */}

                <div className="seller-stat-card">

                    <div className="stat-icon">
                        <ShoppingBag size={21} />
                    </div>

                    <div className="stat-content">

                        <span>
                            Total Orders
                        </span>

                        <strong>
                            {totalOrders}
                        </strong>

                    </div>

                </div>


                {/* PENDING */}

                <div className="seller-stat-card">

                    <div className="stat-icon">
                        <Clock size={21} />
                    </div>

                    <div className="stat-content">

                        <span>
                            Pending Orders
                        </span>

                        <strong>
                            {pendingOrders}
                        </strong>

                    </div>

                </div>


                {/* COMPLETED */}

                <div className="seller-stat-card">

                    <div className="stat-icon">
                        <CheckCircle size={21} />
                    </div>

                    <div className="stat-content">

                        <span>
                            Completed
                        </span>

                        <strong>
                            {completedOrders}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================
                MAIN DASHBOARD GRID
            ================================= */}

            <div className="seller-dashboard-grid">


                {/* =================================
                    RECENT ORDERS
                ================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Recent Orders
                            </h2>

                            <p>
                                Your latest customer orders
                            </p>

                        </div>


                        <button
                            type="button"
                            className="section-link"
                            onClick={() =>
                                window.location.href =
                                    "/seller/orders"
                            }
                        >
                            View all
                            <Eye size={15} />
                        </button>

                    </div>


                    {recentOrders.length === 0 ? (

                        <div className="dashboard-empty">

                            <ShoppingBag size={30} />

                            <p>
                                No orders yet.
                            </p>

                        </div>

                    ) : (

                        <div className="orders-table-wrapper">

                            <table className="seller-orders-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Order
                                        </th>

                                        <th>
                                            Customer
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {recentOrders.map(
                                        (order) => {

                                            const status =
                                                getOrderStatus(order);

                                            return (

                                                <tr
                                                    key={order.id}
                                                >

                                                    <td>
                                                        #{order.id}
                                                    </td>

                                                    <td>
                                                        {
                                                            getCustomerName(
                                                                order
                                                            )
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            formatCurrency(
                                                                order.total_amount ??
                                                                order.total ??
                                                                order.amount
                                                            )
                                                        }
                                                    </td>

                                                    <td>

                                                        <span
                                                            className={`order-status ${status}`}
                                                        >
                                                            {status}
                                                        </span>

                                                    </td>

                                                    <td>
                                                        {
                                                            formatDate(
                                                                order.created_at
                                                            )
                                                        }
                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* =================================
                    LOW STOCK
                ================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                Stock Alert
                            </h2>

                            <p>
                                Products with low stock
                            </p>

                        </div>


                        <button
                            type="button"
                            className="section-link"
                            onClick={() =>
                                window.location.href =
                                    "/seller/products"
                            }
                        >
                            Products
                            <Package size={15} />
                        </button>

                    </div>


                    {lowStockProducts.length === 0 ? (

                        <div className="dashboard-empty">

                            <CheckCircle size={30} />

                            <p>
                                All products have sufficient stock.
                            </p>

                        </div>

                    ) : (

                        <div className="low-stock-list">

                            {lowStockProducts.map(
                                (product) => {

                                    const stock =
                                        Number(
                                            product?.stock ??
                                            product?.quantity ??
                                            0
                                        );

                                    return (

                                        <div
                                            className="stock-item"
                                            key={product.id}
                                        >

                                            <div className="stock-product">

                                                <div className="stock-icon">
                                                    <Package size={18} />
                                                </div>

                                                <div>

                                                    <strong>
                                                        {
                                                            product.name ||
                                                            "Product"
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            formatCurrency(
                                                                product.price
                                                            )
                                                        }
                                                    </span>

                                                </div>

                                            </div>


                                            <span className="stock-count">
                                                {stock} left
                                            </span>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>

            </div>


            {/* =================================
                QUICK ACTIONS
            ================================= */}

            <section className="quick-actions-section">

                <div className="section-header">

                    <div>

                        <h2>
                            Quick Actions
                        </h2>

                        <p>
                            Common seller actions
                        </p>

                    </div>

                </div>


                <div className="quick-actions">

                    <button
                        type="button"
                        onClick={() =>
                            window.location.href =
                                "/seller/products"
                        }
                        className="quick-action"
                    >

                        <Package size={20} />

                        <span>
                            Manage Products
                        </span>

                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            window.location.href =
                                "/seller/orders"
                        }
                        className="quick-action"
                    >

                        <ShoppingBag size={20} />

                        <span>
                            Manage Orders
                        </span>

                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            window.location.href =
                                "/seller/store-profile"
                        }
                        className="quick-action"
                    >

                        <Store size={20} />

                        <span>
                            Store Profile
                        </span>

                    </button>


                    <button
                        type="button"
                        onClick={() =>
                            window.location.href =
                                "/seller/products"
                        }
                        className="quick-action primary"
                    >

                        <Plus size={20} />

                        <span>
                            Add Product
                        </span>

                    </button>

                </div>

            </section>

        </div>

    );
}

export default SellerDashboard;
