/** @type {import('next').NextConfig} */
const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();
const onVercel = Boolean(process.env.VERCEL);

if (onVercel && (!apiUrl || /localhost|127\.0\.0\.1/i.test(apiUrl))) {
  console.warn(
    "[next.config] NEXT_PUBLIC_API_URL is missing or still localhost. " +
      "The app will call same-origin /api. After generating a Railway public domain on chic-presence, " +
      "set NEXT_PUBLIC_API_URL=https://<railway-host>/api (or API_PROXY_TARGET=https://<railway-host>)."
  );
}

const nextConfig = {};

export default nextConfig;
