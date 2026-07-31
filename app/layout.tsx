import type { Metadata } from "next";
import "./globals.css";

const title = "ORIGIN — The Cycle of Becoming";
const description =
  "A scroll-driven cinematic cycle: a point becomes energy, life and cosmos, then returns.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: [{ url: "favicon.svg", type: "image/svg+xml" }],
    shortcut: "favicon.svg",
    apple: "favicon.svg",
  },
  openGraph: {
    title,
    description,
    type: "website",
    images: [
      {
        url: "og.png",
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
    images: ["og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
