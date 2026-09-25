import React, { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Power,
    Package,
    Search,
    X,
    Image as ImageIcon,
    Minus,
    LoaderCircle,
} from "lucide-react";

import "../../pages_styles/seller_styles/seller-products.css";

const API_URL = import.meta.env.VITE_API_URL;

const emptyForm = {
    category_id: "",
    name: "",
    description: "",
    old_price: "",
    discount: "0",
    stock_quantity: "0",
    image: null,
};

function SellerProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [form, setForm] = useState(emptyForm);
    const [imagePreview, setImagePreview] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    const [stockEditingId, setStockEditingId] = useState(null);
    const [stockValue, setStockValue] = useState("");

    const token = localStorage.getItem("token");

    const headers = {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };

    /* =========================================================
       LOAD PRODUCTS
    ========================================================= */

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_URL}/seller/products`,
                {
                    method: "GET",
                    headers,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load products."
                );
            }

            setProducts(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================
       LOAD CATEGORIES
    ========================================================= */

    const fetchCategories = async () => {
        try {
            const response = await fetch(
                `${API_URL}/categories`,
                {
                    method: "GET",
                    headers,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load categories."
                );
            }

            setCategories(data.data?.data || data.data || []);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    /* =========================================================
       FORM INPUT
    ========================================================= */

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    /* =========================================================
       IMAGE
    ========================================================= */

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            return;
        }

        setForm((previous) => ({
            ...previous,
            image: file,
        }));

        setImagePreview(URL.createObjectURL(file));
    };

    /* =========================================================
       OPEN ADD FORM
    ========================================================= */

    const openAddForm = () => {
        setEditingProduct(null);
        setForm(emptyForm);
        setImagePreview(null);
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    /* =========================================================
       OPEN EDIT FORM
    ========================================================= */

    const openEditForm = (product) => {
        setEditingProduct(product);

        setForm({
            category_id: product.category?.id || "",
            name: product.name || "",
            description: product.description || "",
            old_price: product.old_price || "",
            discount: product.discount || "0",
            stock_quantity: product.stock_quantity ?? "0",
            image: null,
        });

        setImagePreview(product.image_url || null);

        setError("");
        setSuccess("");
        setShowForm(true);
    };

    /* =========================================================
       CLOSE FORM
    ========================================================= */

    const closeForm = () => {
        if (saving) return;

        setShowForm(false);
        setEditingProduct(null);
        setForm(emptyForm);
        setImagePreview(null);
    };

    /* =========================================================
       CALCULATED PRICE
    ========================================================= */

    const calculatePrice = () => {
        const oldPrice = Number(form.old_price);
        const discount = Number(form.discount);

        if (!oldPrice || oldPrice <= 0) {
            return 0;
        }

        if (discount < 0 || discount > 100) {
            return oldPrice;
        }

        return oldPrice - (oldPrice * discount) / 100;
    };

    /* =========================================================
       SAVE PRODUCT
    ========================================================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append(
                "category_id",
                form.category_id
            );

            formData.append(
                "name",
                form.name
            );

            formData.append(
                "description",
                form.description
            );

            formData.append(
                "old_price",
                form.old_price
            );

            formData.append(
                "discount",
                form.discount
            );

            formData.append(
                "stock_quantity",
                form.stock_quantity
            );

            if (form.image) {
                formData.append("image", form.image);
            }

            let url = `${API_URL}/products`;
            let method = "POST";

            /*
             * Laravel method spoofing allows us to send the
             * multipart/form-data request as POST while telling
             * Laravel that it should be handled as PUT.
             */
            if (editingProduct) {
                url = `${API_URL}/products/${editingProduct.id}`;
                formData.append("_method", "PUT");
            }

            const response = await fetch(url, {
                method,
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(
                        data.errors
                    )[0]?.[0];

                    throw new Error(
                        firstError || data.message || "Validation failed."
                    );
                }

                throw new Error(
                    data.message || "Failed to save product."
                );
            }

            setSuccess(
                editingProduct
                    ? "Product updated successfully."
                    : "Product added successfully."
            );

            closeForm();
            await fetchProducts();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    /* =========================================================
       DELETE PRODUCT
    ========================================================= */

    const handleDelete = async (product) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/products/${product.id}`,
                {
                    method: "DELETE",
                    headers,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to delete product."
                );
            }

            setSuccess("Product deleted successfully.");

            setProducts((previous) =>
                previous.filter(
                    (item) => item.id !== product.id
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };

    /* =========================================================
       ACTIVATE / DEACTIVATE
    ========================================================= */

    const handleStatusChange = async (product) => {
        try {
            setError("");
            setSuccess("");

            const newStatus = !product.is_active;

            const response = await fetch(
                `${API_URL}/products/${product.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        ...headers,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        is_active: newStatus,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update product status."
                );
            }

            setSuccess(
                newStatus
                    ? "Product activated."
                    : "Product deactivated."
            );

            setProducts((previous) =>
                previous.map((item) =>
                    item.id === product.id
                        ? {
                              ...item,
                              is_active: newStatus,
                          }
                        : item
                )
            );
        } catch (err) {
            setError(err.message);
        }
    };

    /* =========================================================
       START STOCK EDIT
    ========================================================= */

    const startStockEdit = (product) => {
        setStockEditingId(product.id);
        setStockValue(product.stock_quantity ?? 0);
    };

    /* =========================================================
       UPDATE STOCK
    ========================================================= */

    const updateStock = async (product) => {
        const quantity = Number(stockValue);

        if (!Number.isInteger(quantity) || quantity < 0) {
            setError("Stock quantity must be a whole number of 0 or more.");
            return;
        }

        try {
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API_URL}/products/${product.id}/stock`,
                {
                    method: "PATCH",
                    headers: {
                        ...headers,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        stock_quantity: quantity,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to update stock."
                );
            }

            setProducts((previous) =>
                previous.map((item) =>
                    item.id === product.id
                        ? {
                              ...item,
                              stock_quantity:
                                  data.data?.stock_quantity ??
                                  quantity,
                          }
                        : item
                )
            );

            setStockEditingId(null);
            setSuccess("Stock updated successfully.");
        } catch (err) {
            setError(err.message);
        }
    };

    /* =========================================================
       FILTER PRODUCTS
    ========================================================= */

    const filteredProducts = products.filter((product) =>
        product.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    /* =========================================================
       FORMAT MONEY
    ========================================================= */

    const formatMoney = (amount) => {
        return Number(amount || 0).toLocaleString("en-TZ", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <div className="seller-products-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="seller-products-header">

                <div>
                    <h2>Products</h2>

                    <p>
                        Manage your products, stock and
                        product availability.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn seller-add-product-btn"
                    onClick={openAddForm}
                >
                    <Plus size={18} />
                    Add Product
                </button>

            </div>

            {/* =================================================
                ALERTS
            ================================================= */}

            {success && (
                <div className="alert alert-success">
                    {success}
                </div>
            )}

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="seller-products-toolbar">

                <div className="seller-product-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search your products..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                    />

                </div>

                <div className="seller-product-count">
                    {filteredProducts.length} product
                    {filteredProducts.length !== 1
                        ? "s"
                        : ""}
                </div>

            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
                <div className="seller-products-loading">
                    <LoaderCircle
                        size={30}
                        className="spin"
                    />

                    <span>
                        Loading your products...
                    </span>
                </div>
            ) : filteredProducts.length === 0 ? (

                /* =================================================
                   EMPTY STATE
                ================================================= */

                <div className="seller-products-empty">

                    <Package size={42} />

                    <h4>
                        {searchTerm
                            ? "No products found"
                            : "No products yet"}
                    </h4>

                    <p>
                        {searchTerm
                            ? "Try a different search."
                            : "Start by adding your first product."}
                    </p>

                    {!searchTerm && (
                        <button
                            type="button"
                            className="btn seller-add-product-btn"
                            onClick={openAddForm}
                        >
                            <Plus size={18} />
                            Add Product
                        </button>
                    )}

                </div>

            ) : (

                /* =================================================
                   PRODUCT TABLE
                ================================================= */

                <div className="seller-products-card">

                    <div className="table-responsive">

                        <table className="table seller-products-table">

                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredProducts.map((product) => (

                                    <tr key={product.id}>

                                        {/* PRODUCT */}

                                        <td>
                                            <div className="seller-product-info">

                                                <div className="seller-product-image">

                                                    {product.image_url ? (
                                                        <img
                                                            src={
                                                                product.image_url
                                                            }
                                                            alt={
                                                                product.name
                                                            }
                                                        />
                                                    ) : (
                                                        <ImageIcon
                                                            size={25}
                                                        />
                                                    )}

                                                </div>

                                                <div>
                                                    <strong>
                                                        {product.name}
                                                    </strong>

                                                    {product.discount > 0 && (
                                                        <small>
                                                            {product.discount}%
                                                            discount
                                                        </small>
                                                    )}
                                                </div>

                                            </div>
                                        </td>

                                        {/* CATEGORY */}

                                        <td>
                                            {product.category?.name ||
                                                "Uncategorized"}
                                        </td>

                                        {/* PRICE */}

                                        <td>

                                            <strong>
                                                TZS{" "}
                                                {formatMoney(
                                                    product.price
                                                )}
                                            </strong>

                                            {Number(
                                                product.old_price
                                            ) >
                                                Number(
                                                    product.price
                                                ) && (
                                                <small className="old-price">
                                                    TZS{" "}
                                                    {formatMoney(
                                                        product.old_price
                                                    )}
                                                </small>
                                            )}

                                        </td>

                                        {/* STOCK */}

                                        <td>

                                            {stockEditingId ===
                                            product.id ? (

                                                <div className="stock-editor">

                                                    <button
                                                        type="button"
                                                        className="stock-adjust-btn"
                                                        onClick={() =>
                                                            setStockValue(
                                                                Math.max(
                                                                    0,
                                                                    Number(
                                                                        stockValue
                                                                    ) - 1
                                                                )
                                                            )
                                                        }
                                                    >
                                                        <Minus
                                                            size={14}
                                                        />
                                                    </button>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={
                                                            stockValue
                                                        }
                                                        onChange={(e) =>
                                                            setStockValue(
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                    <button
                                                        type="button"
                                                        className="stock-adjust-btn"
                                                        onClick={() =>
                                                            setStockValue(
                                                                Number(
                                                                    stockValue
                                                                ) + 1
                                                            )
                                                        }
                                                    >
                                                        <Plus
                                                            size={14}
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="stock-save-btn"
                                                        onClick={() =>
                                                            updateStock(
                                                                product
                                                            )
                                                        }
                                                    >
                                                        Save
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="stock-cancel-btn"
                                                        onClick={() =>
                                                            setStockEditingId(
                                                                null
                                                            )
                                                        }
                                                    >
                                                        <X size={14} />
                                                    </button>

                                                </div>

                                            ) : (

                                                <button
                                                    type="button"
                                                    className="stock-value-btn"
                                                    onClick={() =>
                                                        startStockEdit(
                                                            product
                                                        )
                                                    }
                                                    title="Manage stock"
                                                >
                                                    {product.stock_quantity}
                                                </button>

                                            )}

                                        </td>

                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={`product-status ${
                                                    product.is_active
                                                        ? "active"
                                                        : "inactive"
                                                }`}
                                            >
                                                {product.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>

                                        </td>

                                        {/* ACTIONS */}

                                        <td>

                                            <div className="product-actions">

                                                <button
                                                    type="button"
                                                    className="product-action-btn edit"
                                                    onClick={() =>
                                                        openEditForm(
                                                            product
                                                        )
                                                    }
                                                    title="Edit product"
                                                >
                                                    <Pencil
                                                        size={16}
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="product-action-btn status"
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            product
                                                        )
                                                    }
                                                    title={
                                                        product.is_active
                                                            ? "Deactivate"
                                                            : "Activate"
                                                    }
                                                >
                                                    <Power
                                                        size={16}
                                                    />
                                                </button>

                                                <button
                                                    type="button"
                                                    className="product-action-btn delete"
                                                    onClick={() =>
                                                        handleDelete(
                                                            product
                                                        )
                                                    }
                                                    title="Delete product"
                                                >
                                                    <Trash2
                                                        size={16}
                                                    />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            )}

            {/* =================================================
                ADD / EDIT MODAL
            ================================================= */}

            {showForm && (

                <div className="seller-product-modal-overlay">

                    <div className="seller-product-modal">

                        <div className="seller-product-modal-header">

                            <div>
                                <h4>
                                    {editingProduct
                                        ? "Edit Product"
                                        : "Add Product"}
                                </h4>

                                <p>
                                    {editingProduct
                                        ? "Update your product information."
                                        : "Add a new product to your store."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={closeForm}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="seller-product-modal-body">

                                {/* IMAGE */}

                                <div className="product-image-upload">

                                    <div className="product-image-preview">

                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Product preview"
                                            />
                                        ) : (
                                            <ImageIcon
                                                size={42}
                                            />
                                        )}

                                    </div>

                                    <div>
                                        <label
                                            htmlFor="product-image"
                                            className="btn image-upload-btn"
                                        >
                                            Choose Image
                                        </label>

                                        <input
                                            id="product-image"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={
                                                handleImageChange
                                            }
                                            hidden
                                        />

                                        <small>
                                            JPG, PNG or WEBP.
                                            Maximum 5MB.
                                        </small>
                                    </div>

                                </div>

                                {/* NAME */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Product Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Enter product name"
                                        required
                                    />

                                </div>

                                {/* CATEGORY */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Category
                                    </label>

                                    <select
                                        name="category_id"
                                        className="form-select"
                                        value={
                                            form.category_id
                                        }
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select category
                                        </option>

                                        {categories.map(
                                            (category) => (
                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {/* DESCRIPTION */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        className="form-control"
                                        rows="4"
                                        maxLength="2000"
                                        value={
                                            form.description
                                        }
                                        onChange={handleChange}
                                        placeholder="Describe your product..."
                                    />

                                </div>

                                {/* PRICE ROW */}

                                <div className="row">

                                    <div className="col-md-4 mb-3">

                                        <label className="form-label">
                                            Old Price
                                        </label>

                                        <input
                                            type="number"
                                            name="old_price"
                                            className="form-control"
                                            min="0.01"
                                            step="0.01"
                                            value={
                                                form.old_price
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>

                                    <div className="col-md-4 mb-3">

                                        <label className="form-label">
                                            Discount (%)
                                        </label>

                                        <input
                                            type="number"
                                            name="discount"
                                            className="form-control"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={
                                                form.discount
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>

                                    <div className="col-md-4 mb-3">

                                        <label className="form-label">
                                            Selling Price
                                        </label>

                                        <div className="calculated-price">
                                            TZS{" "}
                                            {formatMoney(
                                                calculatePrice()
                                            )}
                                        </div>

                                        <small>
                                            Calculated automatically
                                        </small>

                                    </div>

                                </div>

                                {/* STOCK */}

                                <div className="mb-3">

                                    <label className="form-label">
                                        Stock Quantity
                                    </label>

                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        className="form-control"
                                        min="0"
                                        step="1"
                                        value={
                                            form.stock_quantity
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>

                            </div>

                            {/* FOOTER */}

                            <div className="seller-product-modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn seller-save-product-btn"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <LoaderCircle
                                                size={17}
                                                className="spin"
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            {editingProduct
                                                ? "Update Product"
                                                : "Save Product"}
                                        </>
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default SellerProducts;