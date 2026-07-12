'use client';

export default function AdminAnalyticsPage() {
  // Temporary mocked dashboard data metrics matrix
  const users = [
    { id: 1, name: 'Alex Tan', email: 'alex@example.com', plan: 'Premium Tier', status: 'Active', price: '$29/mo' },
    { id: 2, name: 'Sarah Lim', email: 'sarah.l@example.com', plan: 'Basic Tier', status: 'Active', price: '$12/mo' },
    { id: 3, name: 'John Doe', email: 'johndoe@example.com', plan: 'Free Trial', status: 'Expired', price: '$0' },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Summary Row */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-indigo-400 tracking-tight">Platform Insights</h1>
            <p className="text-xs text-slate-400 mt-1">Global workspace analytics, user subscriptions, and billing plans</p>
          </div>
          <a href="/dashboard" className="text-xs bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition">
            ← Return to Dashboard
          </a>
        </div>

        {/* Analytic Cards Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">Total Registered Users</div>
            <div className="text-3xl font-black text-white mt-2">1,248</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-1">+12% this week</div>
          </div>
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">Monthly Recurring Revenue</div>
            <div className="text-3xl font-black text-indigo-400 mt-2">$4,812</div>
            <div className="text-[10px] text-indigo-500 font-mono mt-1">Based on active plans</div>
          </div>
          <div className="bg-slate-950 border border-slate-900 p-6 rounded-2xl">
            <div className="text-xs text-slate-400 font-medium">Premium Conversion Rate</div>
            <div className="text-3xl font-black text-white mt-2">24.3%</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">Target benchmark: 20%</div>
          </div>
        </div>

        {/* Detailed Users & Plans Table Matrix */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-900">
            <h2 className="text-sm font-bold text-slate-200">Active Account Master Registry</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider font-mono border-b border-slate-900">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Assigned Plan</th>
                  <th className="p-4">Billing Rate</th>
                  <th className="p-4">Gateway Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/20 transition">
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{user.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-300">{user.plan}</td>
                    <td className="p-4 text-indigo-400 font-mono font-bold">{user.price}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}