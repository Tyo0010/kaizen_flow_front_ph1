import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import NumberCode from '../components/numberCode';
import { CustomizationModal, type CompanyCustomization } from '../components/TransformationModal';
import { Trash2, Edit, Plus } from 'lucide-react';
import { 
    // Admin API functions
    fetchCompanies as apiFetchCompanies,
    createCompany as apiCreateCompany,
    updateCompany as apiUpdateCompany,
    deleteCompany as apiDeleteCompany,
    fetchUsers as apiFetchUsers,
    createUser as apiCreateUser,
    updateUser as apiUpdateUser,
    deleteUser as apiDeleteUser,
    toggleUserStatus as apiToggleUserStatus,
    fetchRoles as apiFetchRoles
} from '../utils/api';

type AdminSection = 'user' | 'company' | 'userRole' | 'outputFormat';
type CrudAction = 'create' | 'update' | 'delete';

interface User {
    user_id: string;
    email: string;
    user_name: string;
    is_active: boolean;
    role: {
        role_id: string;
        role_name: string;
        role_description: string;
        permissions: any;
    };
    company: {
        company_id: string;
        company_name: string;
        company_status: string;
        company_address: string;
        company_phone: string;
        company_email: string;
    };
}

interface AdminPanelProps {
    setUser: (user: User | null) => void;
}

interface Company {
    company_id: string;
    company_name: string;
    company_status: string;
    created_at: string;
    updated_at: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    tax_id: string;
    customizations?: CompanyCustomization[];
}

interface UserData {
    user_id: string;
    company_id: string;
    role_id: string;
    supabase_user_id: string;
    user_name: string;
    email: string;
    phone: string;
    is_active: boolean;
    last_login: string;
    created_at: string;
    updated_at: string;
}

interface UserRole {
    role_id: string;
    role_name: string;
    role_description: string;
    permissions: string[];
    created_at: string;
    updated_at: string;
}

