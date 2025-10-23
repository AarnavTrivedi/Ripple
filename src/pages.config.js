import Dashboard from './pages/Dashboard';
import Map from './pages/Map';
import Analytics from './pages/Analytics';
import Scanner from './pages/Scanner';
import Profile from './pages/Profile';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Map": Map,
    "Analytics": Analytics,
    "Scanner": Scanner,
    "Profile": Profile,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};