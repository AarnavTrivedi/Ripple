import Dashboard from './pages/Dashboard';
import Map from './pages/Map';
import Analytics from './pages/Analytics';
import Scanner from './pages/Scanner';
import Profile from './pages/Profile';
import Chatbot from './pages/Chatbot';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Map": Map,
    "Analytics": Analytics,
    "Scanner": Scanner,
    "Profile": Profile,
    "Chatbot": Chatbot,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};