import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName || 'Traveler',
          email: user.email,
          createdAt: serverTimestamp()
        });
      }
      
      onAuthSuccess({ 
        name: user.displayName || 'Traveler', 
        email: user.email || '', 
        uid: user.uid 
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        
        // Fetch profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : { name: user.displayName || 'Traveler', email: user.email };
        
        onAuthSuccess({ ...userData, uid: user.uid });
      } else {
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: formData.name });

        // Create profile in Firestore
        const path = `users/${user.uid}`;
        try {
          await setDoc(doc(db, 'users', user.uid), {
            name: formData.name,
            email: formData.email,
            createdAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }

        setIsLogin(true);
        setError('Account created! Please sign in.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password auth is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold mb-2 text-slate-800">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-sm text-slate-400">
                {isLogin ? 'Enter your details to access your account' : 'Start your journey with us today'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      id="input-name"
                      data-testid="input-name"
                      type="text"
                      required
                      placeholder="John Doe"
                      className="luxury-input w-full pl-12"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="input-email"
                    data-testid="input-email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="luxury-input w-full pl-12"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="input-password"
                    data-testid="input-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="luxury-input w-full pl-12"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {error && (
                <p id="auth-error" data-testid="auth-error" className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-100 text-center font-medium">
                  {error}
                </p>
              )}

              <button
                id="btn-auth-submit"
                data-testid="btn-auth-submit"
                disabled={loading}
                className="w-full luxury-button flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400 font-bold">Or continue with</span></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Sign in with Google
              </button>

              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-center text-sm font-bold text-blue-600 hover:underline"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
