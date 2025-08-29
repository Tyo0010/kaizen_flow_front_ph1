import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface UserLayoutProps {
  children: ReactNode
}

function UserLayout({ children }: UserLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    // Clear stored tokens and user data
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')

    // Force page reload to reset all state and redirect to login
    window.location.href = '/'
  }

  const sidebarItems = [
    {
      id: 'upload',
      label: 'Upload Files',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
      path: '/upload',
      description: 'Upload and submit PDF files'
    },
    {
      id: 'documents',
      label: 'My Documents',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      path: '/documents',
      description: 'View submitted documents and their status'
    }
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center space-x-3">
          <div className="w-8 flex items-center justify-center">
            <img src="/logo.svg" alt="Kaizen Flow Logo" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black text-black uppercase tracking-wide">KAIZEN FLOW</h1>
            <p className="text-xs text-gray-500 tracking-wide">Logistics Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full text-left p-4 rounded-lg transition-all duration-200 group ${isActive(item.path)
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`${isActive(item.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  {item.icon}
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <p className={`text-xs ${isActive(item.path) ? 'text-blue-600' : 'text-gray-500'}`}>
                {item.description}
              </p>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {/* Feedback Button */}
          <button
            onClick={() => {
              window.open('https://docs.google.com/forms/d/e/1FAIpQLSemlQF-agwB6yaNZKmA-lL5CTZvS06MtvOERuw1KCN4vJbpCA/viewform', '_blank')
              console.log('Feedback button clicked - Google Form link to be added')
            }}
            className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.843-.508L5 23l3.508-5.157A8.013 8.013 0 013 12C3 7.582 6.582 4 12 4s8 3.582 8 8z" />
            </svg>
            <span className="font-medium">Report Issue</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default UserLayout
