import "./globals.css";

export const metadata = {
  title: "DrSkin & DrHair — Premium care",
  description: "Online booking for DrSkin & DrHair in Ulaanbaatar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}
