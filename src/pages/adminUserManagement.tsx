import { useState, useEffect } from "react";
import {
  getCompanyUsers,
  addUserToCompany,
  updateCompanyUser,
  deleteCompanyUser,
  getAssignableRoles,
} from "../utils/api";

interface Role {
  role_id: string;
  role_name: string;
  role_description: string;
  permissions: Record<string, boolean>;
}

interface Company {
  company_id: string;
  company_name: string;
  company_status: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  tax_id: string;
  created_at: string;
}

interface User {
  user_id: string;
  email: string;
  user_name: string;
  phone: string;
  is_active: boolean;
  company_id: string;
  role_id: string;
  created_at: string;
  last_login: string | null;
  supabase_user_id: string;
  role: Role;
  company: Company;
}

function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form state for creating new user
  const [formData, setFormData] = useState({
    email: "",
    user_name: "",
    phone: "",
    role_id: "",
    generate_password: true,
    password: "",
  });

  useEffect(() => {
    // Get current user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    loadData();
  }, []);

  // Helper function to check if the editing user is the current admin
  const isEditingSelf = (user: User) => {
    return currentUser && user.user_id === currentUser.user_id;
  };

  // Helper function to check if current user is super_admin
  const isSuperAdmin = () => {
    return currentUser?.role?.role_name === "super_admin";
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load company users and assignable roles in parallel
      const [usersData, rolesData] = await Promise.all([
        getCompanyUsers({
          page: 1,
          per_page: 100, // Get all users for now
        }),
        getAssignableRoles(),
      ]);

      setUsers(usersData.users || []);
      setRoles(rolesData.roles || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      setMessage(`Error loading data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Use real API to create user
      const userData: any = {
        email: formData.email,
        user_name: formData.user_name,
        phone: formData.phone,
        generate_password: formData.generate_password,
        is_active: true,
      };

      // Only include role_id if user is super_admin
      if (isSuperAdmin()) {
        userData.role_id = formData.role_id;
      }

      // Add password if not auto-generating
      if (!formData.generate_password) {
        userData.password = formData.password;
      }

      const result = await addUserToCompany(userData);

      let successMessage = "User created successfully!";
      if (result.generated_password) {
        successMessage += ` Generated password: ${result.generated_password}`;
      }

      setMessage(successMessage);
      setShowCreateForm(false);
      setFormData({
        email: "",
        user_name: "",
        phone: "",
        role_id: "",
        generate_password: true,
        password: "",
      });

      // Reload users
      loadData();
    } catch (error: any) {
      console.error("Error creating user:", error);
      setMessage(`Error creating user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowEditForm(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const userData: any = {
        user_name: formData.get("user_name") as string,
        phone: formData.get("phone") as string,
      };

      // Only include role_id if not editing self and user is super_admin
      if (!isEditingSelf(editingUser) && isSuperAdmin()) {
        userData.role_id = formData.get("role_id") as string;
      }

      const result = await updateCompanyUser(editingUser.user_id, userData);
      setMessage(result.message);
      setShowEditForm(false);
      setEditingUser(null);

      // Reload users
      loadData();
    } catch (error: any) {
      console.error("Error updating user:", error);
      setMessage(`Error updating user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const result = await deleteCompanyUser(userId);
      setMessage(result.message);

      // Remove user from local state
      setUsers(users.filter((user) => user.user_id !== userId));
    } catch (error: any) {
      console.error("Error deleting user:", error);
      setMessage(`Error deleting user: ${error.message}`);
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">Manage users in your company</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {showCreateForm ? "Cancel" : "Create New User"}
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg mb-4 text-sm ${
            message.includes("Error") || message.includes("error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Create User Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Create New User
          </h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="user_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="user_name"
                  value={formData.user_name}
                  onChange={(e) =>
                    setFormData({ ...formData, user_name: e.target.value })
                  }
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              {/* Only show role selection for super_admin */}
              {isSuperAdmin() && (
                <div>
                  <label
                    htmlFor="role_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Role
                  </label>
                  <select
                    id="role_id"
                    value={formData.role_id}
                    onChange={(e) =>
                      setFormData({ ...formData, role_id: e.target.value })
                    }
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="generate_password"
                  type="checkbox"
                  checked={formData.generate_password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      generate_password: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="generate_password"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Generate password automatically
                </label>
              </div>
            </div>

            {!formData.generate_password && (
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!formData.generate_password}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Form */}
      {showEditForm && editingUser && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {isEditingSelf(editingUser) ? "Edit My Profile" : "Edit User"}
            </h2>
            {isEditingSelf(editingUser) && (
              <p className="text-sm text-gray-600 mt-1">
                Note: You cannot change your own role for security reasons.
              </p>
            )}
          </div>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit_user_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="edit_user_name"
                  name="user_name"
                  defaultValue={editingUser.user_name}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label
                  htmlFor="edit_email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email (Read Only)
                </label>
                <input
                  type="email"
                  id="edit_email"
                  defaultValue={editingUser.email}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label
                  htmlFor="edit_phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="edit_phone"
                  name="phone"
                  defaultValue={editingUser.phone}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
              {/* Only show role field if not editing self and user is super_admin */}
              {!isEditingSelf(editingUser) && isSuperAdmin() && (
                <div>
                  <label
                    htmlFor="edit_role_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Role
                  </label>
                  <select
                    id="edit_role_id"
                    name="role_id"
                    defaultValue={editingUser.role_id}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name} - {role.role_description}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Show read-only role field if editing self */}
              {isEditingSelf(editingUser) && (
                <div>
                  <label
                    htmlFor="edit_role_readonly"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Role (Cannot be changed)
                  </label>
                  <input
                    type="text"
                    id="edit_role_readonly"
                    value={`${editingUser.role?.role_name} - ${editingUser.role?.role_description}`}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Company Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.user_name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {user.role?.role_name || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.user_id)}
                        className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUserManagement;
