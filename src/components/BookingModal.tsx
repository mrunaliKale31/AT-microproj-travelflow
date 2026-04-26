import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (booking: any) => void;
  item: any;
  type: 'flights' | 'hotels';
}

export default function BookingModal({ isOpen, onClose, onSuccess, item, type }: BookingModalProps) {
  const [step, setStep] = useState<'details' | 'payment' | 'result'>('details');
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'failure' | null>(null);
  const [cardNumber, setCardNumber] = useState('');

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardNumber, amount: item.price })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Save booking to Firestore
        if (auth.currentUser) {
          const path = `users/${auth.currentUser.uid}/bookings`;
          try {
            await addDoc(collection(db, path), {
              type: type === 'flights' ? 'Flight' : 'Hotel',
              name: type === 'flights' ? `${item.source} to ${item.destination}` : item.name,
              date: type === 'flights' ? item.date : new Date().toLocaleDateString(),
              price: item.price,
              status: 'Confirmed',
              userId: auth.currentUser.uid,
              createdAt: serverTimestamp()
            });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, path);
          }
        }
        
        setPaymentResult('success');
        setStep('result');
        onSuccess({ ...item, type });
      } else {
        setPaymentResult('failure');
        setStep('result');
      }
    } catch (err) {
      setPaymentResult('failure');
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {step === 'details' && 'Confirm Your Trip'}
                {step === 'payment' && 'Secure Payment'}
                {step === 'result' && 'Booking Status'}
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {step === 'details' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="micro-label mb-2 block">{type === 'flights' ? 'Outbound Flight' : 'Accommodation'}</span>
                      <h3 className="text-3xl font-extrabold text-slate-800">{type === 'flights' ? `${item.source} to ${item.destination}` : item.name}</h3>
                      <p className="text-slate-500 mt-2 font-medium">{type === 'flights' ? `${item.Airline} • ${item.departureTime}` : item.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-black text-slate-800">${item.price}</p>
                      <p className="micro-label">Total Amount</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-center gap-4">
                    <ShieldCheck size={24} className="text-blue-500" />
                    <div>
                      <p className="text-sm font-bold text-blue-900">TravelFlow Secure Booking</p>
                      <p className="text-[10px] text-blue-600 uppercase tracking-tighter font-bold">Instant confirmation & Best price guarantee</p>
                    </div>
                  </div>

                  <button
                    id="btn-confirm-booking"
                    data-testid="btn-confirm-booking"
                    onClick={() => setStep('payment')}
                    className="w-full luxury-button"
                  >
                    Proceed to Payment
                  </button>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                   <div className="bg-[#1E293B] rounded-2xl p-6 text-white flex flex-col gap-4 shadow-xl">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400">Dummy Payment Gateway</h3>
                    <form onSubmit={handlePayment} className="space-y-4">
                      <div>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                          <input
                            id="input-card"
                            data-testid="input-card"
                            type="text"
                            required
                            placeholder="Card Number"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 pl-12 text-sm text-white focus:outline-none focus:border-blue-500"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                          />
                        </div>
                        <p className="text-[10px] text-white/40 mt-2 italic">Tip: Use 0000... for a failure scenario</p>
                      </div>

                      <button
                        id="btn-pay"
                        data-testid="btn-pay"
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : `Pay $${item.price} & Confirm`}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {step === 'result' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="text-center py-8"
                >
                  {paymentResult === 'success' ? (
                    <>
                      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={48} className="text-green-500" />
                      </div>
                      <h3 className="text-3xl font-extrabold text-slate-800 mb-2">Booking Confirmed!</h3>
                      <p id="msg-success" data-testid="msg-success" className="text-slate-500 mb-8 font-medium">Your journey begins. We've sent a confirmation email.</p>
                      <button onClick={onClose} className="luxury-button w-full">Great!</button>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={48} className="text-red-500" />
                      </div>
                      <h3 className="text-3xl font-extrabold text-slate-800 mb-2">Payment Failed</h3>
                      <p id="msg-failure" data-testid="msg-failure" className="text-slate-500 mb-8 font-medium">We couldn't process your payment. Please check your card details.</p>
                      <button onClick={() => setStep('payment')} className="secondary-button w-full">
                        Try Again
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

  );
}
