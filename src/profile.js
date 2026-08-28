export const profile = {
  name: "Adithya M P",
  title: "AIML Engineer | Full Stack Developer",
  email: "adityamp450@gmail.com",
  phone: "+91-8431841045",
  linkedin: "https://www.linkedin.com/in/aadithya-m-p/",
  github: "https://github.com/Aditya-MP",
  resume: "/Adithya_MP_Resume_AIML.pdf",
  imgUrl: "/profile_pic.jpg",

  about: `
I am an AIML engineering graduate passionate about building intelligent applications, 
full-stack platforms, and interactive systems. I enjoy turning ideas into real-world 
products using AI, Java, and modern web technologies. I actively participate in 
hackathons and love experimenting with emerging tech.
  `,

  skills: {
    "Languages & Tools": ["Python", "Java", "SQL", "Git", "Docker", "Data Validation", "Server Management"],
    "Cloud": ["GCP", "Vertex AI", "AWS S3", "Microsoft Azure", "Serverless Cloud Functions", "Firebase"],
    "Frameworks": ["React 19", "FastAPI", "Node.js", "LangGraph", "Flutter", "Next.js"],
    "AI & ML": ["TensorFlow", "Gemini 2.5", "RAG Pipelines", "NPU Optimization", "Scikit-Learn", "Pandas", "NumPy"]
  },

  /* Each project carries a short `tagline` for the card face and a structured
     detail block for the expanded view. `problem`, `features` and `metrics`
     are drawn from the same facts as `description` — restated, never
     embellished — so the two views can never disagree with each other. A
     project with no measured numbers simply omits `metrics` rather than
     inventing one. */
  projects: [
    {
      id: 7,
      title: "WorldBean AI – EUDR Compliance Platform",
      tagline: "Satellite-verified deforestation compliance",
      description: "Architected a full-stack EUDR compliance platform that resolves smallholder coffee plots from Bhoomi land records and satellite imagery through a four-tier geolocation pipeline with a human-in-the-loop consistency gate. Integrated SAM2 change detection and LayoutLM document parsing to verify each plot against Hansen deforestation data and generate EU-compliant Due Diligence Statements.",
      problem: "EU deforestation regulation requires proof that a coffee plot has not been deforested — but smallholder plots often exist only as land records, with no precise geometry to check against satellite data.",
      features: [
        "Four-tier geolocation pipeline resolving plots from Bhoomi land records and satellite imagery",
        "Human-in-the-loop consistency gate for ambiguous resolutions",
        "SAM2 change detection verified against Hansen deforestation data",
        "LayoutLM document parsing for land-record extraction",
        "Generates EU-compliant Due Diligence Statements"
      ],
      tech: ["React", "Cesium", "FastAPI", "PostGIS", "SAM2"],
      link: "https://dishaank.netlify.app/",
      github: "https://github.com/Aditya-MP/Dishaank-AI",
      cover: "/worldbean_cover.webp",
      year: "Aug 2026"
    },
    {
      id: 1,
      title: "SalaryPilot – AI Financial Runway Planner",
      tagline: "Know exactly how long you could last",
      description: "A three-service personal finance platform for Indian salaried employees, built around runway — how many months you survive on zero income — instead of net worth. A React frontend computes the runway, tax and portfolio engines client-side; a Go API owns identity and a double-entry wallet ledger on Postgres; a Python service serves eight ML models hand-implemented on numpy. Every model ships with the baseline it beat, or it does not ship.",
      problem: "Personal finance apps answer \"what do I own?\" — a number that moves on its own and that you can rarely influence. The question salaried people actually carry is: if the income stopped today, how long before I am in trouble, and what would genuinely change that?",
      features: [
        "Runway engine measuring months of cover against essential spend only, with assets haircut by real liquidity (equity 85%, crypto 70%, locked retirement instruments 0%)",
        "Freedom Score: a 0–100 composite of five pillars, each shown with its own score and a plain-English verdict rather than a black box",
        "Ranked levers — every suggested action simulated against the user's own numbers and sorted by its actual effect on runway",
        "Six AI Coach agents (Runway Guard, Debt Strategist, Tax Optimiser, Leak Hunter, Portfolio Doctor, Milestone Planner) that show their reasoning",
        "Tax Centre running both Indian regimes against real declarations, reporting the break-even deduction level and which statutory HRA limit binds",
        "Go API with argon2id + JWT auth and a real double-entry ledger — the only service holding a database credential"
      ],
      metrics: [
        { value: "10 of 15", label: "walk-forward quarters beating the Nifty 500" },
        { value: "24.9%", label: "screener annualised return vs 13.4% benchmark" },
        { value: "8", label: "ML models built, each gated on its own evidence" }
      ],
      tech: ["React 19", "TypeScript", "Go", "Python", "PostgreSQL", "Gemini"],
      link: "https://a-salary-pilot-amd-addition.vercel.app/",
      github: "https://github.com/Aditya-MP/A_Salary_Pilot_-AMD_Addition-",
      cover: "/salary_pilot_cover.webp",
      year: "Aug 2026"
    },
    {
      id: 2,
      title: "Agent Forces – AI Cardano Wallet Assistant",
      tagline: "Conversational analytics for Cardano wallets",
      description: "Built an AI conversational assistant delivering wallet analytics, staking education, and actionable reward intelligence for Cardano users. Designed personalized portfolio insights covering ADA balance, UTXOs, delegation status, and stake pool performance metrics.",
      problem: "Cardano wallet data — UTXOs, delegation state, stake pool performance — is public but hard to interpret, so holders struggle to judge whether their staking is actually working for them.",
      features: [
        "Conversational assistant for wallet analytics",
        "Personalized portfolio insights across ADA balance and UTXOs",
        "Delegation status and stake pool performance metrics",
        "Staking education and actionable reward intelligence"
      ],
      tech: ["Cardano", "Web3", "AI"],
      link: "https://cardano-ai-assistence.netlify.app/",
      github: "https://github.com/Aditya-MP/Agent-Force",
      cover: "/agent_forces_cover.webp",
      year: "2025"
    },
    {
      id: 3,
      title: "Java Face Recognition Attendance System",
      tagline: "Attendance taken by recognition, not roll-call",
      description: "Created a Spring Boot web system enabling automated attendance tracking through real-time face recognition workflows. Implemented face registration, attendance history browsing, CSV export, and seamless navigation for daily operations.",
      problem: "Manual attendance is slow to take and awkward to audit later, leaving no reliable trail to export or review.",
      features: [
        "Real-time face recognition attendance workflow",
        "Face registration for enrolling new people",
        "Attendance history browsing",
        "CSV export for records and reporting"
      ],
      tech: ["Java", "Spring Boot", "Computer Vision"],
      link: "https://github.com/Aditya-MP/Face-Detection-attendence-system-Java-Spring-boot-",
      github: "https://github.com/Aditya-MP/Face-Detection-attendence-system-Java-Spring-boot-",
      cover: "/java_attendance_cover.webp",
      year: "2025"
    },
    {
      id: 4,
      title: "Chef-AI – GenAI Recipe Platform",
      tagline: "Meal plans generated around real constraints",
      description: "Architected a generative AI pipeline producing personalized meal plans based on dietary preferences and user constraints. Integrated secure authentication, cloud storage, and responsive UI, increasing user engagement by 40%.",
      problem: "Generic recipe sites ignore the constraints that actually decide what someone can cook — diet, restrictions, and what they are willing to plan around.",
      features: [
        "Generative pipeline producing personalized meal plans",
        "Planning driven by dietary preferences and user constraints",
        "Secure authentication and cloud storage",
        "Responsive UI across devices"
      ],
      metrics: [
        { value: "+40%", label: "user engagement" }
      ],
      tech: ["Next.js", "Gemini API", "Firebase"],
      link: "https://chef-ai-a-recipe-generator.netlify.app/",
      github: "https://github.com/Aditya-MP/Project-Chef-AI",
      cover: "/chef_ai_cover.webp",
      year: "July 2025"
    },
    {
      id: 5,
      title: "Kalakrithi – AI Artisan Marketplace (Lead)",
      tagline: "Artisans sell the story, not just the object",
      description: "Directed development of a full-stack marketplace connecting artisans with buyers through AI-powered storytelling experiences. Delivered voice recognition intelligence and dynamic pricing recommendations using multimodal generative models and market analytics.",
      problem: "Artisans lose value on generic marketplaces: the craft and story behind a piece never reaches the buyer, and pricing is guesswork.",
      features: [
        "Full-stack marketplace connecting artisans with buyers",
        "AI-powered storytelling built on multimodal generative models",
        "Voice recognition intelligence for artisan input",
        "Dynamic pricing recommendations from market analytics"
      ],
      role: "Team lead",
      tech: ["Python", "Flutter", "Vertex AI"],
      link: "https://kalakrithi-39f00.web.app",
      github: "https://github.com/Aditya-MP/kalakriti-_hosting",
      cover: "/kalakriti_cover.webp",
      year: "Sept 2025"
    },
    {
      id: 6,
      title: "Local Lens – AI-Powered Hyperlocal Discovery",
      tagline: "Finding what is genuinely nearby",
      description: "Developed an AI-driven hyperlocal platform to optimize real-time location-based searches. Engineered a smart recommendation engine and interactive maps to seamlessly connect users with personalized nearby businesses and services.",
      problem: "General search buries small nearby businesses under whatever ranks nationally, so the most relevant option a few streets away never surfaces.",
      features: [
        "Real-time location-based search",
        "Smart recommendation engine for personalized results",
        "Interactive maps connecting users to nearby businesses",
        "Coverage across local services and businesses"
      ],
      tech: ["React", "AI", "Geolocation", "Firebase"],
      link: "https://locallens-a3b3f.web.app/",
      github: "https://github.com/Aditya-MP/Locallens-AI-Powered-Hyperlocal-Discovery-Optimization.git",
      cover: "/locallens_cover.webp",
      year: "2026"
    }
  ],

  experience: [
    {
      role: "Data Center Operations Associate (Freelance)",
      company: "Vseek Ventures",
      duration: "Mar 2026 – Present",
      tech: ["AWS S3", "Data Pipelines", "Server Management"],
      description: [
        "Executed large-scale data ingestion from physical media to AWS S3 with full lifecycle management.",
        "Performed integrity audits via checksum and hash verification, achieving 100% accuracy on all transfers.",
        "Managed on-premise servers, resolving throughput inefficiencies to maintain consistently optimized data flow."
      ]
    },
    {
      role: "Software Developer Intern",
      company: "TAP Academy",
      duration: "Jan 2026 – Present",
      tech: ["Java", "Spring Boot", "Hibernate", "MySQL", "React", "REST APIs"],
      description: [
        "Developed secure REST APIs using Spring Boot and Hibernate ORM following Clean Architecture principles.",
        "Overhauled legacy SQL schemas, cutting query bottlenecks by 30% with strict business logic isolation.",
        "Spearheaded a cross-team UI migration to componentized React, boosting render performance by 40%."
      ]
    }
  ],

  education: [
    {
      degree: "B.Tech CSE (AIML)",
      institution: "CMR University",
      duration: "2022 - 2026",
      details: "CGPA: 8.00 / 10.00"
    },
    {
      degree: "Diploma Mechanical Engineering",
      institution: "Govt Polytechnic",
      duration: "2019 – 2022",
      details: "Bengaluru"
    }
  ],

  achievements: [
    "Finalist, Top 1% – Innova Hackathon Chapter 1, WorldBean AI (2026)",
    "National Runner-Up – Sandbox 1.0 Ideathon, IIT Bombay (2025)",
    "Finalist – Cardano Blockchain Hackathon, Hack2Skills (2025)",
    "Finalist – Hackademia National Hackathon (2025)",
    "Runner-Up – Ideathon 2K25, CMR University (2025)",
    "Participant – Hackwise National Hackathon (2025)",
    "Volunteer – Google Cloud Agentic AI Day (2025)"
  ]
};