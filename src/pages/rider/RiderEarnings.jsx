import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    Banknote,
    CalendarDays,
    CheckCircle2,
    Clock3,
    RefreshCw,
    Wallet,
} from "lucide-react";
import "../../pages_styles/rider-styles/rider-earnings.css";

const API_URL = import.meta.env.VITE_API_URL;
const PERIODS = [
    { value: "all", label: "All time" },
    { value: "month", label: "This month" },
    { value: "30days", label: "Last 30 days" },
];

/** Format server amounts consistently as Tanzanian shillings. */
function formatMoney(amount, currency = "TZS") {
    return new Intl.NumberFormat("en-TZ", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
}

/** Display delivery timestamps in the rider's local East African time zone. */
function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString("en-TZ", {
        timeZone: "Africa/Dar_es_Salaam",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function RiderEarnings() {
    const [deliveries, setDeliveries] = useState([]);
    const [period, setPeriod] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Load the authenticated rider's own completed-delivery ledger from the API.
    const loadEarnings = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/earnings`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to load rider earnings.");
            }

            setDeliveries(Array.isArray(result.data?.earnings) ? result.data.earnings : []);
        } catch (loadError) {
            setError(loadError.message || "Unable to load rider earnings.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEarnings();
    }, [loadEarnings]);

    // Apply the selected period to both the summary cards and the delivery ledger.
    const filteredDeliveries = useMemo(() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        return deliveries.filter((delivery) => {
            const completedAt = new Date(delivery.completed_at);
            if (Number.isNaN(completedAt.getTime())) return false;
            if (period === "month") return completedAt >= monthStart;
            if (period === "30days") return completedAt >= thirtyDaysAgo;
            return true;
        });
    }, [deliveries, period]);

    const currency = filteredDeliveries[0]?.currency || deliveries[0]?.currency || "TZS";
    const summary = useMemo(() => ({
        total: filteredDeliveries.reduce((sum, delivery) => sum + (Number(delivery.payout_amount) || 0), 0),
        pending: filteredDeliveries
            .filter((delivery) => delivery.payout_status === "pending")
            .reduce((sum, delivery) => sum + (Number(delivery.payout_amount) || 0), 0),
        completed: filteredDeliveries.length,
    }), [filteredDeliveries]);

    return (
        <main className="rider-earnings-page">
            <header className="rider-earnings-header">
                <div>
                    <span className="rider-earnings-eyebrow">Rider account</span>
                    <h1>Earnings</h1>
                    <p>Track completed delivery pay and payout status.</p>
                </div>
                <button
                    className="rider-earnings-refresh"
                    type="button"
                    onClick={loadEarnings}
                    disabled={loading}
                    aria-label="Refresh earnings"
                >
                    <RefreshCw size={17} className={loading ? "is-spinning" : ""} />
                    Refresh
                </button>
            </header>

            <section className="rider-earnings-period" aria-label="Filter earnings by period">
                <CalendarDays size={18} />
                <span>Show</span>
                <div className="rider-earnings-period-options">
                    {PERIODS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={period === option.value ? "active" : ""}
                            aria-pressed={period === option.value}
                            onClick={() => setPeriod(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </section>

            {error && (
                <div className="rider-earnings-alert" role="alert">
                    <span>{error}</span>
                    <button type="button" onClick={loadEarnings} disabled={loading}>Try again</button>
                </div>
            )}

            <section className="rider-earnings-summary" aria-label="Earnings summary">
                <article className="rider-earnings-stat rider-earnings-stat-primary">
                    <span className="rider-earnings-stat-icon"><Wallet size={21} /></span>
                    <span className="rider-earnings-stat-label">Earned from completed deliveries</span>
                    <strong>{loading ? "—" : formatMoney(summary.total, currency)}</strong>
                    <small>After the platform delivery commission</small>
                </article>
                <article className="rider-earnings-stat">
                    <span className="rider-earnings-stat-icon"><Clock3 size={21} /></span>
                    <span className="rider-earnings-stat-label">Pending payout</span>
                    <strong>{loading ? "—" : formatMoney(summary.pending, currency)}</strong>
                    <small>Awaiting payout processing</small>
                </article>
                <article className="rider-earnings-stat">
                    <span className="rider-earnings-stat-icon"><CheckCircle2 size={21} /></span>
                    <span className="rider-earnings-stat-label">Completed deliveries</span>
                    <strong>{loading ? "—" : summary.completed}</strong>
                    <small>For the selected period</small>
                </article>
            </section>

            <section className="rider-earnings-ledger">
                <div className="rider-earnings-ledger-heading">
                    <div>
                        <h2>Delivery earnings</h2>
                        <p>Each entry is added after its delivery is completed.</p>
                    </div>
                    <Banknote size={21} aria-hidden="true" />
                </div>

                {loading ? (
                    <div className="rider-earnings-empty">Loading your earnings...</div>
                ) : filteredDeliveries.length === 0 ? (
                    <div className="rider-earnings-empty">
                        <span className="rider-earnings-empty-icon"><Wallet size={24} /></span>
                        <h3>No completed deliveries yet</h3>
                        <p>Your completed delivery earnings will appear here.</p>
                    </div>
                ) : (
                    <div className="rider-earnings-table-wrap">
                        <table className="rider-earnings-table">
                            <thead>
                                <tr>
                                    <th scope="col">Completed</th>
                                    <th scope="col">Delivery</th>
                                    <th scope="col">Payout</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDeliveries.map((delivery) => (
                                    <tr key={delivery.delivery_id}>
                                        <td data-label="Completed">{formatDate(delivery.completed_at)}</td>
                                        <td data-label="Delivery">
                                            <strong>Delivery #{delivery.delivery_id}</strong>
                                            <small>Order #{delivery.order_id}</small>
                                        </td>
                                        <td data-label="Payout" className="rider-earnings-amount">
                                            {formatMoney(delivery.payout_amount, delivery.currency || currency)}
                                        </td>
                                        <td data-label="Status">
                                            <span className={`rider-earnings-status ${delivery.payout_status === "paid" ? "paid" : "pending"}`}>
                                                {delivery.payout_status === "paid" ? "Paid" : "Pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <aside className="rider-earnings-payout-note">
                <div className="rider-earnings-payout-note-icon"><Banknote size={20} /></div>
                <div>
                    <strong>Keep your payout details up to date</strong>
                    <p>Manage your payout destination and verification in rider settings.</p>
                </div>
                <Link to="/rider/settings">Payout settings</Link>
            </aside>
        </main>
    );
}

export default RiderEarnings;
