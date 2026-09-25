import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Package,
    CheckCircle,
    Truck,
} from "lucide-react";

import "../../pages_styles/buyer_styles/checkout.css";

const API_URL =
    import.meta.env.VITE_API_URL;

function Checkout() {
    const location = useLocation();
    const navigate = useNavigate();

    const cartItemIds = location.state?.cartItemIds || [];

    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [savingAddress, setSavingAddress] = useState(false);
    const [addressError, setAddressError] = useState("");
    const [addressForm, setAddressForm] = useState({
        address_line: "", district: "", city: "", region: "", country: "Tanzania",
    });

    const [vehicleType, setVehicleType] = useState("bodaboda");
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [calculatedTotal, setCalculatedTotal] = useState(0);

    const [loading, setLoading] = useState(true);
    const [calculatingDelivery, setCalculatingDelivery] =
        useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    const [error, setError] = useState("");
    const [deliveryError, setDeliveryError] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        if (cartItemIds.length === 0) {
            navigate("/cart");
            return;
        }

        fetchCheckoutData();
    }, []);

    const fetchCheckoutData = async () => {
        try {
            setLoading(true);
            setError("");

            const headers = {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            };

            const [cartResponse, addressResponse] =
                await Promise.all([
                    fetch(`${API_URL}/cart`, {
                        headers,
                    }),
                    fetch(`${API_URL}/addresses`, {
                        headers,
                    }),
                ]);

            const cartResult = await cartResponse.json();
            const addressResult =
                await addressResponse.json();

            if (!cartResponse.ok) {
                throw new Error(
                    cartResult.message ||
                        "Unable to load your cart."
                );
            }

            if (!addressResponse.ok) {
                throw new Error(
                    addressResult.message ||
                        "Unable to load your addresses."
                );
            }

            const allCartItems =
                cartResult.data?.items || [];

            const selectedItems = allCartItems.filter(
                (item) => cartItemIds.includes(item.id)
            );

            if (selectedItems.length === 0) {
                throw new Error(
                    "The selected cart items are no longer available."
                );
            }

            setCartItems(selectedItems);

            const customerAddresses =
                addressResult.data || [];

            setAddresses(customerAddresses);

            const defaultAddress =
                customerAddresses.find(
                    (address) => address.is_default === true
                );

            if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
            } else if (customerAddresses.length > 0) {
                setSelectedAddressId(
                    customerAddresses[0].id
                );
            } else {
                setShowAddressForm(false);
            }
        } catch (error) {
            console.error(
                "Checkout data error:",
                error
            );

            setError(
                error.message ||
                    "Unable to load checkout information."
            );
        } finally {
            setLoading(false);
        }
    };

    const saveDeliveryAddress = async (event) => {
        event.preventDefault();
        setSavingAddress(true);
        setAddressError("");
        try {
            const response = await fetch(`${API_URL}/addresses`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...addressForm, is_default: addresses.length === 0 }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Unable to save this address.");

            const listResponse = await fetch(`${API_URL}/addresses`, {
                headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
            });
            const listResult = await listResponse.json();
            if (!listResponse.ok) throw new Error(listResult.message || "Address saved, but the address list could not be refreshed.");
            const savedAddresses = listResult.data || [];
            setAddresses(savedAddresses);
            const savedId = result.data?.address?.id || result.data?.id;
            setSelectedAddressId(savedId || savedAddresses[savedAddresses.length - 1]?.id || null);
            setShowAddressForm(false);
            setAddressForm({ address_line: "", district: "", city: "", region: "", country: "Tanzania" });
        } catch (saveError) {
            setAddressError(saveError.message || "Unable to save this address.");
        } finally {
            setSavingAddress(false);
        }
    };

    const subtotal = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const price = Number(
                item.product?.price || 0
            );

            const quantity = Number(
                item.quantity || 0
            );

            return total + price * quantity;
        }, 0);
    }, [cartItems]);

    const calculateDelivery = async () => {
        if (
            !selectedAddressId ||
            cartItemIds.length === 0
        ) {
            setDeliveryFee(0);
            setCalculatedTotal(subtotal);
            return;
        }

        try {
            setCalculatingDelivery(true);
            setDeliveryError("");

            const response = await fetch(
                `${API_URL}/orders/calculate-delivery`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        cart_item_ids: cartItemIds,
                        address_id: selectedAddressId,
                        vehicle_type: vehicleType,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Unable to calculate delivery fee."
                );
            }

            const deliveryData = result.data;

            setDeliveryFee(
                Number(deliveryData.delivery_fee || 0)
            );

            setCalculatedTotal(
                Number(deliveryData.total_amount || 0)
            );
        } catch (error) {
            console.error(
                "Delivery calculation error:",
                error
            );

            setDeliveryFee(0);
            setCalculatedTotal(0);

            setDeliveryError(
                error.message ||
                    "Unable to calculate delivery fee."
            );
        } finally {
            setCalculatingDelivery(false);
        }
    };

    useEffect(() => {
        if (
            !loading &&
            selectedAddressId &&
            cartItems.length > 0
        ) {
            calculateDelivery();
        }
    }, [
        selectedAddressId,
        vehicleType,
        cartItems,
    ]);

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            setError(
                "Please select a delivery address."
            );
            return;
        }

        if (!vehicleType) {
            setError(
                "Please select a delivery vehicle."
            );
            return;
        }

        if (calculatingDelivery) {
            setError(
                "Please wait while the delivery fee is calculated."
            );
            return;
        }

        if (deliveryError || calculatedTotal <= 0) {
            setError(
                "Please ensure the delivery fee has been calculated successfully."
            );
            return;
        }

        try {
            setPlacingOrder(true);
            setError("");

            const response = await fetch(
                `${API_URL}/orders/checkout`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept:
                            "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        cart_item_ids: cartItemIds,
                        address_id: selectedAddressId,
                        vehicle_type: vehicleType,
                    }),
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Unable to place your order."
                );
            }

            const order = result.data;

            /*
             * Payment will be connected here next.
             *
             * For now, go to the order page
             * after successful checkout.
             */
            navigate(`/orders/${order.id}/payment`, {
                state: {
                    order,
                    checkoutSuccess: true,
                },
            });
        } catch (error) {
            console.error(
                "Place order error:",
                error
            );

            setError(
                error.message ||
                    "Unable to place your order."
            );
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) {
        return (
            <div className="checkout-loading">
                Loading checkout...
            </div>
        );
    }

    if (error && cartItems.length === 0) {
        return (
            <div className="checkout-error">
                <p>{error}</p>

                <button
                    type="button"
                    onClick={() => navigate("/cart")}
                >
                    Back to Cart
                </button>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">

                {/* Header */}
                <div className="checkout-header">
                    <button
                        type="button"
                        className="checkout-back-button"
                        onClick={() =>
                            navigate("/cart")
                        }
                    >
                        <ArrowLeft size={18} />
                        Back to Cart
                    </button>

                    <div>
                        <h1>Checkout</h1>

                        <p>
                            Review your order and
                            choose your delivery
                            details.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <div className="checkout-grid">

                    {/* LEFT SIDE */}
                    <div className="checkout-main">

                        {/* Delivery Address */}
                        <section className="checkout-section">
                            <div className="checkout-section-header">
                                <div className="checkout-section-icon">
                                    <MapPin size={20} />
                                </div>

                                <div>
                                    <h2>
                                        Delivery Address
                                    </h2>

                                    <p>
                                        Where should we
                                        deliver your order?
                                    </p>
                                </div>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="checkout-empty-address">
                                    <MapPin size={28} />

                                    <h3>
                                        No saved address
                                    </h3>

                                    <p>
                                        Please add a delivery
                                        address before
                                        placing your order.
                                    </p>

                                    {!showAddressForm && <button type="button" onClick={() => setShowAddressForm(true)}>Add delivery address</button>}
                                </div>
                            ) : (
                                <div className="checkout-address-list">
                                    {addresses.map(
                                        (address) => (
                                            <label
                                                key={
                                                    address.id
                                                }
                                                className={`checkout-address-card ${
                                                    selectedAddressId ===
                                                    address.id
                                                        ? "selected"
                                                        : ""
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={
                                                        address.id
                                                    }
                                                    checked={
                                                        selectedAddressId ===
                                                        address.id
                                                    }
                                                    onChange={() =>
                                                        setSelectedAddressId(
                                                            address.id
                                                        )
                                                    }
                                                />

                                                <div className="checkout-address-content">
                                                    <div className="checkout-address-title">
                                                        <strong>
                                                            {
                                                                address.address_line
                                                            }
                                                        </strong>

                                                        {address.is_default && (
                                                            <span>
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p>
                                                        {
                                                            address.district
                                                        }
                                                        ,{" "}
                                                        {
                                                            address.city
                                                        }
                                                    </p>

                                                    <p>
                                                        {
                                                            address.region
                                                        }
                                                        ,{" "}
                                                        {
                                                            address.country
                                                        }
                                                    </p>
                                                </div>
                                            </label>
                                        )
                                    )}
                                </div>
                            )}
                            {addresses.length > 0 && !showAddressForm && (
                                <button className="checkout-add-address" type="button" onClick={() => setShowAddressForm(true)}>+ Add another address</button>
                            )}
                            {showAddressForm && (
                                <form className="checkout-address-form" onSubmit={saveDeliveryAddress}>
                                    <h3>{addresses.length ? "Add another delivery address" : "Where should we deliver?"}</h3>
                                    {addressError && <p className="checkout-address-error" role="alert">{addressError}</p>}
                                    <label>Street address<input required name="address_line" autoComplete="street-address" value={addressForm.address_line} onChange={(e) => setAddressForm({ ...addressForm, address_line: e.target.value })} placeholder="House, street, or landmark" /></label>
                                    <div className="checkout-address-fields">
                                        <label>District<input required name="district" value={addressForm.district} onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })} /></label>
                                        <label>City / town<input required name="city" autoComplete="address-level2" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} /></label>
                                        <label>Region<input required name="region" autoComplete="address-level1" value={addressForm.region} onChange={(e) => setAddressForm({ ...addressForm, region: e.target.value })} /></label>
                                        <label>Country<input required name="country" autoComplete="country-name" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} /></label>
                                    </div>
                                    <div className="checkout-address-form-actions">
                                        <button type="button" className="checkout-address-cancel" onClick={() => setShowAddressForm(false)}>Cancel</button>
                                        <button type="submit" disabled={savingAddress}>{savingAddress ? "Saving…" : "Save delivery address"}</button>
                                    </div>
                                </form>
                            )}
                        </section>

                        {/* Delivery Vehicle */}
                        <section className="checkout-section">
                            <div className="checkout-section-header">
                                <div className="checkout-section-icon">
                                    <Truck size={20} />
                                </div>

                                <div>
                                    <h2>
                                        Delivery Vehicle
                                    </h2>

                                    <p>
                                        Select how your order
                                        should be delivered.
                                    </p>
                                </div>
                            </div>

                            <div className="checkout-vehicle-options">

                                <label
                                    className={`checkout-vehicle-card ${
                                        vehicleType ===
                                        "bodaboda"
                                            ? "selected"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="vehicle_type"
                                        value="bodaboda"
                                        checked={
                                            vehicleType ===
                                            "bodaboda"
                                        }
                                        onChange={(event) =>
                                            setVehicleType(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <div className="checkout-vehicle-content">
                                        <strong>
                                            Bodaboda
                                        </strong>

                                        <span>
                                            400 TZS per km
                                        </span>

                                        <small>
                                            Suitable for
                                            small packages
                                        </small>
                                    </div>
                                </label>

                                <label
                                    className={`checkout-vehicle-card ${
                                        vehicleType ===
                                        "bajaji"
                                            ? "selected"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="vehicle_type"
                                        value="bajaji"
                                        checked={
                                            vehicleType ===
                                            "bajaji"
                                        }
                                        onChange={(event) =>
                                            setVehicleType(
                                                event.target.value
                                            )
                                        }
                                    />

                                    <div className="checkout-vehicle-content">
                                        <strong>
                                            Bajaji
                                        </strong>

                                        <span>
                                            600 TZS per km
                                        </span>

                                        <small>
                                            Suitable for
                                            larger packages
                                        </small>
                                    </div>
                                </label>
                            </div>

                            <p className="checkout-vehicle-note">
                                Base delivery fee is TZS
                                1,500 for the first
                                kilometer. The final fee
                                depends on the actual route.
                            </p>
                        </section>

                        {/* Products */}
                        <section className="checkout-section">
                            <div className="checkout-section-header">
                                <div className="checkout-section-icon">
                                    <Package size={20} />
                                </div>

                                <div>
                                    <h2>
                                        Order Items
                                    </h2>

                                    <p>
                                        Products you're
                                        checking out.
                                    </p>
                                </div>
                            </div>

                            <div className="checkout-items">
                                {cartItems.map(
                                    (item) => {
                                        const product =
                                            item.product;

                                        return (
                                            <div
                                                className="checkout-item"
                                                key={item.id}
                                            >
                                                <div className="checkout-item-image">
                                                    {product?.image_url ? (
                                                        <img
                                                            src={
                                                                product.image_url
                                                            }
                                                            alt={
                                                                product.name
                                                            }
                                                        />
                                                    ) : (
                                                        <Package
                                                            size={
                                                                32
                                                            }
                                                        />
                                                    )}
                                                </div>

                                                <div className="checkout-item-info">
                                                    <h3>
                                                        {
                                                            product?.name
                                                        }
                                                    </h3>

                                                    <p>
                                                        Quantity:{" "}
                                                        {
                                                            item.quantity
                                                        }
                                                    </p>

                                                    <strong>
                                                        TSh{" "}
                                                        {Number(
                                                            product?.price ||
                                                                0
                                                        ).toLocaleString()}
                                                    </strong>
                                                </div>

                                                <div className="checkout-item-total">
                                                    TSh{" "}
                                                    {(
                                                        Number(
                                                            product?.price ||
                                                                0
                                                        ) *
                                                        Number(
                                                            item.quantity ||
                                                                0
                                                        )
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </section>
                    </div>

                    {/* RIGHT SIDE */}
                    <aside className="checkout-summary">
                        <div className="checkout-summary-card">
                            <h2>
                                Order Summary
                            </h2>

                            <div className="checkout-summary-row">
                                <span>
                                    Items
                                </span>

                                <span>
                                    {cartItems.length}
                                </span>
                            </div>

                            <div className="checkout-summary-row">
                                <span>
                                    Product subtotal
                                </span>

                                <span>
                                    TSh{" "}
                                    {subtotal.toLocaleString()}
                                </span>
                            </div>

                            <div className="checkout-summary-row">
                                <span>
                                    Delivery fee
                                </span>

                                <span>
                                    {calculatingDelivery
                                        ? "Calculating..."
                                        : deliveryError
                                        ? "Unavailable"
                                        : `TSh ${deliveryFee.toLocaleString()}`}
                                </span>
                            </div>

                            <div className="checkout-summary-divider"></div>

                            <div className="checkout-summary-total">
                                <span>
                                    Total amount to pay
                                </span>

                                <strong>
                                    {calculatingDelivery
                                        ? "Calculating..."
                                        : `TSh ${calculatedTotal.toLocaleString()}`}
                                </strong>
                            </div>

                            <button
                                type="button"
                                className="checkout-place-order"
                                onClick={
                                    handlePlaceOrder
                                }
                                disabled={
                                    placingOrder ||
                                    calculatingDelivery ||
                                    addresses.length ===
                                        0 ||
                                    !selectedAddressId ||
                                    !!deliveryError ||
                                    calculatedTotal <= 0
                                }
                            >
                                <CheckCircle
                                    size={19}
                                />

                                {placingOrder
                                    ? "Placing Order..."
                                    : "Place Order"}
                            </button>

                            <p className="checkout-payment-note">
                                After placing your order,
                                you will proceed to
                                 payment.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
