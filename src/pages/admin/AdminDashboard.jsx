import React, { useEffect, useState } from "react";

import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import {
    Users,
    Package,
    ShoppingBag,
    DollarSign,
    Store,
    AlertTriangle,
   
} from "lucide-react";

import "../../pages_styles/admin-styles/admin-dashboard.css";


function AdminDashboard() {

    const [dashboard, setDashboard] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /*
    |--------------------------------------------------------------------------
    | GET DASHBOARD DATA
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const fetchDashboard = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/admin/dashboard`,
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
                        "Unable to load admin dashboard."
                    );

                }


                setDashboard(result.data);

            } catch (err) {

                console.error(
                    "Admin dashboard error:",
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


        fetchDashboard();

    }, []);


    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <div className="admin-dashboard-loading">

                <div
                    className="spinner-border"
                    role="status"
                >
                    <span className="visually-hidden">
                        Loading...
                    </span>
                </div>

                <p>
                    Loading admin dashboard...
                </p>

            </div>
        );

    }


    /*
    |--------------------------------------------------------------------------
    | ERROR
    |--------------------------------------------------------------------------
    */

    if (error) {

        return (
            <div className="admin-dashboard-error">

                <AlertTriangle size={24} />

                <div>

                    <h5>
                        Unable to load dashboard
                    </h5>

                    <p>
                        {error}
                    </p>

                </div>

            </div>
        );

    }


    if (!dashboard) {
        return null;
    }


    /*
    |--------------------------------------------------------------------------
    | DATA
    |--------------------------------------------------------------------------
    */

    const summary = dashboard.summary || {};

    const ordersByStatus =
        dashboard.orders_by_status || [];

    const ordersByMonth =
        dashboard.orders_by_month || [];

    const productsByCategory =
        dashboard.products_by_category || [];

    const recentOrders =
        dashboard.recent_orders || [];

    const recentSellerApplications =
        dashboard.recent_seller_applications || [];


    /*
    |--------------------------------------------------------------------------
    | FORMAT REVENUE
    |--------------------------------------------------------------------------
    */

    const formatMoney = (amount) => {

        return new Intl.NumberFormat(
            "en-TZ",
            {
                style: "currency",
                currency: "TZS",
                maximumFractionDigits: 0,
            }
        ).format(Number(amount || 0));

    };


    /*
    |--------------------------------------------------------------------------
    | FORMAT MONTH
    |--------------------------------------------------------------------------
    */

    const formatMonth = (month) => {

        if (!month) {
            return "";
        }

        const [year, monthNumber] =
            month.split("-");

        const date = new Date(
            Number(year),
            Number(monthNumber) - 1
        );

        return date.toLocaleString(
            "en-US",
            {
                month: "short",
                year: "numeric",
            }
        );

    };


    const monthlyChartData =
        ordersByMonth.map((item) => ({
            month: formatMonth(item.month),
            orders: Number(item.orders),
            revenue: Number(item.revenue),
        }));


    const statusChartData =
        ordersByStatus.map((item) => ({
            name: item.status,
            value: Number(item.count),
        }));


    const categoryChartData =
        productsByCategory.map((item) => ({
            category: item.category,
            products: Number(item.products),
        }));


    /*
    |--------------------------------------------------------------------------
    | DASHBOARD
    |--------------------------------------------------------------------------
    */

    return (

        <div className="admin-dashboard">

            {/* ========================================
                HEADER
            ======================================== */}

            <div className="admin-dashboard-header">

                <div>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p>
                        Monitor and manage your OrderMe marketplace.
                    </p>

                </div>

            </div>


            {/* ========================================
                SUMMARY CARDS
            ======================================== */}

            <div className="admin-summary-grid">


                {/* USERS */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">

                        <Users size={22} />

                    </div>

                    <div>

                        <span className="admin-stat-label">
                            Total Users
                        </span>

                        <h3>
                            {summary.total_users || 0}
                        </h3>

                        <small>
                            {summary.total_buyers || 0} buyers
                            {" · "}
                            {summary.total_sellers || 0} sellers
                            {" . "}
                            {summary.total_admins || 0} admins
                        </small>

                    </div>

                </div>


                {/* PRODUCTS */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">

                        <Package size={22} />

                    </div>

                    <div>

                        <span className="admin-stat-label">
                            Total Products
                        </span>

                        <h3>
                            {summary.total_products || 0}
                        </h3>

                        <small>
                            {summary.active_products || 0} active
                        </small>

                    </div>

                </div>


                {/* ORDERS */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">

                        <ShoppingBag size={22} />

                    </div>

                    <div>

                        <span className="admin-stat-label">
                            Total Orders
                        </span>

                        <h3>
                            {summary.total_orders || 0}
                        </h3>

                        <small>
                            All marketplace orders
                        </small>

                    </div>

                </div>


                {/* REVENUE */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">

                        <DollarSign size={22} />

                    </div>

                    <div>

                        <span className="admin-stat-label">
                            Total Revenue
                        </span>

                        <h3>
                            {formatMoney(summary.total_revenue)}
                        </h3>

                        <small>
                            Order value
                        </small>

                    </div>

                </div>


                {/* SELLER APPLICATIONS */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">

                        <Store size={22} />

                    </div>

                    <div>

                        <span className="admin-stat-label">
                            Seller Applications
                        </span>

                        <h3>
                            {summary.pending_seller_applications || 0}
                        </h3>

                        <small>
                            Pending review
                        </small>

                    </div>

                </div>


                {/* OUT OF STOCK */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">

                        <AlertTriangle size={22} />

                    </div>

                    <div>

                        <span className="admin-stat-label">
                            Out of Stock
                        </span>

                        <h3>
                            {summary.out_of_stock_products || 0}
                        </h3>

                        <small>
                            Products need attention
                        </small>

                    </div>

                </div>


            </div>


            {/* ========================================
                GRAPHS
            ======================================== */}

            <div className="admin-charts-grid">


                {/* ORDERS TREND */}

                <div className="admin-chart-card">

                    <div className="admin-chart-header">

                        <div>

                            <h4>
                                Orders Overview
                            </h4>

                            <p>
                                Orders received over the last 12 months.
                            </p>

                        </div>

                    </div>

                    <div className="admin-chart-container">

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <LineChart
                                data={monthlyChartData}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="month"
                                />

                                <YAxis />

                                <Tooltip />

                                <Legend />

                                <Line
                                    type="monotone"
                                    dataKey="orders"
                                    name="Orders"
                                    strokeWidth={2}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                {/* REVENUE TREND */}

                <div className="admin-chart-card">

                    <div className="admin-chart-header">

                        <div>

                            <h4>
                                Revenue Overview
                            </h4>

                            <p>
                                Order revenue over the last 12 months.
                            </p>

                        </div>

                    </div>

                    <div className="admin-chart-container">

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <LineChart
                                data={monthlyChartData}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="month"
                                />

                                <YAxis />

                                <Tooltip
                                    formatter={(value) =>
                                        formatMoney(value)
                                    }
                                />

                                <Legend />

                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    name="Revenue"
                                    strokeWidth={2}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                </div>


            </div>


            {/* ========================================
                SECOND GRAPH ROW
            ======================================== */}

            <div className="admin-charts-grid">


                {/* ORDER STATUS */}

                <div className="admin-chart-card">

                    <div className="admin-chart-header">

                        <div>

                            <h4>
                                Orders By Status
                            </h4>

                            <p>
                                Current distribution of marketplace orders.
                            </p>

                        </div>

                    </div>

                    <div className="admin-chart-container">

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <PieChart>

                                <Pie
                                    data={statusChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={105}
                                    label
                                >

                                    {statusChartData.map(
                                        (entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                            />
                                        )
                                    )}

                                </Pie>

                                <Tooltip />

                                <Legend />

                            </PieChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                {/* PRODUCTS BY CATEGORY */}

                <div className="admin-chart-card">

                    <div className="admin-chart-header">

                        <div>

                            <h4>
                                Products By Category
                            </h4>

                            <p>
                                Product distribution across categories.
                            </p>

                        </div>

                    </div>

                    <div className="admin-chart-container">

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <BarChart
                                data={categoryChartData}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="category"
                                />

                                <YAxis />

                                <Tooltip />

                                <Bar
                                    dataKey="products"
                                    name="Products"
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>


            </div>


            {/* ========================================
                RECENT INFORMATION
            ======================================== */}

            <div className="admin-recent-grid">


                {/* RECENT ORDERS */}

                <div className="admin-table-card">

                    <div className="admin-table-header">

                        <div>

                            <h4>
                                Recent Orders
                            </h4>

                            <p>
                                Latest marketplace orders.
                            </p>

                        </div>

                    </div>

                    <div className="table-responsive">

                        <table className="table admin-table">

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

                                </tr>

                            </thead>

                            <tbody>

                                {recentOrders.length > 0 ? (

                                    recentOrders.map((order) => (

                                        <tr key={order.id}>

                                            <td>
                                                #{order.id}
                                            </td>

                                            <td>
                                                {order.user?.name || "Unknown"}
                                            </td>

                                            <td>
                                                {formatMoney(
                                                    order.total_amount
                                                )}
                                            </td>

                                            <td>

                                                <span className="admin-status-badge">

                                                    {order.status}

                                                </span>

                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="4"
                                            className="admin-empty-state"
                                        >
                                            No orders found.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>


                {/* SELLER APPLICATIONS */}

                <div className="admin-table-card">

                    <div className="admin-table-header">

                        <div>

                            <h4>
                                Seller Applications
                            </h4>

                            <p>
                                Recent seller applications.
                            </p>

                        </div>

                    </div>

                    <div className="table-responsive">

                        <table className="table admin-table">

                            <thead>

                                <tr>

                                    <th>
                                        Store
                                    </th>

                                    <th>
                                        Seller
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {recentSellerApplications.length > 0 ? (

                                    recentSellerApplications.map(
                                        (application) => (

                                            <tr key={application.id}>

                                                <td>
                                                    {application.store_name}
                                                </td>

                                                <td>
                                                    {
                                                        application.user?.name ||
                                                        "Unknown"
                                                    }
                                                </td>

                                                <td>

                                                    <span className="admin-status-badge">

                                                        {application.status}

                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="3"
                                            className="admin-empty-state"
                                        >
                                            No seller applications found.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>


            </div>

        </div>

    );

}


export default AdminDashboard;
