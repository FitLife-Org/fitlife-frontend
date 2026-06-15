import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { User, Ruler, Weight, Activity, Mail, Phone, Target, Edit3, ShieldCheck, Dumbbell, Calendar, Loader2 } from 'lucide-react';
import { memberApi, MemberProfileResponse } from '../../api/memberApi';


export default function MemberProfile() {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [memberData, setMemberData] = useState<MemberProfileResponse | null>(null);
  const [activePackage, setActivePackage] = useState<any>(null);
  const [upcomingSession, setUpcomingSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);


 useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [profileRes, packageRes, sessionRes] = await Promise.all([
          memberApi.getMyProfile(),
          Promise.resolve({ data: { data: { name: "Premium 12 Tháng" } } }), 
          Promise.resolve({ data: { data: { time: "18:00 - Hôm nay" } } })
        ]);
        
        console.log("Toàn bộ phản hồi từ API:", profileRes.data);
       const responseBody = profileRes.data as any;
        const actualMemberData = responseBody.data || responseBody.payload || responseBody.result || responseBody;
        
     
        setMemberData(actualMemberData); 
        
        setActivePackage(packageRes.data.data);
        setUpcomingSession(sessionRes.data.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  useGSAP(() => {
    if (isLoading || !memberData) return;
    
    
    const tl = gsap.timeline();
    tl.fromTo(".profile-header", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out" });
    tl.fromTo(".avatar-pop", { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }, "-=0.3");
    tl.fromTo(".info-card", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" }, "-=0.2");
  }, { scope: containerRef, dependencies: [isLoading, memberData] });

  // Tính BMI và phân loại
  const getBmiInfo = (bmi: number) => {
    if (!bmi) return { label: 'Chưa có', color: 'text-gray-500', bg: 'bg-gray-200', width: '0%' };
    if (bmi < 18.5) return { label: 'Thiếu cân', color: 'text-blue-500', bg: 'bg-blue-500', width: '25%' };
    if (bmi < 25) return { label: 'Tuyệt vời', color: 'text-emerald-500', bg: 'bg-emerald-500', width: '50%' };
    if (bmi < 30) return { label: 'Thừa cân', color: 'text-orange-500', bg: 'bg-orange-500', width: '75%' };
    return { label: 'Béo phì', color: 'text-red-500', bg: 'bg-red-500', width: '100%' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!memberData) return <div className="text-center mt-20 text-red-500">Không tìm thấy thông tin hồ sơ!</div>;

  const bmiInfo = getBmiInfo(memberData.bmi);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50 pb-12">
      <div className="h-64 w-full bg-gradient-to-r from-emerald-500 to-teal-600 object-cover relative overflow-hidden profile-header">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-6 profile-header mb-8">
          <div className="avatar-pop relative">
            <img 
              src={memberData.avatarUrl || "https://ui-avatars.com/api/?name=Hoi+Vien&background=10b981&color=fff"} 
              alt="Avatar" 
              className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
            />
            {memberData.status === 'ACTIVE' && (
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Active Member">
                <ShieldCheck size={20} />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{memberData.fullName}</h1>
            <p className="text-slate-500 font-medium mt-1">ID Hội viên: #{memberData.id}</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-50 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
              <Edit3 size={18} /> Cập nhật
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-slate-200 mb-8 px-2 overflow-x-auto">
          {['overview', 'workouts', 'settings'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'text-emerald-600 border-b-2 border-emerald-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'overview' ? 'Tổng quan' : tab === 'workouts' ? 'Lịch tập' : 'Cài đặt'}
            </button>
          ))}
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cột trái */}
          <div className="lg:col-span-1 space-y-8">
            <div className="info-card bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <User size={20} className="text-emerald-500"/> Liên hệ
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Mail size={18}/></div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-slate-400 font-medium">Email</p>
                    <p className="font-semibold text-slate-700 truncate">{memberData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Phone size={18}/></div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Điện thoại</p>
                    <p className="font-semibold text-slate-700">{memberData.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card bg-slate-900 p-6 rounded-3xl shadow-lg relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={80}/></div>
              <h2 className="text-lg font-bold mb-2 relative z-10 flex items-center gap-2">
                Mục tiêu hiện tại
              </h2>
              <p className="text-emerald-400 font-semibold text-xl relative z-10 mb-4">{memberData.fitnessGoal || 'Chưa thiết lập'}</p>
              <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors relative z-10">
                Đổi mục tiêu
              </button>
            </div>
          </div>

          {/* Cột phải */}
          <div className="lg:col-span-2 space-y-8">
            <div className="info-card bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Activity size={20} className="text-emerald-500"/> Chỉ số cơ thể
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-center hover:shadow-md transition-all">
                  <Ruler className="mx-auto mb-2 text-slate-400" size={24}/>
                  <p className="text-xs text-slate-400 font-medium uppercase">Chiều cao</p>
                  <p className="text-xl font-bold text-slate-800">{memberData.height || 0} <span className="text-sm font-normal text-slate-500">cm</span></p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50 text-center hover:shadow-md transition-all">
                  <Weight className="mx-auto mb-2 text-slate-400" size={24}/>
                  <p className="text-xs text-slate-400 font-medium uppercase">Cân nặng</p>
                  <p className="text-xl font-bold text-slate-800">{memberData.weight || 0} <span className="text-sm font-normal text-slate-500">kg</span></p>
                </div>
                <div className="col-span-2 p-4 rounded-2xl border-2 border-emerald-50 bg-emerald-50/50 flex flex-col justify-center">
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-xs text-emerald-600 font-bold uppercase">Chỉ số BMI</p>
                    <p className={`text-sm font-bold ${bmiInfo.color}`}>{bmiInfo.label}</p>
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-3xl font-extrabold text-slate-800">{memberData.bmi || 0}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${bmiInfo.bg} transition-all duration-1000 ease-out`}
                      style={{ width: bmiInfo.width }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

           <div className="info-card grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-sm text-white flex items-center justify-between cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
                <div>
                  <p className="text-indigo-100 font-medium text-sm">Gói tập của bạn</p>
                  <p className="text-xl font-bold mt-1">
      
                    {activePackage ? activePackage.name : "Chưa đăng ký gói"} 
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Dumbbell size={24} />
                </div>
              </div>
              
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer hover:shadow-lg hover:border-emerald-200 transition-all hover:-translate-y-1">
                <div>
                  <p className="text-slate-500 font-medium text-sm">Lịch PT sắp tới</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">
                    {/* Fallback nếu không có lịch: */}
                    {upcomingSession ? upcomingSession.time : "Chưa có lịch"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                  <Calendar size={24} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}