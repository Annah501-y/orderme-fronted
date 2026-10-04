import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, MapPin, Package, Truck } from "lucide-react";
import { fetchAllProducts, getProductImageUrl } from "../../api/marketplace";
import AddressLocationPicker from "../../components/AddressLocationPicker";
import { toTanzaniaPhoneNumber } from "../../utils/tanzaniaPhone";
import "../../pages_styles/buyer_styles/checkout.css";

const API_URL = import.meta.env.VITE_API_URL;
// Keep the guest cart in browser storage until its items are submitted to the server.
const GUEST_CART_KEY = "orderme_guest_cart";

function GuestCheckout({ cartItemIds = [] }) {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState("");
    const [quoteError, setQuoteError] = useState("");
    const [quote, setQuote] = useState(null);
    const [vehicleType, setVehicleType] = useState("bodaboda");
    const [form, setForm] = useState({
        name: "",
        phone: "",
        address_line: "",
        district: "",
        city: "",
        region: "",
        country: "Tanzania",
        latitude: "",
        longitude: "",
    });

    useEffect(() => {
        let current = true;
        async function loadGuestCart() {
            try {
                // Restore only the selected cart rows, then hydrate them from the public catalog.
                const stored = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
                const selectedIds = cartItemIds.length
                    ? new Set(cartItemIds.map(String))
                    : new Set(stored.map((item) => `guest-${item.product_id}`));
                const products = await fetchAllProducts();
                const productById = new Map(products.map((product) => [Number(product.id), product]));
                const checkoutItems = stored
                    .filter((entry) => selectedIds.has(`guest-${entry.product_id}`) || selectedIds.has(String(entry.product_id)))
                    .map((entry) => {
                        const product = productById.get(Number(entry.product_id));
                        if (!product) return null;
                        return {
                            id: `guest-${product.id}`,
                            product_id: product.id,
                            quantity: Number(entry.quantity || 1),
                            product: {
                                ...product,
                                image_url: getProductImageUrl(product),
                            },
                        };
                    })
                    .filter(Boolean);

                if (current) {
                    setItems(checkoutItems);
                    if (checkoutItems.length === 0) setError("Your selected guest cart items could not be found.");
                }
            } catch (loadError) {
                if (current) setError(loadError.message || "Unable to load your guest cart.");
            } finally {
                if (current) setLoading(false);
            }
        }
        loadGuestCart();
        return () => { current = false; };
    }, [cartItemIds]);

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.quantity, 0),
        [items]
    );

    useEffect(() => {
        const addressReady = ["address_line", "district", "city", "region", "country"]
            .every((field) => form[field].trim())
            && form.latitude !== ""
            && form.longitude !== "";
        // Never allow a quote for an earlier address or vehicle choice to be submitted.
        setQuote(null);
        if (!addressReady || items.length === 0) {
            setQuoteError("");
            return undefined;
        }

        let current = true;
        const timer = window.setTimeout(async () => {
            try {
                setQuoteError("");
                const response = await fetch(`${API_URL}/guest/orders/calculate-delivery`, {
                    method: "POST",
                    headers: { Accept: "application/json", "Content-Type": "application/json" },
                    body: JSON.stringify({
                        items: items.map(({ product_id, quantity }) => ({ product_id, quantity })),
                        ...form,
                        vehicle_type: vehicleType,
                    }),
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Unable to calculate delivery.");
                if (current) setQuote(result.data);
            } catch (requestError) {
                if (current) {
                    setQuote(null);
                    setQuoteError(requestError.message || "Unable to calculate delivery.");
                }
            }
        }, 350);

        return () => {
            current = false;
            window.clearTimeout(timer);
        };
    }, [form.address_line, form.district, form.city, form.region, form.country, form.latitude, form.longitude, vehicleType, items]);

    const updateField = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const placeGuestOrder = async (event) => {
        event.preventDefault();
        setError("");
        if (!quote) {
            setError(quoteError || "Enter your delivery address to calculate the total before placing your order.");
            return;
        }

        try {
            setPlacingOrder(true);
            // The API recalculates prices, stock, and delivery totals before persisting an order.
            const response = await fetch(`${API_URL}/guest/orders/checkout`, {
                method: "POST",
                headers: { Accept: "application/json", "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    phone: toTanzaniaPhoneNumber(form.phone),
                    vehicle_type: vehicleType,
                    items: items.map(({ product_id, quantity }) => ({ product_id, quantity })),
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Unable to place your order.");

            const order = result.data;
            const guestAccessToken = order.guest_access_token;
            const trackingNotice = "Log in to track your order";
            // Keep the guest credential for payment and to securely link the order after account login.
            localStorage.setItem(`orderme_guest_order_${order.id}`, JSON.stringify({ order, guestAccessToken, trackingNotice }));
            const purchasedIds = new Set(items.map((item) => Number(item.product_id)));
            const savedCart = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]")
                .filter((item) => !purchasedIds.has(Number(item.product_id)));
            localStorage.setItem(GUEST_CART_KEY, JSON.stringify(savedCart));
            navigate(`/orders/${order.id}/payment`, {
                state: { order, guestAccessToken, trackingNotice },
            });
        } catch (requestError) {
            setError(requestError.message || "Unable to place your order.");
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) return <div className="checkout-loading">Loading guest checkout...</div>;

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <header className="checkout-header">
                    <button type="button" className="checkout-back-button" onClick={() => navigate("/cart")}>
                        <ArrowLeft size={18} /> Back to Cart
                    </button>
                    <div>
                        <h1>Guest Checkout</h1>
                        <p>Enter a delivery address and reachable phone number to place your order.</p>
                    </div>
                </header>

                {error && <div className="alert alert-danger" role="alert">{error}</div>}

                <form className="checkout-grid" onSubmit={placeGuestOrder}>
                    <div className="checkout-main">
                        <section className="checkout-section">
                            <div className="checkout-section-header">
                                <div className="checkout-section-icon"><MapPin size={20} /></div>
                                <div><h2>Contact and delivery address</h2><p>We will use these details to deliver your order.</p></div>
                            </div>
                            <div className="checkout-address-form guest-checkout-fields">
                                <label>Full name<input required name="name" autoComplete="name" value={form.name} onChange={updateField} /></label>
                                <label>Reachable phone number<input required type="tel" name="phone" autoComplete="tel" placeholder="+255 7XX XXX XXX" value={form.phone} onChange={updateField} /></label>
                                <label>Street address<input required name="address_line" autoComplete="street-address" placeholder="House, street, or landmark" value={form.address_line} onChange={updateField} /></label>
                                <div className="checkout-address-fields">
                                    <label>District<input required name="district" value={form.district} onChange={updateField} /></label>
                                    <label>City / town<input required name="city" autoComplete="address-level2" value={form.city} onChange={updateField} /></label>
                                    <label>Region<input required name="region" autoComplete="address-level1" value={form.region} onChange={updateField} /></label>
                                    <label>Country<input required name="country" autoComplete="country-name" value={form.country} onChange={updateField} /></label>
                                </div>
                                <AddressLocationPicker
                                    latitude={form.latitude}
                                    longitude={form.longitude}
                                    onChange={({ latitude, longitude }) => setForm((previous) => ({ ...previous, latitude, longitude }))}
                                />
                            </div>
                        </section>

                        <section className="checkout-section">
                            <div className="checkout-section-header"><div className="checkout-section-icon"><Truck size={20} /></div><div><h2>Delivery vehicle</h2><p>Select how the order should be delivered.</p></div></div>
                            <div className="checkout-vehicle-options">
                                {[{ value: "bodaboda", label: "Bodaboda", fee: "400 TZS per km" }, { value: "bajaji", label: "Bajaji", fee: "600 TZS per km" }].map((vehicle) => (
                                    <label className={`checkout-vehicle-card ${vehicleType === vehicle.value ? "selected" : ""}`} key={vehicle.value}>
                                        <input type="radio" name="vehicle_type" value={vehicle.value} checked={vehicleType === vehicle.value} onChange={() => setVehicleType(vehicle.value)} />
                                        <div className="checkout-vehicle-content"><strong>{vehicle.label}</strong><span>{vehicle.fee}</span></div>
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section className="checkout-section">
                            <div className="checkout-section-header"><div className="checkout-section-icon"><Package size={20} /></div><div><h2>Order items</h2><p>Products you are checking out.</p></div></div>
                            <div className="checkout-items">
                                {items.map((item) => (
                                    <div className="checkout-item" key={item.id}>
                                        <div className="checkout-item-image">{item.product.image_url ? <img src={item.product.image_url} alt={item.product.name} /> : <Package size={28} />}</div>
                                        <div className="checkout-item-info"><h3>{item.product.name}</h3><p>Quantity: {item.quantity}</p><strong>TSh {Number(item.product.price || 0).toLocaleString()}</strong></div>
                                        <div className="checkout-item-total">TSh {(Number(item.product.price || 0) * item.quantity).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="checkout-summary">
                        <div className="checkout-summary-card">
                            <h2>Order summary</h2>
                            <div className="checkout-summary-row"><span>Items</span><span>{items.length}</span></div>
                            <div className="checkout-summary-row"><span>Product subtotal</span><span>TSh {subtotal.toLocaleString()}</span></div>
                            <div className="checkout-summary-row"><span>Delivery fee</span><span>{quote ? `TSh ${Number(quote.delivery_fee).toLocaleString()}` : quoteError || "Enter address to calculate"}</span></div>
                            <div className="checkout-summary-divider" />
                            <div className="checkout-summary-total"><span>Total amount</span><strong>{quote ? `TSh ${Number(quote.total_amount).toLocaleString()}` : "—"}</strong></div>
                            <button className="checkout-place-order" type="submit" disabled={placingOrder || !quote || items.length === 0}>
                                <CheckCircle size={19} /> {placingOrder ? "Placing order..." : "Place Order"}
                            </button>
                            <p className="checkout-payment-note">You can continue to payment after placing your order. No account is required.</p>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
}

export default GuestCheckout;
