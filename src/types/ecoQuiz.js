// Eco Quiz Type Definitions

/**
 * Question types for the eco onboarding quiz
 */
export const QuestionType = {
  SINGLE_CHOICE: 'single_choice',
  MULTIPLE_CHOICE: 'multiple_choice',
  TEXT_INPUT: 'text_input',
  SCALE: 'scale',
};

/**
 * Eco Quiz Structure
 * Follows similar pattern to the reference quiz but optimized for eco-tracking purposes
 */
export const ecoQuizQuestions = [
  // Step 1: Welcome & Basic Info
  {
    id: 'welcome',
    type: QuestionType.TEXT_INPUT,
    title: 'Welcome to Ripple!',
    subtitle: 'Let\'s personalize your environmental journey',
    question: 'What\'s your name?',
    placeholder: 'Enter your first name',
    required: true,
    next: 'location',
  },
  
  // Step 2: Location
  {
    id: 'location',
    type: QuestionType.TEXT_INPUT,
    title: 'Where are you located?',
    subtitle: 'We\'ll tailor environmental data to your area',
    question: 'City or County, State',
    placeholder: 'e.g., Arlington, Virginia',
    required: true,
    next: 'eco_goals',
  },

  // Step 3: Primary Eco Goals
  {
    id: 'eco_goals',
    type: QuestionType.MULTIPLE_CHOICE,
    title: 'What are your environmental goals?',
    subtitle: 'Select all that apply',
    question: 'I want to:',
    choices: [
      { id: 'reduce_carbon', label: 'Reduce my carbon footprint', icon: '🌱' },
      { id: 'track_emissions', label: 'Track and monitor emissions', icon: '📊' },
      { id: 'find_green_spaces', label: 'Discover green spaces nearby', icon: '🌳' },
      { id: 'improve_air_quality', label: 'Improve local air quality', icon: '💨' },
      { id: 'sustainable_transport', label: 'Use sustainable transportation', icon: '🚴' },
      { id: 'community_action', label: 'Join community environmental efforts', icon: '🤝' },
    ],
    minSelections: 1,
    required: true,
    next: 'current_habits',
  },

  // Step 4: Current Environmental Habits
  {
    id: 'current_habits',
    type: QuestionType.SINGLE_CHOICE,
    title: 'How would you describe your current eco-habits?',
    subtitle: 'Be honest - we\'re here to help you improve!',
    question: 'My environmental awareness is:',
    choices: [
      { id: 'beginner', label: 'Just Getting Started', description: 'New to environmental action' },
      { id: 'intermediate', label: 'Making Progress', description: 'I recycle and make some eco-friendly choices' },
      { id: 'advanced', label: 'Eco-Conscious', description: 'I actively track and reduce my impact' },
      { id: 'expert', label: 'Environmental Champion', description: 'I lead by example and inspire others' },
    ],
    required: true,
    next: 'transport_mode',
  },

  // Step 5: Primary Transportation
  {
    id: 'transport_mode',
    type: QuestionType.SINGLE_CHOICE,
    title: 'How do you usually get around?',
    subtitle: 'Transportation is a major source of emissions',
    question: 'My primary mode of transport is:',
    choices: [
      { id: 'car_solo', label: 'Personal Vehicle (Solo)', icon: '🚗', emission: 'high' },
      { id: 'car_carpool', label: 'Carpool/Rideshare', icon: '🚙', emission: 'medium' },
      { id: 'public_transit', label: 'Public Transportation', icon: '🚌', emission: 'low' },
      { id: 'bike_walk', label: 'Bike or Walk', icon: '🚴', emission: 'zero' },
      { id: 'mixed', label: 'Mixed - Varies by Day', icon: '🔄', emission: 'medium' },
    ],
    required: true,
    next: 'daily_commute',
  },

  // Step 6: Daily Commute Distance
  {
    id: 'daily_commute',
    type: QuestionType.SCALE,
    title: 'How far do you travel daily?',
    subtitle: 'This helps us calculate your transportation impact',
    question: 'Average round-trip distance:',
    min: 0,
    max: 100,
    step: 5,
    unit: 'miles',
    labels: {
      0: 'Work from home',
      25: '~25 miles',
      50: '~50 miles',
      100: '100+ miles',
    },
    required: true,
    next: 'environmental_concerns',
  },

  // Step 7: Environmental Concerns
  {
    id: 'environmental_concerns',
    type: QuestionType.MULTIPLE_CHOICE,
    title: 'What environmental issues concern you most?',
    subtitle: 'We\'ll prioritize relevant data and insights',
    question: 'I\'m most concerned about:',
    choices: [
      { id: 'air_quality', label: 'Air Quality & Pollution', icon: '🌫️' },
      { id: 'climate_change', label: 'Climate Change', icon: '🌡️' },
      { id: 'waste_plastic', label: 'Waste & Plastic Pollution', icon: '♻️' },
      { id: 'deforestation', label: 'Deforestation & Habitat Loss', icon: '🌲' },
      { id: 'water_quality', label: 'Water Quality', icon: '💧' },
      { id: 'urban_heat', label: 'Urban Heat Islands', icon: '🏙️' },
    ],
    minSelections: 1,
    required: true,
    next: 'notification_preference',
  },

  // Step 8: Notification Preferences
  {
    id: 'notification_preference',
    type: QuestionType.SINGLE_CHOICE,
    title: 'Stay informed about your environmental impact',
    subtitle: 'Choose your notification preference',
    question: 'I want to receive:',
    choices: [
      { id: 'daily', label: 'Daily Updates', description: 'Daily eco-tips and air quality alerts' },
      { id: 'weekly', label: 'Weekly Summaries', description: 'Weekly progress reports and insights' },
      { id: 'important', label: 'Important Only', description: 'Critical alerts and major milestones' },
      { id: 'none', label: 'No Notifications', description: 'I\'ll check the app myself' },
    ],
    required: true,
    next: 'complete',
  },

  // Step 9: Complete
  {
    id: 'complete',
    type: 'completion',
    title: 'You\'re all set!',
    subtitle: 'Let\'s start your eco journey',
    message: 'Based on your answers, we\'ve personalized your dashboard to help you make the biggest environmental impact.',
  },
];

