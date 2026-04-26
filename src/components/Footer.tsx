import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export default async function Footer() {
  const sha = process.env.NEXT_PUBLIC_COMMIT_SHA ?? "dev";

  const cookieStore = await cookies();
  const userId = cookieStore.get("rw_uid")?.value;

  let displayName = "Anonymous User";
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    if (user && user.name && user.name !== "Anonymous") {
      displayName = user.name;
    }
  }

  return (
    <footer className="border-t border-gray-700 mt-8 py-4 text-center text-xs text-gray-500">
      <Link href="/profile" className="hover:text-gray-300 transition-colors">
        {displayName}
      </Link>
      <span className="mx-2">·</span>
      RateWings
      <span className="mx-2">·</span>
      <span className="font-mono">{sha}</span>
    </footer>
  );
}
