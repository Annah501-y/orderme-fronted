import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TanzaniaPhoneInput from "../../components/TanzaniaPhoneInput";
import { getTanzaniaNationalNumber, toTanzaniaPhoneNumber } from "../../utils/tanzaniaPhone";

function SellerProfileSetup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        store_name: "",
        store_description: "",
        phone: "",
        address_line: "",
        district: "",
        city: "",
        region: "",
        country: "Tanzania",
        nida_number: "",
        tin_reference: "",
        payout_method: "mobile_money",
        mobile_phone: "",
        bank_bic: "",
        bank_account_number: "",
        bank_account_name: "",
    });
    const [businessLicense, setBusinessLicense] = useState(null);

    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setGeneralError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});
        setGeneralError("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const payload = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== "") payload.append(key, value);
            });
            payload.set("phone", getTanzaniaNationalNumber(formData.phone));
            if (formData.payout_method === "mobile_money") {
                payload.set("mobile_phone", toTanzaniaPhoneNumber(formData.mobile_phone));
            }
            if (businessLicense) payload.append("business_license", businessLicense);

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/seller/profile`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: payload,
                }
            );

            const data = await response.json().catch(() => ({}));

            if (response.status === 422) {
                setErrors(data.errors || {});
                return;
            }

            if (!response.ok) {
                setGeneralError(
                    data.message ||
                        "Unable to submit your seller profile. Please try again."
                );
                return;
            }

            // Seller profile submission promotes an existing buyer to seller
            // on the backend. Keep the local navigation role in sync with it.
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                try {
                    const currentUser = JSON.parse(storedUser);
                    const roles = Array.isArray(currentUser.roles) ? currentUser.roles : [];
                    const sellerRole = roles.find((item) => item?.name === "seller") || { name: "seller" };
                    const updatedUser = {
                        ...currentUser,
                        roles: [sellerRole, ...roles.filter((item) => item?.name !== "seller")],
                    };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    window.dispatchEvent(new Event("orderme:auth-changed"));
                } catch (error) {
                    console.error("Unable to update seller account role:", error);
                }
            }

            navigate("/seller-pending-approval");
        } catch (error) {
            console.error("Seller profile submission error:", error);

            setGeneralError(
                "Unable to connect to the server. Please check your connection and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-7">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4 p-md-5">
                            <h2 className="mb-2">Set Up Your Store</h2>

                            <p className="text-muted mb-4">
                                Complete your store information before submitting
                                your seller application for approval.
                            </p>

                            {generalError && (
                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >
                                    {generalError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate>
                                {/* Store Name */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="store_name"
                                        className="form-label"
                                    >
                                        Store Name
                                    </label>

                                    <input
                                        type="text"
                                        id="store_name"
                                        name="store_name"
                                        className={`form-control ${
                                            errors.store_name
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        value={formData.store_name}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />

                                    {errors.store_name && (
                                        <div className="invalid-feedback">
                                            {errors.store_name[0]}
                                        </div>
                                    )}
                                </div>

                                {/* Store Description */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="store_description"
                                        className="form-label"
                                    >
                                        Store Description
                                    </label>

                                    <textarea
                                        id="store_description"
                                        name="store_description"
                                        className={`form-control ${
                                            errors.store_description
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        rows="4"
                                        value={formData.store_description}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="Tell customers about your store..."
                                    />

                                    {errors.store_description && (
                                        <div className="invalid-feedback">
                                            {errors.store_description[0]}
                                        </div>
                                    )}
                                </div>

                                {/* Store Phone */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="phone"
                                        className="form-label"
                                    >
                                        Store Phone
                                    </label>

                                    <TanzaniaPhoneInput
                                        id="phone"
                                        name="phone"
                                        className={`form-control ${
                                            errors.phone ? "is-invalid" : ""
                                        }`}
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />

                                    {errors.phone && (
                                        <div className="invalid-feedback">
                                            {errors.phone[0]}
                                        </div>
                                    )}
                                </div>

                                <h5 className="mt-4 mb-3">Identity and business documents</h5>
                                <div className="mb-3">
                                    <label htmlFor="nida_number" className="form-label">NIDA Number</label>
                                    <input id="nida_number" name="nida_number" className={`form-control ${errors.nida_number ? "is-invalid" : ""}`} value={formData.nida_number} onChange={handleChange} required disabled={loading} />
                                    {errors.nida_number && <div className="invalid-feedback">{errors.nida_number[0]}</div>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="tin_reference" className="form-label">TIN Reference</label>
                                    <input id="tin_reference" name="tin_reference" className={`form-control ${errors.tin_reference ? "is-invalid" : ""}`} value={formData.tin_reference} onChange={handleChange} required disabled={loading} />
                                    {errors.tin_reference && <div className="invalid-feedback">{errors.tin_reference[0]}</div>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="business_license" className="form-label">Business Licence (PDF/JPG/PNG, max 10 MB)</label>
                                    <input id="business_license" type="file" accept=".pdf,.jpg,.jpeg,.png" className={`form-control ${errors.business_license ? "is-invalid" : ""}`} onChange={(event) => setBusinessLicense(event.target.files?.[0] || null)} required disabled={loading} />
                                    {errors.business_license && <div className="invalid-feedback">{errors.business_license[0]}</div>}
                                </div>

                                <h5 className="mt-4 mb-3">Payout details</h5>
                                <div className="mb-3">
                                    <label htmlFor="payout_method" className="form-label">Payout Method</label>
                                    <select id="payout_method" name="payout_method" className="form-select" value={formData.payout_method} onChange={handleChange} disabled={loading}>
                                        <option value="mobile_money">Mobile Money</option>
                                        <option value="bank">Bank Transfer</option>
                                    </select>
                                </div>
                                {formData.payout_method === "mobile_money" ? (
                                    <div className="mb-3">
                                        <label htmlFor="mobile_phone" className="form-label">Mobile Money Number</label>
                                        <TanzaniaPhoneInput id="mobile_phone" name="mobile_phone" value={formData.mobile_phone} onChange={handleChange} className={`form-control ${errors.mobile_phone ? "is-invalid" : ""}`} required disabled={loading} />
                                        {errors.mobile_phone && <div className="invalid-feedback">{errors.mobile_phone[0]}</div>}
                                    </div>
                                ) : (
                                    <>
                                        {[ ["bank_bic", "Bank BIC"], ["bank_account_number", "Account Number"], ["bank_account_name", "Account Holder Name"] ].map(([name, label]) => (
                                            <div className="mb-3" key={name}>
                                                <label htmlFor={name} className="form-label">{label}</label>
                                                <input id={name} name={name} className={`form-control ${errors[name] ? "is-invalid" : ""}`} value={formData[name]} onChange={handleChange} required disabled={loading} />
                                                {errors[name] && <div className="invalid-feedback">{errors[name][0]}</div>}
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* Address Line */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="address_line"
                                        className="form-label"
                                    >
                                        Store Address
                                    </label>

                                    <input
                                        type="text"
                                        id="address_line"
                                        name="address_line"
                                        className={`form-control ${
                                            errors.address_line
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        value={formData.address_line}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="Street, building or area"
                                    />

                                    {errors.address_line && (
                                        <div className="invalid-feedback">
                                            {errors.address_line[0]}
                                        </div>
                                    )}
                                </div>

                                {/* District */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="district"
                                        className="form-label"
                                    >
                                        District
                                    </label>

                                    <input
                                        type="text"
                                        id="district"
                                        name="district"
                                        className={`form-control ${
                                            errors.district
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        value={formData.district}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="e.g. Kinondoni"
                                    />

                                    {errors.district && (
                                        <div className="invalid-feedback">
                                            {errors.district[0]}
                                        </div>
                                    )}
                                </div>

                                {/* City */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="city"
                                        className="form-label"
                                    >
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        className={`form-control ${
                                            errors.city ? "is-invalid" : ""
                                        }`}
                                        value={formData.city}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="e.g. Dar es Salaam"
                                    />

                                    {errors.city && (
                                        <div className="invalid-feedback">
                                            {errors.city[0]}
                                        </div>
                                    )}
                                </div>

                                {/* Region */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="region"
                                        className="form-label"
                                    >
                                        Region
                                    </label>

                                    <input
                                        type="text"
                                        id="region"
                                        name="region"
                                        className={`form-control ${
                                            errors.region ? "is-invalid" : ""
                                        }`}
                                        value={formData.region}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="e.g. Dar es Salaam"
                                    />

                                    {errors.region && (
                                        <div className="invalid-feedback">
                                            {errors.region[0]}
                                        </div>
                                    )}
                                </div>

                                {/* Country */}
                                <div className="mb-4">
                                    <label
                                        htmlFor="country"
                                        className="form-label"
                                    >
                                        Country
                                    </label>

                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        className={`form-control ${
                                            errors.country ? "is-invalid" : ""
                                        }`}
                                        value={formData.country}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />

                                    {errors.country && (
                                        <div className="invalid-feedback">
                                            {errors.country[0]}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Submitting Application..."
                                        : "Submit for Approval"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SellerProfileSetup;
