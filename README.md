# ammar hassan — personal site

My corner of the internet. Quiet, monochrome, and built with probably too much attention to detail.

**Live:** [ammarhassan.dev](https://ammarhassan.dev)

## Stack

- [Next.js 16](https://nextjs.org) (App Router, fully static)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) for animation, [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- [cmdk](https://cmdk.paco.me) for the command menu (`ctrl k`)
- [next-themes](https://github.com/pacocoursey/next-themes) for the theme switch

## Design

Dark by default and monochrome the whole way through — white, black and grey, nothing else. The fonts are Geist and Geist Mono, with a serif italic for the odd emphasized word. There are a couple of easter eggs hidden in there too.

Content lives in [`data/site.ts`](data/site.ts). Pages are in [`app/`](app), components in [`components/`](components).

## Running locally

```bash
npm install
npm run dev
```

No environment variables needed.
