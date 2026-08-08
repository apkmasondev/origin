import type { Metadata } from "next";
import "./globals.css";

const title = "ORIGIN — The Cycle of Becoming";
const description =
  "A scroll-driven cinematic cycle: a point becomes energy, life and cosmos, then returns.";

// Social crawlers ignore relative og:image / twitter:image values, so the URL is
// made absolute from NEXT_PUBLIC_SITE_URL when it is configured. Without it the
// build stays on the relative path, which keeps the page itself sub-path safe.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
const ogImage = siteUrl ? `${siteUrl}/og.png` : "og.png";

export const metadata: Metadata = {
  title,
  description,
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  openGraph: {
    title,
    description,
    type: "website",
    ...(siteUrl ? { url: siteUrl } : {}),
    images: [
      {
        url: ogImage,
        width: 1672,
        height: 939,
        alt: "ORIGIN — luminous hummingbird framed by the words From a Point to Life",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="favicon.svg" />
        <link rel="apple-touch-icon" href="favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
