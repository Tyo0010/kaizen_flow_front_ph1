import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../utils/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Alert, AlertDescription } from '../components/ui/alert'

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

interface LoginProps {
    setUser: (user: User | null) => void;
}

interface LoginResponse {
    message: string;
    access_token: string;
    refresh_token: string;
    user: User;
}

function Login({ setUser }: LoginProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            })

            const data: LoginResponse = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Login failed')
            }

            // Store tokens and user data if provided
            if (data.access_token) {
                localStorage.setItem('access_token', data.access_token)
            }
            if (data.refresh_token) {
                localStorage.setItem('refresh_token', data.refresh_token)
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user))
                
                // Update App component state
                setUser(data.user)
                
                // Navigate based on user role
                switch (data.user.role.role_name) {
                    case 'admin':
                    case 'super_admin':
                        navigate('/admin')
                        break
                    case 'user':
                    default:
                        navigate('/main')
                        break
                }
            } else {
                // If no user data returned, default to main page
                navigate('/main')
            }
        } catch (error: any) {
            console.error('Login error:', error)
            setMessage(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center h-screen flex-col bg-gray-50 w-full p-16">
            <Card className="max-w-[860px] w-full flex-1 flex flex-col justify-center">
                <CardHeader className="text-center justify-center items-center">
                    <CardTitle className="text-[28px] font-bold">Login to Your Account</CardTitle>
                </CardHeader>
                
                <CardContent className="flex flex-col items-center">
                    {message && (
                        <Alert variant={message.includes('Error') || message.includes('error') ? 'destructive' : 'default'} className="mb-4 max-w-[320px] w-full">
                            <AlertDescription>
                                {message}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleLogin} className="flex flex-col items-center gap-4 w-full">
                        <div className="flex flex-col max-w-[320px] w-full space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-14"
                            />
                        </div>

                        <div className="flex flex-col max-w-[320px] w-full space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-14"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="max-w-[320px] w-full h-14"
                            size="lg"
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Login