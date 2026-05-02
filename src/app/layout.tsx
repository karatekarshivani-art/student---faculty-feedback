import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Faculty Feedback & Analytics",
  description: "Anonymous AI-Driven Faculty Feedback & Analytics System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="theme-toggle">
          <button onClick={() => {
            document.documentElement.classList.toggle('dark-mode');
          }} title="Toggle Dark Mode">
            🌓
          </button>
        </div>
        <main className="main-container">
          {children}
        </main>
      </body>
    </html>
  );
}
