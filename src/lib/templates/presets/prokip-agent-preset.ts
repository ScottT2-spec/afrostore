import type { EditorNode } from "@/lib/visual-editor/node-tree";

export const PROKIP_AGENT_PRESET: EditorNode[] = [
  {
    id: "pa-modal",
    type: "prokipAgentModal",
    settings: {
      title: "Enter your correct details to join Prokip Sales Agent Team",
      badge: "Nigeria Agent",
      fields: [
        { name: "fullName", label: "Full Name", type: "text", placeholder: "John Doe" },
        { name: "email", label: "Email", type: "email", placeholder: "john@example.com" },
        { name: "phone", label: "Phone Number", type: "tel", placeholder: "801 234 5678", prefix: "+234" },
      ],
      submitText: "JOIN OUR TEAM NOW",
    },
  },
  {
    id: "pa-banner",
    type: "prokipAgentTopBanner",
    settings: {
      attentionText: "Attention!",
      message: '<strong>Please read this entire page carefully before you register.</strong> This opportunity requires serious commitment. If you cannot read and understand the full page, please do not sign up.',
    },
  },
  {
    id: "pa-hero",
    type: "prokipAgentHero",
    settings: {
      badge: "Become Our Next Success Story",
      titleStart: "Earn 6-figures And More Monthly As a",
      titleHighlight: "Prokip Sales Agent",
      description: 'By becoming our sales agent, you will enjoy earnings of up to <strong>N500,000 - N1,000,000</strong> aside from bonuses. Now you can build a financial growth path for yourself all from your location in Nigeria.',
      videoUrl: "https://www.youtube.com/embed/Sd7MkZ9PZqM?si=hkq1ZIeesfmZG45k",
      ctaText: "Join Our Team Now",
    },
  },
  {
    id: "pa-intro",
    type: "prokipAgentIntro",
    settings: {
      subtitle: "A Unique Opportunity",
      title: "Dear friend, if you're looking for a way to make more money this year, this could be the most important message you'll read today.",
      description: "Right now, our company, Prokip, is offering a unique opportunity for individuals like you to join us as a sales agent. All you have to do is help business owners use our software to grow their businesses.",
      calloutText: "And don't worry—it doesn't matter whether you have advanced tech skills or accounting experience. We'll teach you everything step by step. We'll teach all you need to know to represent us in your state and start making good money.",
      tasksTitle: "What You'll Do",
      tasksSubtitle: "As a Sales Agent at Prokip, you'll be at the forefront of our mission to empower businesses. Here's what your day-to-day will look like:",
      tasks: [
        { title: "Engage and Consult", description: "Collaborate with businesses to understand their challenges and show how Prokip's cutting-edge technology is the perfect solution.", icon: "👥" },
        { title: "Lead Product Demos", description: "Deliver tailored, impactful demonstrations that highlight how our all-in-one platform simplifies operations and accelerates growth.", icon: "🎯" },
        { title: "Provide Technical Expertise", description: "Explain complex technical concepts in simple terms, making it easy for clients to see the value of our software.", icon: "🔧" },
        { title: "Offer Post-Sales Support", description: "Ensure smooth onboarding and ongoing success by assisting clients with setup, troubleshooting, and best practices.", icon: "💼" },
        { title: "Collaborate and Innovate", description: "Work closely with sales, product, and engineering teams to create customized solutions that meet client needs.", icon: "📈" },
      ],
    },
  },
  {
    id: "pa-about",
    type: "prokipAgentAbout",
    settings: {
      title: "Now, What's Prokip All About?",
      description: "Prokip is a powerful business management software that helps business owners simplify their operations and manage their money better.",
      description2: "Prokip is redefining how businesses manage their operations with an all-in-one platform that integrates:",
      features: ["Accounting", "Inventory Management", "Customer Relationship Management", "Payment Processing", "Marketing Tools", "POS System", "Production Management", "Table and Restaurant Management"],
      highlightQuote: "And in today's world, tools like Prokip are becoming a must-have for every serious business.",
      cardTitle: "Here's the exciting part:",
      cardDescription: 'In Nigeria alone, there are over <strong>20 million businesses</strong> that could benefit from Prokip solution. Plus, 200,000 new businesses start every year!',
      cardDescription2: "Many of these businesses do not even know how much Prokip can help them. That's where you come in.",
      dutiesTitle: "And your job is simple:",
      duties: [
        "Talk to business owners and show them how Prokip can make their lives easier.",
        "Help them see the value, and close them to integrate Prokip's solution with their businesses.",
        "Support them through a seamless onboarding process.",
        "Earn a commission while at it.",
      ],
      ctaText: "Join Our Team Now",
    },
  },
  {
    id: "pa-benefits",
    type: "prokipAgentBenefits",
    settings: {
      title: "What Will You Gain?",
      subtitle: "Joining Prokip isn't just a job—it's a launchpad for your career.",
      benefits: [
        { title: "Competitive Pay and Rewards", items: ["Earn up to 40% commission per sale—plus performance-based bonuses.", "Our top Sales Agents make ₦500K to ₦1M per month by supporting and engaging clients."], icon: "🏆" },
        { title: "Expert Training", items: ["30-60 days of intensive training to take you from novice to expert.", "Gain technical knowledge, presentation skills, and real-world experience to excel in your role."], icon: "📚" },
        { title: "Professional Growth", items: ["Unlock opportunities for advancement and financial growth.", "Be part of a fintech company that's shaping the future of business management."], icon: "📈" },
        { title: "Flexible Work Options", items: ["Enjoy a hybrid work model—work remotely and visit clients when needed."], icon: "🏠" },
        { title: "Dynamic Culture", items: ["Join a collaborative, innovative team where your ideas are valued."], icon: "😊" },
      ],
    },
  },
  {
    id: "pa-media",
    type: "prokipAgentMedia",
    settings: {
      teamsTitle: "We Have Team All Over Africa",
      teamsSubtitle: "Below are some of our team in different countries.",
      teams: [
        { country: "Nigeria Team", imageUrl: "https://i0.wp.com/agent.prokip.africa/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-02-at-16.35.23.jpeg?resize=768%2C512&ssl=1" },
        { country: "Kenya Team", imageUrl: "https://i0.wp.com/agent.prokip.africa/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-02-at-16.27.30-scaled.jpeg?resize=768%2C432&ssl=1" },
        { country: "Ghana Team", imageUrl: "https://i0.wp.com/agent.prokip.africa/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-02-at-16.30.17.jpeg?resize=768%2C512&ssl=1" },
        { country: "Rwanda Team", imageUrl: "https://i0.wp.com/agent.prokip.africa/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-02-at-16.38.05.jpeg?resize=768%2C435&ssl=1" },
      ],
      videosTitle: "Hear What Some of Our Agents Are Saying...",
      videos: [
        "https://www.youtube.com/embed/wLpJFn0nzy8",
        "https://www.youtube.com/embed/Sd7MkZ9PZqM",
        "https://www.youtube.com/embed/Z9gap2q1XIg",
        "https://www.youtube.com/embed/LaIF0JnY_0U",
      ],
      ctaText: "Join Our Team Now",
    },
  },
  {
    id: "pa-support",
    type: "prokipAgentSupport",
    settings: {
      supportTitle: "How Can Prokip Support You As A Sales Agent?",
      supportSubtitle: "As a sales agent, Prokip will support you every step of the way. Here is how we intend to do so:",
      supportCards: [
        {
          number: "1",
          title: "Comprehensive Onboarding — 30-60 Days",
          items: [
            "In-depth training on Prokip's platform to understand its features and functionality.",
            "Guidance on how to support businesses in integrating Prokip into their operations.",
            { text: "Sales training to develop essential skills, including:", subitems: ["Effective communication", "Relationship building", "Persuasive selling techniques"] },
          ],
        },
        {
          number: "2",
          title: "Ongoing Support and Development",
          items: [
            "Continuous training to stay up-to-date on industry best practices and Prokip's evolving features.",
            "Regular check-in calls to provide personalized guidance and address any challenges you may face.",
          ],
          footer: "With this support system, Prokip ensures you have everything you need to succeed as a Sales Agent.",
        },
      ],
      qualBadge: "Exclusive Opportunity",
      qualTitle: "BUT So We Don't Waste Your Time…",
      qualDescription: "It's important you know that this opening is NOT for everyone. It's an EXCLUSIVE opportunity for a certain set of people. So, you have to be eligible before you join.",
      lookingForTitle: "Who Are We Looking For?",
      lookingFor: [
        "Tech-Savvy: Comfortable with computers and eager to master new software.",
        "Sales Mindset: Strong communication skills and the ability to turn technical features into real-world benefits.",
        "Problem Solver: You listen, understand, and find creative solutions.",
        "Self-Motivated: Ready to take initiative and achieve results.",
        "Team Player: Thrive in a collaborative environment and work well across departments.",
      ],
      opportunityTitle: "Who Is This Opportunity For?",
      opportunitySubtitle: "This is for you if:",
      opportunityItems: [
        "You know how to use computers and software and can learn new tools quickly.",
        "If you've worked in IT, ERP, or used business or accounting software, that's great! But it's not a must.",
        "If you've done sales before or can explain things in a way people understand, you're a good fit. If you're willing to learn, that works too!",
        "You care about making sure customers are happy and successful with our product.",
        "You enjoy working with others to achieve shared goals.",
        "You're open to learning and keeping up with new ideas and updates about our product.",
      ],
      ctaText: "Join Our Team Now",
    },
  },
  {
    id: "pa-conversion",
    type: "prokipAgentConversion",
    settings: {
      title: "What Are You Waiting For?",
      description: "If you are serious about making more money that allows you to do what you really want to do with your life —",
      checkmarks: [
        "Spending quality time with your family...",
        "Going on holidays whenever you want...",
        "Living in a beautiful home you want...",
        "Paying bills easily and never having to worry about money again…",
      ],
      urgencyText: "Then, you owe it to yourself to take full advantage of this very limited, risk-free opportunity right now before it's too late, as we will close down this opportunity very soon. So do yourself a favour. Join today, won't you?",
      ctaText: "Join Our Team Now",
    },
  },
  {
    id: "pa-footer",
    type: "prokipAgentFooter",
    settings: {
      brandName: "Prokip",
      brandAccent: ".",
      disclaimers: [
        "This site and associated website are not a part of the Facebook website or Facebook Inc.",
        "Additionally, this is NOT endorsed by FACEBOOK in any way. FACEBOOK is a trademark of FACEBOOK, INC.",
      ],
      copyright: "© 2024 Prokip. ALL RIGHTS RESERVED.",
    },
  },
];
