import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  ChevronRight, 
  ChevronLeft, 
  Leaf, 
  MapPin,
  Target,
  Activity,
  Car,
  Route,
  AlertCircle,
  Bell,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { 
  ecoQuizQuestions, 
  QuestionType, 
  calculateEcoProfile, 
  generateWelcomeMessage 
} from '@/types/ecoQuiz';
import { 
  saveQuizProgress, 
  loadQuizProgress, 
  saveUserProfile 
} from '@/utils/quizStorage';
import RippleLogo from '@/assets/Ripple Logo.png';

const iconMap = {
  0: Leaf,
  1: MapPin,
  2: Target,
  3: Activity,
  4: Car,
  5: Route,
  6: AlertCircle,
  7: Bell,
  8: CheckCircle2,
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(-1); // Start at -1 for intro screen
  const [answers, setAnswers] = useState({});
  const [textInput, setTextInput] = useState('');
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [sliderValue, setSliderValue] = useState([25]);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion = currentStep >= 0 ? ecoQuizQuestions[currentStep] : null;
  const progress = currentStep >= 0 ? ((currentStep + 1) / ecoQuizQuestions.length) * 100 : 0;
  const StepIcon = currentStep >= 0 ? (iconMap[currentStep] || Leaf) : Leaf;

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = loadQuizProgress();
    if (savedProgress) {
      setAnswers(savedProgress.answers);
      setCurrentStep(savedProgress.currentStep);
    }
  }, []);

  // Save progress whenever answers or step changes
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveQuizProgress(answers, currentStep);
    }
  }, [answers, currentStep]);

  // Initialize current question state
  useEffect(() => {
    if (currentQuestion) {
      // Load previous answer if it exists
      const previousAnswer = answers[currentQuestion.id];
      
      if (currentQuestion.type === QuestionType.TEXT_INPUT) {
        setTextInput(previousAnswer || '');
      } else if (currentQuestion.type === QuestionType.MULTIPLE_CHOICE) {
        setSelectedChoices(previousAnswer || []);
      } else if (currentQuestion.type === QuestionType.SINGLE_CHOICE) {
        setSelectedChoices(previousAnswer ? [previousAnswer] : []);
      } else if (currentQuestion.type === QuestionType.SCALE) {
        setSliderValue([previousAnswer || currentQuestion.min || 0]);
      }
    }
  }, [currentStep, currentQuestion]);

  const handleNext = () => {
    // Handle intro screen (step -1)
    if (currentStep === -1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(0);
        setIsAnimating(false);
      }, 200);
      return;
    }

    // Validate answer
    if (currentQuestion.required && !isAnswerValid()) {
      return;
    }

    // Save answer
    let answer;
    if (currentQuestion.type === QuestionType.TEXT_INPUT) {
      answer = textInput.trim();
    } else if (currentQuestion.type === QuestionType.MULTIPLE_CHOICE) {
      answer = selectedChoices;
    } else if (currentQuestion.type === QuestionType.SINGLE_CHOICE) {
      answer = selectedChoices[0];
    } else if (currentQuestion.type === QuestionType.SCALE) {
      answer = sliderValue[0];
    }

    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));

    // Check if quiz is complete
    if (currentQuestion.type === 'completion' || currentStep === ecoQuizQuestions.length - 1) {
      handleQuizComplete({ ...answers, [currentQuestion.id]: answer });
      return;
    }

    // Move to next step with animation
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsAnimating(false);
    }, 200);
  };

  const handleBack = () => {
    if (currentStep > -1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const isAnswerValid = () => {
    if (currentStep === -1) return true; // Intro screen is always valid
    if (!currentQuestion) return false;
    
    if (currentQuestion.type === QuestionType.TEXT_INPUT) {
      return textInput.trim().length > 0;
    } else if (currentQuestion.type === QuestionType.MULTIPLE_CHOICE) {
      const minSelections = currentQuestion.minSelections || 1;
      return selectedChoices.length >= minSelections;
    } else if (currentQuestion.type === QuestionType.SINGLE_CHOICE) {
      return selectedChoices.length > 0;
    } else if (currentQuestion.type === QuestionType.SCALE) {
      return true; // Slider always has a value
    }
    return true;
  };

  const handleChoiceToggle = (choiceId) => {
    if (currentQuestion.type === QuestionType.SINGLE_CHOICE) {
      setSelectedChoices([choiceId]);
    } else {
      setSelectedChoices(prev =>
        prev.includes(choiceId)
          ? prev.filter(id => id !== choiceId)
          : [...prev, choiceId]
      );
    }
  };

  const handleQuizComplete = (finalAnswers) => {
    const profile = calculateEcoProfile(finalAnswers);
    const welcomeMessage = generateWelcomeMessage(profile);
    
    saveUserProfile({
      ...profile,
      welcomeMessage,
      completedAt: new Date().toISOString(),
    });

    // Navigate to completion screen
    navigate('/onboarding-complete');
  };

  const handleSkip = () => {
    // Create minimal profile and skip to app
    const minimalProfile = {
      name: 'Eco Warrior',
      location: '',
      ecoLevel: 'beginner',
      completedAt: new Date().toISOString(),
      skipped: true,
    };
    saveUserProfile(minimalProfile);
    navigate('/dashboard');
  };

  // Intro Screen (Step -1)
  if (currentStep === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-[#1a2f26] to-[#0f1f18] flex flex-col">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={RippleLogo} alt="Ripple" className="h-40 w-auto" />
            </div>
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="text-emerald-200/60 hover:text-emerald-200 text-sm"
            >
              Skip for now
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 pb-32">
          <div className="w-full max-w-2xl">
            <div
              className={`transition-all duration-200 ${
                isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Discover your personalized eco journey
              </h1>
              
              {/* Subtitle */}
              <p className="text-emerald-200/80 text-lg mb-8 leading-relaxed">
                Learn about personalized environmental tracking options based on your goals, habits, and location.
              </p>

              {/* Terms Notice */}
              {/* <p className="text-emerald-200/60 text-sm mb-8 leading-relaxed">
                By clicking Continue, you agree to our{' '}
                <a href="#" className="text-emerald-400 underline hover:text-emerald-300">
                  Terms of Service
                </a>{' '}
                and that Ripple may use your responses to personalize your experience and other purposes as described in our{' '}
                <a href="#" className="text-emerald-400 underline hover:text-emerald-300">
                  Privacy Policy
                </a>
                . Responses prior to account creation will not be used as part of your environmental assessment.
              </p> */}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="p-6">
          <Button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-6 text-lg font-semibold shadow-lg"
          >
            Continue
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-[#1a2f26] to-[#0f1f18] flex flex-col">
      {/* Header with Progress */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img src={RippleLogo} alt="EcoTrackr" className="h-40 w-auto" />
          </div>
          <Button
            onClick={handleSkip}
            variant="ghost"
            className="text-emerald-200/60 hover:text-emerald-200 text-sm"
          >
            Skip for now
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-emerald-900/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-emerald-200/60 text-xs mt-2 text-center">
          Step {currentStep + 1} of {ecoQuizQuestions.length}
        </p>
      </div>

      {/* Question Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div
          className={`w-full max-w-2xl transition-all duration-200 ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Title & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {currentQuestion.title}
            </h1>
            {currentQuestion.subtitle && (
              <p className="text-emerald-200/70 text-sm md:text-base">
                {currentQuestion.subtitle}
              </p>
            )}
          </div>

          {/* Question Input */}
          <Card className="bg-emerald-950/40 backdrop-blur-xl border-2 border-emerald-500/20 p-5">
            <p className="text-white text-base md:text-lg font-medium mb-5">
              {currentQuestion.question}
            </p>

            {/* Text Input */}
            {currentQuestion.type === QuestionType.TEXT_INPUT && (
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="bg-emerald-900/30 border-emerald-500/30 text-white placeholder:text-emerald-200/40 text-lg py-6"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isAnswerValid()) {
                    handleNext();
                  }
                }}
              />
            )}

            {/* Single/Multiple Choice */}
            {(currentQuestion.type === QuestionType.SINGLE_CHOICE ||
              currentQuestion.type === QuestionType.MULTIPLE_CHOICE) && (
              <div className="space-y-3">
                {currentQuestion.choices.map((choice) => {
                  const isSelected = selectedChoices.includes(choice.id);
                  return (
                    <button
                      key={choice.id}
                      onClick={() => handleChoiceToggle(choice.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20'
                          : 'bg-emerald-900/20 border-emerald-500/20 hover:border-emerald-400/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {choice.icon && (
                          <span className="text-2xl">{choice.icon}</span>
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {choice.label}
                          </p>
                          {choice.description && (
                            <p className="text-emerald-200/60 text-sm mt-1">
                              {choice.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Scale/Slider */}
            {currentQuestion.type === QuestionType.SCALE && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-4xl font-bold text-emerald-400">
                    {sliderValue[0]}
                  </span>
                  <span className="text-xl text-emerald-200/70 ml-2">
                    {currentQuestion.unit}
                  </span>
                </div>
                <Slider
                  value={sliderValue}
                  onValueChange={setSliderValue}
                  min={currentQuestion.min}
                  max={currentQuestion.max}
                  step={currentQuestion.step}
                  className="w-full"
                />
                {currentQuestion.labels && (
                  <div className="flex justify-between text-xs text-emerald-200/60">
                    {Object.entries(currentQuestion.labels).map(([value, label]) => (
                      <span key={value}>{label}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completion Message */}
            {currentQuestion.type === 'completion' && (
              <div className="flex flex-col items-center justify-center w-full py-8 px-4">
                {/* Circular Progress Bar - 100% Complete */}
                <div className="relative w-32 h-32 mb-6">
                  <svg className="w-32 h-32 transform -rotate-90">
                    {/* Background circle */}
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgba(255, 255, 255, 0.1)"
                      strokeWidth="6"
                      fill="none"
                    />
                    {/* Progress circle - 100% */}
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#10b981"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  {/* Checkmark in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Completion Message */}
                <p className="text-white text-lg font-medium leading-relaxed text-center max-w-md">
                  {currentQuestion.message}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 pt-0">
        <div className="flex gap-3">
          {currentStep > 0 && currentQuestion.type !== 'completion' && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="bg-emerald-900/30 border-emerald-500/30 text-white hover:bg-emerald-800/40"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          )}
          {currentStep === 0 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="bg-emerald-900/30 border-emerald-500/30 text-white hover:bg-emerald-800/40"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={currentQuestion.required && !isAnswerValid()}
            className={`flex-1 py-6 text-lg font-semibold ${
              currentQuestion.type === 'completion'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                : 'bg-emerald-500'
            } hover:bg-emerald-600 text-white shadow-lg`}
          >
            {currentQuestion.type === 'completion' ? (
              <>
                Start Your Journey
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

