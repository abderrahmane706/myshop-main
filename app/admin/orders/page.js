'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import {
  Search, RefreshCw, Phone, MapPin,
  ChevronDown, Filter, ShoppingBag, X,
  MessageSquare, Save, TrendingUp, Package,
  CheckCircle2, XCircle, Clock, Truck
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
  { id: 'all',          label: 'All Orders',    color: 'bg-gray-100 text-gray-700',       dot: 'bg-gray-400' },
  { id: 'new',          label: 'New',           color: 'bg-blue-100 text-blue-700',        dot: 'bg-blue-500' },
  { id: 'pending_call', label: 'Pending Call',  color: 'bg-amber-100 text-amber-700',      dot: 'bg-amber-500' },
  { id: 'confirmed',    label: 'Confirmed',     color: 'bg-cyan-100 text-cyan-700',        dot: 'bg-cyan-500' },
  { id: 'preparing',    label: 'Preparing',     color: 'bg-purple-100 text-purple-700',    dot: 'bg-purple-500' },
  { id: 'shipped',      label: 'Shipped',       color: 'bg-indigo-100 text-indigo-700',    dot: 'bg-indigo-500' },
  { id: 'delivered',    label: 'Delivered',     color: 'bg-emerald-100 text-emerald-700',  dot: 'bg-emerald-500' },
  { id: 'cancelled',    label: 'Cancelled',     color: 'bg-red-100 text-red-700',          dot: 'bg-red-500' },
  { id: 'returned',     label: 'Returned',      color: 'bg-orange-100 text-orange-700',    dot: 'bg-orange-500' },
];

