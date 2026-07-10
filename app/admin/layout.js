export const metadata = {
  title: { default: 'Admin CMS | Dar el Ghourabaa', template: '%s | Admin' },
  description: 'Dar el Ghourabaa Market Admin Panel',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return children;
}
