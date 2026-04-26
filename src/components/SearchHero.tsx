import { useState, FormEvent } from 'react';
import { Search, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchHeroProps {
  type: 'flights' | 'hotels';
  onSearch: (params: any) => void;
  onTypeChange: (type: 'flights' | 'hotels') => void;
  loading: boolean;
}

export default function SearchHero({ type, onSearch, onTypeChange, loading }: SearchHeroProps) {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (type === 'flights') {
      onSearch({ source, destination, date });
    } else {
      onSearch({ city: destination });
    }
  };

  return (
    <div className="text-center py-12">
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-slate-800"
      >
        Discover your next <span className="text-blue-600">adventure</span>.
      </motion.h1>
      <p className="text-slate-500 mb-10 text-lg">Book flights and hotels at the best prices with TravelFlow Pro.</p>

      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-soft p-1.5 border border-slate-100">
        <div className="flex gap-6 mb-2 px-6 pt-4 border-b border-slate-50">
           <button 
             onClick={() => onTypeChange('flights')}
             className={`pb-3 font-bold text-sm transition-all border-b-2 ${type === 'flights' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
             data-testid="tab-flights"
           >
             Search Flights
           </button>
           <button 
             onClick={() => onTypeChange('hotels')}
             className={`pb-3 font-bold text-sm transition-all border-b-2 ${type === 'hotels' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
             data-testid="tab-hotels"
           >
             Search Hotels
           </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end p-6 pt-2">
          {type === 'flights' && (
            <div className="md:col-span-2 space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <MapPin size={10} /> Source
              </label>
              <input
                id="input-source"
                data-testid="input-source"
                type="text"
                placeholder="From where?"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-0 outline-none"
              />
            </div>
          )}
          
          <div className={`${type === 'flights' ? 'md:col-span-2' : 'md:col-span-4'} space-y-1.5 text-left`}>
             <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <MapPin size={10} /> Destination
             </label>
             <input
                id="input-destination"
                data-testid="input-destination"
                type="text"
                placeholder={type === 'flights' ? "Where to?" : "Which city?"}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-0 outline-none"
              />
          </div>

          <div className="md:col-span-2 space-y-1.5 text-left">
             <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <CalendarIcon size={10} /> {type === 'flights' ? 'Departure' : 'Check-in'}
             </label>
             <input
                id="input-date"
                data-testid="input-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-0 outline-none"
              />
          </div>

          <button
            id="btn-search"
            data-testid="btn-search"
            type="submit"
            disabled={loading}
            className="md:col-span-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
          >
            {loading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Search size={16} />}
            Search
          </button>
        </form>
      </div>
    </div>
  );
}

