'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Free Starter',
      price: '0',
      description: 'Essential grading diagnostics for O-Level adjustments.',
      features: [
        '3 automated LORMS marker evaluations daily',
        'Standard Singapore syllabus question configurations',
        'Syllabus matrix tracking parameters',
        'Basic structural feedback matrices'
      ],
      cta: 'Start Free Practice',
      premium: false
    },
    {
      name: 'Pro Master',
      price: billingCycle === 'monthly' ? '12' : '9',
      description: 'Complete syllabus structural optimization engine toolsets.',
      features: [
        'Unlimited AI diagnostic marking sweeps',
        'Custom Mode ("Vet Homework") school document analysis',
        'Full structural model comparison essay overlays',
        'Priority low-latency access processing layers',
        'Full operational log archive history storage'
      ],
      cta: 'Upgrade to Pro Master',
      premium: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 py-16 px-6 font-sans">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <div>
          <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase bg-indigo-950/50 border border-indigo-900/50 px-3 py-1 rounded-full">
            Transparent Subscription Structure
          </span>
          <h2 className="text-3xl font-black tracking-tight mt-4 text-white">
            Maximize Your Cambridge Humanities Metrics
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-2">
            Pick your tier scale parameters to optimize structured history source deductions and clear essay linkage.
          </p>
        </div>

        {/* Toggle Controls */}
        <div className="inline-flex bg-slate-950 p-1 border border-slate-900 rounded-xl">
          <button 
            onClick={() => setBillingCycle('monthly')} 
            className={`text-[10px] font-bold px-4 py-2 rounded-lg transition ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Monthly Period
          </button>
          <button 
            onClick={() => setBillingCycle('yearly')} 
            className={`text-[10px] font-bold px-4 py-2 rounded-lg transition ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Yearly Rate <span className="text-emerald-400 font-mono ml-0.5">(-25%)</span>
          </button>
        </div>

        {/* Product Cards Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 text-left">
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`bg-slate-950/80 border rounded-2xl p-6 flex flex-col justify-between transition relative ${plan.premium ? 'border-indigo-500/40 shadow-xl shadow-indigo-950/20' : 'border-slate-900'}`}
            >
              {plan.premium && (
                <span className="absolute -top-2.5 right-4 bg-indigo-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Popular Choice
                </span>
              )}
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-black text-slate-200 uppercase tracking-wide">{plan.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{plan.description}</p>
                </div>

                <div className="flex items-baseline text-slate-100 font-mono">
                  <span className="text-2xl font-black">$</span>
                  <span className="text-4xl font-black tracking-tight">{plan.price}</span>
                  <span className="text-slate-600 text-[11px] ml-1">/{billingCycle === 'monthly' ? 'mo' : 'mo billed annually'}</span>
                </div>

                <hr className="border-slate-900/60" />

                <ul className="space-y-2.5 text-[11px] text-slate-400">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 leading-tight">
                      <span className="text-indigo-500 font-bold font-mono">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => router.push('/dashboard')}
                className={`w-full text-xs font-bold py-3 rounded-xl transition mt-8 text-center ${plan.premium ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-950/50' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