function getStatusCfg(status) {
  return STATUSES.find(s => s.id === status) || STATUSES[0];
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function OrdersContent() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [wilayas, setWilayas] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!hasAdminToken()) { router.replace('/admin'); return; }
    setLoading(true);
    const { ok, data } = await adminApi.getOrders(null);
    if (ok) setOrders(data.orders || []);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Sync note text when an order is expanded
  useEffect(() => {
    if (expandedId) {
      const order = orders.find(o => o.id === expandedId);
      setNoteText(order?.notes || '');
    }
  }, [expandedId, orders]);

  const handleStatusUpdate = async (id, newStatus) => {
    const { ok, data } = await adminApi.updateOrderStatus(id, newStatus);
    if (ok) {
      toast.success('Status updated');
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } else {
      toast.error(data?.error || 'Failed to update');
    }
  };

  const handleSaveNote = async (orderId) => {
    setSavingNote(true);
    const res = await fetch(`/api/admin/orders`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`,
      },
      body: JSON.stringify({ id: orderId, status: orders.find(o => o.id === orderId)?.status, notes: noteText }),
    });
    if (res.ok) {
      toast.success('Note saved');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, notes: noteText } : o));
    } else {
      toast.error('Failed to save note');
    }
    setSavingNote(false);
  };

  // Stats
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30);

  const todayOrders = orders.filter(o => new Date(o.placed_at) >= today).length;
  const weekOrders = orders.filter(o => new Date(o.placed_at) >= weekAgo).length;
  const pendingOrders = orders.filter(o => ['new', 'pending_call', 'confirmed', 'preparing'].includes(o.status)).length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const revenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + Number(o.total), 0);

  // Unique wilayas for filter
  const allWilayas = [...new Set(orders.map(o => o.address?.wilaya).filter(Boolean))].sort();

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (wilayas !== 'all' && o.address?.wilaya !== wilayas) return false;
    if (search) {
      const s = search.toLowerCase();
      const matchesProduct = (o.items || []).some(i => i.name_en?.toLowerCase().includes(s));
      return (
        o.order_number?.toLowerCase().includes(s) ||
        o.customer?.name?.toLowerCase().includes(s) ||
        o.customer?.phone?.includes(s) ||
        o.address?.wilaya?.toLowerCase().includes(s) ||
        matchesProduct
      );
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar pendingCount={pendingOrders} />
      <div className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-500 text-sm mt-1">{filtered.length} order{filtered.length !== 1 ? 's' : ''} shown</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <StatCard icon={ShoppingBag}  label="Today"     value={todayOrders}   color="bg-blue-50 text-blue-600" />
            <StatCard icon={TrendingUp}   label="This Week" value={weekOrders}     color="bg-purple-50 text-purple-600" />
            <StatCard icon={Clock}        label="Active"    value={pendingOrders}  color="bg-amber-50 text-amber-600" />
            <StatCard icon={CheckCircle2} label="Delivered" value={deliveredOrders} color="bg-emerald-50 text-emerald-600" />
            <StatCard icon={Package}      label="Revenue"   value={`${(revenue/1000).toFixed(1)}k DA`} color="bg-rose-50 text-rose-600" />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, phone, order ID, product..."
                className="pl-9"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <Select value={wilayas} onValueChange={setWilayas}>
              <SelectTrigger className="w-full sm:w-44">
                <MapPin className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                <SelectValue placeholder="All Wilayas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wilayas</SelectItem>
                {allWilayas.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
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
                  'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5',
                  statusFilter === s.id
                    ? `${s.color} border-current shadow-sm`
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                )}
              >
                {s.id !== 'all' && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
                {s.label}
                {s.id !== 'all' && orders.filter(o => o.status === s.id).length > 0 && (
                  <span className="opacity-70">{orders.filter(o => o.status === s.id).length}</span>
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
                const statusCfg = getStatusCfg(order.status);
                const isExpanded = expandedId === order.id;
                const isNew = order.status === 'new';

                return (
                  <div
                    key={order.id}
                    className={cn(
                      'bg-white rounded-xl border shadow-sm overflow-hidden transition-all',
                      isNew ? 'border-blue-300' : 'border-gray-100'
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
                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1', statusCfg.color)}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            {statusCfg.label}
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
                        {/* Product preview */}
                        {(order.items || []).length > 0 && (
                          <div className="text-xs text-gray-400 mt-0.5 truncate">
                            📦 {order.items.map(i => `${i.name_en} ×${i.qty}`).join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0 hidden sm:block">
                        <div className="font-bold text-gray-900">{formatMoney(order.total, 'DZD')}</div>
                        <div className="text-xs text-gray-400">
                          {formatMoney(order.subtotal, 'DZD')} + {formatMoney(order.shipping, 'DZD')} ship
                        </div>
                      </div>

                      <ChevronDown className={cn('w-4 h-4 text-gray-400 shrink-0 transition-transform', isExpanded && 'rotate-180')} />
                    </div>

                    {/* Expanded panel */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50 grid sm:grid-cols-2 gap-6">
                        {/* Left: Customer + Address + Notes */}
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
                          {/* Admin notes */}
                          <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5" /> Admin Notes (private)
                            </div>
                            <textarea
                              value={noteText}
                              onChange={e => setNoteText(e.target.value)}
                              placeholder="Called customer, no answer, requested blue color..."
                              rows={3}
                              className="w-full text-sm p-3 rounded-xl border border-gray-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <button
                              onClick={() => handleSaveNote(order.id)}
                              disabled={savingNote}
                              className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition disabled:opacity-50"
                            >
                              <Save className="w-3.5 h-3.5" />
                              {savingNote ? 'Saving...' : 'Save Note'}
                            </button>
                          </div>
                        </div>

                        {/* Right: Products + Pricing + Status */}
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Products</div>
                            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                              {(order.items || []).map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 text-sm">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {(item.image || item.images?.[0]) && <img src={item.image || item.images?.[0]} alt="" className="w-full h-full object-cover" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate">{item.name_en}</div>
                                    <div className="text-gray-400 text-xs">×{item.qty} · {formatMoney(item.price, 'DZD')}/unit</div>
                                  </div>
                                  <div className="text-gray-700 font-medium">{formatMoney(item.price * item.qty, 'DZD')}</div>
                                </div>
                              ))}
                              <div className="px-3 py-2 space-y-1 text-xs text-gray-500">
                                <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(order.subtotal, 'DZD')}</span></div>
                                <div className="flex justify-between"><span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Shipping</span><span>{formatMoney(order.shipping, 'DZD')}</span></div>
                              </div>
                              <div className="flex justify-between items-center p-3 font-bold text-sm bg-gray-50">
                                <span>Total</span>
                                <span className="text-gray-900 text-base">{formatMoney(order.total, 'DZD')}</span>
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
                                  <SelectItem key={s.id} value={s.id}>
                                    <span className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                      {s.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Order timeline */}
                          <div>
                            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Timeline</div>
                            <div className="bg-white rounded-xl border border-gray-100 p-3 text-xs text-gray-500 space-y-1">
                              <div>📅 Placed: {new Date(order.placed_at).toLocaleString()}</div>
                              {order.updated_at && order.updated_at !== order.placed_at && (
                                <div>🔄 Updated: {new Date(order.updated_at).toLocaleString()}</div>
                              )}
                              <div>💳 Payment: Cash on Delivery</div>
                            </div>
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
