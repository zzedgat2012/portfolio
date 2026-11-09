import type { Metadata } from 'next';
import { Fira_Code, Open_Sans } from 'next/font/google';
import type { ReactNode } from 'react';
import { getSiteSettings } from '@/features/settings';
import './globals.css';

const firaCode = Fira_Code({ subsets: ['latin'], variable: '--font-fira-code', display: 'swap' });
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(settings.siteUrl),
    title: { default: settings.siteName, template: `%s | ${settings.siteName}` },
    description: settings.description,
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // `data-scroll-behavior="smooth"`: Next turns the CSS smooth scrolling off during route changes,
    // so a new page opens at the top instantly while in-page anchors still scroll smoothly.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${firaCode.variable} ${openSans.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
