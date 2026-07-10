'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import {
  Search, RefreshCw, Phone, MapPin, Calendar,
  ChevronDown, Filter, ShoppingBag
} from 'lucide-react';
import { adminApi, hasAdminToken } from '@/lib/admin-api';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatMoney } from '@/lib/utils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STATUSES = [
  { id: 'all', label: 'All Orders', color: 'bg-gray-100 text-gray-700' },
  { id: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  { id: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  { id: 'preparing', label: 'Preparing', color: 'bg-purple-100 text-purple-700' },
  { id: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
];

function getStatusConfig(status) {
  return STATUSES.find(s => s.id === status) || STATUSES[0];
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!hasAdminToken()) { router.replace('/admin'); return; }
    setLoading(true);
    const { ok, data } = await adminApi.getOrders(statusFilter !== 'all' ? statusFilter : null);
    if (ok) setOrders(data.orders || []);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (id, newStatus) => {
    const { ok, data } = await adminApi.updateOrderStatus(id, newStatus);
    if (ok) {
      toast.success('Status updated');
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } else {
      toast.error(data?.error || 'Failed to update');
    }
  };

  const filtered = orders.filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(s) ||
      o.customer?.name?.toLowerCase().includes(s) ||
      o.customer?.phone?.includes(s) ||
      o.address?.wilaya?.toLowerCase().includes(s)
    );
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar pendingCount={pendingCount} />
      <div className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-500 text-sm mt-1">{filtered.length} {statusFilter !== 'all' ? statusFilter : 'total'} orders</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, phone, order ID, wilaya..."
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
            {STATUSES.map(s => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={cn(
                  'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                  statusFilter === s.id
                    ? `${s.color} border-current shadow-sm`
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                )}
              >
                {s.label}
                {s.id !== 'all' && orders.filter(o => o.status === s.id).length > 0 && (
                  <span className="ml-1.5 opacity-70">
                    {orders.filter(o => o.status === s.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Orders list */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-28 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
              <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-500">No orders found</h3>
              <p className="text-sm text-gray-400 mt-1">
                {search ? 'Try adjusting your search.' : 'Waiting for new leads.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(order => {
                const statusCfg = getStatusConfig(order.status);
                const isExpanded = expandedId === order.id;
                const isNew = order.status === 'pending';

                return (
                  <div
                    key={order.id}
                    className={cn(
                      'bg-white rounded-xl border shadow-sm overflow-hidden transition-all',
                      isNew ? 'border-amber-300' : 'border-gray-100'
                    )}
                  >
                    {/* Order header */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-bold text-sm text-gray-900">{order.order_number}</span>
                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide', statusCfg.color)}>
                            {order.status}
                            {isNew && ' 🔔'}
                          </span>
                          <span className="text-xs text-gray-400 hidden sm:inline">
                            {new Date(order.placed_at).toLocaleDateString()} {new Date(order.placed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-medium text-gray-700">{order.customer?.name}</span>
                          <a href={`tel:${order.customer?.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                            <Phone className="w-3 h-3" /> {order.customer?.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {order.address?.wilaya}{order.address?.municipality ? `, ${order.address.municipality}` : ''}
                        </div>
                      </div>

                      <div className="text-right shrink-0 hidden sm:block">
                        <div className="font-bold text-gray-900">{formatMoney(order.total, 'DZD')}</div>
                        <div className="text-xs text-gray-400">{(order.items || []).length} item{order.items?.length !== 1 ? 's' : ''}</div>
                      </div>

                      <ChevronDown className={cn('w-4 h-4 text-gray-400 shrink-0 transition-transform', isExpanded && 'rotate-180')} />
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50 grid sm:grid-cols-2 gap-6">
                        {/* Left: Customer & Address */}
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Customer</div>
                            <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-2 text-sm">
                              <div className="font-medium text-gray-900">{order.customer?.name}</div>
                              <a href={`tel:${order.customer?.phone}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                                <Phone className="w-4 h-4" /> {order.customer?.phone}
                              </a>
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Delivery Address</div>
                            <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-1 text-sm">
                              <div className="font-medium">{order.address?.wilaya}</div>
                              {order.address?.municipality && <div className="text-gray-500">{order.address.municipality}</div>}
                              <div className="text-gray-600">{order.address?.address}</div>
                            </div>
                          </div>
                          {order.notes && (
                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-sm text-yellow-800">
                              <span className="font-semibold">Notes: </span>{order.notes}
                            </div>
                          )}
                        </div>

                        {/* Right: Products + Status */}
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Products</div>
                            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                              {(order.items || []).map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 text-sm">
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {item.images?.[0] && <img src={item.images[0]} alt="" className="w-full h-full object-cover" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{item.name_en}</div>
                                    <div className="text-gray-400">×{item.qty}</div>
                                  </div>
                                  <div className="text-gray-700 font-medium">{formatMoney(item.price * item.qty, 'DZD')}</div>
                                </div>
                              ))}
                              <div className="flex justify-between items-center p-3 font-bold text-sm">
                                <span>Total</span>
                                <span className="text-gray-900">{formatMoney(order.total, 'DZD')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Changer */}
                          <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Update Status</div>
                            <Select value={order.status} onValueChange={val => handleStatusUpdate(order.id, val)}>
                              <SelectTrigger className={cn('font-semibold', statusCfg.color)}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUSES.filter(s => s.id !== 'all').map(s => (
                                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
