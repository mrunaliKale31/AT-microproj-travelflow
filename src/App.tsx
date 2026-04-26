import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plane, Hotel } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import Navbar from './components/Navbar';
import SearchHero from './components/SearchHero';
import ResultsList from './components/ResultsList';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import BookingModal from './components/BookingModal';

export type SearchType = 'flights' | 'hotels';

export default function App() {
  const [activeTab, setActiveTab] = useState<SearchType>('flights');
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ ...userDoc.data() as { name: string, email: string }, uid: firebaseUser.uid });
        } else {
          setUser({ name: firebaseUser.displayName || 'Traveler', email: firebaseUser.email || '', uid: firebaseUser.uid });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = async (params: any) => {
    setLoading(true);
    const endpoint = activeTab === 'flights' ? '/api/search-flights' : '/api/search-hotels';
    const query = new URLSearchParams(params).toString();
    try {
      const res = await fetch(`${endpoint}?${query}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setShowDashboard(false);
  };

  const handleBookingClick = (item: any) => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setSelectedItem(item);
      setShowBookingModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-main">
      <Navbar 
        user={user} 
        onAuthClick={() => setShowAuthModal(true)} 
        onDashboardClick={() => setShowDashboard(true)}
        onLogout={handleLogout}
      />

      <main className="pt-20 px-6 max-w-7xl mx-auto pb-20">
        <AnimatePresence mode="wait">
          {showDashboard ? (
            <motion.div 
              key="dashboard-container"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <div className="flex items-center gap-4 mb-10 mt-10">
                <button 
                  onClick={() => setShowDashboard(false)}
                  className="w-10 h-10 rounded-xl bg-white shadow-soft border border-slate-100 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <Plane size={20} className="-rotate-90" />
                </button>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Your Journeys</h1>
              </div>
              <Dashboard onClose={() => setShowDashboard(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 pt-10"
            >
              <SearchHero 
                type={activeTab} 
                onSearch={handleSearch} 
                onTypeChange={setActiveTab}
                loading={loading}
              />

              <ResultsList 
                type={activeTab} 
                results={results} 
                loading={loading} 
                onBook={handleBookingClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>


      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onAuthSuccess={(userData) => {
          setUser(userData);
          setShowAuthModal(false);
        }}
      />

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        item={selectedItem}
        type={activeTab}
        onSuccess={(booking) => {
          console.log("Saving booking to history:", booking);
          // Here you would typically refresh dashboards or local storage
        }}
      />
    </div>
  );
}
