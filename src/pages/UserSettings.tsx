import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Settings } from "lucide-react";

export default function UserSettings() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    localStorage.setItem('newsleak_settings', JSON.stringify({
      darkMode,
      notifications
    }));
    alert('Settings saved!');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="mb-4">Please log in to access settings</p>
          <a href="/login" className="bg-primary text-white px-6 py-2 rounded">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <div className="space-y-6">
            <div>
              <label className="flex items-center justify-between">
                <span className="font-medium">Dark Mode</span>
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
            </div>

            <div>
              <label className="flex items-center justify-between">
                <span className="font-medium">Enable Notifications</span>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="w-4 h-4"
                />
              </label>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={handleSave}
                className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
