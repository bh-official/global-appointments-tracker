import { Link } from "react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };

    getSession();

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center px-6">
      {/* HERO SECTION - Matches Splash Screen Centering */}
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-fade-in-up">
        <div className="max-w-4xl mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Manage your appointments across different time zones, organized and secure.
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Everything structured in one place, with smart reminders and easy filtering.
          </p>

          {/* Action Button */}
          <div className="flex justify-center">
            {!user ? (
              <Link
                to="/auth"
                className="btn-theme bg-white/20 hover:bg-white/30 text-white px-8 py-4 text-xl font-bold"
              >
                Get Started
              </Link>
            ) : (
              <Link
                to="/appointments"
                className="btn-theme bg-white/20 hover:bg-white/30 text-white px-8 py-4 text-xl font-bold"
              >
                Go to My Appointments
              </Link>
            )}
          </div>
        </div>

      </div>

      {/* FEATURES */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full pb-16">
        <div className="glass-card p-8 text-white delay-100 flex flex-col items-center text-center">
          <div className="text-3xl mb-4 animate-float">🌍</div>
          <h3 className="font-bold text-xl mb-3">Timezone Aware</h3>
          <p className="text-white/70 text-sm leading-relaxed">
            Schedule meetings across different countries without confusion. Automatic offset calculations.
          </p>
        </div>

        <div className="glass-card p-8 text-white delay-200 flex flex-col items-center text-center">
          <div className="text-3xl mb-4 animate-float" style={{ animationDelay: '1s' }}>🔍</div>
          <h3 className="font-bold text-xl mb-3">Smart Filtering</h3>
          <p className="text-white/70 text-sm leading-relaxed">
            Filter by category, date range, upcoming or past. Keep your schedule focused.
          </p>
        </div>

        <div className="glass-card p-8 text-white delay-300 flex flex-col items-center text-center">
          <div className="text-3xl mb-4 animate-float" style={{ animationDelay: '2s' }}>🛡️</div>
          <h3 className="font-bold text-xl mb-3">Secure & Private</h3>
          <p className="text-white/70 text-sm leading-relaxed">
            Each user can only view and manage their own appointments. Your data is protected.
          </p>
        </div>
      </div>
    </div>
  );
}
