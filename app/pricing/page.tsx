'use client';

import { useRouter } from 'next/navigation';

export default function PricingFunnel() {
  const router = useRouter();

  const handleCheckout = (planType: string) => {
    if (planType === 'free') {
      router.push('/dashboard');
    } else {
      // Direct integration point for Stripe checkout pipeline link
      window.location.href = 'https://checkout.stripe.com/pay/your_test_link';
    }
  };

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center py-12 px-6">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white">Select Your Grade Accelerator</h2>
          <p className="text-xs text-slate-400">Unlock your full diagnostic suite metrics below.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Free Tier Option */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Core</h4>
              <p className="text-3xl font-black text-white mt-2">$0</p>
              <div className="border-t border-slate-900 my-4" />
              <ul className="space-y-3 text-xs text-slate-400">
                <li>• 3 Structural scans per day</li>
                <li>• Core Social Studies tracks</li>
              </ul>
            </div>
            <button onClick={() => handleCheckout('free')} className="mt-8 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl transition">
              Launch Free Tier
            </button>
          </div>

          {/* Pro Value Option */}
          <div className="bg-[#0b0f17] border-2 border-indigo-500 rounded-2xl p-8 flex flex-col justify-between shadow-xl relative">
            <span className="absolute -top-2.5 left-6 bg-indigo-500 text-white text-[9px] uppercase font-black px-2 py-0.5 rounded tracking-wide">Best Value</span>
            <div>
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Pro Master</h4>
              <p className="text-3xl font-black text-white mt-2">$12<span className="text-xs font-normal text-slate-500"> /mo</span></p>
              <div className="border-t border-slate-900 my-4" />
              <ul className="space-y-3 text-xs text-slate-300">
                <li>• Unlimited grading executions</li>
                <li>• Full History database syllabus</li>
                <li>• A1 structural rewritten models</li>
              </ul>
            </div>
            <button onClick={() => handleCheckout('pro')} className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl transition">
              Upgrade to Pro Master
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
