import Image from "next/image";

export default function Home() {
  return (
    <div className="home-hero">
      <Image
        src="/placeholders/placeholder-01.jpg"
        alt="Alexandra Nikita — featured photograph"
        fill
        sizes="100vw"
        style={{ objectFit: "cover" }}
        preload
      />
      <div className="home-hero-caption">
        <div className="name">Alexandra Nikita</div>
        <div className="sub">Photography</div>
      </div>
    </div>
  );
}
