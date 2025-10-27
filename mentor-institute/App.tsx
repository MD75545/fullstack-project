import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import Gallery from './pages/Gallery';
import GalleryDetail from './pages/GalleryDetail';
import Contact from './pages/Contact';
import SearchResults from './pages/SearchResults';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './context/NotificationsContext';
import PageBanner from './components/PageBanner';
import ScrollToTopButton from './components/ScrollToTopButton';
import Practice from './pages/Practice';
import Contest from './pages/Contest';
import TestGuidelines from './pages/TestGuidelines';
import TestScreen from './pages/TestScreen';
import Payment from './pages/Payment';
import ContestGuidelines from './pages/ContestGuidelines';
import ContestScreen from './pages/ContestScreen';
import SolutionScreen from './pages/SolutionScreen';
import ContestWinners from './pages/ContestWinners';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <HashRouter>
          <div className="flex flex-col min-h-screen font-sans">
            <Header />
            <PageBanner />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/gallery/:id" element={<GalleryDetail />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/contest" element={<Contest />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Dashboard Route */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/test/:testId/guidelines" element={<TestGuidelines />} />
                  <Route path="/test/:testId/start" element={<TestScreen />} />
                  <Route path="/contest/:contestId/payment" element={<Payment />} />
                  <Route path="/contest/:contestId/guidelines" element={<ContestGuidelines />} />
                  <Route path="/contest/:contestId/start" element={<ContestScreen />} />
                  <Route path="/contest/:contestId/winners" element={<ContestWinners />} />
                  <Route path="/solution/:resultType/:resultId" element={<SolutionScreen />} />
                </Route>

              </Routes>
            </main>
            <Footer />
            <ScrollToTopButton />
          </div>
        </HashRouter>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
