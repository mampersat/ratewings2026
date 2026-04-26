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
};

export default nextConfig;
