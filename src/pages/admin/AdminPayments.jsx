import React, { useEffect, useState } from "react";
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock3,
    CreditCard,
    RefreshCw,
    Search,
    XCircle,
} from "lucide-react";

import "../../pages_styles/admin-styles/admin-payments.css";

const API_URL = import.meta.env.VITE_API_URL;

const formatCurrency = (amount, currency = "TZS") =>
    new Intl.NumberFormat("en-TZ", {
        style: "currency",
        currency: currency || "TZS",
        maximumFractionDigits: 0,
    }).format(Number(amount || 0));

const formatStatus = (status = "unknown") =>
    status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (date) => {
    if (!date) return "—";
    const parsed = new Date(date);
    return Number.isNaN(parsed.getTime())
        ? "—"
        : parsed.toLocaleString("en-TZ", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
};

/** Show searchable customer payment attempts and their provider-confirmed status. */
export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState({});
    const [status, setStatus] = useState("");
    const [type, setType] = useState("payments");
    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadPayments = async (showLoader = true) => {
            try {
                if (showLoader) setLoading(true);
                if (showLoader) setError("");

                const params = new URLSearchParams({ page: String(page), type });
                if (status) params.set("status", status);
                if (appliedSearch) params.set("search", appliedSearch);

                const response = await fetch(`${API_URL}/admin/payments?${params}`, {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || "Unable to load payments.");
                }

                if (!active) return;
                setPayments(result.data?.records || []);
                setPagination({
                    current_page: result.data?.pagination?.current_page || 1,
                    last_page: result.data?.pagination?.last_page || 1,
                });
                setSummary(result.data?.summary || {});
            } catch (requestError) {
                if (active) setError(requestError.message || "Unable to load payments.");
            } finally {
                if (active && showLoader) setLoading(false);
            }
        };

        loadPayments();
        const refreshTimer = window.setInterval(() => loadPayments(false), 30000);
        return () => {
            active = false;
            window.clearInterval(refreshTimer);
        };
    }, [type, status, appliedSearch, page, refreshKey]);

    const selectType = (nextType) => {
        setType(nextType);
        setStatus("");
        setSearch("");
        setAppliedSearch("");
        setPage(1);
    };

    const submitSearch = (event) => {
        event.preventDefault();
        setPage(1);
        setAppliedSearch(search.trim());
    };

    const refresh = () => {
        setRefreshKey((current) => current + 1);
    };

    return (
        <main className="admin-payments-page">
            <header className="admin-payments-header">
                <div>
                    <h1>Payments</h1>
                    <p>Review customer collections and provider payouts for sellers and riders.</p>
                </div>
                <button className="admin-payments-refresh" type="button" onClick={refresh}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </header>

            <nav className="admin-payments-tabs" aria-label="Payment records">
                {[
                    ["payments", "Customer payments"],
                    ["seller_payouts", "Seller payouts"],
                    ["rider_payouts", "Rider payouts"],
                ].map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        className={type === value ? "active" : ""}
                        onClick={() => selectType(value)}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            <section className="admin-payments-summary" aria-label="Payment summary">
                <article className="admin-payment-summary-card">
                    <span className="summary-icon total"><CreditCard size={18} /></span>
                    <div><span>{type === "payments" ? "Total payments" : "Total payout records"}</span><strong>{Number(summary.total_count || 0).toLocaleString()}</strong></div>
                </article>
                <article className="admin-payment-summary-card">
                    <span className="summary-icon paid"><CheckCircle size={18} /></span>
                    <div><span>{type === "payments" ? "Collected amount" : "Paid out"}</span><strong>{formatCurrency(summary.paid_amount)}</strong><small>{Number(summary.paid_count || 0)} successful</small></div>
                </article>
                <article className="admin-payment-summary-card">
                    <span className="summary-icon waiting"><Clock3 size={18} /></span>
                    <div><span>{type === "payments" ? "Awaiting confirmation" : "Awaiting payout"}</span><strong>{Number(summary.awaiting_count || 0).toLocaleString()}</strong></div>
                </article>
                <article className="admin-payment-summary-card">
                    <span className="summary-icon failed"><XCircle size={18} /></span>
                    <div><span>Failed</span><strong>{Number(summary.failed_count || 0).toLocaleString()}</strong></div>
                </article>
            </section>

            <section className="admin-payments-card">
                <div className="admin-payments-toolbar">
                    <form className="admin-payments-search" onSubmit={submitSearch}>
                        <Search size={18} />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search order, customer, reference or transaction..."
                            aria-label="Search payments"
                        />
                        <button type="submit">Search</button>
                    </form>
                    <select
                        value={status}
                        onChange={(event) => { setStatus(event.target.value); setPage(1); }}
                        aria-label="Filter by payment status"
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        {type !== "payments" && <option value="queued">Queued</option>}
                        <option value="processing">Processing</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>

                {error && <div className="admin-payments-error" role="alert">{error}</div>}

                {loading ? (
                    <div className="admin-payments-empty"><RefreshCw size={22} className="payments-spinner" /> Loading payments...</div>
                ) : payments.length === 0 ? (
                    <div className="admin-payments-empty"><CreditCard size={30} /><strong>No payments found</strong><span>Try another search or status filter.</span></div>
                ) : (
                    <div className="admin-payments-table-wrap">
                        <table className="admin-payments-table">
                            <thead>
                                <tr>
                                    <th>Order / Recipient</th>
                                    <th>{type === "payments" ? "Payment method" : "Payout method"}</th>
                                    <th>{type === "payments" ? "Amount" : "Payout amount"}</th>
                                    <th>Status</th>
                                    <th>Provider reference</th>
                                    <th>Transaction ID</th>
                                    <th>Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => {
                                    return (
                                        <tr key={payment.id}>
                                            <td>
                                                <strong>Order #{payment.order_id}</strong>
                                                {type !== "payments" && <span>{type === "seller_payouts" ? "Seller order" : "Delivery"} #{payment.related_id}</span>}
                                                <span>{payment.recipient_name}</span>
                                                {payment.recipient_contact && <small>{payment.recipient_contact}</small>}
                                            </td>
                                            <td>
                                                <strong>{payment.method ? formatStatus(payment.method) : "Not configured"}</strong>
                                                <span>{formatStatus(payment.provider || "unknown")}</span>
                                            </td>
                                            <td className="payment-amount">{formatCurrency(payment.amount, payment.currency)}</td>
                                            <td>
                                                <span className={`payment-status status-${payment.status || "unknown"}`}>{formatStatus(payment.status)}</span>
                                                {payment.failure_reason && <small className="payment-failure-reason">{payment.failure_reason}</small>}
                                            </td>
                                            <td className="payment-reference">{payment.reference || "—"}</td>
                                            <td className="payment-reference">{payment.transaction_id || "—"}</td>
                                            <td>{formatDate(payment.paid_at || payment.updated_at || payment.created_at)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <footer className="admin-payments-pagination">
                    <span>Page {pagination.current_page} of {pagination.last_page}</span>
                    <div>
                        <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading}>
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <button type="button" onClick={() => setPage((current) => Math.min(pagination.last_page, current + 1))} disabled={page >= pagination.last_page || loading}>
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </footer>
            </section>
        </main>
    );
}
