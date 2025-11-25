import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow p-8">
                    <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
                    <p className="text-gray-600 mb-4">
                        Welcome back, <strong>{user?.username}</strong>!
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Credits: {user?.credits_balance} • Tier: {user?.subscription_tier}
                    </p>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
