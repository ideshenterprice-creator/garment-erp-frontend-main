/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

if (process.env.VERCEL_ENV === "production") {
  if (!apiUrl || /localhost|127\.0\.0\.1/i.test(apiUrl)) {
    throw new Error(
      "Vercel production builds require NEXT_PUBLIC_API_URL to be the deployed backend (not localhost)."
    );
  }
}

const nextConfig = {};

export default nextConfig;
