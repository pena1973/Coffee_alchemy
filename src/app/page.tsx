import { HomeGenerator } from "@/components/HomeGenerator";
import { SiteNav } from "@/components/SiteNav";
import { currentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await currentUser();

  return (
    <div className="shell">
      <SiteNav />
      <HomeGenerator isRegistered={Boolean(user)} />
    </div>
  );
}
