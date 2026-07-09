export const metadata = {
  title: 'Admin Dashboard | Dar el Ghourabaa Market',
  description: 'Manage store orders and leads.',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans" dir="ltr">
      {children}
    </div>
  );
}
