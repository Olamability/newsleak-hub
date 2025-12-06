import { useAuth } from "@/components/AuthProvider";
import { User } from "lucide-react";

export default function Profile() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4">Please log in to view your profile</p>
          <a href="/login" className="bg-primary text-white px-6 py-2 rounded">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.email}</h1>
              <p className="text-gray-600">User ID: {user.id}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="font-semibold mb-2">Account Information</h2>
              <p className="text-gray-600">Email: {user.email}</p>
              <p className="text-gray-600">Display Name: {user.displayName || 'Not set'}</p>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={signOut}
                className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
