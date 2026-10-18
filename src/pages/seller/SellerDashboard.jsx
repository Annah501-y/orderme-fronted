import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Activity,
    CheckCircle,
    Clock,
    Eye,
    Package,
    Plus,
    RefreshCw,
    ShoppingBag,
    Store,
} from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import "../../pages_styles/seller_styles/seller-dashboard.css";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

function getArrayFromResponse(result) {
    if (Array.isArray(result?.data?.data)) return result.data.data;
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result)) return result;
    return [];
}

function getOrderStatus(order) {
    return String(order?.status || order?.order_status || "pending").toLowerCase();
}

function getOrderDate(order) {
    const value = order?.created_at || order?.createdAt;
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function getOrderAmount(order) {
    return Number(order?.total_amount ?? order?.total ?? order?.amount ?? 0);
}

function getOrderItems(order) {
    const items = order?.items ?? order?.order_items ?? order?.orderItems;
    return Array.isArray(items) ? items : [];
}

function getWeekStart(date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return start;
}

function isCompletedOrder(order) {
    return ["completed", "delivered"].includes(getOrderStatus(order));
}

function SellerDashboard() {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const fetchDashboardData = useCallback(async () => {
        if (!token) {
            setError("You are not authenticated.");
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            setError("");

            const headers = {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            };

            const [ordersResponse, productsResponse, profileResponse] =
                await Promise.all([
                    fetch(`${API_URL}/seller/orders`, { headers }),
                    fetch(`${API_URL}/seller/products`, { headers }),
                    fetch(`${API_URL}/seller/profile`, { headers }),
                ]);

            if (!ordersResponse.ok) {
                throw new Error("Unable to load seller orders.");
            }

            if (!productsResponse.ok) {
                throw new Error("Unable to load seller products.");
            }

            const [ordersResult, productsResult] = await Promise.all([
                ordersResponse.json(),
                productsResponse.json(),
            ]);

            setOrders(getArrayFromResponse(ordersResult));
            setProducts(getArrayFromResponse(productsResult));

            if (profileResponse.ok) {
                const profileResult = await profileResponse.json();
                setSeller(
                    profileResult?.data?.seller ??
                    profileResult?.data ??
                    null
                );
            }
        } catch (fetchError) {
            console.error("Seller dashboard error:", fetchError);
            setError(fetchError.message || "Unable to load dashboard data.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-TZ", {
            style: "currency",
            currency: "TZS",
            maximumFractionDigits: 0,
        }).format(Number(amount || 0));

    const formatDate = (value) => {
        if (!value) return "Date unavailable";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "Date unavailable";

        return date.toLocaleDateString("en-TZ", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getCustomerName = (order) =>
        order?.user?.name ||
        order?.customer?.name ||
        order?.buyer?.name ||
        order?.guest_name ||
        "Customer";

    const storeName =
        seller?.store_name || seller?.name || "Your Store";

    const pendingOrders = orders.filter((order) =>
        ["pending", "processing", "confirmed", "paid", "preparing"].includes(
            getOrderStatus(order)
        )
    ).length;

    const completedOrders = orders.filter(isCompletedOrder).length;

    const activeProducts = products.filter((product) =>
        product?.is_active === true ||
        product?.is_active === 1 ||
        product?.is_active === "1"
    ).length;

    const getProductStock = (product) =>
        Number(
            product?.stock_quantity ??
            product?.stock ??
            product?.quantity ??
            0
        );

    const lowStockProducts = products
        .filter((product) => getProductStock(product) <= 5)
        .slice(0, 5);

    const completedOrdersWithDates = orders
        .filter(isCompletedOrder)
        .map((order) => ({ order, date: getOrderDate(order) }))
        .filter(({ date }) => date);

    const weeklyRevenue = useMemo(() => {
        const now = new Date();
        const thisWeekStart = getWeekStart(now);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const chartDays = Array.from({ length: 7 }, (_, index) => {
            const currentDay = new Date(thisWeekStart);
            currentDay.setDate(currentDay.getDate() + index);

            const previousDay = new Date(lastWeekStart);
            previousDay.setDate(previousDay.getDate() + index);

            const nextCurrentDay = new Date(currentDay);
            nextCurrentDay.setDate(nextCurrentDay.getDate() + 1);

            const nextPreviousDay = new Date(previousDay);
            nextPreviousDay.setDate(nextPreviousDay.getDate() + 1);

            const thisWeek = completedOrdersWithDates
                .filter(
                    ({ date }) => date >= currentDay && date < nextCurrentDay
                )
                .reduce((sum, { order }) => sum + getOrderAmount(order), 0);

            const lastWeek = completedOrdersWithDates
                .filter(
                    ({ date }) => date >= previousDay && date < nextPreviousDay
                )
                .reduce((sum, { order }) => sum + getOrderAmount(order), 0);

            return {
                day: currentDay.toLocaleDateString("en", {
                    weekday: "short",
                }),
                thisWeek,
                lastWeek,
            };
        });

        const thisWeekTotal = chartDays.reduce(
            (sum, day) => sum + day.thisWeek,
            0
        );
        const lastWeekTotal = chartDays.reduce(
            (sum, day) => sum + day.lastWeek,
            0
        );

        return { chartDays, thisWeekTotal, lastWeekTotal };
    }, [completedOrdersWithDates]);

    const topSellingProducts = useMemo(() => {
        const salesByProduct = new Map();

        orders
            .filter(isCompletedOrder)
            .forEach((order) => {
                getOrderItems(order).forEach((item) => {
                    const product = item?.product ?? item;
                    const id =
                        product?.id ??
                        item?.product_id ??
                        product?.name;

                    if (!id) return;

                    const quantity = Number(item?.quantity ?? item?.qty ?? 0);
                    const price = Number(
                        item?.unit_price ??
                        item?.price ??
                        product?.price ??
                        0
                    );

                    const current = salesByProduct.get(id) || {
                        id,
                        name: product?.name || "Product",
                        price,
                        quantity: 0,
                        amount: 0,
                        lastSoldAt: null,
                    };

                    current.quantity += quantity;
                    current.amount += quantity * price;

                    const orderDate = getOrderDate(order);
                    if (
                        orderDate &&
                        (!current.lastSoldAt ||
                            orderDate > current.lastSoldAt)
                    ) {
                        current.lastSoldAt = orderDate;
                    }

                    salesByProduct.set(id, current);
                });
            });

        return [...salesByProduct.values()]
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    }, [orders]);

    const recentOrders = useMemo(
        () =>
            [...orders]
                .sort(
                    (a, b) =>
                        (getOrderDate(b)?.getTime() || 0) -
                        (getOrderDate(a)?.getTime() || 0)
                )
                .slice(0, 5),
        [orders]
    );

    const recentSalesActivity = useMemo(
        () =>
            [...orders]
                .filter((order) =>
                    [
                        "paid",
                        "processing",
                        "confirmed",
                        "completed",
                        "delivered",
                    ].includes(getOrderStatus(order))
                )
                .sort(
                    (a, b) =>
                        (getOrderDate(b)?.getTime() || 0) -
                        (getOrderDate(a)?.getTime() || 0)
                )
                .slice(0, 5),
        [orders]
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (loading) {
        return (
            <div className="seller-dashboard">
                <div className="dashboard-loading">
                    <RefreshCw size={20} className="loading-icon" />
                    <span>Loading dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="seller-dashboard">
            <header className="seller-dashboard-header">
                <div>
                    <p className="dashboard-label"></p>
                    <h1>Welcome to {storeName}</h1>
                    <p className="dashboard-subtitle">
                        Manage your products, orders, and store performance.
                    </p>
                </div>

                <button
                    type="button"
                    className="refresh-dashboard-button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw
                        size={17}
                        className={refreshing ? "loading-icon" : ""}
                    />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </header>

            {error && <div className="dashboard-error">{error}</div>}

            <section className="seller-statistics" aria-label="Store summary">
                <div className="seller-stat-card">
                    <div className="stat-icon"><Package size={21} /></div>
                    <div className="stat-content">
                        <span>Active products</span>
                        <strong>{activeProducts}</strong>
                    </div>
                </div>

                <div className="seller-stat-card">
                    <div className="stat-icon"><ShoppingBag size={21} /></div>
                    <div className="stat-content">
                        <span>Total orders</span>
                        <strong>{orders.length}</strong>
                    </div>
                </div>

                <div className="seller-stat-card">
                    <div className="stat-icon"><Clock size={21} /></div>
                    <div className="stat-content">
                        <span>Pending orders</span>
                        <strong>{pendingOrders}</strong>
                    </div>
                </div>

                <div className="seller-stat-card">
                    <div className="stat-icon"><CheckCircle size={21} /></div>
                    <div className="stat-content">
                        <span>Completed orders</span>
                        <strong>{completedOrders}</strong>
                    </div>
                </div>
            </section>

            <section className="dashboard-section weekly-earnings">
                <div className="section-header">
                    <div>
                        <h2>Weekly Earnings</h2>
                        <p>Completed and delivered orders</p>
                    </div>
                </div>

                <div className="revenue-periods">
                    <div>
                        <span>This week</span>
                        <strong>{formatCurrency(weeklyRevenue.thisWeekTotal)}</strong>
                    </div>
                    <div>
                        <span>Last week</span>
                        <strong>{formatCurrency(weeklyRevenue.lastWeekTotal)}</strong>
                    </div>
                </div>

                {completedOrdersWithDates.length === 0 ? (
                    <div className="dashboard-empty chart-empty">
                        <p>No completed earnings to chart yet.</p>
                    </div>
                ) : (
                    <div className="revenue-chart">
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={weeklyRevenue.chartDays}>
                                <CartesianGrid
                                    stroke="#edf0f3"
                                    strokeDasharray="4 4"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    width={72}
                                    tickFormatter={(value) =>
                                        new Intl.NumberFormat("en-TZ", {
                                            notation: "compact",
                                            maximumFractionDigits: 1,
                                        }).format(value)
                                    }
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    contentStyle={{
                                        borderRadius: 10,
                                        border: "1px solid #e5e8ec",
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="thisWeek"
                                    name="This week"
                                    stroke="#b58a32"
                                    fill="#b58a32"
                                    fillOpacity={0.12}
                                    strokeWidth={2.5}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="lastWeek"
                                    name="Last week"
                                    stroke="#526477"
                                    fill="#526477"
                                    fillOpacity={0.06}
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </section>

            <div className="seller-dashboard-grid">
                <section className="dashboard-section">
                    <div className="section-header">
                        <div>
                            <h2>Recent Orders</h2>
                            <p>Your latest customer orders</p>
                        </div>
                        <a className="section-link" href="/seller/orders">
                            View all <Eye size={15} />
                        </a>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="dashboard-empty">
                            <ShoppingBag size={28} />
                            <p>No orders yet.</p>
                        </div>
                    ) : (
                        <div className="orders-table-wrapper">
                            <table className="seller-orders-table">
                                <thead>
                                    <tr>
                                        <th>Order</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => {
                                        const status = getOrderStatus(order);

                                        return (
                                            <tr key={order.id}>
                                                <td>#{order.id}</td>
                                                <td>{getCustomerName(order)}</td>
                                                <td>{formatCurrency(getOrderAmount(order))}</td>
                                                <td>
                                                    <span className={`order-status ${status}`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td>{formatDate(order.created_at)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="dashboard-section">
                    <div className="section-header">
                        <div>
                            <h2>Low Stock</h2>
                            <p>Products with five or fewer units</p>
                        </div>
                        <a className="section-link" href="/seller/products">
                            Products <Package size={15} />
                        </a>
                    </div>

                    {lowStockProducts.length === 0 ? (
                        <div className="dashboard-empty">
                            <CheckCircle size={28} />
                            <p>No low-stock products found.</p>
                        </div>
                    ) : (
                        <div className="low-stock-list">
                            {lowStockProducts.map((product) => (
                                <div className="stock-item" key={product.id}>
                                    <div className="stock-product">
                                        <div className="stock-icon">
                                            <Package size={17} />
                                        </div>
                                        <div>
                                            <strong>{product.name || "Product"}</strong>
                                            <span>{formatCurrency(product.price)}</span>
                                        </div>
                                    </div>
                                    <span className="stock-count">
                                        {getProductStock(product)} left
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <div className="seller-dashboard-grid seller-insights-grid">
                <section className="dashboard-section">
                    <div className="section-header">
                        <div>
                            <h2>Top Selling Products</h2>
                            <p>Ranked by units sold in completed orders</p>
                        </div>
                    </div>

                    {topSellingProducts.length === 0 ? (
                        <div className="dashboard-empty">
                            <Package size={28} />
                            <p>No order item data is available yet.</p>
                        </div>
                    ) : (
                        <div className="orders-table-wrapper">
                            <table className="seller-orders-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Sold</th>
                                        <th>Sales amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topSellingProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <strong>{product.name}</strong>
                                                <span className="table-subtext">
                                                    Last sold {formatDate(product.lastSoldAt)}
                                                </span>
                                            </td>
                                            <td>{formatCurrency(product.price)}</td>
                                            <td>{product.quantity}</td>
                                            <td>{formatCurrency(product.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="dashboard-section">
                    <div className="section-header">
                        <div>
                            <h2>Recent Sales Activity</h2>
                            <p>Latest paid and fulfilled orders</p>
                        </div>
                    </div>

                    {recentSalesActivity.length === 0 ? (
                        <div className="dashboard-empty">
                            <Activity size={28} />
                            <p>No sales activity yet.</p>
                        </div>
                    ) : (
                        <div className="low-stock-list">
                            {recentSalesActivity.map((order) => (
                                <div className="stock-item activity-item" key={order.id}>
                                    <div className="stock-product">
                                        <div className="stock-icon">
                                            <ShoppingBag size={16} />
                                        </div>
                                        <div>
                                            <strong>
                                                Order #{order.id} · {getCustomerName(order)}
                                            </strong>
                                            <span>
                                                {formatDate(order.created_at)} · {getOrderStatus(order)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="stock-count">
                                        {formatCurrency(getOrderAmount(order))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <section className="quick-actions-section">
                <div className="section-header">
                    <div>
                        <h2>Quick Actions</h2>
                        <p>Common seller actions</p>
                    </div>
                </div>

                <div className="quick-actions">
                    <a className="quick-action" href="/seller/products">
                        <Package size={19} />
                        <span>Manage Products</span>
                    </a>
                    <a className="quick-action" href="/seller/orders">
                        <ShoppingBag size={19} />
                        <span>Manage Orders</span>
                    </a>
                    <a className="quick-action" href="/seller/store-profile">
                        <Store size={19} />
                        <span>Store Profile</span>
                    </a>
                    <a className="quick-action primary" href="/seller/products">
                        <Plus size={19} />
                        <span>Add Product</span>
                    </a>
                </div>
            </section>
        </div>
    );
}

export default SellerDashboard;