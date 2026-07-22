import { Check } from "lucide-react";

export function DemoDetails() {
  const benefits = [
    "Reduce employee theft, mistakes, and unauthorized activities",
    "Track every sale, payment, discount, return, and stock movement",
    "Know what is happening even when you are not physically there",
    "Understand whether your business is truly making profit",
    "Monitor expenses and identify where money is being wasted",
    "Manage one location or multiple branches from one place",
    "Keep cleaner records for accounting, reporting, and tax compliance",
    "Build a stronger system that allows your business to grow without depending on you 24/7"
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            What You Will See During Your Free Demo
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Your demo is focused on your business, your challenges, and your growth goals. Whether you run a shop, supermarket, pharmacy, restaurant, wholesale business, distribution company, manufacturing business, service business, school, hotel, or multi-branch operation, the demo will be tailored to your business.
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.05)] border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
            We will show you how Prokip can help you:
          </h3>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="mt-1 text-prokip-dark font-black">✓</div>
                <span className="text-slate-700 font-medium text-sm leading-relaxed">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
