import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import { PartSwitcher } from '@/components/part-switcher/PartSwitcher';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

// Display face is used sparingly (empty states, project titles), so only the
// optical-size axis is loaded to keep the font file small.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
});

/** @type {import('next').Metadata} */
export const metadata = {
  title: {
    default: 'FOMI — Create',
    template: '%s · FOMI',
  },
  description: 'Turn ideas into professional-quality images and video with FOMI.',
};

/** @type {import('next').Viewport} */
export const viewport = {
  themeColor: '#fbfaf6',
  colorScheme: 'light',
  // Lets the phone dock pad itself with env(safe-area-inset-bottom) above the home bar.
  viewportFit: 'cover',
};

/** @param {{ children: React.ReactNode }} props */
export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: the theme script sets data-theme before React hydrates.
    <html lang="en" className={`${jakarta.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {children}
        <PartSwitcher placement="page" />
      </body>
    </html>
  );
}
