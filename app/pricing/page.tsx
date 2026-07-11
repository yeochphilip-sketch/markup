'use client';

import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();

  const handleFreeRedirect = () => {
    // Stripe setup is bypassed for quick testing access
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl text-center space-y-4 mb-10">
        <h2 className="text-3xl font-black text-indigo-400 uppercase tracking-wide">Choose Your Performance Plan</h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Gain access to full LORMS standard examinations and structured diagnostic analysis feedback loops.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        
        {/* Free Plan Onboarding Tier */}
        <div className="bg-slate-950 border border-slate-900 rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-4">
            <span className="text-[10px] font-bold bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-400 uppercase">Beta Access</span>
            <h3 className="text-xl font-black mt-2">Free Starter</h3>
            <p className="text-xs text-slate-500">Essential structural review parameters for independent humanistic practice sheets.</p>
            <div className="text-2xl font-black font-mono mt-4 text-slate-200">S$0 <span className="text-xs text-slate-600 font-normal">/ month</span></div>
            
            <ul className="space-y-2 pt-4 border-t border-slate-900 text-xs text-slate-400">
              <li className="flex items-center gap-2">✓ 5 automated LORMS script scans / month</li>
              <li className="flex items-center gap-2">✓ Standard history timeline checks</li>
              <li className="flex items-center gap-2">✓ Access to standard Singapore prelim prompts</li>
            </ul>
          </div>

          <button 
            onClick={handleFreeRedirect}
            className="w-full bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold py-3 rounded-xl text-xs transition border border-slate-800 mt-8"
          >
            Get Free
          </button>
        </div>

        {/* Premium Plan Tier */}
        <div className="bg-indigo-950/10 border-2 border-indigo-500/40 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-indigo-600 text-white font-black text-[9px] px-4 py-1.5 uppercase rounded-bl-xl tracking-widest">Recommended</div>
          
          <div className="space-y-4">
            <span className="text-[10px] font-bold bg-indigo-500/20 px-3 py-1 rounded-full text-indigo-400 uppercase">Pro Master</span>
            <h3 className="text-xl font-black mt-2">Humanities Plus</h3>
            <p className="text-xs text-slate-400">Comprehensive exam review suite with adaptive LORMS level scoring matrix options.</p>
            <div className="text-2xl font-black font-mono mt-4 text-indigo-400">S$19 <span className="text-xs text-slate-600 font-normal">/ month</span></div>
            
            <ul className="space-y-2 pt-4 border-t border-indigo-950 text-xs text-slate-300">
              <li className="flex items-center gap-2 text-indigo-400">★ Unlimited AI evaluation marking loops</li>
              <li className="flex items-center gap-2">✓ Dynamic Cross-Reference & Motive checks</li>
              <li className="flex items-center gap-2">✓ Full SEAB O-Level Model Answer keys</li>
              <li className="flex items-center gap-2">✓ Live XP Mastery tracking rewards</li>
            </ul>
          </div>

          <button 
            onClick={handleFreeRedirect}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 mt-8"
          >
            Upgrade to Pro
          </button>
        </div>

      </div>
    </div>
  );
}