/**
 * Calculate user's eco profile based on quiz answers
 */
export const calculateEcoProfile = (answers) => {
  const profile = {
    name: '',
    location: '',
    ecoLevel: 'beginner',
    primaryGoals: [],
    transportMode: '',
    dailyCommute: 0,
    concerns: [],
    notifications: 'weekly',
    estimatedAnnualEmissions: 0,
    recommendations: [],
  };

  // Extract basic info
  profile.name = answers.welcome || 'Eco Warrior';
  profile.location = answers.location || '';
  
  // Eco level
  profile.ecoLevel = answers.current_habits || 'beginner';
  
  // Goals and concerns
  profile.primaryGoals = answers.eco_goals || [];
  profile.concerns = answers.environmental_concerns || [];
  
  // Transportation
  profile.transportMode = answers.transport_mode || 'mixed';
  profile.dailyCommute = answers.daily_commute || 0;
  
  // Notifications
  profile.notifications = answers.notification_preference || 'weekly';

  // Calculate estimated annual emissions based on transport
  const emissionFactors = {
    car_solo: 0.96, // lbs CO2 per mile
    car_carpool: 0.48,
    public_transit: 0.14,
    bike_walk: 0,
    mixed: 0.5,
  };
  
  const factor = emissionFactors[profile.transportMode] || 0.5;
  const annualMiles = profile.dailyCommute * 250; // 250 work days
  profile.estimatedAnnualEmissions = Math.round(annualMiles * factor);

  // Generate personalized recommendations
  profile.recommendations = generateRecommendations(profile);

  return profile;
};

/**
 * Generate personalized recommendations based on user profile
 */
const generateRecommendations = (profile) => {
  const recommendations = [];

  // Transportation recommendations
  if (profile.transportMode === 'car_solo' && profile.dailyCommute > 10) {
    recommendations.push({
      category: 'transportation',
      priority: 'high',
      title: 'Consider Carpooling',
      description: `You could reduce your annual emissions by ${Math.round(profile.estimatedAnnualEmissions * 0.5)} lbs by carpooling 2-3 days per week.`,
      icon: '🚙',
    });
  }

  if (profile.dailyCommute < 5 && profile.transportMode !== 'bike_walk') {
    recommendations.push({
      category: 'transportation',
      priority: 'medium',
      title: 'Try Biking or Walking',
      description: 'Your short commute is perfect for active transportation. Save emissions and improve your health!',
      icon: '🚴',
    });
  }

  // Goal-based recommendations
  if (profile.primaryGoals.includes('find_green_spaces')) {
    recommendations.push({
      category: 'discovery',
      priority: 'medium',
      title: 'Explore Green Spaces',
      description: 'Use our interactive map to discover parks and nature trails near you.',
      icon: '🌳',
    });
  }

  if (profile.primaryGoals.includes('track_emissions')) {
    recommendations.push({
      category: 'tracking',
      priority: 'high',
      title: 'Enable Location Tracking',
      description: 'Track your daily routes to get accurate emission calculations and insights.',
      icon: '📊',
    });
  }

  // Concern-based recommendations
  if (profile.concerns.includes('air_quality')) {
    recommendations.push({
      category: 'health',
      priority: 'high',
      title: 'Monitor Air Quality',
      description: 'Enable AQI alerts to know when air quality is poor in your area.',
      icon: '🌫️',
    });
  }

  return recommendations;
};

/**
 * Generate personalized welcome message
 */
export const generateWelcomeMessage = (profile) => {
  const { name, ecoLevel, estimatedAnnualEmissions } = profile;
  
  const levelMessages = {
    beginner: `${name}, we're excited to help you start your environmental journey! Every small action counts.`,
    intermediate: `${name}, you're already making a difference! Let's take your eco-efforts to the next level.`,
    advanced: `${name}, your commitment to the environment is inspiring! Let's help you maximize your impact.`,
    expert: `${name}, you're an environmental champion! Let's help you lead and inspire others.`,
  };

  const emissionContext = estimatedAnnualEmissions > 0
    ? `Based on your commute, you currently generate approximately ${estimatedAnnualEmissions.toLocaleString()} lbs of CO2 annually from transportation. Together, we'll help you reduce that number.`
    : `Great news - your transportation choices already have minimal environmental impact!`;

  return `${levelMessages[ecoLevel] || levelMessages.beginner}\n\n${emissionContext}`;
};

