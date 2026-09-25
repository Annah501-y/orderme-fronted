import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bike,
    Package,
    Clock,
    CheckCircle,
    MapPin,
    ArrowRight,
    RefreshCw,
} from "lucide-react";

import "../../pages_styles/rider-styles/rider-dashboard.css";
import PayoutMobileVerification from "../../components/PayoutMobileVerification";

const API_URL = import.meta.env.VITE_API_URL;

const RiderDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("You are not authenticated.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");
            const response = await fetch(`${API_URL}/rider/deliveries`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || "Unable to load rider deliveries.");
            }

            setDeliveries(Array.isArray(result.data) ? result.data : []);
        } catch (fetchError) {
            setError(fetchError.message || "Unable to load rider deliveries.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (parseError) {
            console.error("Unable to load rider information:", parseError);
        }
        fetchDashboard();
    }, [fetchDashboard]);

    const stats = useMemo(() => ({
        assigned: deliveries.length,
        active: deliveries.filter((delivery) =>
            ["accepted", "started"].includes(delivery.status)
        ).length,
        pending: deliveries.filter((delivery) => delivery.status === "assigned").length,
        completed: deliveries.filter((delivery) => delivery.status === "completed").length,
    }), [deliveries]);

    const currentDelivery = deliveries.find((delivery) =>
        ["accepted", "started"].includes(delivery.status)
    );
    const riderName = user?.name || "Rider";

    return (
        <div className="rider-dashboard">
            <div className="rider-dashboard-header">
                <div>
                    <h1>Welcome, {riderName}</h1>
                    <p>Manage your deliveries and rider activities from your dashboard.</p>
                </div>
                <div className="rider-status">
                    <span className="rider-status-dot"></span>
                    <span>{loading ? "Syncing" : "Delivery status"}</span>
                </div>
            </div>

            {error && (
                <div className="rider-dashboard-card" role="alert">
                    <p>{error}</p>
                    <button type="button" onClick={fetchDashboard} disabled={loading}>
                        <RefreshCw size={16} /> Retry
                    </button>
                </div>
            )}

            <div className="rider-stat-grid">
                <div className="rider-stat-card"><div className="rider-stat-icon"><Package size={22} /></div><div className="rider-stat-content"><span className="rider-stat-label">Assigned Orders</span><strong>{stats.assigned}</strong></div></div>
                <div className="rider-stat-card"><div className="rider-stat-icon"><Bike size={22} /></div><div className="rider-stat-content"><span className="rider-stat-label">Active Deliveries</span><strong>{stats.active}</strong></div></div>
                <div className="rider-stat-card"><div className="rider-stat-icon"><Clock size={22} /></div><div className="rider-stat-content"><span className="rider-stat-label">Pending Deliveries</span><strong>{stats.pending}</strong></div></div>
                <div className="rider-stat-card"><div className="rider-stat-icon"><CheckCircle size={22} /></div><div className="rider-stat-content"><span className="rider-stat-label">Completed</span><strong>{stats.completed}</strong></div></div>
            </div>

            <div className="rider-dashboard-grid">
                <div className="rider-dashboard-card">
                    <div className="rider-card-header">
                        <div><h2>Current Delivery</h2><p>Your active assignment from the delivery API.</p></div>
                        <Package size={21} />
                    </div>
                    {currentDelivery ? (
                        <div className="rider-empty-state">
                            <div className="rider-empty-icon"><MapPin size={28} /></div>
                            <h3>Order #{currentDelivery.order_id}</h3>
                            <p>Status: {currentDelivery.status}</p>
                            <button type="button" onClick={() => navigate("/rider/orders")}>View delivery</button>
                        </div>
                    ) : (
                        <div className="rider-empty-state">
                            <div className="rider-empty-icon"><MapPin size={28} /></div>
                            <h3>{loading ? "Loading deliveries..." : "No active delivery"}</h3>
                            <p>{loading ? "" : "Your assigned and completed deliveries will appear in My Deliveries."}</p>
                        </div>
                    )}
                </div>

                <div className="rider-dashboard-card">
                    <div className="rider-card-header"><div><h2>Quick Actions</h2><p>Open your delivery list.</p></div></div>
                    <div className="rider-quick-actions">
                        <button type="button" className="rider-action-button" onClick={() => navigate("/rider/orders")}>
                            <div className="rider-action-icon"><Package size={19} /></div>
                            <div><strong>My Deliveries</strong><span>View assigned deliveries</span></div>
                            <ArrowRight size={17} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="rider-availability-card">
                <div className="rider-availability-info">
                    <div className="rider-availability-icon"><Bike size={22} /></div>
                    <div><h3>Rider Availability</h3><p>Delivery assignment and availability are managed by dispatch.</p></div>
                </div>
            </div>
            <PayoutMobileVerification />
        </div>
    );
};

export default RiderDashboard;
