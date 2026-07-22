/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Hero } from "./components/Hero";
import { ProblemSection } from "./components/ProblemSection";
import { SolutionSection } from "./components/SolutionSection";
import { DemoDetails } from "./components/DemoDetails";
import { Testimonials } from "./components/Testimonials";
import { ProcessSection } from "./components/ProcessSection";
import { BookingForm } from "./components/BookingForm";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-prokip-yellow/30">
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <DemoDetails />
      <Testimonials />
      <ProcessSection />
      <BookingForm />
      
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm font-semibold tracking-wider uppercase">
        <p>© {new Date().getFullYear()} Prokip. All rights reserved.</p>
      </footer>
    </div>
  );
}
