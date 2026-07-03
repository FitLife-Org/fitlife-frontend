import { CheckSquare, Clock, DollarSign, Users, TrendingUp, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import { formatCurrency } from "../../utils/formatCurrency";

const revenueData = [
  { month: "T1", revenue: 450000000 },
  { month: "T2", revenue: 520000000 },
  { month: "T3", revenue: 480000000 },
  { month: "T4", revenue: 610000000 },
  { month: "T5", revenue: 590000000 },
  { month: "T6", revenue: 720000000 },
];

const packageData = [
  { name: "1 tháng", value: 34, color: "#10b981" }, // Emerald 500
  { name: "3 tháng", value: 28, color: "#3b82f6" }, // Blue 500
  { name: "6 tháng", value: 23, color: "#8b5cf6" }, // Violet 500
  { name: "12 tháng", value: 15, color: "#f97316" }, // Orange 500
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader 
          title="Dashboard"
          description="Tổng quan vận hành hệ thống phòng gym FitLife" 
        />
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-1 hover:shadow-xl">
          Xuất báo cáo
        </button>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <AdminMetric 
            icon={<Users className="w-7 h-7" />} 
            label="Tổng hội viên" 
            value="2.456" 
            note="+8,2% so với tháng trước" 
            colorClass="from-emerald-400 to-teal-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AdminMetric 
            icon={<CheckSquare className="w-7 h-7" />} 
            label="Check-in hôm nay" 
            value="348" 
            note="+12,4% so với hôm qua" 
            colorClass="from-blue-400 to-indigo-500" 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AdminMetric 
            icon={<DollarSign className="w-7 h-7" />} 
            label="Doanh thu tháng" 
            value="1.25B" 
            note="+15,6% so với tháng trước" 
            colorClass="from-purple-400 to-fuchsia-500"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <AdminMetric 
            icon={<Clock className="w-7 h-7" />} 
            label="Gói sắp hết hạn" 
            value="86" 
            note="Cần nhắc nhở gia hạn" 
            colorClass="from-orange-400 to-red-500"
          />
        </motion.div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 xl:grid-cols-[1.5fr_1fr]"
      >
        {/* Doanh thu Chart */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="p-6 h-full border-none shadow-xl shadow-slate-200/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Doanh thu 6 tháng
                </h2>
                <p className="text-sm text-slate-500 mt-1">Tổng quan dòng tiền từ các gói tập</p>
              </div>
              <button className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                <MoreHorizontal className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000000}M`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Tỷ lệ gói tập */}
        <motion.div variants={itemVariants} className="h-full">
          <Card className="p-6 h-full border-none shadow-xl shadow-slate-200/50">
            <h2 className="text-xl font-bold text-slate-900">Phân bổ gói tập</h2>
            <p className="text-sm text-slate-500 mt-1 mb-8">Tỷ lệ hội viên theo thời hạn gói</p>
            
            <div className="flex flex-col items-center justify-center">
              <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={packageData}
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {packageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [`${value}%`, "Tỷ lệ"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text in donut chart */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-800">2.456</span>
                  <span className="text-xs font-bold text-slate-400">TỔNG GÓI</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full mt-6 px-4">
                {packageData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 xl:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <ListCard 
            title="Hội viên mới gần đây" 
            items={["Nguyễn Minh Anh", "Trần Quang Huy", "Lê Thị Thu Trang", "Phạm Hoàng Nam"]} 
            type="member"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ListCard 
            title="Lịch PT hôm nay" 
            items={["09:00 - Nguyễn Minh Anh", "10:00 - Trần Quang Huy", "14:00 - Lê Thị Thu Trang"]} 
            type="schedule"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ListCard 
            title="Thanh toán gần đây" 
            items={["GD250601-0012", "GD250601-0011", "GD250531-0056", "GD250531-0051"]} 
            type="payment"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function AdminMetric({ icon, label, value, note, colorClass }: { icon: ReactNode; label: string; value: string; note: string; colorClass: string }) {
  return (
    <Card className="p-6 relative overflow-hidden group cursor-pointer border-none shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300">
      <div className={`absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br ${colorClass} opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-bold text-slate-500 mb-1">{label}</p>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      
      <div className="mt-6 flex items-center gap-2">
        <Badge variant={note.includes('+') ? 'success' : note.includes('-') ? 'danger' : 'info'} className="px-2 py-0.5 text-[10px]">
          {note.split(' ')[0]}
        </Badge>
        <span className="text-xs font-medium text-slate-400">
          {note.substring(note.indexOf(' ') + 1)}
        </span>
      </div>
    </Card>
  );
}

function ListCard({ title, items, type }: { title: string; items: string[], type: 'member' | 'schedule' | 'payment' }) {
  return (
    <Card className="p-0 overflow-hidden border-none shadow-xl shadow-slate-200/50 flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <button className="text-sm font-bold text-emerald-500 hover:text-emerald-600 transition-colors">
          Xem tất cả
        </button>
      </div>
      
      <div className="flex-1 p-2 bg-slate-50/50">
        <div className="space-y-1">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                  ${type === 'member' ? 'bg-blue-100 text-blue-600' : 
                    type === 'schedule' ? 'bg-orange-100 text-orange-600' : 
                    'bg-emerald-100 text-emerald-600'}`}
                >
                  <span className="font-bold text-sm">
                    {type === 'member' ? item.charAt(0) : 
                     type === 'schedule' ? <Clock className="w-4 h-4" /> : 
                     <DollarSign className="w-4 h-4" />}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                    {item}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {type === 'member' ? 'Hội viên VIP' : type === 'schedule' ? 'PT: Coach Tuấn' : 'Chuyển khoản'}
                  </span>
                </div>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Badge variant={index === 0 ? "success" : "default"}>
                  {type === 'member' ? 'Mới' : type === 'schedule' ? 'Sắp tới' : 'Hoàn tất'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
