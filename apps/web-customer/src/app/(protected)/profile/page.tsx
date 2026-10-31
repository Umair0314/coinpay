import { getCurrentUser } from "@/lib/data";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  return <main className="container-page py-8"><h1 className="text-3xl font-bold">Profile</h1><div className="card mt-6 space-y-4"><div><p className="text-sm text-muted">Email</p><p className="font-semibold">{user?.email}</p></div><div><p className="text-sm text-muted">Name</p><p className="font-semibold">{user?.user_metadata?.full_name || "Not set"}</p></div><Link className="button-outline w-full" href="/account/delete">Delete my account</Link><form action="/api/auth/logout" method="post"><button className="button-outline w-full" type="submit">Log out</button></form></div></main>;
}
