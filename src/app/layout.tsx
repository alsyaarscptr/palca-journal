import type { Metadata } from 'next';
import { Outfit, Lora, Caveat } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-hand',
});

export const metadata: Metadata = {
  title: 'My Daily Memory Journal',
  description: 'A beautiful place to store everyday memories.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${lora.variable} ${caveat.variable}`}>
        {children}
      </body>
    </html>
  );
}
