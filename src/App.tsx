import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Login from './pages/login'
import MainPage from './pages/upload'
import DocumentsPage from './pages/documents'
import AdminPanel from './pages/adminPanel'
import AdminUserManagement from './pages/adminUserManagement'
import UserLayout from './components/UserLayout'
import AdminLayout from './components/AdminLayout'

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

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const Router = import.meta.env.PROD ? HashRouter : BrowserRouter

  useEffect(() => {
    // Check for stored user and token
    const storedUser = localStorage.getItem('user')
    const accessToken = localStorage.getItem('access_token')
    
    if (storedUser && accessToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    }
    
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-lg text-[#101518]">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to={
            user.role.role_name === 'user' ? '/upload' : 
            user.role.role_name === 'admin' ? '/admin/upload' : 
            '/super-admin'
          } /> : <Login setUser={setUser} />} 
        />
        
        {/* User Routes */}
        <Route 
          path="/upload" 
          element={user && user.role.role_name === 'user' ? (
            <UserLayout>
              <MainPage />
            </UserLayout>
          ) : <Navigate to="/" />} 
        />
        <Route 
          path="/documents" 
          element={user && user.role.role_name === 'user' ? (
            <UserLayout>
              <DocumentsPage />
            </UserLayout>
          ) : <Navigate to="/" />} 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/upload" 
          element={user && user.role.role_name === 'admin' ? (
            <AdminLayout>
              <MainPage />
            </AdminLayout>
          ) : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/documents" 
          element={user && user.role.role_name === 'admin' ? (
            <AdminLayout>
              <DocumentsPage />
            </AdminLayout>
          ) : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/users" 
          element={user && user.role.role_name === 'admin' ? (
            <AdminLayout>
              <AdminUserManagement />
            </AdminLayout>
          ) : <Navigate to="/" />} 
        />
        <Route 
          path="/admin/settings" 
          element={user && user.role.role_name === 'admin' ? (
            <AdminLayout>
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Settings</h1>
                <p className="text-gray-600">Configure system settings and preferences.</p>
              </div>
            </AdminLayout>
          ) : <Navigate to="/" />} 
        />
        
        {/* Super Admin Routes */}
        <Route 
          path="/super-admin" 
          element={user && user.role.role_name === 'super_admin' ? <AdminPanel setUser={setUser} /> : <Navigate to="/" />} 
        />
        
        {/* Legacy admin route for backward compatibility */}
        <Route 
          path="/admin" 
          element={user && (user.role.role_name === 'admin' || user.role.role_name === 'super_admin') ? 
            <Navigate to={user.role.role_name === 'admin' ? '/admin/upload' : '/super-admin'} /> : 
            <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  )
}

export default App
