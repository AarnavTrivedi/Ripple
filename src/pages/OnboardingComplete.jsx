import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Leaf, 
  TrendingDown, 
  Target,
  ChevronRight,
  Award
} from 'lucide-react';
import { loadUserProfile } from '@/utils/quizStorage';

export default function OnboardingComplete() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const userProfile = loadUserProfile();
    if (!userProfile) {
      // If no profile, redirect to onboarding
      navigate('/onboarding');
      return;
    }
    setProfile(userProfile);
  }, [navigate]);

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-[#1a2f26] to-[#0f1f18] flex items-center justify-center">
        <div className="animate-spin">
          <Leaf className="w-12 h-12 text-emerald-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-[#1a2f26] to-[#0f1f18] pb-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">

        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-white mb-4">
            Welcome, {profile.name}! 
          </h1>
          <p className="text-emerald-200/80 text-lg leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
            {profile.welcomeMessage}
          </p>
        </div>

        {/* Profile Summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Eco Level */}
          <Card className="bg-emerald-950/40 backdrop-blur-xl border-2 border-emerald-500/20 p-6 text-center">
            <Award className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <p className="text-emerald-200/60 text-sm mb-1">Your Eco Level</p>
            <p className="text-white text-xl font-bold capitalize">
              {profile.ecoLevel.replace('_', ' ')}
            </p>
          </Card>

          {/* Annual Emissions */}
          {profile.estimatedAnnualEmissions > 0 && (
            <Card className="bg-emerald-950/40 backdrop-blur-xl border-2 border-emerald-500/20 p-6 text-center">
              <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-emerald-200/60 text-sm mb-1">Annual Transport Emissions</p>
              <p className="text-white text-xl font-bold">
                {profile.estimatedAnnualEmissions.toLocaleString()} lbs CO₂
              </p>
            </Card>
          )}

          {/* Primary Goals */}
          <Card className="bg-emerald-950/40 backdrop-blur-xl border-2 border-emerald-500/20 p-6 text-center">
            <Target className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <p className="text-emerald-200/60 text-sm mb-1">Active Goals</p>
            <p className="text-white text-xl font-bold">
              {profile.primaryGoals?.length || 0} Goals Set
            </p>
          </Card>
        </div>

        {/* Personalized Recommendations */}
        {profile.recommendations && profile.recommendations.length > 0 && (
          <Card className="bg-emerald-950/40 backdrop-blur-xl border-2 border-emerald-500/20 p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Your Personalized Recommendations
            </h2>
            <div className="space-y-4">
              {profile.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-4 bg-emerald-900/30 border border-emerald-500/20 rounded-xl hover:bg-emerald-900/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{rec.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{rec.title}</h3>
                        {rec.priority === 'high' && (
                          <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-xs font-medium">
                            High Priority
                          </span>
                        )}
                      </div>
                      <p className="text-emerald-200/70 text-sm">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Get Started Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-12 py-6 text-lg font-semibold shadow-xl shadow-emerald-500/30"
          >
            Start Tracking My Impact
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-emerald-200/60 text-sm mt-4">
            You can update your preferences anytime in your profile
          </p>
        </div>
      </div>
    </div>
  );
}

