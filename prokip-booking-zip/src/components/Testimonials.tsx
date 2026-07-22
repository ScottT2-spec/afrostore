import { PlayCircle, ArrowRight } from "lucide-react";
import { Button } from "./Button";

export function Testimonials() {
  const testimonials = [
    {
      id: "WXfLnZ-iyYA",
      title: "Business Owner Testimonial 1",
    },
    {
      id: "dDeEqanvkRc",
      title: "Business Owner Testimonial 2",
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-block px-3 py-1 bg-prokip-yellow/20 text-prokip-dark border border-prokip-yellow/30 text-xs font-bold tracking-widest uppercase rounded-full mb-6">
          Success Stories
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Hear From Business Owners
        </h2>
        <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">
          See how real businesses across Africa use Prokip to take control of their operations and grow confidently.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {testimonials.map((test, idx) => (
            <div key={idx} className="relative rounded-2xl overflow-hidden shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.05)] border border-slate-200 bg-white aspect-video p-2">
              <iframe
                className="w-full h-full rounded-xl"
                src={`https://www.youtube.com/embed/${test.id}?rel=0`}
                title={test.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={() => document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })} className="w-full sm:w-auto font-bold">
            Book a demo <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
