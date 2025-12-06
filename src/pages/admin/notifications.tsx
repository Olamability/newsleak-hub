import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

export default function AdminNotifications() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  if (!user) {
    navigate('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin')} className="bg-primary text-white px-4 py-2 rounded">
            Back
          </button>
          <button onClick={signOut} className="text-red-500">Sign Out</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Notifications feature is not available in the local storage version.</p>
        <p className="text-gray-600 mt-2">This would require a backend to send push notifications.</p>
      </div>
    </div>
  );
}
