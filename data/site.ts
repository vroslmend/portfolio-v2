export type Project = {
  slug: string;
  name: string;
  year: string;
  tagline: string;
  description: string;
  evidence?: string[];
  stack: string[];
  links: { live?: string; github?: string };
  image?: string;
  imageLight?: string;
  featured: boolean;
};

export const current = {
  focus: "working across web and ai",
  availability: "open to roles and",
  clientWork: "client work",
} as const;

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
  now: `${current.focus} · ${current.availability} ${current.clientWork}`,
} as const;

export type ClientService = {
  name: string;
  description: string;
  /** Slugs of the projects that show this kind of work. On the work with me
   *  page, hovering the area keeps these lit in the recent work list. */
  work: string[];
};

export const clientServices: ClientService[] = [
  {
    name: "websites",
    description:
      "I build new sites and rebuild old ones that have stopped pulling their weight, and I care about how they look as much as how they're put together.",
    work: ["this-site"],
  },
  {
    name: "web applications",
    description:
      "The kind of app people log into every day, from a small team's internal tool to a full product with accounts, roles and live updates. I build it front to back, database included.",
    work: ["cui-central", "check"],
  },
  {
    name: "AI assistants",
    description:
      "I add AI where it can be trusted: assistants that answer from your own information, agents that stick to a small set of tools, and tests that show when a change makes them worse.",
    work: ["kitty-agent", "replywork", "cui-central"],
  },
  {
    name: "backends and cloud",
    description:
      "I set up backends the way I'd want to inherit one: infrastructure written as code, deploys that run on their own, and no secrets sitting in the repo.",
    work: ["cloud-visitor-counter", "replywork", "kitty-agent"],
  },
  {
    name: "automation",
    description:
      "I connect the tools a business already runs on, so routine work stops getting copied between them by hand, and a person can still step in whenever it matters.",
    work: ["replywork"],
  },
];

/** The projects listed as recent work on the work with me page, in order.
 *  Every slug an area points to must appear here. */
export const clientRecentWork: string[] = [
  "replywork",
  "kitty-agent",
  "cui-central",
  "cloud-visitor-counter",
  "check",
  "this-site",
];

