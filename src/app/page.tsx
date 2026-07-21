import Image from "next/image";
import { getFeaturedPhoto } from "@/lib/collections";

// Data is live/mutable in Supabase — never prerender this at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = await getFeaturedPhoto();

  return (
    <div className="home-hero">
      {featured ? (
        <Image
          src={featured.url}
          alt="Alexandra Nikita — featured photograph"
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          preload
        />
      ) : (
        <div className="home-hero-empty" />
      )}
      <div className="home-hero-caption">
        <div className="name">Alexandra Nikita</div>
        <div className="sub">Photography</div>
      </div>
    </div>
  );
}
