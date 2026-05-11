import { execSync } from "child_process";
import type { NextConfig } from "next";

let commitSha = "dev";
try {
  commitSha = execSync("git rev-parse --short HEAD").toString().trim();
} catch {}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_COMMIT_SHA: commitSha,
  },
  async redirects() {
    return [
      {
        source: "/grafana",
        destination:
          "https://matthewsheppard.grafana.net/public-dashboards/96bdb431bfd545e884b9e336d6609236",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
