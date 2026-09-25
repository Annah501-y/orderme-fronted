import React, { useEffect, useState } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    Power,
    Search,
    X,
    Image as ImageIcon,
} from "lucide-react";

import "../../pages_styles/admin-styles/admin-categories.css";

function AdminCategories() {
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        is_active: true,
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    const getToken = () => {
        return localStorage.getItem("token");
    };

    /* ========================================
       FETCH CATEGORIES
    ======================================== */

    const fetchCategories = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/admin/categories`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to load categories."
                );
            }

            setCategories(data.data || []);
        } catch (error) {
            console.error(
                "Fetch categories error:",
                error
            );

            setError(
                error.message ||
                "Unable to load categories."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    /* ========================================
       FORM HANDLING
    ======================================== */

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    /* ========================================
       IMAGE HANDLING
    ======================================== */

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError(
                "Please select a JPG, JPEG, PNG, or WEBP image."
            );

            e.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError(
                "The category image must not exceed 2MB."
            );

            e.target.value = "";
            return;
        }

        setError("");
        setImageFile(file);

        const previewUrl = URL.createObjectURL(file);

        setImagePreview(previewUrl);
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    /* ========================================
       OPEN ADD MODAL
    ======================================== */

    const handleAddCategory = () => {
        setEditingCategory(null);

        setFormData({
            name: "",
            description: "",
            is_active: true,
        });

        setImageFile(null);
        setImagePreview(null);

        setError("");
        setSuccess("");

        setShowModal(true);
    };

    /* ========================================
       OPEN EDIT MODAL
    ======================================== */

    const handleEditCategory = (category) => {
        setEditingCategory(category);

        setFormData({
            name: category.name || "",
            description: category.description || "",
            is_active: Boolean(category.is_active),
        });

        setImageFile(null);

        setImagePreview(
            category.image || null
        );

        setError("");
        setSuccess("");

        setShowModal(true);
    };

    /* ========================================
       CLOSE MODAL
    ======================================== */

    const handleCloseModal = () => {
        if (saving) return;

        setShowModal(false);
        setEditingCategory(null);

        setFormData({
            name: "",
            description: "",
            is_active: true,
        });

        setImageFile(null);
        setImagePreview(null);
    };

    /* ========================================
       CREATE / UPDATE CATEGORY
    ======================================== */

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const isEditing = Boolean(
                editingCategory
            );

            const url = isEditing
                ? `${API_URL}/categories/${editingCategory.id}`
                : `${API_URL}/categories`;

            /*
             * FormData is required because
             * we are uploading an image.
             */
            const data = new FormData();

            data.append(
                "name",
                formData.name
            );

            data.append(
                "description",
                formData.description || ""
            );

            data.append(
                "is_active",
                formData.is_active ? "1" : "0"
            );

            if (imageFile) {
                data.append(
                    "image",
                    imageFile
                );
            }

            /*
             * Laravel handles PUT/PATCH
             * file uploads more reliably
             * through POST + _method.
             */
            if (isEditing) {
                data.append("_method", "PUT");
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: data,
            });

            const responseData =
                await response.json();

            if (!response.ok) {
                if (responseData.errors) {
                    const firstError =
                        Object.values(
                            responseData.errors
                        )[0];

                    throw new Error(
                        Array.isArray(firstError)
                            ? firstError[0]
                            : "Validation failed."
                    );
                }

                throw new Error(
                    responseData.message ||
                    "Failed to save category."
                );
            }

            setShowModal(false);
            setEditingCategory(null);

            setFormData({
                name: "",
                description: "",
                is_active: true,
            });

            setImageFile(null);
            setImagePreview(null);

            setSuccess(
                isEditing
                    ? "Category updated successfully."
                    : "Category created successfully."
            );

            await fetchCategories();

        } catch (error) {
            console.error(
                "Save category error:",
                error
            );

            setError(
                error.message ||
                "Unable to save category."
            );
        } finally {
            setSaving(false);
        }
    };

    /* ========================================
       TOGGLE CATEGORY STATUS
    ======================================== */

    const handleToggleStatus = async (category) => {
        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_URL}/categories/${category.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${getToken()}`,
                    },
                    body: JSON.stringify({
                        name: category.name,
                        description:
                            category.description,
                        is_active:
                            !category.is_active,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to update category status."
                );
            }

            setSuccess(
                category.is_active
                    ? "Category deactivated successfully."
                    : "Category activated successfully."
            );

            await fetchCategories();

        } catch (error) {
            console.error(
                "Toggle category status error:",
                error
            );

            setError(
                error.message ||
                "Unable to update category status."
            );
        }
    };

    /* ========================================
       DELETE CATEGORY
    ======================================== */

    const handleDeleteCategory = async (
        category
    ) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${category.name}"?`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            const response = await fetch(
                `${API_URL}/categories/${category.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${getToken()}`,
                    },
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to delete category."
                );
            }

            setSuccess(
                "Category deleted successfully."
            );

            await fetchCategories();

        } catch (error) {
            console.error(
                "Delete category error:",
                error
            );

            setError(
                error.message ||
                "Unable to delete category."
            );
        }
    };

    /* ========================================
       FILTER CATEGORIES
    ======================================== */

    const filteredCategories =
        categories.filter((category) => {
            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            if (!search) return true;

            return (
                category.name
                    ?.toLowerCase()
                    .includes(search) ||
                category.description
                    ?.toLowerCase()
                    .includes(search)
            );
        });

    /* ========================================
       RENDER
    ======================================== */

    return (
        <div className="admin-categories">

            {/* HEADER */}

            <div className="admin-categories-header">

                <div>
                    <span className="admin-section-label">
                        ADMINISTRATION
                    </span>

                    <h1>Categories</h1>

                    <p>
                        Manage product categories
                        across the OrderMe marketplace.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-add-category-btn"
                    onClick={handleAddCategory}
                >
                    <Plus size={18} />
                    Add Category
                </button>

            </div>


            {/* ALERTS */}

            {error && (
                <div className="admin-category-alert admin-category-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="admin-category-alert admin-category-success">
                    {success}
                </div>
            )}


            {/* TOOLBAR */}

            <div className="admin-categories-toolbar">

                <div className="admin-category-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                    />

                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() =>
                                setSearchTerm("")
                            }
                            className="clear-search-btn"
                            aria-label="Clear search"
                        >
                            <X size={16} />
                        </button>
                    )}

                </div>

                <div className="category-count">
                    {filteredCategories.length}{" "}
                    {filteredCategories.length === 1
                        ? "category"
                        : "categories"}
                </div>

            </div>


            {/* CATEGORY TABLE */}

            <div className="admin-categories-card">

                {loading ? (
                    <div className="admin-category-loading">

                        <div
                            className="spinner-border"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading...
                            </span>
                        </div>

                        <p>
                            Loading categories...
                        </p>

                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="admin-category-empty">

                        <div className="empty-category-icon">
                            <Search size={24} />
                        </div>

                        <h3>
                            No categories found
                        </h3>

                        <p>
                            {searchTerm
                                ? "Try a different search term."
                                : "There are no categories available yet."}
                        </p>

                    </div>
                ) : (
                    <div className="table-responsive">

                        <table className="table admin-category-table">

                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th className="text-end">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredCategories.map(
                                    (category) => (
                                        <tr
                                            key={
                                                category.id
                                            }
                                        >

                                            {/* CATEGORY */}

                                            <td>

                                                <div className="category-info">

                                                    <div className="category-image">

                                                        {category.image ? (
                                                            <img
                                                                src={
                                                                    category.image
                                                                }
                                                                alt={
                                                                    category.name
                                                                }
                                                            />
                                                        ) : (
                                                            <ImageIcon
                                                                size={18}
                                                            />
                                                        )}

                                                    </div>

                                                    <div>
                                                        <div className="category-name">
                                                            {
                                                                category.name
                                                            }
                                                        </div>

                                                        <div className="category-slug">
                                                            {
                                                                category.slug
                                                            }
                                                        </div>
                                                    </div>

                                                </div>

                                            </td>


                                            {/* DESCRIPTION */}

                                            <td>

                                                <div className="category-description">
                                                    {category.description ||
                                                        "No description"}
                                                </div>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`category-status ${
                                                        category.is_active
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                >

                                                    <span className="status-dot"></span>

                                                    {category.is_active
                                                        ? "Active"
                                                        : "Inactive"}

                                                </span>

                                            </td>


                                            {/* CREATED */}

                                            <td>

                                                <span className="category-date">
                                                    {category.created_at
                                                        ? new Date(
                                                            category.created_at
                                                        ).toLocaleDateString()
                                                        : "—"}
                                                </span>

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="category-actions">

                                                    <button
                                                        type="button"
                                                        className="category-action-btn edit"
                                                        onClick={() =>
                                                            handleEditCategory(
                                                                category
                                                            )
                                                        }
                                                        title="Edit category"
                                                    >
                                                        <Pencil
                                                            size={16}
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={`category-action-btn ${
                                                            category.is_active
                                                                ? "deactivate"
                                                                : "activate"
                                                        }`}
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                category
                                                            )
                                                        }
                                                        title={
                                                            category.is_active
                                                                ? "Deactivate category"
                                                                : "Activate category"
                                                        }
                                                    >
                                                        <Power
                                                            size={16}
                                                        />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="category-action-btn delete"
                                                        onClick={() =>
                                                            handleDeleteCategory(
                                                                category
                                                            )
                                                        }
                                                        title="Delete category"
                                                    >
                                                        <Trash2
                                                            size={16}
                                                        />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>


            {/* ADD / EDIT MODAL */}

            {showModal && (
                <div
                    className="admin-category-modal-overlay"
                    onMouseDown={(e) => {
                        if (
                            e.target ===
                                e.currentTarget &&
                            !saving
                        ) {
                            handleCloseModal();
                        }
                    }}
                >

                    <div className="admin-category-modal">

                        {/* MODAL HEADER */}

                        <div className="admin-category-modal-header">

                            <div>

                                <span className="admin-section-label">
                                    CATEGORY
                                </span>

                                <h2>
                                    {editingCategory
                                        ? "Edit Category"
                                        : "Add Category"}
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="modal-close-btn"
                                onClick={
                                    handleCloseModal
                                }
                                disabled={saving}
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* CATEGORY NAME */}

                            <div className="admin-category-form-group">

                                <label htmlFor="category-name">
                                    Category Name
                                </label>

                                <input
                                    id="category-name"
                                    type="text"
                                    name="name"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Electronics"
                                    disabled={saving}
                                    minLength={2}
                                    maxLength={100}
                                    required
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="admin-category-form-group">

                                <label htmlFor="category-description">
                                    Description
                                </label>

                                <textarea
                                    id="category-description"
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Describe this category..."
                                    disabled={saving}
                                    maxLength={1000}
                                    rows="4"
                                />

                            </div>


                            {/* CATEGORY IMAGE */}

                            <div className="admin-category-form-group">

                                <label htmlFor="category-image">
                                    Category Picture
                                </label>

                                <div className="category-image-upload">

                                    <input
                                        id="category-image"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={
                                            handleImageChange
                                        }
                                        disabled={saving}
                                    />

                                    <small>
                                        JPG, PNG or WEBP.
                                        Maximum 2MB.
                                    </small>

                                </div>

                                {imagePreview && (
                                    <div className="category-image-preview">

                                        <img
                                            src={
                                                imagePreview
                                            }
                                            alt="Category preview"
                                        />

                                        <button
                                            type="button"
                                            className="remove-category-image"
                                            onClick={
                                                handleRemoveImage
                                            }
                                            disabled={
                                                saving
                                            }
                                            aria-label="Remove category image"
                                        >
                                            <X size={16} />
                                        </button>

                                    </div>
                                )}

                            </div>


                            {/* ACTIVE */}

                            <div className="admin-category-active-option">

                                <label>

                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={
                                            formData.is_active
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />

                                    <span>

                                        <strong>
                                            Active category
                                        </strong>

                                        <small>
                                            Allow this
                                            category to
                                            appear to
                                            buyers.
                                        </small>

                                    </span>

                                </label>

                            </div>


                            {/* ACTIONS */}

                            <div className="admin-category-modal-actions">

                                <button
                                    type="button"
                                    className="category-cancel-btn"
                                    onClick={
                                        handleCloseModal
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="category-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingCategory
                                            ? "Update Category"
                                            : "Create Category"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default AdminCategories;