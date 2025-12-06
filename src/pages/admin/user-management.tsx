import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  if (!user) {
    navigate('/admin/login');
    return null;
  }

  // Get users from localStorage
  const usersData = localStorage.getItem('newsleak_users');
  const users = usersData ? JSON.parse(usersData) : [];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin')} className="bg-primary text-white px-4 py-2 rounded">
            Back
          </button>
          <button onClick={signOut} className="text-red-500">Sign Out</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u: any) => (
              <tr key={u.id}>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
