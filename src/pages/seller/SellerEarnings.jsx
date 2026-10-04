import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Banknote,
    CalendarDays,
    CheckCircle2,
    Clock3,
    RefreshCw,
    Wallet,
} from "lucide-react";
import "../../pages_styles/seller_styles/seller-earnings.css";

const API_URL = import.meta.env.VITE_API_URL;
const PERIODS = [
    { value: "all", label: "All time" },
    { value: "month", label: "This month" },
    { value: "30days", label: "Last 30 days" },
];

/** Format earnings in the currency returned by the shared earnings endpoint. */
function formatMoney(amount, currency = "TZS") {
    return new Intl.NumberFormat("en-TZ", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
}

/** Display order completion dates in the East Africa time zone. */
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

function SellerEarnings() {
    const [earnings, setEarnings] = useState([]);
    const [period, setPeriod] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // The shared endpoint determines seller access from the authenticated account role.
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
                throw new Error(result.message || "Unable to load seller earnings.");
            }

            setEarnings(Array.isArray(result.data?.earnings) ? result.data.earnings : []);
        } catch (loadError) {
            setError(loadError.message || "Unable to load seller earnings.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadEarnings();
    }, [loadEarnings]);

    // Filter totals and ledger together so each period remains internally consistent.
    const filteredEarnings = useMemo(() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        return earnings.filter((entry) => {
            const completedAt = new Date(entry.completed_at);
            if (Number.isNaN(completedAt.getTime())) return false;
            if (period === "month") return completedAt >= monthStart;
            if (period === "30days") return completedAt >= thirtyDaysAgo;
            return true;
        });
    }, [earnings, period]);

    const currency = filteredEarnings[0]?.currency || earnings[0]?.currency || "TZS";
    const summary = useMemo(() => ({
        earned: filteredEarnings.reduce((sum, entry) => sum + (Number(entry.payout_amount) || 0), 0),
        pending: filteredEarnings
            .filter((entry) => entry.payout_status === "pending")
            .reduce((sum, entry) => sum + (Number(entry.payout_amount) || 0), 0),
        completed: filteredEarnings.length,
    }), [filteredEarnings]);

    return (
        <main className="seller-earnings-page">
            <header className="seller-earnings-header">
                <div>
                    <span className="seller-earnings-eyebrow">Seller account</span>
                    <h1>Earnings</h1>
                    <p>Review net store earnings for customer orders delivered and verified by OTP.</p>
                </div>
                <button
                    className="seller-earnings-refresh"
                    type="button"
                    onClick={loadEarnings}
                    disabled={loading}
                    aria-label="Refresh earnings"
                >
                    <RefreshCw size={17} className={loading ? "is-spinning" : ""} />
                    Refresh
                </button>
            </header>

            <section className="seller-earnings-period" aria-label="Filter earnings by period">
                <CalendarDays size={18} />
                <span>Show</span>
                <div className="seller-earnings-period-options">
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
                <div className="seller-earnings-alert" role="alert">
                    <span>{error}</span>
                    <button type="button" onClick={loadEarnings} disabled={loading}>Try again</button>
                </div>
            )}

            <section className="seller-earnings-summary" aria-label="Seller earnings summary">
                <article className="seller-earnings-stat seller-earnings-stat-primary">
                    <span className="seller-earnings-stat-icon"><Wallet size={21} /></span>
                    <span className="seller-earnings-stat-label">Net earnings</span>
                    <strong>{loading ? "—" : formatMoney(summary.earned, currency)}</strong>
                    <small>After OrderMe commission</small>
                </article>
                <article className="seller-earnings-stat">
                    <span className="seller-earnings-stat-icon"><Clock3 size={21} /></span>
                    <span className="seller-earnings-stat-label">Pending payout</span>
                    <strong>{loading ? "—" : formatMoney(summary.pending, currency)}</strong>
                    <small>Awaiting payout processing</small>
                </article>
                <article className="seller-earnings-stat">
                    <span className="seller-earnings-stat-icon"><CheckCircle2 size={21} /></span>
                    <span className="seller-earnings-stat-label">Delivered orders</span>
                    <strong>{loading ? "—" : summary.completed}</strong>
                    <small>Completed and OTP verified</small>
                </article>
            </section>

            <section className="seller-earnings-ledger">
                <div className="seller-earnings-ledger-heading">
                    <div>
                        <h2>Order earnings</h2>
                        <p>Net seller payout for eligible delivered orders.</p>
                    </div>
                    <Banknote size={21} aria-hidden="true" />
                </div>

                {loading ? (
                    <div className="seller-earnings-empty">Loading your earnings...</div>
                ) : filteredEarnings.length === 0 ? (
                    <div className="seller-earnings-empty">
                        <span className="seller-earnings-empty-icon"><Wallet size={24} /></span>
                        <h3>No verified order earnings yet</h3>
                        <p>Earnings appear after the rider completes delivery and verifies the customer's OTP.</p>
                    </div>
                ) : (
                    <div className="seller-earnings-table-wrap">
                        <table className="seller-earnings-table">
                            <thead>
                                <tr>
                                    <th scope="col">Delivered</th>
                                    <th scope="col">Order</th>
                                    <th scope="col">Net payout</th>
                                    <th scope="col">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEarnings.map((entry) => (
                                    <tr key={entry.entry_id}>
                                        <td data-label="Delivered">{formatDate(entry.completed_at)}</td>
                                        <td data-label="Order">
                                            <strong>Order #{entry.order_id}</strong>
                                            <small>Store order #{entry.seller_order_id}</small>
                                        </td>
                                        <td data-label="Net payout" className="seller-earnings-amount">
                                            {formatMoney(entry.payout_amount, entry.currency || currency)}
                                        </td>
                                        <td data-label="Status">
                                            <span className={`seller-earnings-status ${entry.payout_status === "paid" ? "paid" : "pending"}`}>
                                                {entry.payout_status === "paid" ? "Paid" : "Pending"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <aside className="seller-earnings-release-note">
                <span className="seller-earnings-note-icon"><CheckCircle2 size={20} /></span>
                <div>
                    <strong>Earnings become eligible after delivery verification</strong>
                    <p>Order earnings appear only after the customer receives the order and the rider verifies the delivery OTP.</p>
                </div>
            </aside>
        </main>
    );
}

export default SellerEarnings;
