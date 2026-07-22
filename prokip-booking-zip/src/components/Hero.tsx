import { ArrowRight, Store } from "lucide-react";
import { Button } from "./Button";

export function Hero() {
  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-prokip-dark text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background accents (optional subtlety) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-prokip-yellow/10 rounded-full blur-[100px] opacity-50"></div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-block px-3 py-1 bg-prokip-yellow/20 text-prokip-yellow border border-prokip-yellow/30 text-xs font-bold tracking-widest uppercase rounded-full mb-6">
          Africa's #1 Business software
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-[0.95] text-white">
          Trust Is Good. <br className="hidden sm:block" />
          <span className="text-prokip-yellow">Clear Records</span> <br className="hidden sm:block" /> Are Better.
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          See how Prokip helps African businesses track sales, stock, staff activities, expenses, and profit from one place — so you can reduce losses, improve control, and grow with confidence.
        </p>

        <div className="relative bg-slate-800 rounded-2xl p-2 sm:p-4 overflow-hidden shadow-2xl mx-auto max-w-4xl aspect-video group cursor-pointer border border-slate-700 mb-12">
          <iframe
            className="w-full h-full relative z-10 rounded-xl"
            src="https://www.youtube.com/embed/npOn8HIb0Yo?si=VaQ3U0g7XoRO7fUn&autoplay=0&rel=0"
            title="How Prokip helped us track sales, stock, and prevent employees theft"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={scrollToForm} className="w-full sm:w-auto font-bold uppercase tracking-wide">
            Book your Demo <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
