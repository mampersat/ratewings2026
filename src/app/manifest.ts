import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RateWings",
    short_name: "RateWings",
    description: "Discover, review, and rank the best chicken wing spots.",
    start_url: "/",
    display: "standalone",
    background_color: "#111827",
    theme_color: "#f97316",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
