"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export async function updateNameAction(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("rw_uid")?.value;
  if (!userId) redirect("/profile");

  const name = (formData.get("name") as string)?.trim();
  if (!name) redirect("/profile");

  await prisma.user.upsert({
    where: { id: userId },
    update: { name },
    create: { id: userId, name, email: `${userId}@anon.ratewings` },
  });
  redirect("/profile");
}
