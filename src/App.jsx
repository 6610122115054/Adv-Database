import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Search, Map, BarChart2, MonitorPlay, Settings, Bell, User } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// ==========================================
// 1. ส่วนประกอบหลัก (Components)
// ==========================================

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', name: 'Home', icon: Home },
    { path: '/discovery', name: 'Discovery', icon: Search },
    { path: '/destination', name: 'Destination', icon: Map },
    { path: '/analytics', name: 'Analytics', icon: BarChart2 },
    { path: '/content', name: 'Content', icon: MonitorPlay },
    { path: '/settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 flex flex-col shadow-sm">
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
          GenZ
        </div>
        <span className="font-bold text-slate-800 text-lg leading-tight">TikTok<br/>Travel Trends</span>
      </div>
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} /> 
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

const Header = () => {
  const location = useLocation();
  const pageTitle = {
    '/': 'Home / Dashboard',
    '/discovery': 'Data Discovery / Search',
    '/destination': 'Destination Analysis',
    '/analytics': 'Behavior Analytics',
    '/content': 'Content Optimization',
    '/settings': 'System & Settings'
  }[location.pathname] || 'Dashboard';

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{pageTitle}</h1>
        <p className="text-sm text-slate-500">ระบบวิเคราะห์พฤติกรรมการท่องเที่ยวกลุ่ม Gen Z</p>
      </div>
      <div className="flex items-center gap-5">
        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><Search size={22} /></button>
        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200 cursor-pointer">
          <User size={20} />
        </div>
      </div>
    </header>
  );
};

// ==========================================
// 2. หน้าต่างแต่ละหน้า (Pages)
// ==========================================

// หน้า 1: Home / Dashboard
const DashboardPage = () => {
  const pieData = [{ name: 'Slang', value: 45 }, { name: 'Stand', value: 55 }];
  const COLORS = ['#3b82f6', '#0ea5e9']; // สีฟ้าโมเดิร์น

  return (
    <div className="p-8 space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="font-bold mb-4 text-slate-800 flex items-center gap-2">🔥 TOP VIRAL DESTINATIONS</h2>
          <div className="flex gap-4">
            <div className="flex-1 h-40 rounded-xl bg-[url('https://images.unsplash.com/photo-1552465011-b4e21bf6e79a')] bg-cover bg-center shadow-inner relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                 <span className="text-white font-medium">ทะเลใต้</span>
               </div>
            </div>
            <div className="flex-1 h-40 rounded-xl bg-[url('https://images.unsplash.com/photo-1540959733332-eab4deabeeaf')] bg-cover bg-center shadow-inner relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                 <span className="text-white font-medium">คาเฟ่เชียงใหม่</span>
               </div>
            </div>
            <div className="flex-1 h-40 rounded-xl bg-[url('https://images.unsplash.com/photo-1498804103079-a6351b050096')] bg-cover bg-center shadow-inner relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                 <span className="text-white font-medium">จุดกางเต็นท์</span>
               </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-md text-white flex flex-col justify-center gap-6">
           <h2 className="font-semibold text-blue-100">KEY METRICS</h2>
           <div>
             <p className="text-5xl font-bold mb-1">33.9M</p>
             <p className="text-sm text-blue-200">Total Views on Travel Hashtags</p>
           </div>
           <div className="h-px w-full bg-blue-500/50"></div>
           <div>
             <p className="text-3xl font-bold mb-1">12.1K</p>
             <p className="text-sm text-blue-200">Average Engagement</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="font-bold mb-4 text-slate-800">GEN Z INTERPRETATION TRENDS</h2>
          <div className="h-48 flex items-center justify-center text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            #เที่ยวทิพย์ #ป้ายยา
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="font-bold mb-4 text-slate-800">POPULAR CONTENT TYPES</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// หน้าอื่นๆ (สร้างโครงไว้รอใส่ข้อมูล)
const DiscoveryPage = () => <div className="p-8"><div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[400px] flex items-center justify-center text-slate-400">เนื้อหาหน้า Data Discovery / Search</div></div>;
const DestinationPage = () => <div className="p-8"><div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[400px] flex items-center justify-center text-slate-400">เนื้อหาหน้า Destination Analysis</div></div>;
const AnalyticsPage = () => <div className="p-8"><div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[400px] flex items-center justify-center text-slate-400">เนื้อหาหน้า Behavior Analytics</div></div>;
const ContentPage = () => <div className="p-8"><div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[400px] flex items-center justify-center text-slate-400">เนื้อหาหน้า Content Optimization</div></div>;
const SettingsPage = () => <div className="p-8"><div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[400px] flex items-center justify-center text-slate-400">เนื้อหาหน้า System & Settings</div></div>;

// ==========================================
// 3. ตัวรันแอปพลิเคชันหลัก
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex font-sans">
        <Sidebar />
        <div className="ml-64 flex-1 flex flex-col">
          <Header />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/destination" element={<DestinationPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/content" element={<ContentPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}