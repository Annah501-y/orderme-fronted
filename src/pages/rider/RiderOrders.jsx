import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    ChevronRight,
    Package,
    Clock,
    CheckCircle2,
    Circle,
    Truck,
    User,
} from "lucide-react";
import "../../pages_styles/rider-styles/rider-order.css";

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_STEPS = [
    { key: "assigned", label: "Assigned" },
    { key: "accepted", label: "Accepted" },
    { key: "started", label: "Started" },
    { key: "completed", label: "Completed" },
];

const STATUS_LABELS = {
    assigned: "Assigned",
    accepted: "Accepted",
    started: "Started",
    completed: "Completed",
    arrived: "Arrived",
    cancelled: "Cancelled",
};

function getStatusLabel(status) {
    return STATUS_LABELS[status] || status?.replaceAll("_", " ") || "Unknown";
}

function getStatusClass(status) {
    switch (status) {
        case "assigned":
            return "status-assigned";

        case "accepted":
            return "status-accepted";

        case "arrived":
            return "status-picking";

        case "started":
            return "status-transit";

        case "completed":
            return "status-delivered";

        case "cancelled":
            return "status-cancelled";

        default:
            return "";
    }
}

function getActiveStep(status) {
    const index = STATUS_STEPS.findIndex(
        (step) => step.key === status
    );

    return index === -1 ? 0 : index;
}

