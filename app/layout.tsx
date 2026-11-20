import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Midix Gram",
  description: "A modern messenger with chats, gifts and collectibles."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}