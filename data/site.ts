export type Project = {
  slug: string;
  name: string;
  year: string;
  tagline: string;
  description: string;
  stack: string[];
  links: { live?: string; github?: string };
  image?: string;
  imageLight?: string;
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
  now: "final year, going deep on python and ai engineering, open to work",
} as const;

export const projects: Project[] = [
  {
    slug: "cui-central",
    name: "CUI Central",
    year: "2025",
    tagline: "campus operating system",
    description:
      "A platform for my university that brings cafeteria pre-ordering, room booking, faculty availability and a job portal into one place, with separate flows for students, teachers and admins. It also has a Gemini-powered chatbot that answers questions about the campus from a custom knowledge base.",
    stack: ["Next.js 15", "Socket.IO", "Gemini", "MongoDB"],
    links: { live: "https://cui-central.vercel.app" },
    image: "/images/projects/cui-central.webp",
    featured: true,
  },
  {
    slug: "check",
    name: "Check!",
    year: "2025",
    tagline: "multiplayer card game",
    description:
      "An online multiplayer card game you can actually play with friends. I wrote the game server myself with Socket.IO, handling rooms, turns and reconnects, and learned a lot about keeping several players' screens in sync.",
    stack: ["Next.js", "Node.js", "Socket.IO"],
    links: {
      live: "https://check-the-game.vercel.app",
      github: "https://github.com/vroslmend/check-the-card-game-v2",
    },
    image: "/images/projects/check.webp",
    featured: true,
  },
  {
    slug: "imaginify",
    name: "Imaginify",
    year: "2024",
    tagline: "ai image platform",
    description:
      "An AI image editing app with generative fill, restore, recolor and background removal, plus a credits system and payments through Stripe. Built with Next.js, Cloudinary and MongoDB.",
    stack: ["Next.js", "TypeScript", "Cloudinary AI", "Stripe"],
    links: {
      github: "https://github.com/vroslmend/next-ai-saas-app",
    },
    image: "/images/projects/imaginify.webp",
    featured: true,
  },
  {
    slug: "karting-analysis",
    name: "Karting Analysis",
    year: "2025",
    tagline: "lap-time analysis",
    description:
      "Lap-time analysis for go-karting sessions with my friends. It scrapes our results from the track's website, then uses Pandas and NumPy to chart fastest laps, consistency and how everyone stacks up.",
    stack: ["Python", "Pandas", "NumPy"],
    links: {
      live: "https://karting-dashboard.vercel.app/",
      github: "https://github.com/vroslmend/sportzilla-laptime-analysis",
    },
    image: "/images/projects/karting-analysis.webp",
    featured: true,
  },
  {
    slug: "cloud-visitor-counter",
    name: "Cloud Visitor Counter",
    year: "2026",
    tagline: "serverless, the long way",
    description:
      "The live visitor and Prius counts at the bottom of this site, running as their own small AWS service. A Python Lambda and DynamoDB sit behind an API Gateway, all of it defined in Terraform and deployed by GitHub Actions with no stored keys. It's a tiny backend, but I built the full production setup around it on purpose, as my take on the Cloud Resume Challenge.",
    stack: ["AWS Lambda", "DynamoDB", "API Gateway", "Terraform", "GitHub Actions"],
    links: { github: "https://github.com/vroslmend/cloud-visitor-counter" },
    featured: true,
  },
  {
    slug: "course-scheduler",
    name: "Course Scheduler",
    year: "2025",
    tagline: "clash-free timetable optimizer",
    description:
      "A Python tool that reads university timetable PDFs and finds clash-free course combinations. Built it because making my own schedule by hand every semester was miserable.",
    stack: ["Python"],
    links: { github: "https://github.com/vroslmend/course-scheduler" },
    featured: false,
  },
  {
    slug: "docs-crawler",
    name: "Docs Crawler",
    year: "2025",
    tagline: "documentation to markdown",
    description:
      "A Python crawler that walks a library's documentation site and turns every page into clean markdown. Built it to feed current docs to AI assistants and read them offline.",
    stack: ["Python", "Crawl4AI", "asyncio"],
    links: {
      github: "https://github.com/vroslmend/crawl4ai-documentation-crawler",
    },
    featured: false,
  },
  {
    slug: "lead-tracker",
    name: "Lead Tracker",
    year: "2023",
    tagline: "chrome extension",
    description:
      "A small Chrome extension for saving links from the current tab. One of the first things I ever built.",
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
      "This website. Built with Next.js, Tailwind and Motion, and kept deliberately quiet.",
    stack: ["Next.js 16", "Tailwind v4", "Motion"],
    links: { github: "https://github.com/vroslmend/portfolio-v2" },
    image: "/images/projects/this-site.webp",
    imageLight: "/images/projects/this-site-light.webp",
    featured: false,
  },
];

export const experience = [
  {
    company: "Punjab Safe Cities Authority",
    role: "Web Development Intern",
    period: "jun – aug 2024",
    description:
      "Worked on citizen-facing government web portals and got an inside look at how Punjab's automated e-challan system works, from the traffic cameras through to the dashboards.",
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
  "Express",
  "Socket.IO",
  "XState",
  "Tailwind CSS",
  "Framer Motion / GSAP",
  "Stripe",
  "Zod",
  "Python",
  "Pandas / NumPy / Matplotlib",
  "MongoDB + Vector Search",
  "Gemini API",
  "Spotify API",
  "OAuth",
  "SQL",
  "Docker",
  "AWS",
  "Terraform",
  "GitHub Actions",
  "Vercel",
  "Git / Linux",
];
