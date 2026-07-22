import { CheckCircle2 } from "lucide-react";

export function SolutionSection() {
  const features = [
    "What was sold",
    "Who sold it",
    "What is in stock",
    "Who moved stock",
    "Who gave discounts",
    "Who handled returns",
    "Who owes you money",
    "Which expenses are reducing your profit",
    "Which products, services, or branches are performing best",
    "Whether your business is truly profitable"
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="lg:w-1/2">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
            Prokip Helps You See <br />
            <span className="text-prokip-dark">What Is Really Happening</span>
          </h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            Prokip is an all-in-one business management system that helps you bring sales, inventory, expenses, accounting, staff activities, customers, suppliers, and reports into one connected system.
          </p>
          
          <div className="space-y-4">
            <p className="font-semibold text-slate-900 text-lg">With Prokip, you can instantly see:</p>
            <ul className="grid sm:grid-cols-2 gap-3">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-prokip-dark shrink-0 mt-0.5" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 p-6 bg-prokip-dark border border-slate-800 rounded-xl text-white shadow-sm">
            <p className="text-lg font-bold">
              When you can see clearly, you can manage better — and grow with less stress.
            </p>
          </div>
        </div>

        <div className="lg:w-1/2 w-full">
          {/* A dashboard mockup placeholder reflecting the app UI style */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="mx-auto bg-white text-xs text-slate-400 px-3 py-1 rounded-md border border-slate-200 w-1/2 text-center truncate">
                app.prokip.africa/dashboard
              </div>
            </div>
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-semibold text-lg text-slate-800">Sales Overview</h3>
                  <p className="text-sm text-slate-500">Today's activities</p>
                </div>
                <div className="h-8 w-24 bg-prokip-yellow rounded-md opacity-20"></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-sm text-slate-500 mb-1">Total Sales</p>
                  <p className="text-2xl font-bold text-slate-800">₦245,000</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-sm text-slate-500 mb-1">Items Sold</p>
                  <p className="text-2xl font-bold text-slate-800">124</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-10 bg-slate-200 rounded-md w-full animate-pulse"></div>
                <div className="h-10 bg-slate-100 rounded-md w-full animate-pulse"></div>
                <div className="h-10 bg-slate-50 rounded-md w-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