function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-TZ", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatMoney(amount) {
    if (amount === null || amount === undefined) {
        return "—";
    }

    return Number(amount).toLocaleString("en-TZ", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function getDeliveryCategory(delivery) {
    const status = delivery.status;

    if (status === "completed") {
        return "completed";
    }

    if (status === "assigned") {
        return "upcoming";
    }

    if (status === "cancelled") {
        return "completed";
    }

    return "active";
}

const RiderOrders = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [activeTab, setActiveTab] = useState("active");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedDelivery, setExpandedDelivery] = useState(null);
    const [busyAction, setBusyAction] = useState("");
    const [otpSession, setOtpSession] = useState(null);
    const reportedArrivalIds = useRef(new Set());

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                // This endpoint returns normalized pickup stops and customer contact fields.
                `${API_URL}/rider/orders`,
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
                    result.message || "Failed to load deliveries."
                );
            }

            setDeliveries(result.data || []);
        } catch (err) {
            console.error("Failed to fetch rider deliveries:", err);
            setError(
                err.message || "Unable to load your deliveries."
            );
        } finally {
            setLoading(false);
        }
    };

    const stats = useMemo(() => {
        return {
            total: deliveries.length,

            active: deliveries.filter(
                (delivery) =>
                    getDeliveryCategory(delivery) === "active"
            ).length,

            upcoming: deliveries.filter(
                (delivery) =>
                    getDeliveryCategory(delivery) === "upcoming"
            ).length,

            completed: deliveries.filter(
                (delivery) =>
                    getDeliveryCategory(delivery) === "completed"
            ).length,
        };
    }, [deliveries]);

    const filteredDeliveries = useMemo(() => {
        return deliveries.filter(
            (delivery) =>
                getDeliveryCategory(delivery) === activeTab
        );
    }, [deliveries, activeTab]);

    const openRoute = (delivery) => {
        const stops = (delivery.stops || []).filter(
            (stop) => stop.type === "pickup"
        );

        const locations = [
            ...stops.map((stop) =>
                stop.location?.latitude != null &&
                stop.location?.longitude != null
                    ? `${stop.location.latitude},${stop.location.longitude}`
                    : null
            ),
            delivery.customer_address?.latitude &&
            delivery.customer_address?.longitude
                ? `${delivery.customer_address.latitude},${delivery.customer_address.longitude}`
                : null,
        ].filter(Boolean);

        if (locations.length === 0) {
            return;
        }

        const destination = locations[locations.length - 1];
        const waypoints = locations.slice(0, -1).join("|");

        const url =
            `https://www.google.com/maps/dir/?api=1` +
            `&destination=${encodeURIComponent(destination)}` +
            (waypoints
                ? `&waypoints=${encodeURIComponent(waypoints)}`
                : "");

        window.open(url, "_blank", "noopener,noreferrer");
    };

    const toggleDetails = (deliveryId) => {
        setExpandedDelivery((current) =>
            current === deliveryId ? null : deliveryId
        );
    };

    // Apply rider delivery and stop changes through the authenticated API.
    const updateRiderStatus = async (endpoint, status, actionKey) => {
        setBusyAction(actionKey);
        setError("");

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: "PUT",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Unable to update delivery status.");
            await fetchDeliveries();
        } catch (actionError) {
            setError(actionError.message || "Unable to update delivery status.");
        } finally {
            setBusyAction("");
        }
    };

    // Send GPS updates while a delivery is active so the backend can detect arrival and send the OTP.
    const activeDeliveryIds = deliveries
        .filter((delivery) => delivery.status === "started")
        .map((delivery) => delivery.delivery_id)
        .join(",");

    useEffect(() => {
        if (!activeDeliveryIds || !navigator.geolocation) return undefined;

        let updateInProgress = false;
        const watchId = navigator.geolocation.watchPosition(async (position) => {
            if (updateInProgress) return;
            updateInProgress = true;

            try {
                const response = await fetch(`${API_URL}/rider/location`, {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Unable to update rider location.");

                const newlyArrived = (result.data?.arrived_deliveries || [])
                    .filter((item) => item.otp_sent && !reportedArrivalIds.current.has(item.delivery_id));

                if (newlyArrived.length) {
                    newlyArrived.forEach((item) => reportedArrivalIds.current.add(item.delivery_id));
                    setOtpSession({
                        deliveryId: newlyArrived[0].delivery_id,
                        code: "",
                        message: "Your arrival was detected. The 6-digit OTP was sent to the customer's phone and expires in 10 minutes.",
                    });
                    await fetchDeliveries();
                }
            } catch (locationError) {
                setError(locationError.message || "Unable to track rider arrival.");
            } finally {
                updateInProgress = false;
            }
        }, (locationError) => {
            setError(`GPS arrival tracking is unavailable: ${locationError.message}`);
        }, {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 15000,
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, [activeDeliveryIds]);

    // Verify the code the customer received; only the successful API response completes delivery.
    const verifyCustomerOtp = async (event, deliveryId) => {
        event.preventDefault();
        const actionKey = `otp-verify-${deliveryId}`;
        setBusyAction(actionKey);
        setError("");

        try {
            const response = await fetch(`${API_URL}/rider/deliveries/${deliveryId}/otp/verify`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ otp: otpSession?.code || "" }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "The customer OTP could not be verified.");

            setOtpSession(null);
            await fetchDeliveries();
        } catch (otpError) {
            setError(otpError.message || "The customer OTP could not be verified.");
        } finally {
            setBusyAction("");
        }
    };

    if (loading) {
        return (
            <div className="rider-orders-page">
                <div className="rider-orders-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your deliveries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rider-orders-page">
            <div className="rider-orders-header">
                <div>
                    <h1>My Deliveries</h1>
                    <p>
                        Manage your assigned deliveries and pickup stops.
                    </p>
                </div>
            </div>

            {error && (
                <div className="rider-orders-error">
                    {error}
                    <button onClick={fetchDeliveries}>Retry</button>
                </div>
            )}

            <div className="rider-delivery-stats">
                <div className="delivery-stat-card">
                    <div className="delivery-stat-icon">
                        <Package size={21} />
                    </div>
                    <div>
                        <span>Total Deliveries</span>
                        <strong>{stats.total}</strong>
                    </div>
                </div>

                <div className="delivery-stat-card">
                    <div className="delivery-stat-icon">
                        <Truck size={21} />
                    </div>
                    <div>
                        <span>Active</span>
                        <strong>{stats.active}</strong>
                    </div>
                </div>

                <div className="delivery-stat-card">
                    <div className="delivery-stat-icon">
                        <Clock size={21} />
                    </div>
                    <div>
                        <span>Upcoming</span>
                        <strong>{stats.upcoming}</strong>
                    </div>
                </div>

                <div className="delivery-stat-card">
                    <div className="delivery-stat-icon">
                        <CheckCircle2 size={21} />
                    </div>
                    <div>
                        <span>Completed</span>
                        <strong>{stats.completed}</strong>
                    </div>
                </div>
            </div>

            <div className="rider-delivery-tabs">
                <button
                    className={activeTab === "active" ? "active" : ""}
                    onClick={() => setActiveTab("active")}
                >
                    Active
                    <span>{stats.active}</span>
                </button>

                <button
                    className={activeTab === "upcoming" ? "active" : ""}
                    onClick={() => setActiveTab("upcoming")}
                >
                    Upcoming
                    <span>{stats.upcoming}</span>
                </button>

                <button
                    className={activeTab === "completed" ? "active" : ""}
                    onClick={() => setActiveTab("completed")}
                >
                    Completed
                    <span>{stats.completed}</span>
                </button>
            </div>

            {filteredDeliveries.length === 0 ? (
                <div className="empty-deliveries">
                    <Package size={42} />
                    <h3>No deliveries found</h3>
                    <p>There are no deliveries in this category right now.</p>
                </div>
            ) : (
                <div className="rider-delivery-list">
                    {filteredDeliveries.map((delivery) => {
                        const activeStep = getActiveStep(delivery.status);
                        const isExpanded =
                            expandedDelivery === delivery.delivery_id;
                        const stops = (delivery.stops || []).filter(
                            (stop) => stop.type === "pickup"
                        );
                        const customerStop = (delivery.stops || []).find(
                            (stop) => stop.type === "delivery"
                        );
                        const allPickupsCompleted = stops.every(
                            (stop) => stop.status === "completed"
                        );

                        return (
                            <div
                                className="rider-delivery-card"
                                key={delivery.delivery_id}
                            >
                                <div className="delivery-card-header">
                                    <div>
                                        <div className="delivery-number">
                                            Order #{delivery.order_id}
                                        </div>
                                        <div className="delivery-time">
                                            {delivery.order_delivery_count > 1
                                                ? `Delivery ${delivery.order_delivery_number} of ${delivery.order_delivery_count} for this order · `
                                                : "Customer delivery · "}
                                            Assigned{" "}
                                            {formatDate(delivery.assigned_at)}
                                        </div>
                                    </div>

                                    <span
                                        className={`delivery-status ${getStatusClass(
                                            delivery.status
                                        )}`}
                                    >
                                        {getStatusLabel(delivery.status)}
                                    </span>
                                </div>

                                <div className="delivery-route-summary">
                                    <div className="route-summary-item">
                                        <div className="route-summary-icon pickup">
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <span>Pickup stops</span>
                                            <strong>
                                                {stops.length} Store
                                                {stops.length !== 1 ? "s" : ""}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="route-summary-arrow">
                                        <ChevronRight size={20} />
                                    </div>

                                    <div className="route-summary-item">
                                        <div className="route-summary-icon customer">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <span>Customer</span>
                                            <strong>
                                                {delivery.customer?.name ||
                                                    "Customer details unavailable"}
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                {(delivery.status === "assigned" || delivery.status === "accepted") && (
                                    <div className="rider-delivery-actions">
                                        <button
                                            type="button"
                                            className="rider-action-primary"
                                            disabled={Boolean(busyAction)}
                                            onClick={() => updateRiderStatus(
                                                `/rider/deliveries/${delivery.delivery_id}`,
                                                delivery.status === "assigned" ? "accepted" : "started",
                                                `delivery-${delivery.delivery_id}`
                                            )}
                                        >
                                            {busyAction === `delivery-${delivery.delivery_id}`
                                                ? "Please wait..."
                                                : delivery.status === "assigned" ? "Accept delivery" : "Start delivery"}
                                        </button>
                                    </div>
                                )}

                                <div className="delivery-section">
                                    <div className="section-heading">
                                        <h3>
                                            Pickup{" "}
                                            {stops.length > 1 ? "Stops" : "Stop"}
                                        </h3>
                                        <span>
                                            {stops.length} stop
                                            {stops.length !== 1 ? "s" : ""}
                                        </span>
                                    </div>

                                    <div className="pickup-list">
                                        {stops.map((stop) => (
                                            <div
                                                className="pickup-card"
                                                key={stop.stop_id}
                                            >
                                                <div className="pickup-sequence">
                                                    {stop.sequence}
                                                </div>

                                                <div className="pickup-content">
                                                    <div className="pickup-top">
                                                        <div>
                                                            <h4>
                                                                Store{" "}
                                                                {stop.sequence}
                                                            </h4>
                                                            <p className="seller-name">
                                                                {stop.seller?.name ||
                                                                    "Store name unavailable"}
                                                            </p>
                                                        </div>

                                                        <span
                                                            className={`stop-status ${getStatusClass(
                                                                stop.status
                                                            )}`}
                                                        >
                                                            {getStatusLabel(
                                                                stop.status
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="pickup-location">
                                                        <MapPin size={16} />
                                                        <span>
                                                            {stop.location
                                                                ?.address ||
                                                                "Pickup address unavailable"}
                                                        </span>
                                                    </div>

                                                    {stop.seller?.phone ? (
                                                        <a
                                                            href={`tel:${stop.seller.phone}`}
                                                            className="phone-link"
                                                            aria-label={`Call ${
                                                                stop.seller.name ||
                                                                "the store"
                                                            } at ${stop.seller.phone}`}
                                                        >
                                                            <Phone size={15} />
                                                            <span className="contact-label">
                                                                Store phone:
                                                            </span>
                                                            {stop.seller.phone}
                                                        </a>
                                                    ) : (
                                                        <p className="contact-unavailable">
                                                            Store phone unavailable
                                                        </p>
                                                    )}

                                                    {delivery.status === "started" && stop.status !== "completed" && (
                                                        <div className="rider-stop-actions">
                                                            <button
                                                                type="button"
                                                                className="rider-action-secondary"
                                                                disabled={Boolean(busyAction)}
                                                                onClick={() => updateRiderStatus(
                                                                    `/rider/delivery-stops/${stop.stop_id}`,
                                                                    stop.status === "pending" ? "arrived" : "completed",
                                                                    `stop-${stop.stop_id}`
                                                                )}
                                                            >
                                                                {busyAction === `stop-${stop.stop_id}`
                                                                    ? "Please wait..."
                                                                    : stop.status === "pending" ? "Arrived at store" : "Confirm pickup"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="delivery-section customer-section">
                                    <div className="section-heading">
                                        <h3>Customer</h3>
                                    </div>

                                    <div className="customer-card">
                                        <div className="customer-avatar">
                                            <User size={21} />
                                        </div>

                                        <div className="customer-info">
                                            <h4>
                                                {delivery.customer?.name ||
                                                    "Customer name unavailable"}
                                            </h4>

                                            {delivery.customer?.phone ? (
                                                <a
                                                    href={`tel:${delivery.customer.phone}`}
                                                    className="customer-phone"
                                                    aria-label={`Call customer at ${delivery.customer.phone}`}
                                                >
                                                    <Phone size={15} />
                                                    <span className="contact-label">
                                                        Reachable phone:
                                                    </span>
                                                    {delivery.customer.phone}
                                                </a>
                                            ) : (
                                                <p className="contact-unavailable">
                                                    Reachable phone number unavailable
                                                </p>
                                            )}

                                            <div className="customer-address">
                                                <MapPin size={16} />
                                                <span>
                                                    {delivery.customer_address
                                                        ?.full_address ||
                                                        "Customer address unavailable"}
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                <div className="delivery-progress-section">
                                    <div className="section-heading">
                                        <h3>Delivery Progress</h3>
                                    </div>

                                    {delivery.status === "cancelled" ? (
                                        <div className="cancelled-progress">
                                            <Circle size={18} />
                                            <span>
                                                This delivery has been cancelled.
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="status-timeline">
                                            {STATUS_STEPS.map((step, index) => {
                                                const completed =
                                                    index < activeStep;
                                                const current =
                                                    index === activeStep;

                                                return (
                                                    <div
                                                        className={`timeline-step ${
                                                            completed
                                                                ? "completed"
                                                                : ""
                                                        } ${
                                                            current
                                                                ? "current"
                                                                : ""
                                                        }`}
                                                        key={step.key}
                                                    >
                                                        <div className="timeline-dot">
                                                            {completed ? (
                                                                <CheckCircle2
                                                                    size={17}
                                                                />
                                                            ) : current ? (
                                                                <Truck
                                                                    size={16}
                                                                />
                                                            ) : (
                                                                <Circle
                                                                    size={15}
                                                                />
                                                            )}
                                                        </div>

                                                        <span>{step.label}</span>

                                                        {index <
                                                            STATUS_STEPS.length -
                                                                1 && (
                                                            <div className="timeline-line"></div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="delivery-card-footer">
                                    <button
                                        type="button"
                                        className="route-button"
                                        onClick={() => openRoute(delivery)}
                                    >
                                        <Navigation size={17} />
                                        View Route
                                    </button>

                                    <button
                                        type="button"
                                        className="details-button"
                                        onClick={() =>
                                            toggleDetails(delivery.delivery_id)
                                        }
                                    >
                                        {isExpanded
                                            ? "Hide Details"
                                            : "View Details"}

                                        <ChevronRight
                                            size={17}
                                            className={
                                                isExpanded ? "rotate" : ""
                                            }
                                        />
                                    </button>
                                </div>

                                {isExpanded && (
                                    <div className="delivery-details">
                                        <div>
                                            <span>Delivery ID</span>
                                            <strong>
                                                #{delivery.delivery_id}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Order ID</span>
                                            <strong>#{delivery.order_id}</strong>
                                        </div>

                                        <div>
                                            <span>Assigned</span>
                                            <strong>
                                                {formatDate(delivery.assigned_at)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Accepted</span>
                                            <strong>
                                                {formatDate(delivery.accepted_at)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Started</span>
                                            <strong>
                                                {formatDate(delivery.started_at)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Completed</span>
                                            <strong>
                                                {formatDate(delivery.completed_at)}
                                            </strong>
                                        </div>

                                        {/* OTP verification belongs with delivery details and is available after every pickup is complete and the rider has arrived. */}
                                        {delivery.status === "completed" ? (
                                            <div className="rider-otp-panel rider-otp-details">
                                                <p role="status">This delivery is marked complete. OTP entry is only available before a delivery is completed.</p>
                                            </div>
                                        ) : delivery.status === "started" && customerStop && customerStop.status !== "completed" ? (
                                            <div className="rider-otp-panel rider-otp-details">
                                                {customerStop.status !== "arrived" ? (
                                                    <p className="rider-otp-hint">
                                                        {allPickupsCompleted
                                                            ? "Waiting for backend GPS arrival detection. The customer OTP will be sent automatically when the rider is within 100 metres of the saved delivery address."
                                                            : "Complete every store pickup. GPS arrival detection and automatic OTP sending begin after all pickups are complete."}
                                                    </p>
                                                ) : allPickupsCompleted ? (
                                                    <>
                                                        <p role="status">
                                                            {otpSession?.deliveryId === delivery.delivery_id && otpSession.message
                                                                ? otpSession.message
                                                                : "The backend detected arrival and sent a 6-digit OTP to the customer's phone. It expires in 10 minutes."}
                                                        </p>
                                                        <form className="rider-otp-form" onSubmit={(event) => verifyCustomerOtp(event, delivery.delivery_id)}>
                                                            <label htmlFor={`customer-otp-${delivery.delivery_id}`}>Enter customer's 6-digit delivery code</label>
                                                            <input
                                                                id={`customer-otp-${delivery.delivery_id}`}
                                                                inputMode="numeric"
                                                                autoComplete="one-time-code"
                                                                maxLength={6}
                                                                value={otpSession?.deliveryId === delivery.delivery_id ? otpSession.code : ""}
                                                                onChange={(event) => {
                                                                    const code = event.target.value.replace(/\D/g, "").slice(0, 6);
                                                                    setOtpSession((current) => ({
                                                                        deliveryId: delivery.delivery_id,
                                                                        code,
                                                                        message: current?.deliveryId === delivery.delivery_id ? current.message : "",
                                                                    }));
                                                                }}
                                                                required
                                                            />
                                                            <button type="submit" className="rider-action-primary" disabled={Boolean(busyAction) || otpSession?.deliveryId !== delivery.delivery_id || otpSession.code.length !== 6}>
                                                                {busyAction === `otp-verify-${delivery.delivery_id}` ? "Verifying..." : "Verify code and complete this delivery"}
                                                            </button>
                                                        </form>
                                                    </>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RiderOrders;
