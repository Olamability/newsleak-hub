import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { followTopic } from '@/lib/followedTopics';

const categories = [
  'For you', 'Football', 'Entertainment', 'Politics', 'Sports', 'Technology', 'Business', 'Lifestyle', 'Fashion&Beauty'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleComplete = async () => {
    selectedCategories.forEach(category => {
      followTopic(category);
    });
    
    // Save preferences to localStorage
    localStorage.setItem('newsleak_onboarding_complete', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Welcome to Newsleak!</h1>
        <p className="text-gray-600 mb-8">Select your interests to personalize your news feed</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedCategories.includes(category)
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white hover:border-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <button
          onClick={handleComplete}
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 font-semibold"
          disabled={selectedCategories.length === 0}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