function AdminPanel({ setUser }: AdminPanelProps) {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<AdminSection>('user');
    const [activeCrudAction, setActiveCrudAction] = useState<CrudAction>('create');
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [roles, setRoles] = useState<UserRole[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [message, setMessage] = useState('')
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [generatePassword, setGeneratePassword] = useState(false);
    
    // Customization state
    const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
    const [editingCustomization, setEditingCustomization] = useState<CompanyCustomization | null>(null);

    const handleLogout = async () => {
        // Clear stored tokens and user data
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')

        // Clear user state in App component
        setUser(null)

        navigate('/');
    };

    // Fetch companies from API
    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const data = await apiFetchCompanies();
            // Ensure customizations is at least an empty array if missing
            const processedData = (data.companies || []).map((c: any) => ({
                ...c,
                customizations: c.customizations || []
            }));
            setCompanies(processedData);
        } catch (error) {
            console.error('Error fetching companies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCustomization = (customization: CompanyCustomization) => {
        if (!selectedCompany) return;

        const currentCustomizations = selectedCompany.customizations || [];
        const exists = currentCustomizations.find(c => c.id === customization.id);

        let newCustomizations;
        if (exists) {
            newCustomizations = currentCustomizations.map(c => 
                c.id === customization.id ? customization : c
            );
        } else {
            newCustomizations = [...currentCustomizations, customization];
        }

        setSelectedCompany({
            ...selectedCompany,
            customizations: newCustomizations
        });
        setIsCustomizationModalOpen(false);
        setEditingCustomization(null);
    };

    const removeCustomization = (id: string) => {
        if (!selectedCompany) return;
        const newCustomizations = (selectedCompany.customizations || []).filter(c => c.id !== id);
        setSelectedCompany({
            ...selectedCompany,
            customizations: newCustomizations
        });
    };

    // Fetch users from API
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await apiFetchUsers();
            setUsers(data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch roles from API
    const fetchRoles = async () => {
        try {
            const data = await apiFetchRoles();
            setRoles(data.roles || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
            // If it's an authentication error, handleApiResponse will already handle logout
        }
    };


    // Load data when component mounts or when section is selected
    useEffect(() => {
        // Check if user is authenticated before making API calls
        const accessToken = localStorage.getItem('access_token')

        if (!accessToken) {
            console.error('No access token found, redirecting to login')
            handleLogout()
            return
        }

        setMessage('')

        switch (activeSection) {
            case 'company':
                fetchCompanies();
                break;
            case 'user':
                fetchUsers();
                fetchCompanies(); // Need companies for user creation
                fetchRoles(); // Need roles for user creation
                break;
        }
    }, [activeSection]);

    // Clear messages when switching between CRUD actions
    useEffect(() => {
        setMessage('')
        
    }, [activeCrudAction]);

    // Handle selections for update/delete
    const handleCompanySelect = (companyId: string) => {
        const company = companies.find(c => c.company_id === companyId);
        setSelectedCompany(company || null);
    };

    const handleUserSelect = (userId: string) => {
        const user = users.find(u => u.user_id === userId);
        setSelectedUser(user || null);
    };

    const getSectionTitle = (section: AdminSection, action?: CrudAction): string => {
        let title = '';
        switch (section) {
            case 'user': title = 'User'; break;
            case 'company': title = 'Company'; break;
            default: title = '';
        }
        if (action) {
            switch (action) {
                case 'create': title = `Create New ${title}`; break;
                case 'update': title = `Update ${title}`; break;
                case 'delete': title = `Delete ${title}`; break;
            }
        }
        return title;
    };

    const renderSectionContent = () => {
        // User Section
        if (activeSection === 'user') {
            if (activeCrudAction === 'create') {
                return (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                            {getSectionTitle('user', 'create')}
                        </h1>
                        {message && (
                            <div className={`p-3 rounded-lg mb-4 max-w-[420px] w-full text-sm ${message.includes('Error') || message.includes('error')
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                                }`}>
                                {message}
                            </div>
                        )}
                        <form className="space-y-6 max-w-2xl" onSubmit={handleCreateUser}>
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                                    User Full Name
                                </label>
                                <input
                                    type="text" name="fullName" id="fullName" required placeholder="Enter user full name"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    User Email
                                </label>
                                <input
                                    type="email" name="email" id="email" placeholder="Enter user email" required
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel" name="phone" id="phone" placeholder="Enter phone number" required
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password" 
                                    name="password" 
                                    id="password" 
                                    placeholder="Enter password" 
                                    required={!generatePassword}
                                    disabled={generatePassword}
                                    className={`w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${generatePassword ? 'bg-gray-100' : 'bg-white'}`}
                                />
                            </div>
                            <div className="flex items-center">
                                <input 
                                    id="generatePassword" 
                                    name="generatePassword"
                                    type="checkbox" 
                                    checked={generatePassword}
                                    onChange={(e) => setGeneratePassword(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                                />
                                <label htmlFor="generatePassword" className="ml-2 block text-sm text-gray-700">
                                    Generate password automatically
                                </label>
                            </div>
                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company
                                </label>
                                <select
                                    name="company" id="company" required
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8 bg-no-repeat bg-right"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                                >
                                    <option value="">Select company</option>
                                    {companies.map(company => (
                                        <option key={company.company_id} value={company.company_id}>
                                            {company.company_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="userRole" className="block text-sm font-medium text-gray-700 mb-1">
                                    User's Role
                                </label>
                                <select
                                    name="userRole" id="userRole" required
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8 bg-no-repeat bg-right"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                                >
                                    <option value="">Select user's role</option>
                                    {roles.map(role => (
                                        <option key={role.role_id} value={role.role_id}>
                                            {role.role_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* User List Table */}
                            {users.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4">All Users</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {users.map((user) => (
                                                    <tr key={user.user_id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-900">{user.user_name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {companies.find(c => c.company_id === user.company_id)?.company_name || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {roles.find(r => r.role_id === user.role_id)?.role_name || 'N/A'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                user.is_active 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {user.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <button
                                                                onClick={() => handleToggleUserStatus(user.user_id)}
                                                                className={`px-3 py-1 text-xs font-medium rounded ${
                                                                    user.is_active
                                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                } transition-colors`}
                                                            >
                                                                {user.is_active ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                    Create User
                                </button>
                            </div>
                        </form>
                    </>
                );
            } else if (activeCrudAction === 'update') {
                return (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-800 mb-6">{getSectionTitle('user', 'update')}</h1>
                        <form className="space-y-6 max-w-2xl" onSubmit={handleUpdateUser}>
                            <div>
                                <label htmlFor="selectUser" className="block text-sm font-medium text-gray-700 mb-1">
                                    Select User to Update
                                </label>
                                {message && (
                                    <div className={`p-3 rounded-lg mb-4 max-w-[420px] w-full text-sm ${message.includes('Error') || message.includes('error')
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {message}
                                    </div>
                                )}
                                <select
                                    name="selectUser" id="selectUser"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8 bg-no-repeat bg-right"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                                    onChange={(e) => handleUserSelect(e.target.value)}
                                >
                                    <option value="">Select user</option>
                                    {users.map(user => (
                                        <option key={user.user_id} value={user.user_id}>
                                            {user.user_name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="updateFullName" className="block text-sm font-medium text-gray-700 mb-1">
                                    User Full Name
                                </label>
                                <input
                                    type="text" 
                                    name="fullName" 
                                    id="updateFullName" 
                                    placeholder="Enter user full name"
                                    value={selectedUser ? selectedUser.user_name : ''}
                                    onChange={(e) => setSelectedUser(prev => prev ? { ...prev, user_name: e.target.value } : null)}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="updateUserEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                    User Email (Read Only)
                                </label>
                                <input
                                    type="email" 
                                    name="email" 
                                    id="updateUserEmail" 
                                    placeholder="User email cannot be changed"
                                    value={selectedUser ? selectedUser.email : ''}
                                    disabled
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel" 
                                    name="phone" 
                                    id="phone" 
                                    placeholder="Enter phone number" 
                                    value={selectedUser ? selectedUser.phone || '' : ''}
                                    onChange={(e) => setSelectedUser(prev => prev ? { ...prev, phone: e.target.value } : null)}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="updateCompany" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company
                                </label>
                                <select
                                    name="company" id="updateCompany" value={selectedUser ? selectedUser.company_id : ''}
                                    onChange={(e) => setSelectedUser(prev => prev ? { ...prev, company_id: e.target.value } : null)}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8 bg-no-repeat bg-right"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                                >
                                    <option value="">Select company</option>
                                    {companies.map(company => (
                                        <option key={company.company_id} value={company.company_id}>
                                            {company.company_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="updateUserRole" className="block text-sm font-medium text-gray-700 mb-1">
                                    User's Role
                                </label>
                                <select
                                    name="userRole" id="updateUserRole" value={selectedUser ? selectedUser.role_id : ''}
                                    onChange={(e) => setSelectedUser(prev => prev ? { ...prev, role_id: e.target.value } : null)}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8 bg-no-repeat bg-right"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                                >
                                    <option value="">Select user's role</option>
                                    {roles.map(role => (
                                        <option key={role.role_id} value={role.role_id}>
                                            {role.role_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="updateIsActive" className="block text-sm font-medium text-gray-700 mb-1">
                                    Is Active
                                </label>
                                <select
                                    name="isActive" id="updateIsActive"
                                    value={selectedUser ? selectedUser.is_active ? 'true' : 'false' : ''}
                                    onChange={(e) => setSelectedUser(prev => prev ? { ...prev, is_active: e.target.value === 'true' } : null)}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8 bg-no-repeat bg-right"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                                >
                                    <option value="true">Yes</option>
                                    <option value="false">No</option>
                                </select>

                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors">
                                    Update User
                                </button>
                            </div>
                        </form>
                    </>
                );
            } else if (activeCrudAction === 'delete') {
                return (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-800 mb-6">{getSectionTitle('user', 'delete')}</h1>
                        <form className="space-y-6 max-w-2xl" onSubmit={handleDeleteUser}>
                            <div>
                                <label htmlFor="deleteUser" className="block text-sm font-medium text-gray-700 mb-1">
                                    Select User to Delete
                                </label>
                                {message && (
                                    <div className={`p-3 rounded-lg mb-4 max-w-[420px] w-full text-sm ${message.includes('Error') || message.includes('error')
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {message}
                                    </div>
                                )}
                                <select
                                    name="deleteUser" id="deleteUser" onChange={(e) => handleUserSelect(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none pr-8 bg-no-repeat bg-right"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                                >
                                    <option value="">Select user</option>
                                    {users.map(user => (
                                        <option key={user.user_id} value={user.user_id}>
                                            {user.user_name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedUser && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h3 className="text-sm font-medium text-gray-800 mb-2">User Details:</h3>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><strong>Name:</strong> {selectedUser.user_name}</p>
                                        <p><strong>Email:</strong> {selectedUser.email}</p>
                                        <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                                        <p><strong>Company:</strong> {companies.find(c => c.company_id === selectedUser.company_id)?.company_name || 'N/A'}</p>
                                        <p><strong>Role:</strong> {roles.find(r => r.role_id === selectedUser.role_id)?.role_name || 'N/A'}</p>
                                        <p><strong>Active:</strong> {selectedUser.is_active ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                            )}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Warning</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>This action cannot be undone. This will permanently delete the user account and all associated data.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                                    Delete User
                                </button>
                            </div>
                        </form>
                    </>
                );
            }
        }
        // Company Section
        else if (activeSection === 'company') {
            if (activeCrudAction === 'create') {
                return (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                            {getSectionTitle('company', 'create')}
                        </h1>
                        {message && (
                            <div className={`p-3 rounded-lg mb-4 max-w-[420px] w-full text-sm ${message.includes('Error') || message.includes('error')
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                                }`}>
                                {message}
                            </div>
                        )}
                        <form className="space-y-6 max-w-2xl" onSubmit={handleCreateCompany}>
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Name
                                </label>
                                <input
                                    type="text" name="companyName" id="companyName" placeholder="Enter company name" required
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Address
                                </label>
                                <input
                                    type="text" name="companyAddress" id="companyAddress" placeholder="Enter Company Address" required
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Phone Number
                                </label>
                                <input
                                    type="tel" name="companyPhone" id="companyPhone" placeholder="Enter phone number" required
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                    Company Email
                                </label>
                                <input
                                    type="email" name="companyEmail" id="companyEmail" placeholder="Enter Company Email" required
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tax ID (Optional)
                                </label>
                                <input
                                    type="text" name="taxId" id="taxId" placeholder="Enter Tax ID"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                    Create Company
                                </button>
                            </div>
                        </form>
                    </>
                );
            }
            else if (activeCrudAction === 'update') {
                return (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-800 mb-6">{getSectionTitle('company', 'update')}</h1>
                        {loading ? (
                            <div className="text-center py-4">Loading companies...</div>
                        ) : (
                            <form className="space-y-6 max-w-2xl" onSubmit={handleUpdateCompany}>
                                <div>
                                    <label htmlFor="selectCompany" className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Company to Update
                                    </label>
                                    {message && (
                                        <div className={`p-3 rounded-lg mb-4 max-w-[420px] w-full text-sm ${message.includes('Error') || message.includes('error')
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {message}
                                        </div>
                                    )}
                                    <select
                                        name="selectCompany"
                                        id="selectCompany"
                                        onChange={(e) => handleCompanySelect(e.target.value)} 
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8 bg-no-repeat bg-right"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                                    >
                                        <option value="">Select company</option>
                                        {companies.map(company => (
                                            <option key={company.company_id} value={company.company_id}>
                                                {company.company_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="updateCompanyName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Name
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        id="updateCompanyName"
                                        placeholder="Enter company name"
                                        value={selectedCompany?.company_name || ''}
                                        onChange={(e) => setSelectedCompany(prev => prev ? { ...prev, company_name: e.target.value } : null)}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="updateCompanyAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Address
                                    </label>
                                    <input
                                        type="text"
                                        name="companyAddress"
                                        id="updateCompanyAddress"
                                        placeholder="Enter Company Address"
                                        value={selectedCompany?.company_address || ''}
                                        onChange={(e) => setSelectedCompany(prev => prev ? { ...prev, company_address: e.target.value } : null)}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="updatePhone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Phone Number
                                    </label>
                                    <div className="flex space-x-2">
                                        <NumberCode />
                                        <input
                                            type="tel"
                                            id="updatePhone"
                                            name="companyPhone"
                                            placeholder="Phone"
                                            value={selectedCompany?.company_phone || ''}
                                            onChange={(e) => setSelectedCompany(prev => prev ? { ...prev, company_phone: e.target.value } : null)}
                                            className="block w-2/3 px-3 py-2 border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="updateCompanyEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                        Company Email
                                    </label>
                                    <input
                                        type="email"
                                        name="companyEmail"
                                        id="updateCompanyEmail"
                                        placeholder="Enter Company Email"
                                        value={selectedCompany?.company_email || ''}
                                        onChange={(e) => setSelectedCompany(prev => prev ? { ...prev, company_email: e.target.value } : null)}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="updateTaxId" className="block text-sm font-medium text-gray-700 mb-1">
                                        Tax ID
                                    </label>
                                    <input
                                        type="text"
                                        name="taxId"
                                        id="updateTaxId"
                                        placeholder="Enter Tax ID"
                                        value={selectedCompany?.tax_id || ''}
                                        onChange={(e) => setSelectedCompany(prev => prev ? { ...prev, tax_id: e.target.value } : null)}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                <label htmlFor="updateIsActive" className="block text-sm font-medium text-gray-700 mb-1">
                                    Is Active
                                </label>
                                <select
                                    name="companyStatus" id="updateIsActive"
                                    value={selectedCompany ? selectedCompany.company_status === 'active' ? 'active' : 'inactive' : ''}
                                    onChange={(e) => setSelectedCompany(prev => prev ? { ...prev, company_status: e.target.value } : null)}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8 bg-no-repeat bg-right"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>

                            </div>

                                {/* Company Customizations Section */}
                                <div className="border-t pt-6 mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Company Customizations</h3>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingCustomization(null);
                                                setIsCustomizationModalOpen(true);
                                            }}
                                            className="flex items-center space-x-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Add New</span>
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Define sub-company specific transformation rules and custom AI prompts.
                                    </p>
                                    {/* a1: login as su, click be, update tab to perform be cust */}
                                    <div className="space-y-3">
                                        {selectedCompany?.customizations && selectedCompany.customizations.length > 0 ? (
                                            selectedCompany.customizations.map((cust) => (
                                                <div key={cust.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{cust.sub_company_name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {cust.transformations?.length || 0} transformations, {cust.custom_prompt ? 'Custom prompt active' : 'No custom prompt'}
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingCustomization(cust);
                                                                setIsCustomizationModalOpen(true);
                                                            }}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeCustomization(cust.id)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 border-2 border-dashed rounded-lg text-gray-400 text-sm">
                                                No customizations defined yet.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={!selectedCompany}
                                        className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Update Company
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                );
            } else if (activeCrudAction === 'delete') {
                return (
                    <>
                        <h1 className="text-2xl font-semibold text-gray-800 mb-6">{getSectionTitle('company', 'delete')}</h1>
                        {loading ? (
                            <div className="text-center py-4">Loading companies...</div>
                        ) : (
                            <form className="space-y-6 max-w-2xl" onSubmit={handleDeleteCompany}>
                                <div>
                                    <label htmlFor="deleteCompany" className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Company to Delete
                                    </label>
                                    {message && (
                                        <div className={`p-3 rounded-lg mb-4 max-w-[420px] w-full text-sm ${message.includes('Error') || message.includes('error')
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {message}
                                        </div>
                                    )}
                                    <select
                                        name="deleteCompany"
                                        id="deleteCompany"
                                        onChange={(e) => handleCompanySelect(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none pr-8 bg-no-repeat bg-right"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")` }}
                                    >
                                        <option value="">Select company</option>
                                        {companies.map(company => (
                                            <option key={company.company_id} value={company.company_id}>
                                                {company.company_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Display selected company details */}
                                {selectedCompany && (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-800 mb-2">Company Details:</h3>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><strong>Name:</strong> {selectedCompany.company_name}</p>
                                            <p><strong>Address:</strong> {selectedCompany.company_address}</p>
                                            <p><strong>Phone:</strong> {selectedCompany.company_phone}</p>
                                            <p><strong>Email:</strong> {selectedCompany.company_email}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">Warning</h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <p>This action cannot be undone. This will permanently delete the company and all associated data.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={!selectedCompany}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Delete Company
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                );
            }
        }
        return null;
    };

    // Form submission handlers
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const formData = new FormData(e.target as HTMLFormElement)
            const userData: any = {
                email: formData.get('email') as string,
                user_name: formData.get('fullName') as string,
                company_id: formData.get('company') as string,
                role_id: formData.get('userRole') as string,
                phone: formData.get('phone') as string,
                is_active: true,
                generate_password: generatePassword
            }

            // Only include password if not generating automatically
            if (!generatePassword) {
                userData.password = formData.get('password') as string
            }

            const data = await apiCreateUser(userData)
            console.log('User created:', data)
            let message = 'User registered successfully'
            if (data.generated_password) {
                message += `. Generated password: ${data.generated_password}`
            }
            setMessage(message)
            fetchUsers() // Refresh users list
            setGeneratePassword(false) // Reset generate password option
            // Reset form
            ; (e.target as HTMLFormElement).reset()
        } catch (error: any) {
            console.error('Signup error:', error)
            setMessage(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const formData = new FormData(e.target as HTMLFormElement)
            const companyData = {
                company_name: formData.get('companyName') as string,
                company_address: formData.get('companyAddress') as string,
                company_phone: formData.get('companyPhone') as string,
                company_email: formData.get('companyEmail') as string,
                tax_id: formData.get('taxId') as string || undefined,
                company_status: 'active'
            }

            console.log('Sending company data:', companyData) // Debug log

            const data = await apiCreateCompany(companyData)
            console.log('Company created successfully:', data)
            setMessage('Company created successfully')
            fetchCompanies() // Refresh companies list
            // Reset form
            ; (e.target as HTMLFormElement).reset()
        } catch (error: any) {
            console.error('Error creating company:', error)
            setMessage(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }


    const handleUpdateCompany = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        try {
            if (!selectedCompany) {
                setMessage('Error: No company selected')
                setLoading(false)
                return
            }

            const formData = new FormData(e.target as HTMLFormElement)
            const companyData = {
                company_name: formData.get('companyName') as string,
                company_status: formData.get('companyStatus') as string,
                company_address: formData.get('companyAddress') as string,
                company_phone: formData.get('companyPhone') as string,
                company_email: formData.get('companyEmail') as string,
                tax_id: formData.get('taxId') as string || undefined,
                customizations: selectedCompany.customizations || []
            }
            
            const data = await apiUpdateCompany(selectedCompany.company_id, companyData)
            console.log('Company updated successfully:', data)
            setMessage('Company updated successfully')
            fetchCompanies() // Refresh companies list
            setSelectedCompany(null) // Reset selected company
            // Reset form
            ; (e.target as HTMLFormElement).reset()
        } catch (error: any) {
            console.error('Error updating company:', error)
            setMessage(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        
        try {
            if (!selectedUser) {
                setMessage('Error: No user selected')
                setLoading(false)
                return
            }

            const formData = new FormData(e.target as HTMLFormElement)
            const userData = {
                user_name: formData.get('fullName') as string,
                phone: formData.get('phone') as string,
                company_id: formData.get('company') as string,
                role_id: formData.get('userRole') as string,
                is_active: formData.get('isActive') === 'true'
            }

            const data = await apiUpdateUser(selectedUser.user_id, userData)
            console.log('User updated successfully:', data)
            setMessage('User updated successfully')
            fetchUsers() // Refresh users list
            setSelectedUser(null) // Reset selected user
            // Reset form
            ; (e.target as HTMLFormElement).reset()
        } catch (error: any) {
            console.error('Error updating user:', error)
            setMessage(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteCompany = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        
        if (!selectedCompany) {
            setMessage('Error: No company selected')
            setLoading(false)
            return
        }

        try {
            await apiDeleteCompany(selectedCompany.company_id)
            setMessage('Company deleted successfully')
            fetchCompanies() // Refresh companies list
            setSelectedCompany(null) // Reset selected company
        } catch (error: any) {
            console.error('Error deleting company:', error)
            setMessage(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleUserStatus = async (userId: string) => {
        setLoading(true)
        try {
            const data = await apiToggleUserStatus(userId)
            console.log('User status toggled:', data)
            setMessage(data.message)
            fetchUsers() // Refresh users list
        } catch (error: any) {
            console.error('Error toggling user status:', error)
            setMessage(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        
        if (!selectedUser) {
            setMessage('Error: No user selected')
            setLoading(false)
            return
        }

        try {
            await apiDeleteUser(selectedUser.user_id)
            setMessage('User deleted successfully')
            fetchUsers() // Refresh users list
            setSelectedUser(null) // Reset selected user
        } catch (error: any) {
            console.error('Error deleting user:', error)
            setMessage(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header with Top Navigation and Logout */}
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <nav className="flex space-x-4">
                        {(['user', 'company', 'userRole', 'outputFormat'] as AdminSection[]).map((section) => (
                            <button
                                key={section}
                                onClick={() => {
                                    setActiveSection(section);
                                    setActiveCrudAction('create'); // Reset to create view when section changes
                                }}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${activeSection === section
                                    ? 'bg-gray-200 text-gray-900'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                {getSectionTitle(section)}
                            </button>
                        ))}
                    </nav>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden"> {/* Container for sidebar and main content */}
                {/* New Sidebar for CRUD actions */}
                <aside className="w-64 bg-gray-50 p-6 shadow-inner overflow-y-auto">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                        Manage {getSectionTitle(activeSection)}
                    </h2>
                    <nav className="space-y-2">
                        {(['create', 'update', 'delete'] as CrudAction[]).map((action) => (
                            <button
                                key={action}
                                onClick={() => setActiveCrudAction(action)}
                                className={`block w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeCrudAction === action
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                                    }`}
                            >
                                {action.charAt(0).toUpperCase() + action.slice(1)} {getSectionTitle(activeSection)}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-8 overflow-y-auto"> {/* Adjusted padding */}
                    {renderSectionContent()}
                </main>
            </div>
            
            <CustomizationModal
                open={isCustomizationModalOpen}
                onOpenChange={setIsCustomizationModalOpen}
                customization={editingCustomization}
                onSave={handleSaveCustomization}
            />
        </div>
    );
}
export default AdminPanel;