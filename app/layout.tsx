import "./theme.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { MiniKitInitializer } from "./components/MiniKitInitializer";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "react-hot-toast";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: "Zory - Capture Moments, Create Coins",
    description:
      "A Zory is a story on Zora. Create yours now and share it with your friends.",
    icons: {
      icon: [
        {
          url: process.env.NEXT_PUBLIC_APP_ICON || "/zory.png",
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: process.env.NEXT_PUBLIC_APP_ICON || "/zory.png",
          sizes: "16x16",
          type: "image/png",
        },
      ],
      apple: [
        {
          url: process.env.NEXT_PUBLIC_APP_ICON || "/zory.png",
          sizes: "180x180",
          type: "image/png",
        },
      ],
      shortcut: process.env.NEXT_PUBLIC_APP_ICON || "/zory.png",
    },
    openGraph: {
      title:
        process.env.NEXT_PUBLIC_APP_OG_TITLE ||
        "Zory - Capture Moments, Create Coins",
      description:
        process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION ||
        "A Zory is a story on Zora. Create yours now and share it with your friends.",
      url: URL,
      siteName: "Zory",
      images: [
        {
          url: process.env.NEXT_PUBLIC_APP_OG_IMAGE || "/zory.png",
          width: 1200,
          height: 630,
          alt: "Zory - Capture Moments, Create Coins",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title:
        process.env.NEXT_PUBLIC_APP_OG_TITLE ||
        "Zory - Capture Moments, Create Coins",
      description:
        process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION ||
        "A Zory is a story on Zora. Create yours now and share it with your friends.",
      images: [process.env.NEXT_PUBLIC_APP_OG_IMAGE || "/zory.png"],
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE || "/zory.png",
        button: {
          title: "Launch Zory",
          action: {
            type: "launch_frame",
            name: "Zory",
            url: URL,
            splashImageUrl:
              process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || "/zory.png",
            splashBackgroundColor:
              process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#000000",
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black">
        <Providers>
          <Analytics />
          <MiniKitInitializer />
          <Header />
          {children}
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
