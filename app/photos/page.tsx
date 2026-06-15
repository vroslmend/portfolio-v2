import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { PhotoGallery } from "@/components/photos/photo-gallery";
import { photos } from "@/data/photos";

export const metadata: Metadata = {
  title: "photos · ammar hassan",
  description:
    "A quiet wall of photos I've taken and liked, all shot on a Pixel 5.",
};

export default function PhotosPage() {
  return (
    <div className="flex flex-col gap-10 pb-8">
      <section className="flex flex-col gap-5">
        <Reveal mask>
          <h1 className="text-[15px] font-medium text-muted">photos.</h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="max-w-[58ch] text-[15px] leading-[1.8] text-muted text-pretty">
            Shots I&apos;ve taken and liked, all on a Pixel 5. Mostly nature,
            cars, and whatever looked good at the time.
          </p>
        </Reveal>
      </section>

      {/* break out of the layout's max-w-3xl column so the wall has room */}
      <div className="relative left-1/2 w-screen -translate-x-1/2 px-6">
        <div className="mx-auto max-w-5xl">
          <PhotoGallery photos={photos} />
        </div>
      </div>
    </div>
  );
}
