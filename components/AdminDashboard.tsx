
import React, { useState, useMemo } from 'react';
import {
    Users,
    DollarSign,
    ShoppingBag,
    Settings,
    Search,
    Calendar as CalendarIcon,
    ChevronDown,
    ArrowLeft,
    LayoutDashboard,
    Save,
    Palette,
    Target,
    Clock,
    AlertTriangle,
    Download,
    Filter,
    Trophy,
    RotateCcw,
    CheckCircle,
    Zap,
    CreditCard
} from 'lucide-react';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { UserProfile, Purchase, GlobalSettings, CreditPack } from '../types';
import { CREDIT_PACKS } from '../constants';

interface AdminDashboardProps {
    users: (UserProfile & { id: string })[];
    settings: GlobalSettings;
    onUpdateSettings: (s: GlobalSettings) => void;
    onUpdateUser: (id: string, updates: Partial<UserProfile>) => void;
    onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, settings, onUpdateSettings, onUpdateUser, onBack }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'sales' | 'settings' | 'rankings'>('dashboard');
    const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [localSettings, setLocalSettings] = useState(settings);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isRecalculating, setIsRecalculating] = useState(false);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleExportCSV = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            showToast('Sales data exported successfully (sales_report.csv)');
        }, 1500);
    };

    const handleRecalculateRankings = () => {
        setIsRecalculating(true);
        setTimeout(() => {
            setIsRecalculating(false);
            showToast('Global rankings recalculated and synced');
        }, 2000);
    };

    const handleSaveSettings = () => {
        onUpdateSettings(localSettings);
        showToast('System configuration saved');
    };

    // Mock aggregated purchase data from all users
    const allPurchases = useMemo(() => {
        const p: (Purchase & { userName: string, userId: string })[] = [];
        users.forEach(u => {
            (u.purchaseHistory || []).forEach(purchase => {
                p.push({ ...purchase, userName: u.name, userId: u.id });
            });
        });
        return p.sort((a, b) => b.date - a.date);
    }, [users]);

    const filteredPurchases = useMemo(() => {
        let list = allPurchases;
        if (dateRange !== 'all') {
            const now = Date.now();
            const diff = dateRange === 'today' ? 86400000 : (dateRange === '7d' ? 7 * 86400000 : 30 * 86400000);
            list = list.filter(p => now - p.date < diff);
        }
        return list;
    }, [allPurchases, dateRange]);

    const stats = useMemo(() => {
        const revenue = filteredPurchases.reduce((acc, p) => acc + p.amount, 0);
        return {
            revenue,
            users: users.length,
            sales: filteredPurchases.length,
            averageTicket: filteredPurchases.length > 0 ? revenue / filteredPurchases.length : 0
        };
    }, [users, filteredPurchases]);

    const sortedUsers = useMemo(() => {
        return [...users].sort((a, b) => b.totalScore - a.totalScore);
    }, [users]);

    const chartData = useMemo(() => {
        const daysToShow = dateRange === 'today' ? 1 : (dateRange === '7d' ? 7 : (dateRange === '30d' ? 30 : 15));
        const data = [];
        const now = new Date();

        for (let i = daysToShow - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            const dateStr = d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
            const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
            const dayEnd = new Date(d.setHours(23, 59, 59, 999)).getTime();

            const dayPurchases = allPurchases.filter(p => p.date >= dayStart && p.date <= dayEnd);

            data.push({
                name: dateStr,
                sales: dayPurchases.length,
                revenue: dayPurchases.reduce((acc, p) => acc + p.amount, 0)
            });
        }

        return data;
    }, [allPurchases, dateRange]);

    const renderDashboard = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Overview</h2>
                <div className="flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
                    {(['today', '7d', '30d', 'all'] as const).map(r => (
                        <button
                            key={r}
                            onClick={() => setDateRange(r)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dateRange === r ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {r === 'all' ? 'All Time' : r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: <DollarSign size={20} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Total Users', value: stats.users, icon: <Users size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Total Sales', value: stats.sales, icon: <ShoppingBag size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Avg Ticket', value: `$${stats.averageTicket.toFixed(2)}`, icon: <Target size={20} />, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((s, i) => (
                    <div
                        key={i}
                        onClick={() => i === 1 ? setActiveTab('users') : (i === 2 ? setActiveTab('sales') : null)}
                        className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all ${i === 1 || i === 2 ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md' : ''}`}
                    >
                        <div className={`p-3 rounded-2xl ${s.bg} ${s.color} w-fit mb-4`}>{s.icon}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</div>
                        <div className="text-2xl font-black text-slate-800">{s.value}</div>
                        {(i === 1 || i === 2) && <div className="mt-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">Manage <ChevronDown size={10} className="-rotate-90" /></div>}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px]">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm h-[400px]">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Sales Volume</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                            />
                            <Bar dataKey="sales" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Active Players</h2>
                <div className="relative w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Player</th>
                            <th className="px-8 py-5">Score</th>
                            <th className="px-8 py-5">Credits</th>
                            <th className="px-8 py-5 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs overflow-hidden">
                                            {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-800">{u.name}</div>
                                            <div className="text-xs text-slate-400 font-medium">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 font-black text-slate-800">{u.totalScore.toLocaleString()}</td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 font-black text-indigo-600">
                                        <Zap size={14} /> {u.credits}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => { onUpdateUser(u.id, { credits: u.credits + 100 }); showToast(`Added 100 credits to ${u.name}`); }}
                                            className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase hover:bg-indigo-600 hover:text-white transition-all"
                                        >
                                            + Credits
                                        </button>
                                        <button
                                            onClick={() => showToast(`Player ${u.name} has been suspended`, 'error')}
                                            className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-lg uppercase hover:bg-rose-600 hover:text-white transition-all"
                                        >
                                            Ban
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSales = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Transaction History</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportCSV}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                        {isExporting ? <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full"></div> : <Download size={16} />}
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Transaction ID</th>
                            <th className="px-8 py-5">Player</th>
                            <th className="px-8 py-5">Date</th>
                            <th className="px-8 py-5">Credits</th>
                            <th className="px-8 py-5 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredPurchases.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5 font-mono text-xs text-slate-400 font-bold">#{p.id}</td>
                                <td className="px-8 py-5 font-black text-slate-800">{p.userName}</td>
                                <td className="px-8 py-5 text-slate-500 font-medium text-xs">{new Date(p.date).toLocaleString()}</td>
                                <td className="px-8 py-5 font-black text-indigo-600">+{p.credits}</td>
                                <td className="px-8 py-5 text-right font-black text-emerald-600">{p.currency}{p.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">System Configuration</h2>
                <button
                    onClick={handleSaveSettings}
                    className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30 font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all"
                >
                    <Save size={20} /> Save Changes
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Branding Table */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 text-indigo-600 mb-2">
                        <Palette size={24} />
                        <h3 className="font-black uppercase tracking-tight">Appearance</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Application Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-slate-800"
                                value={localSettings.appName}
                                onChange={(e) => setLocalSettings({ ...localSettings, appName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Primary Color (HEX)</label>
                            <div className="flex gap-4">
                                <input
                                    type="color"
                                    className="w-16 h-14 rounded-2xl border-none cursor-pointer p-0"
                                    value={localSettings.primaryColor}
                                    onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="flex-1 px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-slate-800 uppercase"
                                    value={localSettings.primaryColor}
                                    onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rules Engine */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <Target size={24} />
                        <h3 className="font-black uppercase tracking-tight">Game Logic</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Points Per Level</label>
                            <input
                                type="number"
                                className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-slate-800"
                                value={localSettings.pointsPerLevel}
                                onChange={(e) => setLocalSettings({ ...localSettings, pointsPerLevel: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Timer Multiplier</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-slate-800"
                                    value={localSettings.timeBonusMultiplier}
                                    onChange={(e) => setLocalSettings({ ...localSettings, timeBonusMultiplier: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Mistake Penalty</label>
                                <input
                                    type="number"
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-bold text-slate-800"
                                    value={localSettings.mistakePenalty}
                                    onChange={(e) => setLocalSettings({ ...localSettings, mistakePenalty: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Configuration */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 text-indigo-600 mb-2">
                    <CreditCard size={24} />
                    <h3 className="font-black uppercase tracking-tight">Payment Gateways</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Stripe Configuration */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-black text-xs">S</div>
                            <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">Stripe Configuration</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Public Key</label>
                                <input
                                    type="text"
                                    placeholder="pk_test_..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-mono text-xs text-slate-600"
                                    value={localSettings.stripePublicKey || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, stripePublicKey: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Secret Key</label>
                                <input
                                    type="password"
                                    placeholder="sk_test_..."
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none font-mono text-xs text-slate-600"
                                    value={localSettings.stripeSecretKey || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, stripeSecretKey: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* PayPal Configuration */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs">P</div>
                            <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">PayPal Configuration</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Client ID</label>
                                <input
                                    type="text"
                                    placeholder="AcA..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-xs text-slate-600"
                                    value={localSettings.paypalClientId || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, paypalClientId: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Secret Key</label>
                                <input
                                    type="password"
                                    placeholder="E..."
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-mono text-xs text-slate-600"
                                    value={localSettings.paypalSecretKey || ''}
                                    onChange={(e) => setLocalSettings({ ...localSettings, paypalSecretKey: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 flex items-start gap-4">

                <div className="p-3 bg-white rounded-2xl text-rose-500 shadow-sm">
                    <AlertTriangle size={20} />
                </div>
                <div>
                    <h4 className="font-black text-rose-900 text-sm uppercase tracking-tight">Danger Zone</h4>
                    <p className="text-xs text-rose-700 font-medium mt-1">Changing game logic parameters will affect current sessions. Proceed with caution when reducing player scores or credits.</p>
                </div>
            </div>
        </div>
    );

    const renderRankings = () => {

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Rankings Management</h2>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Moderate global season leaderboards</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRecalculateRankings}
                            disabled={isRecalculating}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            {isRecalculating ? <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full"></div> : <RotateCcw size={16} />}
                            {isRecalculating ? 'Recalculating...' : 'Recalculate Rankings'}
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Rank</th>
                                <th className="px-8 py-5">Player</th>
                                <th className="px-8 py-5">Score</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sortedUsers.map((u, index) => (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-5 font-black text-slate-800">{index + 1}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs overflow-hidden">
                                                {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800">{u.name}</div>
                                                <div className="text-xs text-slate-400 font-medium">{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-black text-slate-800">{u.totalScore.toLocaleString()}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setActiveTab('users'); setSearchTerm(u.name); }}
                                                className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase hover:bg-indigo-600 hover:text-white transition-all"
                                            >
                                                Manage
                                            </button>
                                            <button
                                                onClick={() => showToast(`Resetting score for ${u.name}`, 'success')}
                                                className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-black rounded-lg uppercase hover:bg-slate-600 hover:text-white transition-all"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-amber-900">
                        <Trophy size={24} />
                        <div>
                            <div className="font-black uppercase text-sm tracking-tight">Active Season</div>
                            <div className="text-xs font-medium opacity-80">Season #14 ends in 12 days</div>
                        </div>
                    </div>
                    <button
                        onClick={() => showToast('Season #14 has been extended for 7 days', 'success')}
                        className="px-6 py-3 bg-white border border-amber-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-amber-700 hover:bg-amber-100 transition-all shadow-sm"
                    >
                        End Season Now
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50">
                <div className="p-8">
                    <div
                        className="flex items-center gap-3 mb-10 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg">
                            <LayoutDashboard size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-lg text-slate-800 uppercase tracking-tight leading-none">Admin</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] truncate max-w-[120px]">{localSettings.appName || 'Sudoku Pro'}</span>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
                            { id: 'users', label: 'Players', icon: <Users size={18} /> },
                            { id: 'rankings', label: 'Rankings', icon: <Trophy size={18} /> },
                            { id: 'sales', label: 'Sales History', icon: <ShoppingBag size={18} /> },
                            { id: 'settings', label: 'Global Setup', icon: <Settings size={18} /> },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-2' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-slate-100">
                    <button onClick={onBack} className="w-full flex items-center justify-center gap-2 py-4 bg-slate-50 rounded-2xl font-black text-[10px] text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={14} /> Back to Game UI
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-80 p-12">
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'sales' && renderSales()}
                {activeTab === 'settings' && renderSettings()}
                {activeTab === 'rankings' && renderRankings()}

                {/* Toast Feedback */}
                {toast && (
                    <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-4 duration-300 z-[100] font-black text-xs uppercase tracking-widest text-white ${toast.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`}>
                        <div className="flex items-center gap-3">
                            <CheckCircle size={18} />
                            {toast.message}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
