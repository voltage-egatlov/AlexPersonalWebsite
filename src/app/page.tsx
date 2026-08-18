import Image from "next/image";
import { getFeaturedPhoto } from "@/lib/photos";
import { pickCaptionPlacement } from "@/lib/caption-placement";

// Data is live/mutable in Supabase - never prerender this at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = await getFeaturedPhoto();
  // Pick the caption's corner per-photo so it doesn't land on top of
  // something the same color as the caption text (see caption-placement.ts).
  // Desktop and mobile get their own picks - object-fit: cover crops the
  // same photo very differently on a narrow phone vs. a wide window.
  const placement = featured
    ? await pickCaptionPlacement(featured)
    : { desktop: "bottom-left" as const, mobile: "bottom-left" as const };

  return (
    <div className="home-hero">
      {featured ? (
        <Image
          src={featured.url}
          alt="Alexandra Nikita - featured photograph"
          fill
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: `${featured.focalX}% ${featured.focalY}%`,
          }}
          preload
        />
      ) : (
        <div className="home-hero-empty" />
      )}
      <div
        className={`home-hero-caption home-hero-caption--${placement.desktop}`}
        data-mobile-corner={placement.mobile}
      >
        <h1 className="name">Alexandra Nikita</h1>
        <p className="sub">Photography</p>
      </div>
    </div>
  );
}