export const projects: Project[] = [
  {
    slug: "cui-central",
    name: "CUI Central",
    year: "2025",
    tagline: "campus operating system",
    description:
      "A platform for my university that brings cafeteria pre-ordering, room booking, faculty availability and a job portal into one place, with separate flows for students, teachers and admins. It also has a Gemini-powered chatbot that answers questions about the campus from a custom knowledge base.",
    evidence: [
      "Separate Next.js frontend and Express/MongoDB backend support student, teacher, company and admin workflows.",
      "The campus assistant combines vector search over a custom knowledge base with function calls into live application data.",
    ],
    stack: ["Next.js 15", "Socket.IO", "Gemini", "MongoDB"],
    links: { live: "https://cui-central.vercel.app" },
    image: "/images/projects/cui-central.webp",
    featured: true,
  },
  {
    slug: "kitty-agent",
    name: "Kitty",
    year: "2026",
    tagline: "on-site portfolio agent",
    description:
      "An on-site agent for this portfolio that answers questions about my work, writing and background. A custom LangGraph tool loop coordinates its tools; FastAPI streams each step, and an evaluation suite checks routing and answer quality. Postgres keeps conversations durable, while bounded retries and a warm-on-load health check keep the public widget responsive.",
    evidence: [
      "The LangGraph loop chooses among bounded tools, can interrupt for clarification, and resumes conversations through Postgres checkpoints.",
      "The evaluation suite measures routing and answer quality separately; bounded retries, a model timeout, and a frontend health warm-up protect against common latency failures.",
      "The widget sends server-validated page context and returns one real project or essay link when it helps.",
    ],
    stack: ["Python", "LangGraph", "FastAPI", "Postgres / pgvector", "SSE"],
    links: { github: "https://github.com/vroslmend/kitty-agent" },
    image: "/images/projects/kitty.webp",
    featured: true,
  },
  {
    slug: "replywork",
    name: "Replywork",
    year: "2026",
    tagline: "the work behind the reply",
    description:
      "A backend for support inboxes like Crisp and Chatwoot that answers product questions from approved records instead of from whatever the model remembers. Incoming messages are verified and queued so nothing gets lost or answered twice, and a person can take over a conversation and hand it back. It's a reference build that runs locally rather than a hosted product.",
    evidence: [
      "The model only extracts a bounded request. Local code writes the reply from stored facts in PostgreSQL, so it can't invent a price, change stock or place an order.",
      "Each webhook is checked against its signature and admitted once, in the same transaction that queues it. A worker with visibility timeouts and audit records works through the queue.",
      "A human takeover pauses automation durably, and only a trusted resume control hands the conversation back.",
    ],
    stack: ["TypeScript", "Fastify", "PostgreSQL", "Drizzle", "Gemini"],
    links: { github: "https://github.com/vroslmend/replywork" },
    featured: true,
  },
  {
    slug: "check",
    name: "Check!",
    year: "2025",
    tagline: "multiplayer card game",
    description:
      "An online multiplayer card game you can play with friends. Its Socket.IO game server handles rooms, turns and reconnects, keeping every player's screen in sync.",
    evidence: [
      "An authoritative XState server validates every action and redacts hidden cards before broadcasting each player's view.",
      "Socket acknowledgements and explicit reconnect states keep two-to-six-player sessions coordinated across disconnects.",
    ],
    stack: ["Next.js", "Node.js", "Socket.IO", "XState"],
    links: {
      live: "https://check-the-game.vercel.app",
      github: "https://github.com/vroslmend/check-the-card-game-v2",
    },
    image: "/images/projects/check.webp",
    featured: true,
  },
  {
    slug: "cloud-visitor-counter",
    name: "Cloud Visitor Counter",
    year: "2026",
    tagline: "serverless, the long way",
    description:
      "The live visitor and Prius counts at the bottom of this site, running as their own small AWS service. A Python Lambda and DynamoDB sit behind an API Gateway, all of it defined in Terraform and deployed by GitHub Actions with no stored keys. It's a tiny backend, but I built the full production setup around it on purpose, as my take on the Cloud Resume Challenge.",
    evidence: [
      "DynamoDB increments both counters with an atomic ADD, so simultaneous visits cannot overwrite one another.",
      "Pull requests test and plan the infrastructure; main deploys through short-lived GitHub OIDC credentials with no stored AWS keys.",
    ],
    stack: ["AWS Lambda", "DynamoDB", "API Gateway", "Terraform", "GitHub Actions"],
    links: { github: "https://github.com/vroslmend/cloud-visitor-counter" },
    featured: true,
  },
  {
    slug: "imaginify",
    name: "Imaginify",
    year: "2024",
    tagline: "ai image platform",
    description:
      "An AI image editing app with generative fill, restore, recolor and background removal, plus a credits system and payments through Stripe. Built with Next.js, Cloudinary and MongoDB.",
    evidence: [
      "Cloudinary runs the image transformations while MongoDB stores a searchable community gallery.",
      "Clerk and Stripe webhooks keep user accounts and purchased credit balances in sync.",
    ],
    stack: ["Next.js", "TypeScript", "Cloudinary AI", "Stripe"],
    links: {
      github: "https://github.com/vroslmend/next-ai-saas-app",
    },
    image: "/images/projects/imaginify.webp",
    featured: false,
  },
  {
    slug: "karting-analysis",
    name: "Karting Analysis",
    year: "2025",
    tagline: "lap-time analysis",
    description:
      "Lap-time analysis for go-karting sessions with my friends. It scrapes leaderboard data from the track's website, then uses Pandas and NumPy to chart fastest laps, distributions and how everyone stacks up.",
    evidence: [
      "Three RaceFacer leaderboard snapshots cover 7,508 rows across two Lahore tracks.",
      "The analysis treats the data as best-time rankings rather than lap-by-lap telemetry and removes obvious 105-second-plus outliers.",
    ],
    stack: ["Python", "Pandas", "NumPy"],
    links: {
      live: "https://karting-dashboard.vercel.app/",
      github: "https://github.com/vroslmend/sportzilla-laptime-analysis",
    },
    image: "/images/projects/karting-analysis.webp",
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
    slug: "chat-flashback",
    name: "Chat Flashback",
    year: "2026",
    tagline: "years of group chat, read back",
    description:
      "Turns a Facebook Messenger export into yearly recaps, charts, and a local reader that lets you scroll the whole chat like a messaging app. Response times, reaction habits, who says what. Everything runs on your machine and nothing gets uploaded.",
    stack: ["Python", "Matplotlib", "VADER"],
    links: { github: "https://github.com/vroslmend/chat-flashback" },
    featured: false,
  },
  {
    slug: "zero2hundred",
    name: "Zero to Hundred",
    year: "2026",
    tagline: "timed 0-100 runs from dash footage",
    description:
      "Mark the launch and 100 km/h frames in dashboard footage and it cuts a finished timed clip with a stopwatch overlay. The frame picker runs in the browser with full-resolution stepping, and the source video is never modified.",
    stack: ["Python"],
    links: { github: "https://github.com/vroslmend/zero2hundred" },
    featured: false,
  },
  {
    slug: "ai-studio-to-markdown",
    name: "AI Studio to Markdown",
    year: "2026",
    tagline: "exports, minus the noise",
    description:
      "A zero-dependency CLI that turns Google AI Studio exports into clean markdown, stripping the config metadata and the huge base64 thought signatures they come packed with.",
    stack: ["Python"],
    links: { github: "https://github.com/vroslmend/ai-studio-to-markdown" },
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
    company: "Corporate Events Company",
    role: "Freelance Web Developer",
    period: "jul – sep 2026",
    description:
      "Designed and built the full marketing site for a corporate events company in Astro, working with the client through research, design exploration and staged reviews.",
  },
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
    period: "2021 – 2026",
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
  "Astro",
  "Node.js",
  "Express / Fastify",
  "Socket.IO",
  "XState",
  "Tailwind CSS",
  "Framer Motion / GSAP",
  "Stripe",
  "Zod",
  "Python",
  "FastAPI",
  "LangGraph",
  "Pandas / NumPy / Matplotlib",
  "MongoDB + Vector Search",
  "Postgres / pgvector",
  "Drizzle",
  "Gemini API",
  "LLM evals",
  "Spotify API",
  "OAuth",
  "SQL",
  "Docker",
  "AWS",
  "Terraform",
  "GitHub Actions",
  "Vercel",
  "Cloudflare",
  "Git / Linux",
];
