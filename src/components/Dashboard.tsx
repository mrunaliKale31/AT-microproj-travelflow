import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, History, Calendar, Trash2 } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';

interface DashboardProps {
  onClose: () => void;
}

export default function Dashboard({ onClose }: DashboardProps) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    const path = `users/${auth.currentUser.uid}/bookings`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(data);
      setLoading(false);
    }, (error) => {
      // Handle the case where the user logs out while the listener is active
      if (!auth.currentUser) {
        console.log('Ignore Firestore error after logout');
        return;
      }
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, []);

  const cancelBooking = async (id: string) => {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}/bookings/${id}`;
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await updateDoc(doc(db, path), {
        status: 'Cancelled'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Recent Bookings</h2>
        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">
          {bookings.filter(b => b.status === 'Confirmed').length} ACTIVE
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-soft border border-slate-100 flex flex-col items-center">
            <History className="mb-4 opacity-20" size={40} />
            <p className="font-medium text-slate-400">No bookings yet. Start exploring the world.</p>
            <button onClick={onClose} className="mt-4 text-blue-600 text-sm font-bold hover:underline">Book your first trip</button>
          </div>
        ) : (
          bookings.map((booking) => (
            <motion.div
              layout
              key={booking.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-5 rounded-2xl shadow-soft border border-slate-100 flex items-center gap-4 transition-all hover:border-slate-200"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                {booking.type === 'Flight' ? '✈️' : '🏨'}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${booking.status === 'Confirmed' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${booking.status === 'Confirmed' ? 'text-green-600' : 'text-slate-400'}`}>
                    {booking.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 truncate">{booking.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{booking.date}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                   <div className="text-lg font-black text-slate-800">${booking.price}</div>
                   <div className="text-[9px] text-slate-400 font-bold uppercase">Total</div>
                </div>
                {booking.status === 'Confirmed' && (
                  <button
                    id={`cancel-${booking.id}`}
                    data-testid={`cancel-booking-${booking.id}`}
                    onClick={() => cancelBooking(booking.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="pt-8 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
        <span>SYSTEM STATUS: <span className="text-green-500">ONLINE</span></span>
        <span>API V2.4.1</span>
      </div>
    </div>
  );
}

