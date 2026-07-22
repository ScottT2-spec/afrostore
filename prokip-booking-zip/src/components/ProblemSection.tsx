import { ArrowRight, AlertCircle, TrendingDown, EyeOff, FileQuestion, Users, HelpCircle } from "lucide-react";
import { Button } from "./Button";

export function ProblemSection() {
  const scrollToForm = () => {
    document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const problems = [
    {
      icon: <FileQuestion className="w-6 h-6 text-red-500" />,
      title: "Stock records do not match reality",
    },
    {
      icon: <TrendingDown className="w-6 h-6 text-red-500" />,
      title: "Cash does not always match sales",
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-red-500" />,
      title: "Expenses increase without clear explanation",
    },
    {
      icon: <Users className="w-6 h-6 text-red-500" />,
      title: "Customers owe money, but records are scattered",
    },
    {
      icon: <EyeOff className="w-6 h-6 text-red-500" />,
      title: "Reports come late — or not at all",
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-red-500" />,
      title: "When something goes wrong, everyone has an explanation",
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-[1]">
            The Problem Is Not Always Low Sales. <br />
            <span className="text-red-500">It Is Poor Visibility.</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            Many business owners cannot leave their business for long because they are not fully sure what will happen when they are not there. Staff may be working. Sales may be happening. Customers may be buying <strong className="font-black text-prokip-dark bg-prokip-yellow px-2 py-0.5 rounded shadow-sm inline-block rotate-[-2deg]">but...</strong>
          </p>
          <div className="bg-white p-6 rounded-2xl shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.05)] border border-slate-100 text-slate-700 font-bold text-lg">
            "Can I trust what my staff are telling me?" <br />
            "Is my stock complete?" <br />
            "Are we making profit or just making sales?" <br />
            "Where is the money going?"
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4">
              <div className="p-3 bg-red-50 rounded-lg shrink-0">
                {problem.icon}
              </div>
              <p className="font-medium text-slate-800 self-center">
                {problem.title}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center max-w-2xl mx-auto">
          <p className="text-lg text-slate-600 mb-8">
            Without clear records, it becomes difficult to know who is responsible, where money is going, and whether the business is truly growing. <span className="font-semibold text-slate-900">That uncertainty is stressful. It can also be expensive.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={scrollToForm} className="w-full sm:w-auto font-bold uppercase tracking-wide">
              Book your free demo <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
