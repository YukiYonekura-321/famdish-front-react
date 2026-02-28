import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Famdish",
  description:
    "献立の悩みを解決。AIが家族の好みと冷蔵庫の食材から最適な献立を提案するアプリ",
  icons: {
    icon: "/FamDish_icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
