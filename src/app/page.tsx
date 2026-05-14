import { HomeGenerator } from "@/components/HomeGenerator";
import { SiteNav } from "@/components/SiteNav";

export default function HomePage() {
  return (
    <div className="shell">
      <SiteNav />
      <HomeGenerator />
    </div>
  );
}
