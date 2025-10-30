import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Map from "./Map";

import Analytics from "./Analytics";

import Scanner from "./Scanner";

import Chatbot from "./Chatbot";

import Profile from "./Profile";

import Onboarding from "./Onboarding";

import OnboardingComplete from "./OnboardingComplete";

import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';

import { isQuizCompleted } from '@/utils/quizStorage';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Map: Map,
    
    Analytics: Analytics,
    
    Scanner: Scanner,
    
    Chatbot: Chatbot,
    
    Profile: Profile,
    
    Onboarding: Onboarding,
    
    OnboardingComplete: OnboardingComplete,
    
}

// Protected Route Component - redirects to onboarding if quiz not completed
const ProtectedRoute = ({ children }) => {
    const quizCompleted = isQuizCompleted();
    const location = useLocation();
    
    // Allow access to onboarding and onboarding-complete pages
    if (location.pathname === '/onboarding' || location.pathname === '/onboarding-complete') {
        return children;
    }
    
    // Redirect to onboarding if quiz not completed
    if (!quizCompleted) {
        return <Navigate to="/onboarding" replace />;
    }
    
    return children;
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    const isOnboarding = location.pathname === '/onboarding' || location.pathname === '/onboarding-complete';
    
    // Render onboarding pages without Layout
    if (isOnboarding) {
        return (
            <Routes>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/onboarding-complete" element={<OnboardingComplete />} />
            </Routes>
        );
    }
    
    return (
        <ProtectedRoute>
            <Layout currentPageName={currentPage}>
                <Routes>            
                    
                        <Route path="/" element={<Dashboard />} />
                    
                    
                    <Route path="/Dashboard" element={<Dashboard />} />
                    
                    <Route path="/Map" element={<Map />} />
                    
                    <Route path="/Analytics" element={<Analytics />} />
                    
                    <Route path="/Scanner" element={<Scanner />} />
                    
                    <Route path="/Chatbot" element={<Chatbot />} />
                    
                    <Route path="/Profile" element={<Profile />} />
                    
                </Routes>
            </Layout>
        </ProtectedRoute>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}