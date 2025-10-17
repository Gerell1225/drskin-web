import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "DrSkin & DrHair Salon",
  description: "Premium skin & hair care salon in Ulaanbaatar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
