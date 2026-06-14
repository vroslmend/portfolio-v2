# ammar hassan — personal site

My corner of the internet. Quiet, monochrome, and built with probably too much attention to detail.

**Live:** [ammarhassan.dev](https://ammarhassan.dev)

## Stack

- [Next.js 16](https://nextjs.org) (App Router, fully static)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) for animation, [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- [cmdk](https://cmdk.paco.me) for the command menu (`⌘k` / `ctrl k`)
- [next-themes](https://github.com/pacocoursey/next-themes) for the theme switch
- [Vercel Analytics](https://vercel.com/analytics) for cookieless traffic numbers

## Design

Dark by default, and monochrome at heart. Greys on near-black in the dark theme, warm off-whites in the light, with no real colour anywhere. The fonts are Geist and Geist Mono, with Newsreader in italic for the odd emphasized word and a Nastaliq face for my name in Urdu. There are a handful of easter eggs hidden in there too.

Scroll past the very bottom and a live visitor and Prius counter slides up. It's served by a small AWS backend that lives in its own repo, [cloud-visitor-counter](https://github.com/vroslmend/cloud-visitor-counter).

Content lives in [`data/site.ts`](data/site.ts). Pages are in [`app/`](app), components in [`components/`](components).

## Running locally

```bash
npm install
npm run dev
```

That runs everything. Two optional variables switch on extra pieces:

- `NEXT_PUBLIC_COUNTER_API_URL` points at the visitor counter backend. Leave it unset and the counter panel just stays hidden.
- `NEXT_PUBLIC_SITE_URL` sets the canonical origin used in metadata. It falls back to the Vercel domain, then localhost.
