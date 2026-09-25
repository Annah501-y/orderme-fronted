import React, { useEffect, useState } from "react";

import {
    Search,
    RefreshCw,
    UserRound,
    Mail,
    Phone,
    ShieldCheck,
    Store,
    ShoppingBag,
    MoreVertical,
    Edit,
    Power,
    X,
} from "lucide-react";

import "../../pages_styles/admin-styles/admin-users.css";

const API_URL = import.meta.env.VITE_API_URL;

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");

    const [selectedUser, setSelectedUser] = useState(null);
    const [openActionId, setOpenActionId] = useState(null);

    // Edit modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
    });

    const [saving, setSaving] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);

    // ==========================================
    // FETCH USERS
    // ==========================================

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const params = new URLSearchParams();

            if (search.trim()) {
                params.append("search", search.trim());
            }

            if (role) {
                params.append("role", role);
            }

            const query = params.toString();

            const response = await fetch(
                `${API_URL}/admin/users${query ? `?${query}` : ""}`,
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
                    result.message || "Failed to retrieve users."
                );
            }

            setUsers(result.data || []);
        } catch (err) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // INITIAL FETCH + ROLE FILTER
    // ==========================================

    useEffect(() => {
        fetchUsers();
    }, [role]);

    // ==========================================
    // SEARCH
    // ==========================================

    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers();
    };

    // ==========================================
    // REFRESH
    // ==========================================

    const handleRefresh = () => {
        fetchUsers();
    };

    // ==========================================
    // ACTION MENU
    // ==========================================

    const handleActionToggle = (userId) => {
        setOpenActionId((current) =>
            current === userId ? null : userId
        );
    };

    // ==========================================
    // ROLE
    // ==========================================

    const getUserRole = (user) => {
        return user.roles?.[0]?.name || "No Role";
    };

    const getRoleIcon = (user) => {
        const userRole = getUserRole(user);

        if (userRole === "admin") {
            return <ShieldCheck size={15} />;
        }

        if (userRole === "seller") {
            return <Store size={15} />;
        }

        if (userRole === "buyer") {
            return <ShoppingBag size={15} />;
        }

        return <UserRound size={15} />;
    };

    const formatRole = (user) => {
        const userRole = getUserRole(user);

        return userRole.charAt(0).toUpperCase() + userRole.slice(1);
    };

    // ==========================================
    // VIEW DETAILS
    // ==========================================

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setOpenActionId(null);
    };

    // ==========================================
    // OPEN EDIT MODAL
    // ==========================================

    const handleEditUser = (user) => {
        setSelectedUser(user);

        setEditForm({
            name: user.name || "",
            email: user.email || "",
        });

        setShowEditModal(true);
        setOpenActionId(null);
    };

    // ==========================================
    // EDIT INPUT
    // ==========================================

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    // ==========================================
    // UPDATE USER
    // ==========================================

    const handleUpdateUser = async (e) => {
        e.preventDefault();

        if (!selectedUser) {
            return;
        }

        try {
            setSaving(true);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/admin/users/${selectedUser.id}`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: editForm.name,
                        email: editForm.email,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                if (result.errors) {
                    const firstError = Object.values(result.errors)[0]?.[0];

                    throw new Error(
                        firstError || result.message || "Failed to update user."
                    );
                }

                throw new Error(
                    result.message || "Failed to update user."
                );
            }

            // Update user in table immediately
            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === result.data.id
                        ? result.data
                        : user
                )
            );

            setSelectedUser(result.data);
            setShowEditModal(false);

        } catch (err) {
            alert(err.message || "Failed to update user.");
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // ACTIVATE / DEACTIVATE
    // ==========================================

    const handleStatusChange = async (user) => {
        const newStatus = !user.is_active;

        const action = newStatus ? "activate" : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${user.name}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setStatusUpdating(true);
            setOpenActionId(null);

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/admin/users/${user.id}/status`,
                {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        is_active: newStatus,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || `Failed to ${action} user.`
                );
            }

            // Update table
            setUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    currentUser.id === user.id
                        ? {
                              ...currentUser,
                              is_active: result.data.is_active,
                          }
                        : currentUser
                )
            );

            // Update selected user if modal is open
            if (selectedUser?.id === user.id) {
                setSelectedUser((current) => ({
                    ...current,
                    is_active: result.data.is_active,
                }));
            }

        } catch (err) {
            alert(err.message || "Failed to update user status.");
        } finally {
            setStatusUpdating(false);
        }
    };

    // ==========================================
    // CLOSE DETAILS
    // ==========================================

    const closeDetails = () => {
        setSelectedUser(null);
    };

    // ==========================================
    // CLOSE EDIT MODAL
    // ==========================================

    const closeEditModal = () => {
        if (saving) {
            return;
        }

        setShowEditModal(false);
    };

    return (
        <div className="admin-users-page">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="admin-users-header">
                <div>
                    <span className="admin-users-label">
                        ADMINISTRATION
                    </span>

                    <h1>Users</h1>

                    <p>
                        Manage buyers, sellers and administrators
                        registered on OrderMe.
                    </p>
                </div>

                <button
                    type="button"
                    className="admin-users-refresh-btn"
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "admin-users-spin" : ""}
                    />

                    Refresh
                </button>
            </div>

            {/* ==========================================
                FILTERS
            ========================================== */}

            <div className="admin-users-filters">

                <form
                    className="admin-users-search"
                    onSubmit={handleSearch}
                >
                    <Search size={18} />

                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    <button type="submit">
                        Search
                    </button>
                </form>

                <select
                    className="admin-users-role-filter"
                    value={role}
                    onChange={(e) =>
                        setRole(e.target.value)
                    }
                >
                    <option value="">All Roles</option>
                    <option value="buyer">Buyers</option>
                    <option value="seller">Sellers</option>
                    <option value="admin">Administrators</option>
                </select>

            </div>

            {/* ==========================================
                SUMMARY
            ========================================== */}

            <div className="admin-users-summary">
                <strong>{users.length}</strong>{" "}
                user{users.length !== 1 ? "s" : ""} found
            </div>

            {/* ==========================================
                ERROR
            ========================================== */}

            {error && (
                <div className="admin-users-error">
                    {error}
                </div>
            )}

            {/* ==========================================
                LOADING
            ========================================== */}

            {loading ? (
                <div className="admin-users-loading">
                    <RefreshCw
                        size={22}
                        className="admin-users-spin"
                    />

                    <span>Loading users...</span>
                </div>
            ) : users.length === 0 ? (
                <div className="admin-users-empty">
                    <UserRound size={38} />

                    <h3>No users found</h3>

                    <p>
                        Try changing your search or role filter.
                    </p>
                </div>
            ) : (

                /* ==========================================
                   USERS TABLE
                ========================================== */

                <div className="admin-users-table-wrapper">

                    <table className="admin-users-table">

                        <thead>
                            <tr>
                                <th>USER</th>
                                <th>CONTACT</th>
                                <th>ROLE</th>
                                <th>STATUS</th>
                                <th>REGISTERED</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>

                        <tbody>

                            {users.map((user) => (

                                <tr key={user.id}>

                                    {/* USER */}

                                    <td>
                                        <div className="admin-user-info">

                                            <div className="admin-user-avatar">
                                                <UserRound size={19} />
                                            </div>

                                            <div>
                                                <strong>
                                                    {user.name}
                                                </strong>

                                                <span>
                                                    ID: #{user.id}
                                                </span>
                                            </div>

                                        </div>
                                    </td>

                                    {/* CONTACT */}

                                    <td>
                                        <div className="admin-user-contact">

                                            <span>
                                                <Mail size={14} />
                                                {user.email}
                                            </span>

                                            <span>
                                                <Phone size={14} />
                                                {user.phone || "Not provided"}
                                            </span>

                                        </div>
                                    </td>

                                    {/* ROLE */}

                                    <td>
                                        <span
                                            className={`admin-user-role admin-user-role-${getUserRole(
                                                user
                                            )}`}
                                        >
                                            {getRoleIcon(user)}
                                            {formatRole(user)}
                                        </span>
                                    </td>

                                    {/* STATUS */}

                                    <td>
                                        <span
                                            className={
                                                user.is_active
                                                    ? "admin-user-status active"
                                                    : "admin-user-status inactive"
                                            }
                                        >
                                            <span className="admin-user-status-dot"></span>

                                            {user.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </td>

                                    {/* REGISTERED */}

                                    <td>
                                        {user.created_at
                                            ? new Date(
                                                  user.created_at
                                              ).toLocaleDateString()
                                            : "—"}
                                    </td>

                                    {/* ACTION */}

                                    <td className="admin-user-action-cell">

                                        <button
                                            type="button"
                                            className="admin-user-action-btn"
                                            onClick={() =>
                                                handleActionToggle(
                                                    user.id
                                                )
                                            }
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {openActionId === user.id && (

                                            <div className="admin-user-action-menu">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleViewDetails(
                                                            user
                                                        )
                                                    }
                                                >
                                                    <UserRound size={15} />
                                                    View Details
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEditUser(
                                                            user
                                                        )
                                                    }
                                                >
                                                    <Edit size={15} />
                                                    Edit User
                                                </button>

                                                <div className="admin-user-action-divider" />

                                                <button
                                                    type="button"
                                                    className={
                                                        user.is_active
                                                            ? "admin-user-action-danger"
                                                            : "admin-user-action-success"
                                                    }
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            user
                                                        )
                                                    }
                                                >
                                                    <Power size={15} />

                                                    {user.is_active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>

                                            </div>
                                        )}

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>
            )}

            {/* ==========================================
                VIEW DETAILS MODAL
            ========================================== */}

            {selectedUser && !showEditModal && (

                <div
                    className="admin-user-modal-backdrop"
                    onClick={closeDetails}
                >

                    <div
                        className="admin-user-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="admin-user-modal-header">

                            <div>
                                <span>
                                    USER DETAILS
                                </span>

                                <h3>
                                    {selectedUser.name}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={closeDetails}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="admin-user-modal-body">

                            <div className="admin-user-detail-row">
                                <span>Name</span>
                                <strong>
                                    {selectedUser.name}
                                </strong>
                            </div>

                            <div className="admin-user-detail-row">
                                <span>Email</span>
                                <strong>
                                    {selectedUser.email}
                                </strong>
                            </div>

                            <div className="admin-user-detail-row">
                                <span>Phone</span>
                                <strong>
                                    {selectedUser.phone ||
                                        "Not provided"}
                                </strong>
                            </div>

                            <div className="admin-user-detail-row">
                                <span>Role</span>
                                <strong>
                                    {formatRole(selectedUser)}
                                </strong>
                            </div>

                            <div className="admin-user-detail-row">
                                <span>Status</span>

                                <strong
                                    className={
                                        selectedUser.is_active
                                            ? "admin-user-modal-active"
                                            : "admin-user-modal-inactive"
                                    }
                                >
                                    {selectedUser.is_active
                                        ? "Active"
                                        : "Inactive"}
                                </strong>
                            </div>

                            <div className="admin-user-detail-row">
                                <span>User ID</span>
                                <strong>
                                    #{selectedUser.id}
                                </strong>
                            </div>

                            <div className="admin-user-detail-row">
                                <span>Registered</span>
                                <strong>
                                    {selectedUser.created_at
                                        ? new Date(
                                              selectedUser.created_at
                                          ).toLocaleDateString()
                                        : "—"}
                                </strong>
                            </div>

                        </div>

                        <div className="admin-user-modal-footer">

                            <button
                                type="button"
                                onClick={() =>
                                    handleEditUser(
                                        selectedUser
                                    )
                                }
                            >
                                <Edit size={15} />
                                Edit User
                            </button>

                            <button
                                type="button"
                                className={
                                    selectedUser.is_active
                                        ? "admin-modal-danger-btn"
                                        : "admin-modal-success-btn"
                                }
                                onClick={() =>
                                    handleStatusChange(
                                        selectedUser
                                    )
                                }
                                disabled={statusUpdating}
                            >
                                <Power size={15} />

                                {selectedUser.is_active
                                    ? "Deactivate"
                                    : "Activate"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* ==========================================
                EDIT USER MODAL
            ========================================== */}

            {showEditModal && selectedUser && (

                <div
                    className="admin-user-modal-backdrop"
                    onClick={closeEditModal}
                >

                    <div
                        className="admin-user-modal admin-user-edit-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="admin-user-modal-header">

                            <div>
                                <span>
                                    EDIT USER
                                </span>

                                <h3>
                                    {selectedUser.name}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={closeEditModal}
                                disabled={saving}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form onSubmit={handleUpdateUser}>

                            <div className="admin-user-modal-body">

                                <div className="admin-user-form-group">

                                    <label htmlFor="name">
                                        Full Name
                                    </label>

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={editForm.name}
                                        onChange={
                                            handleEditChange
                                        }
                                        required
                                    />

                                </div>

                                <div className="admin-user-form-group">

                                    <label htmlFor="email">
                                        Email Address
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={editForm.email}
                                        onChange={
                                            handleEditChange
                                        }
                                        required
                                    />

                                </div>

                            </div>

                            <div className="admin-user-modal-footer">

                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="admin-modal-save-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default AdminUsers;