import { LogOut, User, Compass } from 'lucide-react';

interface NavbarProps {
  user: any;
  onAuthClick: () => void;
  onDashboardClick: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, onAuthClick, onDashboardClick, onLogout }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 gradient-header h-16 flex items-center">
      <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between text-white">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
             T
          </div>
          <span className="text-xl font-bold tracking-tight">TravelFlow <span className="text-blue-400 font-normal">Pro</span></span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button 
                id="nav-dashboard"
                data-testid="nav-dashboard"
                onClick={onDashboardClick}
                className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 hover:bg-white/20 transition-all text-sm"
              >
                <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <span>{user.name}</span>
              </button>
              <button 
                id="nav-logout"
                data-testid="nav-logout"
                onClick={onLogout}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button 
              id="nav-login"
              data-testid="nav-login"
              onClick={onAuthClick}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 px-5 rounded-lg transition-all shadow-lg shadow-blue-600/20"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

