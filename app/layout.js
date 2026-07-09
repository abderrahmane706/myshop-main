import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { MobileTabBar } from '@/components/MobileTabBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata = {
  title: 'Dar el Ghourabaa Market — Luxury Perfumes, Watches & Accessories',
  description: 'Curated perfumes, precision watches and premium accessories. Modern luxury, accessible to all. Shipped worldwide.',
  keywords: 'perfume, luxury, watches, accessories, gift sets, dar el ghourabaa',
  openGraph: {
    title: 'Dar el Ghourabaa Market',
    description: 'Modern luxury, accessible to all.',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1544006593-1a0b9255782d?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200',
        width: 1200,
        height: 630,
        alt: 'Dar el Ghourabaa Market — Luxury Perfumes and Watches',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dar el Ghourabaa Market',
    description: 'Modern luxury, accessible to all.',
  },
};

export const viewport = { themeColor: '#0B3C91' };

function App({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className={inter.variable}>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="font-sans bg-brand-bg text-brand-text antialiased min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1 pb-24 md:pb-0">{children}</main>
          <Footer />
          <CartDrawer />
          <MobileTabBar />
        </Providers>
      </body>
    </html>
  );
}

export default App;
