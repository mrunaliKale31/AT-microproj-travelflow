import { motion } from 'motion/react';
import { Plane, Star, Clock, ArrowRight } from 'lucide-react';

interface ResultsListProps {
  type: 'flights' | 'hotels';
  results: any[];
  loading: boolean;
  onBook: (item: any) => void;
}

export default function ResultsList({ type, results, loading, onBook }: ResultsListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400" data-testid="no-results">
        No results found. Try a different search.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto" data-testid="results-grid">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
          Available {type} <span className="text-sm font-normal text-slate-400 ml-2">({results.length} results)</span>
        </h2>
      </div>

      {results.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="bg-white p-5 rounded-2xl shadow-soft border border-slate-100 flex flex-col md:flex-row items-center justify-between group hover:border-blue-200 transition-all gap-6"
        >
          {type === 'flights' ? (
            <div className="flex items-center gap-8 w-full md:w-auto">
              <div className="text-center">
                <div className="text-xl font-bold">{item.departureTime}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">{item.source.substring(0, 3)}</div>
              </div>
              <div className="flex flex-col items-center w-24 md:w-32">
                <div className="text-[10px] text-slate-400 font-bold">{item.duration}</div>
                <div className="w-full h-[1px] bg-slate-200 relative my-1">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="text-[10px] text-blue-500 font-bold uppercase">Direct</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">Arrives</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">{item.destination.substring(0, 3)}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{item.name}</h3>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className={`${i < item.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                  ))}
                  <span className="text-[10px] text-slate-400 font-bold ml-1">{item.city}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <div className="text-left md:text-right">
              <div className="text-xs text-slate-400 font-bold">{type === 'flights' ? item.Airline : 'Classic Room'}</div>
              <div className="text-2xl font-black text-slate-800">${item.price}</div>
            </div>
            <button
              id={`book-${item.id}`}
              data-testid={`book-${item.id}`}
              onClick={() => onBook(item)}
              className="bg-slate-800 hover:bg-blue-600 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-slate-200 uppercase tracking-wider"
            >
              Book Now
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

