export function ProcessSection() {
  const steps = [
    {
      num: "1",
      title: "We Understand Your Business",
      desc: "We'll ask a few questions about how your business works, your daily operations, your staff, your stock, your sales process, and the challenges you are facing."
    },
    {
      num: "2",
      title: "We Focus on Your Main Problems",
      desc: "Whether it is missing stock, employee theft, unclear profit, manual records, expenses, customer debts, or managing multiple branches, we'll focus on what matters most to your business."
    },
    {
      num: "3",
      title: "We Show You How Prokip Can Help",
      desc: "We'll demonstrate how Prokip can help you track sales, monitor stock, know who did what, manage expenses, understand profit, and run your business with better control."
    },
    {
      num: "4",
      title: "We Answer Your Questions",
      desc: "You can ask about setup, pricing, training, migration, accounting, staff access, branches, and how Prokip fits into your business."
    },
    {
      num: "5",
      title: "You Leave With a Clear Next Step",
      desc: "By the end, you'll understand how Prokip can help you reduce losses, improve accountability, cut stress, and grow your business with more confidence."
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            How Your Free Demo Will Go
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your Prokip demo is a personalized session focused on your business, not a general software presentation.
          </p>
        </div>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-prokip-yellow/20 text-prokip-dark font-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                {step.num}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-lg text-slate-900 mb-2">{step.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
