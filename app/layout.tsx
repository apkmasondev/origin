import type { Metadata } from "next";
import "./globals.css";

const title = "ORIGIN — The Cycle of Becoming";
const description =
  "A scroll-driven cinematic cycle: a point becomes energy, life and cosmos, then returns.";

export const metadata: Metadata = {
  title,
  description,
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
      <head>
        <link rel="icon" href="favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="favicon.svg" />
        <link rel="apple-touch-icon" href="favicon.svg" />
      </head>
      <body>{children}</body>
    </html>
  );
}
