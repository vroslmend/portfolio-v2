# ammar hassan — personal site

My corner of the internet. Quiet, monochrome, and built with probably too much attention to detail.

**Live:** coming soon

## Stack

- [Next.js 16](https://nextjs.org) (App Router, fully static)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) for animations, [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- [cmdk](https://cmdk.paco.me) for the command menu (`ctrl k`)
- [next-themes](https://github.com/pacocoursey/next-themes) for the dark/light switch

## Design notes

Dark-first and strictly monochrome — hierarchy comes from type scale, weight, and four shades of grey, not color. Geist for text, Geist Mono for labels, a serif italic for the occasional emphasized word. One easing curve everywhere. There's also a hidden thing or two; the console knows more.

All content lives in [`data/site.ts`](data/site.ts). Pages are in [`app/`](app), components in [`components/`](components).

## Running it

```bash
npm install
npm run dev
```

That's it — no env vars needed for local dev.
