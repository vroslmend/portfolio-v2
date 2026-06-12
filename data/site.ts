export type Project = {
  slug: string;
  name: string;
  year: string;
  tagline: string;
  description: string;
  stack: string[];
  links: { live?: string; github?: string };
  image?: string;
  featured: boolean;
};

export const site = {
  name: "Ammar Hassan",
  wordmark: "ammar hassan",
  role: "software engineer",
  location: "lahore, pakistan",
  timezone: "Asia/Karachi",
  email: "ammarhassan.amr@gmail.com",
  links: {
    github: "https://github.com/vroslmend",
    linkedin: "https://www.linkedin.com/in/ammar-hassan-8aa48a233/",
    resume: "/resume.pdf",
  },
  now: "building realtime web products and learning to put AI inside them",
} as const;

export const projects: Project[] = [
  {
    slug: "cui-central",
    name: "CUI Central",
    year: "2025",
    tagline: "campus operating system",
    description:
      "Seven campus services — cafeteria ordering, room booking, faculty availability, a job portal — folded into one Next.js 15 monorepo with role-based access for students, faculty, and admins. A RAG agent on Gemini and MongoDB Vector Search answers student questions against live application data.",
    stack: ["Next.js 15", "Socket.IO", "Gemini", "MongoDB"],
    links: { live: "https://cui-central.vercel.app" },
    featured: true,
  },
  {
    slug: "check",
    name: "Check!",
    year: "2025",
    tagline: "multiplayer card game",
    description:
      "A realtime card game on a custom WebSocket engine — concurrent rooms, sub-50ms state sync, event-driven throughout. Most of the work was invisible: hunting race conditions until every client agreed on the board, every time.",
    stack: ["Next.js", "Node.js", "Socket.IO"],
    links: {
      live: "https://check-the-game.vercel.app",
      github: "https://github.com/vroslmend/check-the-card-game-v2",
    },
    featured: true,
  },
  {
    slug: "imaginify",
    name: "Imaginify",
    year: "2024",
    tagline: "ai image platform",
    description:
      "Generative fill, restore, and recolor for high-res images, with type-safe API routes end to end. Stripe webhooks drive a small credit economy — the whole payment lifecycle handled without drama.",
    stack: ["Next.js", "TypeScript", "Cloudinary AI", "Stripe"],
    links: {
      live: "https://imaginify-six-sigma.vercel.app",
      github: "https://github.com/vroslmend/next-ai-saas-app",
    },
    featured: true,
  },
  {
    slug: "sportzilla",
    name: "Sportzilla",
    year: "2025",
    tagline: "karting telemetry analysis",
    description:
      "A Python pipeline for 50,000+ lap-time telemetry points scraped from real karting sessions. Swapping iterative loops for NumPy vectorization cut processing time by 30%; statistical heatmaps surface driver consistency and tyre degradation.",
    stack: ["Python", "Pandas", "NumPy"],
    links: { github: "https://github.com/vroslmend/sportzilla-laptime-analysis" },
    featured: true,
  },
  {
    slug: "course-scheduler",
    name: "Course Scheduler",
    year: "2025",
    tagline: "clash-free timetable optimizer",
    description:
      "A Python CLI that parses university timetable PDFs and finds every clash-free combination of your courses — ranked by gap time, with smart swap suggestions when no valid schedule exists.",
    stack: ["Python"],
    links: { github: "https://github.com/vroslmend" },
    featured: false,
  },
  {
    slug: "lead-tracker",
    name: "Lead Tracker",
    year: "2023",
    tagline: "chrome extension",
    description:
      "A small productivity tool that saves leads straight from the active tab — Chrome Extensions API with localStorage persistence.",
    stack: ["JavaScript", "Chrome API"],
    links: { github: "https://github.com/vroslmend/lead-tracker-extension" },
    featured: false,
  },
  {
    slug: "this-site",
    name: "This Site",
    year: "2026",
    tagline: "you are here",
    description:
      "Whisper-minimal, monochrome, obsessively animated. Next.js 16, Tailwind v4, Motion, and Lenis.",
    stack: ["Next.js 16", "Tailwind v4", "Motion"],
    links: { github: "https://github.com/vroslmend" },
    featured: false,
  },
];

export const experience = [
  {
    company: "Punjab Safe Cities Authority",
    role: "Web Development Intern",
    period: "jun – aug 2024",
    description:
      "Maintained citizen-facing government portals serving high-traffic provincial services on Node.js, and traced Punjab's automated E-Challan pipeline from AI camera detection to dashboard.",
  },
];

export const education = [
  {
    school: "COMSATS University, Lahore",
    degree: "BS Software Engineering",
    period: "2021 – present",
  },
  {
    school: "International School Lahore",
    degree: "A-Levels",
    period: "2019 – 2021",
  },
];

export const toolbox = [
  "TypeScript",
  "React / Next.js",
  "Node.js",
  "Socket.IO",
  "Python",
  "Pandas / NumPy",
  "MongoDB + Vector Search",
  "Gemini API",
  "Tailwind CSS",
  "SQL Server",
  "Docker",
  "Git / Linux",
];
