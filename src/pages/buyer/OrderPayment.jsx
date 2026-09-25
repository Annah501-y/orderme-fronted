import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle,
    CreditCard,
    Smartphone,
    
    LoaderCircle,
} from "lucide-react";
import "../../pages_styles/buyer_styles/payment.css"
import TanzaniaPhoneInput from "../../components/TanzaniaPhoneInput";
import { toTanzaniaPhoneNumber } from "../../utils/tanzaniaPhone";
const API_URL = import.meta.env.VITE_API_URL;

const paymentMethods = [
    {
        value: "mpesa",
        label: "M-Pesa",
        description: "Pay using Vodacom M-Pesa.",
        type: "mobile",
        requiresPhone: true,
        icon: Smartphone,
    },
    {
        value: "airtel_money",
        label: "Airtel Money",
        description: "Pay using Airtel Money.",
        type: "mobile",
        requiresPhone: true,
        icon: Smartphone,
    },
    {
        value: "yas",
        label: "Mixx by Yas",
        description: "Pay using Mixx by Yas.",
        type: "mobile",
        requiresPhone: true,
        icon: Smartphone,
    },
    {
        value: "halopesa",
        label: "HaloPesa",
        description: "Pay using HaloPesa.",
        type: "mobile",
        requiresPhone: true,
        icon: Smartphone,
    },
    {
        value: "card",
        label: "Card",
        description: "Pay using your bank card.",
        type: "card",
        requiresNumber: true,
        icon: CreditCard,
    },
 
];

const OrderPayment = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const orderFromState = location.state?.order;

    const [order, setOrder] = useState(orderFromState || null);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [paying, setPaying] = useState(false);
    const [loadingOrder, setLoadingOrder] = useState(!orderFromState);

    React.useEffect(() => {
        const fetchOrder = async () => {
            if (orderFromState) {
                setLoadingOrder(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/orders/${id}`, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message || "Unable to load order details."
                    );
                }

                setOrder(result.data);
            } catch (fetchError) {
                console.error("Fetch order error:", fetchError);
                setError(
                    fetchError.message || "Unable to load order details."
                );
            } finally {
                setLoadingOrder(false);
            }
        };

        fetchOrder();
    }, [id, orderFromState, token]);

    const selectedMethod = paymentMethods.find(
        (method) => method.value === paymentMethod
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-TZ", {
            style: "currency",
            currency: "TZS",
            maximumFractionDigits: 0,
        }).format(Number(amount || 0));
    };

    const handlePayment = async (event) => {
        event.preventDefault();

        setError("");
        setSuccessMessage("");

        if (!paymentMethod) {
            setError("Please select a payment method.");
            return;
        }

        if (selectedMethod?.requiresPhone && !phoneNumber.trim()) {
            setError(
                "Please enter the phone number registered with your mobile money service."
            );
            return;
        }

        try {
            setPaying(true);

            const paymentData = {
                method: paymentMethod,
            };

            if (selectedMethod?.requiresPhone) {
                paymentData.phone_number = toTanzaniaPhoneNumber(phoneNumber);
            }

            const response = await fetch(
                `${API_URL}/orders/${id}/payment`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(paymentData),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to initiate payment."
                );
            }

            setSuccessMessage(
                result.message || "Payment initiated successfully."
            );

            navigate(`/orders/${id}`, {
                state: {
                    paymentSuccess: true,
                    payment: result.data,
                },
            });
        } catch (paymentError) {
            console.error("Payment error:", paymentError);
            setError(
                paymentError.message || "Unable to initiate payment."
            );
        } finally {
            setPaying(false);
        }
    };

    if (loadingOrder) {
        return (
            <div className="container py-5 text-center">
                <LoaderCircle
                    size={32}
                    className="spinner-border"
                />
                <p className="mt-3 text-muted">
                    Loading order details...
                </p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    {error || "Order details could not be found."}
                </div>

                <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/orders")}
                >
                    <ArrowLeft size={18} className="me-2" />
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="container py-4 order-payment-page">
            <button
                type="button"
                className="btn btn-link text-decoration-none text-dark px-0 mb-4"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={18} className="me-2" />
                Back
            </button>

            <div className="row g-4">
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <div className="mb-4">
                                <h3 className="fw-bold mb-2">
                                    Complete Your Payment
                                </h3>

                                <p className="text-muted mb-0">
                                    Select your preferred payment method to
                                    continue with your order.
                                </p>
                            </div>

                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            {successMessage && (
                                <div className="alert alert-success d-flex align-items-center gap-2">
                                    <CheckCircle size={20} />
                                    {successMessage}
                                </div>
                            )}

                            <form onSubmit={handlePayment}>
                                <h6 className="fw-bold mb-3">
                                    Select Payment Method
                                </h6>

                                <div className="payment-method-list">
                                    {paymentMethods.map((method) => {
                                        const Icon = method.icon;
                                        const isSelected =
                                            paymentMethod === method.value;

                                        return (
                                            <button
                                                key={method.value}
                                                type="button"
                                                className={`payment-method-option ${
                                                    isSelected
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    setPaymentMethod(
                                                        method.value
                                                    );
                                                    setError("");
                                                }}
                                            >
                                                <div className="payment-method-icon">
                                                    <Icon size={22} />
                                                </div>

                                                <div className="payment-method-content">
                                                    <div className="fw-semibold">
                                                        {method.label}
                                                    </div>

                                                    <small className="text-muted">
                                                        {method.description}
                                                    </small>
                                                </div>

                                                <div
                                                    className={`payment-radio ${
                                                        isSelected
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                >
                                                    {isSelected && (
                                                        <CheckCircle
                                                            size={18}
                                                        />
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedMethod?.requiresPhone && (
                                    <div className="mt-4">
                                        <label
                                            htmlFor="phoneNumber"
                                            className="form-label fw-semibold"
                                        >
                                            Mobile Money Phone Number
                                        </label>

                                        <TanzaniaPhoneInput
                                            id="phoneNumber"
                                            className="form-control"
                                            value={phoneNumber}
                                            onChange={(event) => setPhoneNumber(event.target.value)}
                                        />

                                        <small className="text-muted">
                                            Enter the number registered with
                                            your selected mobile money
                                            service.
                                        </small>
                                    </div>
                                )}

                                <div className="alert alert-light border mt-4">
                                    <small className="text-muted">
                                        Your payment will be processed
                                        securely.
                                    </small>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-warning w-100 py-3 fw-semibold"
                                    disabled={paying || !paymentMethod}
                                >
                                    {paying ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            Processing Payment...
                                        </>
                                    ) : (
                                        "Continue to Payment"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <h5 className="fw-bold mb-4">
                                Order Summary
                            </h5>

                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">
                                    Order Number
                                </span>

                                <span className="fw-semibold">
                                    #{order.id}
                                </span>
                            </div>

                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">
                                    Order Status
                                </span>

                                <span className="badge bg-light text-dark text-capitalize">
                                    {order.status || "Pending"}
                                </span>
                            </div>

                            <hr />

                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">
                                    Subtotal
                                </span>

                                <span>
                                    {formatCurrency(order.subtotal)}
                                </span>
                            </div>

                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-muted">
                                    Delivery Fee
                                </span>

                                <span>
                                    {formatCurrency(order.delivery_fee)}
                                </span>
                            </div>

                            <hr />

                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold">
                                    Total Amount
                                </span>

                                <span className="fw-bold text-warning fs-5">
                                    {formatCurrency(order.total_amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

           
        </div>
    );
};

export default OrderPayment;
