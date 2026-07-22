import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { CheckCircle2, Calendar as CalendarIcon, Clock, ChevronDown, Check, ArrowRight, ArrowLeft } from "lucide-react";

export function BookingForm() {
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form states
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [countryCode, setCountryCode] = useState("+234");
  const [phoneNo, setPhoneNo] = useState("");
  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [locations, setLocations] = useState("");
  const [challenge, setChallenge] = useState("");
  
  // Date and Time selection states
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);

  const countries = [
    { code: "+234", flag: "🇳🇬", name: "Nigeria" },
    { code: "+233", flag: "🇬🇭", name: "Ghana" },
    { code: "+254", flag: "🇰🇪", name: "Kenya" },
    { code: "+27", flag: "🇿🇦", name: "South Africa" },
    { code: "+250", flag: "🇷🇼", name: "Rwanda" },
    { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
    { code: "+1", flag: "🇺🇸", name: "United States" },
  ];

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"
  ];

  // Generate next 14 business days (excluding Sunday) starting from tomorrow
  const [upcomingDates, setUpcomingDates] = useState<{ dateString: string; dayName: string; dayNum: string; monthName: string }[]>([]);

  useEffect(() => {
    const list = [];
    const today = new Date();
    let count = 0;
    let daysChecked = 1;

    while (count < 14 && daysChecked < 30) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + daysChecked);
      
      // Skip Sundays (0)
      if (nextDate.getDay() !== 0) {
        const year = nextDate.getFullYear();
        const month = String(nextDate.getMonth() + 1).padStart(2, "0");
        const day = String(nextDate.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;
        
        const dayName = nextDate.toLocaleDateString("en-US", { weekday: "short" });
        const dayNum = nextDate.toLocaleDateString("en-US", { day: "numeric" });
        const monthName = nextDate.toLocaleDateString("en-US", { month: "short" });

        list.push({ dateString, dayName, dayNum, monthName });
        count++;
      }
      daysChecked++;
    }
    setUpcomingDates(list);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (fullName && businessName && phoneNo && email && businessType && locations) {
      setStep(2);
    } else {
      // Small visual feedback could be added here, but relying on required attributes mostly
      const form = document.getElementById('demo-form') as HTMLFormElement;
      form?.reportValidity();
    }
  };

  const currentCountry = countries.find(c => c.code === countryCode) || countries[0];

  return (
    <section id="booking-form" className="py-20 px-4 sm:px-6 lg:px-8 bg-prokip-dark text-slate-100">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 lg:items-start">
        <div className="lg:w-5/12 pt-8">
          <h2 className="text-4xl font-black mb-6 text-white tracking-tight leading-[0.95]">
            Book Your Free <br/><span className="text-prokip-yellow">Personalized Demo</span>
          </h2>
          <p className="text-lg text-slate-300 mb-10 leading-relaxed">
            Free today. No obligation. Tailored to your business.
          </p>
          
          <div className="mt-8">
            <div className="bg-prokip-yellow/10 border border-prokip-yellow/20 rounded-xl p-6">
              <h3 className="font-bold text-prokip-yellow mb-2 text-lg">Trusted by 30,000+ Users</h3>
              <p className="text-slate-300 font-medium text-sm leading-relaxed">
                with 1,500+ Local Support Agents in 80+ Regions.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:w-7/12 w-full">
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-[-20px_0_40px_-20px_rgba(0,0,0,0.5)] border border-slate-700 text-slate-800 relative overflow-hidden">
            {/* Progress Bar */}
            {!submitted && (
              <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                <div 
                  className="h-full bg-prokip-yellow transition-all duration-500 ease-out" 
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
            )}

            {submitted ? (
              <div className="text-center py-8 sm:py-12 animate-fadeIn flex flex-col items-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-green-400 opacity-20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                  <CheckCircle2 className="w-10 h-10 text-green-600 relative z-10" />
                </div>
                
                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">You're all set!</h3>
                <p className="text-slate-600 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                  We've received your request. A calendar invitation and confirmation details have been sent to <span className="font-bold text-slate-800">{email}</span>.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 w-full max-w-md mx-auto mb-8 text-left shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Your Session Details</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-5 h-5 text-prokip-dark" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Date</p>
                        <p className="text-sm font-bold text-slate-900">{selectedDate}</p>
                      </div>
                    </div>
                    <div className="h-px w-full bg-slate-200/60"></div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-prokip-dark" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">Time</p>
                        <p className="text-sm font-bold text-slate-900">{selectedTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={() => {
                  setSubmitted(false);
                  setStep(1);
                  setFullName("");
                  setBusinessName("");
                  setPhoneNo("");
                  setEmail("");
                  setBusinessType("");
                  setLocations("");
                  setChallenge("");
                  setSelectedTime("");
                  setSelectedDate("");
                  setShowCustomDate(false);
                }} variant="outline" className="font-bold rounded-xl px-8 border-slate-300 text-slate-700 hover:bg-slate-50">
                  Book another demo
                </Button>
              </div>
            ) : (
              <form id="demo-form" onSubmit={handleSubmit} className="relative">
                
                {/* Step 1: Basic Details */}
                <div className={`space-y-6 transition-all duration-500 ${step === 1 ? 'block animate-fadeIn' : 'hidden'}`}>
                  <div className="mb-2">
                    <h3 className="text-xl font-bold text-slate-900">About Your Business</h3>
                    <p className="text-sm text-slate-500 mt-1">Let's get to know you better so we can tailor the demo.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider">Full Name *</label>
                      <input 
                        required 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-prokip-dark focus:ring-1 focus:ring-prokip-dark transition-all" 
                        placeholder="John Doe" 
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider">Business Name *</label>
                      <input 
                        required 
                        type="text" 
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-prokip-dark focus:ring-1 focus:ring-prokip-dark transition-all" 
                        placeholder="Acme Corp" 
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col relative">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider">Phone Number *</label>
                      <div className="relative flex rounded-xl border border-slate-200 bg-slate-50 focus-within:border-prokip-dark focus-within:ring-1 focus-within:ring-prokip-dark transition-all">
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className="flex items-center gap-1.5 px-3 border-r border-slate-200 hover:bg-slate-100 transition-colors rounded-l-xl text-sm font-semibold text-slate-700 shrink-0"
                        >
                          <span>{currentCountry.flag}</span>
                          <span>{currentCountry.code}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {isCountryDropdownOpen && (
                          <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 max-h-60 overflow-y-auto">
                            {countries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setCountryCode(country.code);
                                  setIsCountryDropdownOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{country.flag}</span>
                                  <span className="font-medium">{country.name}</span>
                                </div>
                                <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded-md">{country.code}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <input 
                          required 
                          type="tel" 
                          value={phoneNo}
                          onChange={(e) => setPhoneNo(e.target.value)}
                          className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none text-slate-800" 
                          placeholder="801 234 5678" 
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider">Email Address *</label>
                      <input 
                        required 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-prokip-dark focus:ring-1 focus:ring-prokip-dark transition-all" 
                        placeholder="john@example.com" 
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider">Type of Business *</label>
                      <div className="relative">
                        <select 
                          required 
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-prokip-dark focus:ring-1 focus:ring-prokip-dark transition-all text-slate-700 appearance-none"
                        >
                          <option value="">Select industry...</option>
                          <option value="retail">Retail / Supermarket</option>
                          <option value="pharmacy">Pharmacy</option>
                          <option value="restaurant">Restaurant / Hotel</option>
                          <option value="wholesale">Wholesale / Distribution</option>
                          <option value="manufacturing">Manufacturing</option>
                          <option value="service">Service Business</option>
                          <option value="other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider">Locations *</label>
                      <div className="relative">
                        <select 
                          required 
                          value={locations}
                          onChange={(e) => setLocations(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-prokip-dark focus:ring-1 focus:ring-prokip-dark transition-all text-slate-700 appearance-none"
                        >
                          <option value="">Select size...</option>
                          <option value="1">1 (Single Branch)</option>
                          <option value="2-5">2 - 5 Branches</option>
                          <option value="6-10">6 - 10 Branches</option>
                          <option value="11+">11+ Branches</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="button" 
                      onClick={handleNextStep}
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-md mt-2 transition-all"
                    >
                      Continue to Schedule <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Step 2: Challenge & Schedule */}
                <div className={`space-y-6 transition-all duration-500 ${step === 2 ? 'block animate-fadeIn' : 'hidden'}`}>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <button 
                      type="button" 
                      onClick={() => setStep(1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      aria-label="Go back"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Your Goals & Availability</h3>
                      <p className="text-sm text-slate-500">Tell us what you want to fix, and when to meet.</p>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-1 tracking-wider">What is your biggest challenge right now? *</label>
                    <textarea 
                      required 
                      value={challenge}
                      onChange={(e) => setChallenge(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-prokip-dark focus:ring-1 focus:ring-prokip-dark transition-all resize-none" 
                      rows={3} 
                      placeholder="e.g. Employee theft, manual records, tracking stock across branches..." 
                    />
                  </div>

                  {/* Modern Date & Time Picker */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Select a Date *</h4>
                        <p className="text-xs text-slate-500">Pick a day that works best for you.</p>
                      </div>
                      <CalendarIcon className="w-5 h-5 text-slate-300" />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {upcomingDates.slice(0, 5).map((item) => (
                        <button
                          key={item.dateString}
                          type="button"
                          onClick={() => { setSelectedDate(item.dateString); setSelectedTime(""); setShowCustomDate(false); }}
                          className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border text-center transition-all ${
                            selectedDate === item.dateString && !showCustomDate
                              ? "bg-prokip-dark text-white border-prokip-dark shadow-md ring-2 ring-prokip-yellow/50"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span className={`text-[9px] uppercase font-bold mb-0.5 ${selectedDate === item.dateString && !showCustomDate ? "text-slate-300" : "text-slate-400"}`}>{item.dayName}</span>
                          <span className={`text-lg font-black leading-none mb-0.5 ${selectedDate === item.dateString && !showCustomDate ? "text-prokip-yellow" : "text-slate-800"}`}>
                            {item.dayNum}
                          </span>
                          <span className="text-[9px] font-medium opacity-80">{item.monthName}</span>
                        </button>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => setShowCustomDate(!showCustomDate)}
                        className={`flex-1 min-w-[70px] flex flex-col items-center justify-center py-2.5 px-1 rounded-xl border border-dashed text-center transition-all ${
                          showCustomDate
                            ? "bg-slate-100 border-slate-400 text-slate-800"
                            : "bg-transparent text-slate-500 border-slate-300 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                      >
                        <CalendarIcon className="w-5 h-5 mb-1.5 opacity-70" />
                        <span className="text-[10px] font-bold">More</span>
                      </button>
                    </div>

                    {showCustomDate && (
                      <div className="relative animate-fadeIn mb-4">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input 
                          type="date" 
                          required={showCustomDate}
                          value={selectedDate}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedTime("");
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-prokip-dark focus:ring-1 focus:ring-prokip-dark transition-all text-slate-800" 
                        />
                      </div>
                    )}

                    <div className={`transition-all duration-300 overflow-hidden ${selectedDate ? "opacity-100 max-h-[400px]" : "opacity-50 max-h-0 pointer-events-none grayscale"}`}>
                      <div className="mb-4 mt-2 flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Select a Time *</h4>
                          <p className="text-xs text-slate-500">Available slots for the selected date.</p>
                        </div>
                        <Clock className="w-5 h-5 text-slate-300" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`py-3 px-2 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                              selectedTime === time
                                ? "bg-prokip-yellow text-prokip-dark border-prokip-yellow shadow-sm ring-1 ring-prokip-dark"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            {selectedTime === time && <Check className="w-4 h-4 stroke-[3]" />}
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Call To Action */}
                  <div className="pt-6">
                    <button 
                      type="submit" 
                      disabled={!selectedDate || !selectedTime || !challenge}
                      className="w-full flex items-center justify-center gap-2 bg-prokip-yellow hover:bg-prokip-yellow-hover text-prokip-dark font-bold py-4 rounded-xl shadow-lg shadow-prokip-yellow/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {!challenge 
                        ? "Enter your biggest challenge" 
                        : !selectedDate 
                        ? "Select Preferred Date first" 
                        : !selectedTime 
                        ? "Select Available Time Slot" 
                        : "Show Me How to Run My Business"}
                      {challenge && selectedDate && selectedTime && <CheckCircle2 className="w-5 h-5" />}
                    </button>
                    <div className="text-center mt-4">
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Trusted by 30,000+ Users in 80+ Regions</p>
                    </div>
                  </div>
                </div>

              </form>
            )}
          </div>

          <div className="mt-8 bg-slate-800/50 rounded-2xl p-6 sm:p-8 border border-slate-700">
            <h3 className="font-bold text-xl text-white mb-6 text-center">Why Business Owners Book a Prokip Demo</h3>
            <ul className="grid sm:grid-cols-2 gap-4">
              {[
                "They want to know where their money is going.",
                "They want to reduce staff-related losses.",
                "They want to stop depending on manual records.",
                "They want to manage their business without sitting there all day.",
                "They want to expand without losing control."
              ].map((reason, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-prokip-yellow/20 flex items-center justify-center">
                    <span className="text-prokip-yellow font-black text-xs">✓</span>
                  </div>
                  <span className="text-slate-300 font-medium text-sm leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

