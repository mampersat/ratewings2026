"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const cookieStore = await cookies();
  if (!cookieStore.get("rw_admin")?.value) redirect("/admin");
}

export async function loginAction(
  _prev: string | null,
  formData: FormData
): Promise<string | null> {
  const password = formData.get("password") as string;
  if (password === (process.env.ADMIN_PASSWORD ?? "admin")) {
    const cookieStore = await cookies();
    cookieStore.set("rw_admin", "1", { httpOnly: true, path: "/", sameSite: "lax" });
    redirect("/admin/spots");
  }
  return "Invalid password";
}

export async function updateSpotAction(id: string, formData: FormData) {
  await requireAdmin();
  await prisma.spot.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      address: (formData.get("address") as string) ?? "",
      city: (formData.get("city") as string) ?? "",
      state: (formData.get("state") as string) ?? "",
      lat: formData.get("lat") ? parseFloat(formData.get("lat") as string) : null,
      lng: formData.get("lng") ? parseFloat(formData.get("lng") as string) : null,
    },
  });
  redirect("/admin/spots");
}

export async function deleteSpotAction(id: string) {
  await requireAdmin();
  await prisma.spot.delete({ where: { id } });
  redirect("/admin/spots");
}

export async function updateRatingAction(id: string, spotId: string, formData: FormData) {
  await requireAdmin();
  await prisma.rating.update({
    where: { id },
    data: {
      overall: parseInt(formData.get("overall") as string),
      sauce:   parseInt(formData.get("sauce") as string),
      crispy:  parseInt(formData.get("crispy") as string),
      value:   parseInt(formData.get("value") as string),
      notes:   (formData.get("notes") as string) || null,
    },
  });
  redirect(`/admin/spots/${spotId}`);
}

export async function deleteRatingAction(id: string, spotId: string) {
  await requireAdmin();
  await prisma.rating.delete({ where: { id } });
  redirect(`/admin/spots/${spotId}`);
}

export async function mergeSpotsAction(primaryId: string, secondaryId: string) {
  await requireAdmin();

  // Get all ratings on the secondary spot
  const secondaryRatings = await prisma.rating.findMany({
    where: { spotId: secondaryId },
  });

  for (const rating of secondaryRatings) {
    await prisma.rating.update({
      where: { id: rating.id },
      data: { spotId: primaryId },
    });
  }

  await prisma.spot.delete({ where: { id: secondaryId } });
  redirect(`/admin/spots/${primaryId}`);
}
