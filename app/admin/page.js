'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Package, AlertTriangle,
  TrendingUp, Clock, RefreshCw, ArrowRight, Eye
} from 'lucide-react';
import { adminApi, setAdminToken, hasAdminToken } from '@/lib/admin-api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatMoney } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { ok, data } = await adminApi.login(password);
    if (ok && data?.token) {
      setAdminToken(data.token);
      onLogin();
    } else {
      toast.error('Invalid password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-1 text-sm">Dar el Ghourabaa Market CMS</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Admin Password</label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 h-12"
                autoFocus
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Verifying...</span>
              ) : 'Login to Dashboard'}
            </Button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-6">
            Secure admin-only access. Not for public use.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, href }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
          {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

// ── Dashboard Screen ──────────────────────────────────────────────────────────
function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const { ok, data } = await adminApi.getStats();
    if (ok) setStats(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar pendingCount={stats?.pendingOrders || 0} />

      {/* Main content */}
      <div className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchStats} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-28 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  label="Total Revenue"
                  value={formatMoney(stats?.totalRevenue || 0, 'DZD')}
                  sub="All confirmed orders"
                  icon={TrendingUp}
                  color="bg-emerald-100 text-emerald-600"
                />
                <StatCard
                  label="Orders Today"
                  value={stats?.ordersToday || 0}
                  sub={`${stats?.pendingOrders || 0} pending confirmation`}
                  icon={ShoppingBag}
                  color="bg-blue-100 text-blue-600"
                  href="/admin/orders"
                />
                <StatCard
                  label="Total Products"
                  value={stats?.totalProducts || 0}
                  sub={`${stats?.publishedProducts || 0} published`}
                  icon={Package}
                  color="bg-purple-100 text-purple-600"
                  href="/admin/products"
                />
                <StatCard
                  label="Low Stock"
                  value={stats?.lowStockProducts || 0}
                  sub="Products with ≤5 units"
                  icon={AlertTriangle}
                  color="bg-amber-100 text-amber-600"
                  href="/admin/products"
                />
              </div>

              {/* Pending Alert */}
              {stats?.pendingOrders > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-amber-800">
                        {stats.pendingOrders} order{stats.pendingOrders !== 1 ? 's' : ''} awaiting confirmation
                      </div>
                      <div className="text-xs text-amber-600">Call customers to confirm their orders</div>
                    </div>
                  </div>
                  <Link href="/admin/orders?status=pending">
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </motion.div>
              )}

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                  <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {!stats?.recentOrders?.length ? (
                  <div className="py-12 text-center text-gray-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {stats.recentOrders.map(order => (
                      <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-gray-900">{order.order_number}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-0.5">{order.customer?.name} · {order.customer?.phone}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-semibold text-gray-900">{formatMoney(order.total, 'DZD')}</div>
                          <div className="text-xs text-gray-400">{new Date(order.placed_at).toLocaleDateString()}</div>
                        </div>
                        <Link href="/admin/orders">
                          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(null); // null = loading

  useEffect(() => {
    setAuthed(hasAdminToken());
  }, []);

  const handleLogin = () => setAuthed(true);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-white/40 animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {authed ? (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <DashboardScreen />
        </motion.div>
      ) : (
        <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <LoginScreen onLogin={handleLogin} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
