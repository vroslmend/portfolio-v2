<p align="center">
  <img src="app/icon.svg" width="96" alt="Ammar Hassan's ah. mark">
</p>

<h1 align="center">ammarhassan.dev</h1>

<div align="center">
  <p>My corner of the internet.<br>A quiet, monochrome home for projects, writing, photography, and a small resident cat.</p>

  <p><a href="https://ammarhassan.dev">Visit the site</a></p>

  <p><a href="https://github.com/vroslmend/portfolio-v2/actions/workflows/ci.yml"><img src="https://github.com/vroslmend/portfolio-v2/actions/workflows/ci.yml/badge.svg" alt="CI"></a></p>
</div>

## Stack

- [Next.js 16](https://nextjs.org) (App Router, static but for one route that reads my Spotify)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) for animation, [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- [cmdk](https://cmdk.paco.me) for the command menu (`⌘k` / `ctrl k`)
- [react-photo-album](https://react-photo-album.com) for the photo wall
- [next-themes](https://github.com/pacocoursey/next-themes) for the theme switch
- [Vercel Analytics](https://vercel.com/analytics) for cookieless traffic numbers

## Design

Dark by default, and monochrome at heart. Greys on near-black in the dark theme, warm off-whites in the light, with no real colour anywhere. The fonts are Geist and Geist Mono, with Newsreader in italic for the odd emphasized word and a Nastaliq face for my name in Urdu. There are a handful of easter eggs hidden in there too.

There's a photos page as well, a wall of shots I've taken on a Pixel 5 that open fullscreen with a quiet morph and show how each one was taken.

A small cat hides behind the footer hairline and opens a conversation with kitty, an on-site agent that answers questions about my projects and writing. Its LangGraph backend lives in [kitty-agent](https://github.com/vroslmend/kitty-agent).

Beside it, a little equalizer shows whatever I'm playing on Spotify at the time, and stays quiet when I'm not. Scroll past the very bottom and a live visitor and Prius counter slides up. It's served by a small AWS backend that lives in its own repo, [cloud-visitor-counter](https://github.com/vroslmend/cloud-visitor-counter).

Content lives in [`data/site.ts`](data/site.ts). Pages are in [`app/`](app), components in [`components/`](components).

## Running locally

```bash
npm install
npm run dev
```

That runs everything. A few optional variables switch on extra pieces:

- `NEXT_PUBLIC_KITTY_API_URL` points at the kitty backend. Leave it unset and kitty stays hidden.
- `NEXT_PUBLIC_COUNTER_API_URL` points at the visitor counter backend. Leave it unset and the counter panel just stays hidden.
- `NEXT_PUBLIC_SITE_URL` sets the canonical origin used in metadata. It falls back to the Vercel domain, then localhost.
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` and `SPOTIFY_REFRESH_TOKEN` power the now-playing widget. Leave them unset and the footer just stays quiet.

## Credits

“Cat” icons by [inmyheart](https://thenounproject.com/icon/match/cat-8273692/), from [Noun Project](https://thenounproject.com/browse/icons/term/cat/) (CC BY 3.0).
