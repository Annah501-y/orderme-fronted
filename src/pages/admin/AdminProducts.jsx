import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    RefreshCw,
    Package,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle,
    X,
    Store,
    UserRound,
    Tag,
    Boxes,
    MoreVertical,
} from "lucide-react";

import "../../pages_styles/admin-styles/admin-products.css";

const API_URL = import.meta.env.VITE_API_URL;

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const [openActionId, setOpenActionId] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    // ========================================
    // FETCH PRODUCTS
    // ========================================

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(`${API_URL}/admin/products`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to retrieve products."
                );
            }

            /*
             * Supports both:
             * { data: [...] }
             * and
             * { data: { products: [...] } }
             */
            const productData =
                Array.isArray(result.data)
                    ? result.data
                    : result.data?.products || [];

            setProducts(productData);
        } catch (err) {
            setError(
                err.message ||
                    "Something went wrong while loading products."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // ========================================
    // HELPERS
    // ========================================

    const getCategoryName = (product) => {
        return (
            product.category?.name ||
            product.category_name ||
            "Uncategorized"
        );
    };

    const getSellerName = (product) => {
        return (
            product.seller?.user?.name ||
            product.seller?.name ||
            product.seller_name ||
            "Unknown Seller"
        );
    };

    const getStoreName = (product) => {
        return (
            product.seller?.store_name ||
            product.seller?.seller_profile?.store_name ||
            product.store_name ||
            "No Store"
        );
    };

    const getProductImage = (product) => {
        if (!product) return null;
    
        
        if (product.image_url) {
            return product.image_url;
        }
    
        if (!product.image) {
            return null;
        }
    
        
        if (
            product.image.startsWith("http://") ||
            product.image.startsWith("https://")
        ) {
            return product.image;
        }
    
        
        const backendUrl = API_URL.replace(/\/api\/?$/, "");
    
        return `${backendUrl}/storage/${product.image.replace(/^\/?storage\//, "")}`;
        };

    const formatPrice = (price) => {
        const numericPrice = Number(price || 0);

        return new Intl.NumberFormat("en-TZ", {
            style: "currency",
            currency: "TZS",
            maximumFractionDigits: 0,
        }).format(numericPrice);
    };

    const formatStatus = (isActive) => {
        return isActive ? "Active" : "Inactive";
    };

    // ========================================
    // FILTER PRODUCTS
    // ========================================

    const filteredProducts = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        return products.filter((product) => {
            const productName = product.name || "";
            const categoryName = getCategoryName(product);
            const sellerName = getSellerName(product);
            const storeName = getStoreName(product);

            const matchesSearch =
                !searchValue ||
                `${productName} ${categoryName} ${sellerName} ${storeName}`
                    .toLowerCase()
                    .includes(searchValue);

            const matchesStatus =
                status === "all" ||
                (status === "active" && product.is_active) ||
                (status === "inactive" && !product.is_active);

            return matchesSearch && matchesStatus;
        });
    }, [products, search, status]);

    // ========================================
    // SUMMARY COUNTS
    // ========================================

    const totalProducts = products.length;

    const activeProducts = products.filter(
        (product) => product.is_active
    ).length;

    const inactiveProducts = products.filter(
        (product) => !product.is_active
    ).length;

    const lowStockProducts = products.filter(
        (product) =>
            Number(product.stock_quantity || 0) > 0 &&
            Number(product.stock_quantity || 0) <= 5
    ).length;

    // ========================================
    // VIEW PRODUCT
    // ========================================

    const handleViewProduct = async (product) => {
        try {
            setOpenActionId(null);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/admin/products/${product.id}`,
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
                    result.message ||
                        "Failed to retrieve product details."
                );
            }

            const productData =
                result.data?.product ||
                result.data ||
                product;

            setSelectedProduct(productData);
            setShowDetailsModal(true);
        } catch (err) {
            setError(
                err.message ||
                    "Unable to retrieve product details."
            );
        }
    };

    // ========================================
    // UPDATE PRODUCT STATUS
    // ========================================

    const handleToggleStatus = async (product) => {
        try {
            setProcessingId(product.id);
            setOpenActionId(null);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/admin/products/${product.id}/status`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        is_active: !product.is_active,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Failed to update product status."
                );
            }

            const updatedProduct =
                result.data?.product ||
                result.data;

            setProducts((currentProducts) =>
                currentProducts.map((item) =>
                    item.id === product.id
                        ? {
                              ...item,
                              ...(updatedProduct || {}),
                              is_active: !product.is_active,
                          }
                        : item
                )
            );
        } catch (err) {
            setError(
                err.message ||
                    "Unable to update product status."
            );
        } finally {
            setProcessingId(null);
        }
    };

    // ========================================
    // CLOSE DETAILS
    // ========================================

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedProduct(null);
    };

    return (
        <div className="admin-products-page">

            {/* ========================================
                HEADER
            ======================================== */}

            <div className="admin-products-header">

                <div>
                    <h1>Products</h1>

                    <p>
                        Manage products listed by sellers on OrderMe.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-products-refresh-btn"
                    onClick={fetchProducts}
                    disabled={loading}
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "spin" : ""}
                    />

                    Refresh
                </button>

            </div>

            {/* ========================================
                SUMMARY CARDS
            ======================================== */}

            <div className="admin-products-summary">

                <div className="admin-product-summary-card">
                    <div className="admin-product-summary-icon">
                        <Package size={21} />
                    </div>

                    <div>
                        <span>Total Products</span>
                        <strong>{totalProducts}</strong>
                    </div>
                </div>

                <div className="admin-product-summary-card">
                    <div className="admin-product-summary-icon">
                        <CheckCircle size={21} />
                    </div>

                    <div>
                        <span>Active Products</span>
                        <strong>{activeProducts}</strong>
                    </div>
                </div>

                <div className="admin-product-summary-card">
                    <div className="admin-product-summary-icon">
                        <XCircle size={21} />
                    </div>

                    <div>
                        <span>Inactive Products</span>
                        <strong>{inactiveProducts}</strong>
                    </div>
                </div>

                <div className="admin-product-summary-card">
                    <div className="admin-product-summary-icon">
                        <AlertCircle size={21} />
                    </div>

                    <div>
                        <span>Low Stock</span>
                        <strong>{lowStockProducts}</strong>
                    </div>
                </div>

            </div>

            {/* ========================================
                FILTERS
            ======================================== */}

            <div className="admin-products-filters">

                <div className="admin-products-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search products, sellers or stores..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>

                <div className="admin-products-status-filter">

                    <label htmlFor="product-status">
                        Status
                    </label>

                    <select
                        id="product-status"
                        value={status}
                        onChange={(e) =>
                            setStatus(e.target.value)
                        }
                    >
                        <option value="all">
                            All Products
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="inactive">
                            Inactive
                        </option>
                    </select>

                </div>

            </div>

            {/* ========================================
                ERROR
            ======================================== */}

            {error && (
                <div className="admin-products-error">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* ========================================
                TABLE
            ======================================== */}

            <div className="admin-products-table-card">

                <div className="admin-products-table-header">

                    <div>
                        <h2>Product List</h2>

                        <span>
                            Showing {filteredProducts.length} of{" "}
                            {products.length} products
                        </span>
                    </div>

                </div>

                {loading ? (
                    <div className="admin-products-loading">
                        <div className="admin-products-spinner"></div>
                        <p>Loading products...</p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="admin-products-empty">

                        <Package size={42} />

                        <h3>No products found</h3>

                        <p>
                            There are no products matching your
                            current search or filter.
                        </p>

                    </div>
                ) : (
                    <div className="admin-products-table-wrapper">

                        <table className="admin-products-table">

                            <thead>
                                <tr>
                                    <th>PRODUCT</th>
                                    <th>CATEGORY</th>
                                    <th>SELLER / STORE</th>
                                    <th>PRICE</th>
                                    <th>STOCK</th>
                                    <th>STATUS</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredProducts.map((product) => {

                                    const image =
                                        getProductImage(product);

                                    const stock =
                                        Number(
                                            product.stock_quantity || 0
                                        );

                                    return (
                                        <tr key={product.id}>

                                            {/* PRODUCT */}
                                            <td>

                                                <div className="admin-product-info">

                                                    <div className="admin-product-image">

                                                        {image ? (
                                                            <img
                                                                src={image}
                                                                alt={
                                                                    product.name
                                                                }
                                                            />
                                                        ) : (
                                                            <Package
                                                                size={22}
                                                            />
                                                        )}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {product.name}
                                                        </strong>

                                                        <span>
                                                            #{product.id}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* CATEGORY */}
                                            <td>

                                                <div className="admin-product-category">

                                                    <Tag size={15} />

                                                    {getCategoryName(
                                                        product
                                                    )}

                                                </div>

                                            </td>

                                            {/* SELLER */}
                                            <td>

                                                <div className="admin-product-seller">

                                                    <strong>
                                                        {getSellerName(
                                                            product
                                                        )}
                                                    </strong>

                                                    <span>
                                                        {getStoreName(
                                                            product
                                                        )}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* PRICE */}
                                            <td>

                                                <strong className="admin-product-price">
                                                    {formatPrice(
                                                        product.price
                                                    )}
                                                </strong>

                                            </td>

                                            {/* STOCK */}
                                            <td>

                                                <span
                                                    className={`admin-product-stock ${
                                                        stock <= 5
                                                            ? "low"
                                                            : ""
                                                    }`}
                                                >
                                                    {stock}
                                                </span>

                                            </td>

                                            {/* STATUS */}
                                            <td>

                                                <span
                                                    className={`admin-product-status ${
                                                        product.is_active
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                >
                                                    {product.is_active ? (
                                                        <CheckCircle
                                                            size={14}
                                                        />
                                                    ) : (
                                                        <XCircle
                                                            size={14}
                                                        />
                                                    )}

                                                    {formatStatus(
                                                        product.is_active
                                                    )}
                                                </span>

                                            </td>

                                            {/* ACTION */}
                                            <td>

                                                <div className="admin-product-action-wrapper">

                                                    <button
                                                        type="button"
                                                        className="admin-product-action-btn"
                                                        onClick={() =>
                                                            setOpenActionId(
                                                                openActionId ===
                                                                    product.id
                                                                    ? null
                                                                    : product.id
                                                            )
                                                        }
                                                    >
                                                        <MoreVertical
                                                            size={19}
                                                        />
                                                    </button>

                                                    {openActionId ===
                                                        product.id && (
                                                        <div className="admin-product-action-menu">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleViewProduct(
                                                                        product
                                                                    )
                                                                }
                                                            >
                                                                <Eye
                                                                    size={16}
                                                                />
                                                                View Details
                                                            </button>

                                                            <button
                                                                type="button"
                                                                disabled={
                                                                    processingId ===
                                                                    product.id
                                                                }
                                                                onClick={() =>
                                                                    handleToggleStatus(
                                                                        product
                                                                    )
                                                                }
                                                            >
                                                                {product.is_active ? (
                                                                    <>
                                                                        <XCircle
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                        Deactivate
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                        Activate
                                                                    </>
                                                                )}
                                                            </button>

                                                        </div>
                                                    )}

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* ========================================
                DETAILS MODAL
            ======================================== */}

            {showDetailsModal && selectedProduct && (
                <div
                    className="admin-products-modal-overlay"
                    onClick={closeDetailsModal}
                >

                    <div
                        className="admin-products-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="admin-products-modal-header">

                            <div>
                                <h2>Product Details</h2>

                                <p>
                                    Product #{selectedProduct.id}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeDetailsModal}
                                className="admin-products-modal-close"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="admin-products-modal-body">

                            <div className="admin-product-details-top">

                                <div className="admin-product-details-image">

                                    {getProductImage(
                                        selectedProduct
                                    ) ? (
                                        <img
                                            src={getProductImage(
                                                selectedProduct
                                            )}
                                            alt={
                                                selectedProduct.name
                                            }
                                        />
                                    ) : (
                                        <Package size={42} />
                                    )}

                                </div>

                                <div>

                                    <h3>
                                        {selectedProduct.name}
                                    </h3>

                                    <span
                                        className={`admin-product-status ${
                                            selectedProduct.is_active
                                                ? "active"
                                                : "inactive"
                                        }`}
                                    >
                                        {selectedProduct.is_active ? (
                                            <CheckCircle size={14} />
                                        ) : (
                                            <XCircle size={14} />
                                        )}

                                        {formatStatus(
                                            selectedProduct.is_active
                                        )}
                                    </span>

                                </div>

                            </div>

                            <div className="admin-product-details-grid">

                                <div className="admin-product-detail-item">

                                    <span>
                                        <Tag size={15} />
                                        Category
                                    </span>

                                    <strong>
                                        {getCategoryName(
                                            selectedProduct
                                        )}
                                    </strong>

                                </div>

                                <div className="admin-product-detail-item">

                                    <span>
                                        <Store size={15} />
                                        Store
                                    </span>

                                    <strong>
                                        {getStoreName(
                                            selectedProduct
                                        )}
                                    </strong>

                                </div>

                                <div className="admin-product-detail-item">

                                    <span>
                                        <UserRound size={15} />
                                        Seller
                                    </span>

                                    <strong>
                                        {getSellerName(
                                            selectedProduct
                                        )}
                                    </strong>

                                </div>

                                <div className="admin-product-detail-item">

                                    <span>
                                        <Boxes size={15} />
                                        Stock
                                    </span>

                                    <strong>
                                        {
                                            selectedProduct.stock_quantity
                                        }
                                    </strong>

                                </div>

                                <div className="admin-product-detail-item">

                                    <span>
                                        Price
                                    </span>

                                    <strong>
                                        {formatPrice(
                                            selectedProduct.price
                                        )}
                                    </strong>

                                </div>

                                <div className="admin-product-detail-item">

                                    <span>
                                        Old Price
                                    </span>

                                    <strong>
                                        {formatPrice(
                                            selectedProduct.old_price
                                        )}
                                    </strong>

                                </div>

                                <div className="admin-product-detail-item">

                                    <span>
                                        Discount
                                    </span>

                                    <strong>
                                        {selectedProduct.discount
                                            ? `${selectedProduct.discount}%`
                                            : "0%"}
                                    </strong>

                                </div>

                            </div>

                            <div className="admin-product-description">

                                <h4>
                                    Description
                                </h4>

                                <p>
                                    {selectedProduct.description ||
                                        "No description available."}
                                </p>

                            </div>

                        </div>

                        <div className="admin-products-modal-footer">

                            <button
                                type="button"
                                className="admin-products-modal-secondary"
                                onClick={closeDetailsModal}
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className="admin-products-modal-primary"
                                disabled={
                                    processingId ===
                                    selectedProduct.id
                                }
                                onClick={() => {
                                    handleToggleStatus(
                                        selectedProduct
                                    );

                                    setSelectedProduct({
                                        ...selectedProduct,
                                        is_active:
                                            !selectedProduct.is_active,
                                    });
                                }}
                            >
                                {selectedProduct.is_active
                                    ? "Deactivate Product"
                                    : "Activate Product"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
};

export default AdminProducts;