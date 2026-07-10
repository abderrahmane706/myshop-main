'use client';
import { useState, useEffect } from 'react';
import { formatMoney } from '@/lib/utils';
import { Package, Search, Phone, Calendar, RefreshCw, LogOut, Bell, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const STATUSES = [
  { id: 'pending', label: 'Pending Confirmation', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'preparing', label: 'Preparing', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200' },
];

export default function AdminDashboard() {
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Check auth on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch orders when token exists
  useEffect(() => {
    if (token) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Polling for new orders
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(fetchOrders, 30000); // Check every 30s
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.ok) {
        setToken(data.token);
        sessionStorage.setItem('admin_token', data.token);
      } else {
        toast.error(data.error || 'Invalid password');
      }
    } catch (err) {
      toast.error('Connection error');
    }
    setAuthLoading(false);
  };

  const logout = () => {
    sessionStorage.removeItem('admin_token');
    setToken(null);
    setOrders([]);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Order status updated');
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-black/5 p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-500 mb-8">Enter your secure key to view store leads.</p>
          <form onSubmit={login} className="space-y-4">
            <Input 
              type="password" 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="Admin Password"
              className="h-12"
              autoFocus
            />
            <Button type="submit" disabled={authLoading} className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white">
              {authLoading ? 'Verifying...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => {
    const s = search.toLowerCase();
    const matchSearch = 
      o.order_number?.toLowerCase().includes(s) || 
      o.customer?.name?.toLowerCase().includes(s) || 
      o.customer?.phone?.includes(s);
    
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">DG</span>
            </div>
            <h1 className="font-bold text-gray-900 text-lg hidden sm:block">Dar el Ghourabaa Leads</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-medium animate-pulse">
                <Bell className="w-4 h-4" />
                <span>{pendingCount} New</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-gray-900 gap-2">
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              value={search} 
              onChange={e=>setSearch(e.target.value)} 
              placeholder="Search by name, phone, or order ID..." 
              className="pl-9 h-10 w-full"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                {STATUSES.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mb-4" />
            <p>Loading leads...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
            <p className="text-gray-500">
              {search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Waiting for new leads to arrive.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map(order => (
              <OrderCard key={order.id} order={order} onStatusChange={updateStatus} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function OrderCard({ order, onStatusChange }) {
  const currentStatus = STATUSES.find(s => s.id === order.status) || STATUSES[0];
  const date = new Date(order.placed_at);
  const isNew = order.status === 'pending';

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all ${isNew ? 'border-amber-300 shadow-amber-100' : 'border-gray-200'}`}>
      <div className="p-5 flex flex-col md:flex-row gap-6">
        
        {/* Left: Customer & Meta */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-gray-900">{order.order_number}</span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> 
              {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
            {isNew && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">New Lead</span>}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 grid sm:grid-cols-2 gap-4 border border-gray-100">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Customer</div>
              <div className="font-medium text-gray-900">{order.customer?.name}</div>
              <a href={`tel:${order.customer?.phone}`} className="inline-flex items-center gap-1.5 text-blue-600 hover:underline mt-1">
                <Phone className="w-3.5 h-3.5" /> {order.customer?.phone}
              </a>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Delivery</div>
              <div className="font-medium text-gray-900 line-clamp-1">{order.address?.wilaya}</div>
              <div className="text-sm text-gray-600 mt-1 line-clamp-2" title={order.address?.address}>
                {order.address?.municipality && `${order.address.municipality}, `}{order.address?.address}
              </div>
            </div>
          </div>
          
          {order.notes && (
            <div className="bg-yellow-50 text-yellow-800 text-sm p-3 rounded-lg border border-yellow-100">
              <span className="font-semibold mr-1">Notes:</span> {order.notes}
            </div>
          )}
        </div>

        {/* Right: Products & Actions */}
        <div className="md:w-72 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Products</div>
            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
              {order.items?.map((item, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <div className="w-5 font-medium text-gray-500">{item.qty}x</div>
                  <div className="flex-1 font-medium text-gray-900 truncate">{item.name_en}</div>
                  <div className="text-gray-500">{formatMoney(item.price * item.qty, 'DZD')}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total</span>
              <span className="text-lg font-black text-gray-900">{formatMoney(order.total, 'DZD')}</span>
            </div>
            
            <Select value={order.status} onValueChange={(val) => onStatusChange(order.id, val)}>
              <SelectTrigger className={`h-9 w-full ${currentStatus.color} font-medium`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="font-medium">{s.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>
    </div>
  );
}
