import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  User, Ruler, Weight, Activity, Mail, Phone, Target,
  Edit3, ShieldCheck, Dumbbell, Calendar, Loader2,
  Save, X, Clock, LogOut, Key, Camera, Crown
} from 'lucide-react';
import { memberApi, MemberProfileResponse } from '../../api/memberApi';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function MemberProfile() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [memberData, setMemberData] = useState<MemberProfileResponse | null>(null);
  const [activePackage, setActivePackage] = useState<any>(null);
  const [upcomingSession, setUpcomingSession] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<MemberProfileResponse>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [profileRes, packageRes, sessionRes, workoutsRes] = await Promise.all([
          memberApi.getMyProfile(),
          Promise.resolve({ data: { data: null } }),
          Promise.resolve({ data: { data: null } }),
          Promise.resolve({ data: { data: [] } })
        ]);

        const responseBody = profileRes.data as any;
        const actualMemberData = responseBody.data || responseBody.payload || responseBody.result || responseBody;

        setMemberData(actualMemberData);
        setActivePackage(packageRes.data.data);
        setUpcomingSession(sessionRes.data.data);
        setWorkouts(workoutsRes.data.data || []);
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
    tl.fromTo(".info-card", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }, "-=0.2");
  }, { scope: containerRef, dependencies: [isLoading, memberData, activeTab, isEditing] });

  const validateForm = (): string | null => {
    if (!editForm.fullName || editForm.fullName.trim().length < 3) return "Họ và tên không được để trống và phải có ít nhất 3 ký tự.";
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (editForm.phone && !phoneRegex.test(editForm.phone)) return "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (VD: 0912345678).";
    if (editForm.height && (editForm.height < 50 || editForm.height > 250)) return "Chiều cao nhập vào không hợp lý (50 - 250 cm).";
    if (editForm.weight && (editForm.weight < 20 || editForm.weight > 300)) return "Cân nặng nhập vào không hợp lý (20 - 300 kg).";
    return null;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({ title: 'Ảnh quá lớn', text: 'Vui lòng chọn ảnh có dung lượng dưới 2MB.', icon: 'warning' });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm(memberData || {});
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    const errorMessage = validateForm();
    if (errorMessage) {
      Swal.fire({ title: 'Dữ liệu không hợp lệ!', text: errorMessage, icon: 'warning', confirmButtonColor: '#10b981' });
      return;
    }

    setIsSaving(true);
    try {
      let finalAvatarUrl = memberData?.avatarUrl;
      if (avatarFile) {
        try {
          const uploadRes = await memberApi.uploadAvatar(avatarFile) as any;
          finalAvatarUrl = uploadRes.data?.data?.url || uploadRes.data?.payload?.url || avatarPreview;
        } catch (uploadError) {
          console.error("Lỗi upload ảnh:", uploadError);
          Swal.fire('Cảnh báo', 'Cập nhật thông tin thành công nhưng Upload ảnh thất bại!', 'warning');
        }
      }

      const dataToUpdate = { ...editForm, avatarUrl: finalAvatarUrl };
      await memberApi.updateMyProfile(dataToUpdate);

      setMemberData(prev => ({ ...prev, ...dataToUpdate } as MemberProfileResponse));
      setIsEditing(false);

      Swal.fire({ title: 'Thành công!', text: 'Hồ sơ của bạn đã được cập nhật.', icon: 'success', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      Swal.fire({ title: 'Thất bại!', text: 'Có lỗi xảy ra khi cập nhật.', icon: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const getBmiInfo = (bmi: number) => {
    if (!bmi) return { label: 'Chưa có', color: 'text-slate-500', bg: 'bg-slate-200', width: '0%' };
    if (bmi < 18.5) return { label: 'Thiếu cân', color: 'text-sky-500', bg: 'bg-sky-500', width: '25%' };
    if (bmi < 25) return { label: 'Tuyệt vời', color: 'text-emerald-500', bg: 'bg-emerald-500', width: '50%' };
    if (bmi < 30) return { label: 'Thừa cân', color: 'text-orange-500', bg: 'bg-orange-500', width: '75%' };
    return { label: 'Béo phì', color: 'text-red-500', bg: 'bg-red-500', width: '100%' };
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getPackageStyle = (pkgCode: string | number | undefined) => {
    const code = String(pkgCode);
    switch (code) {
      case "1":
        return {
          container: "bg-gradient-to-br from-slate-300 via-gray-100 to-slate-400 border border-slate-300",
          textLabel: "text-slate-500",
          textName: "text-slate-800",
          iconBox: "bg-white/60 text-slate-600 shadow-sm"
        };
      case "2":
        return {
          container: "bg-gradient-to-br from-yellow-300 via-amber-300 to-yellow-600 shadow-yellow-500/30",
          textLabel: "text-amber-900/70",
          textName: "text-amber-950",
          iconBox: "bg-white/40 text-amber-800 shadow-inner"
        };
      case "3":
        return {
          container: "bg-gradient-to-br from-slate-900 via-indigo-950 to-black border border-amber-500/30 shadow-indigo-900/50",
          textLabel: "text-indigo-200/70",
          textName: "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500",
          iconBox: "bg-indigo-900/50 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        };
      default:
        return {
          container: "bg-slate-50 border border-slate-200",
          textLabel: "text-slate-400",
          textName: "text-slate-600",
          iconBox: "bg-white text-slate-300 shadow-sm"
        };
    }
  };

  if (isLoading) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
  );

  if (!memberData) return <div className="text-center mt-20 text-red-500">Không tìm thấy thông tin hồ sơ!</div>;

  const bmiInfo = getBmiInfo(memberData.bmi);
  const currentAvatarSource = avatarPreview || memberData.avatarUrl || "https://ui-avatars.com/api/?name=Hoi+Vien&background=10b981&color=fff";
  const pkgStyle = getPackageStyle(activePackage?.gym_package);

  /* --- RENDER TAB TỔNG QUAN --- */
  const renderOverview = () => (
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
                  <p className="font-semibold text-slate-700">{memberData.phone || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card bg-slate-900 p-6 rounded-3xl shadow-lg relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={80}/></div>
            <h2 className="text-lg font-bold mb-2 relative z-10 flex items-center gap-2">Mục tiêu hiện tại</h2>
            <p className="text-emerald-400 font-semibold text-xl relative z-10 mb-4">{memberData.fitnessGoal || 'Chưa thiết lập'}</p>
            <button onClick={handleEditToggle} className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors relative z-10">
              Cập nhật mục tiêu
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
                  <div className={`h-full rounded-full ${bmiInfo.bg} transition-all duration-1000 ease-out`} style={{width: bmiInfo.width}}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thẻ Gói tập */}
            <div className={`p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:-translate-y-1 transition-all ${activePackage ? pkgStyle.container : 'bg-slate-100 border-2 border-dashed border-slate-300'}`}>
              <div>
                <p className={`${activePackage ? pkgStyle.textLabel : 'text-slate-500'} font-medium text-sm tracking-wide uppercase`}>
                  {activePackage ? 'Gói tập của bạn' : 'Chưa có gói tập'}
                </p>
                <p className={`${activePackage ? pkgStyle.textName : 'text-slate-600'} text-xl font-black mt-1`}>
                  {activePackage ? activePackage.name : "Khám phá ngay"}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md ${activePackage ? pkgStyle.iconBox : 'bg-white text-slate-400'}`}>
                {activePackage && String(activePackage.gym_package) === "3" ? <Crown size={24}/> : <Dumbbell size={24}/>}
              </div>
            </div>

            {/* Thẻ Lịch PT */}
            {upcomingSession ? (
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center justify-between cursor-pointer hover:shadow-lg hover:border-emerald-200 transition-all hover:-translate-y-1">
                  <div>
                    <p className="text-slate-500 font-medium text-sm tracking-wide uppercase">Lịch PT sắp tới</p>
                    <p className="text-lg font-bold text-slate-800 mt-1">{upcomingSession.time}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                    <Calendar size={24}/>
                  </div>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex items-center justify-center text-center">
                  <p className="text-slate-400 text-sm">Chưa có lịch tập PT</p>
                </div>
            )}
          </div>
        </div>
      </div>
  );

  /* --- RENDER TAB LỊCH TẬP --- */
  const renderWorkouts = () => (
      <div className="info-card bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Lịch tập luyện</h2>
        </div>

        {!workouts || workouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                <Crown size={32} className="text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-slate-700">Bạn cần mua VIP để đặt lịch</p>
              <p className="text-sm mt-1 text-slate-400 mb-6">Nâng cấp tài khoản để mở khóa tính năng đặt lịch với PT.</p>
              <button className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all">
                Xem các gói VIP
              </button>
            </div>
        ) : (
            <div className="space-y-4">...</div>
        )}
      </div>
  );

  /* --- RENDER TAB CÀI ĐẶT --- */
  const renderSettings = () => (
      <div className="info-card grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <Key size={20} className="text-emerald-500"/> Đổi mật khẩu
          </h2>
          <div className="space-y-4">
            <input type="password" placeholder="Mật khẩu hiện tại"
                   className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"/>
            <input type="password" placeholder="Mật khẩu mới"
                   className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"/>
            <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
              Cập nhật mật khẩu
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Tài khoản</h2>
            <p className="text-slate-500 text-sm">Quản lý phiên đăng nhập và bảo mật tài khoản của bạn.</p>
          </div>
          <button onClick={handleLogout}
                  className="mt-6 w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
            <LogOut size={18}/> Đăng xuất
          </button>
        </div>
      </div>
  );

  /* --- MAIN RETURN --- */
  return (
      <div ref={containerRef} className="min-h-screen bg-slate-50 pb-12">
        <div className="h-64 w-full bg-gradient-to-r from-emerald-500 to-teal-600 object-cover relative overflow-hidden profile-header">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 profile-header mb-8 transition-all">

            <div className={`flex flex-col md:flex-row items-center md:items-end gap-6 ${isEditing ? 'mb-8 border-b border-slate-100 pb-6' : ''}`}>
              <div className="avatar-pop relative group">
                <img
                    src={currentAvatarSource}
                    alt="Avatar"
                    className={`w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg bg-white transition-all ${isEditing ? 'group-hover:brightness-50' : ''}`}
                />
                {isEditing && (
                    <label className="absolute inset-0 m-1 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 cursor-pointer transition-opacity text-white">
                      <Camera size={24} className="mb-1"/>
                      <span className="text-xs font-semibold">Đổi ảnh</span>
                      <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleAvatarChange}/>
                    </label>
                )}
                {memberData.status === 'ACTIVE' && !isEditing && (
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="Active Member">
                      <ShieldCheck size={20}/>
                    </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {isEditing ? 'Chỉnh sửa hồ sơ' : memberData.fullName}
                </h1>
                <p className="text-slate-500 font-medium mt-1">ID Hội viên: #{memberData.id}</p>
              </div>

              {!isEditing && (
                  <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={handleEditToggle}
                            className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-50 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                      <Edit3 size={18}/> Cập nhật
                    </button>
                  </div>
              )}
            </div>

            {isEditing && (
                <div className="animate-in fade-in zoom-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-600 mb-1 block">Họ và Tên <span className="text-red-500">*</span></label>
                      <input type="text" value={editForm.fullName || ''}
                             onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 font-medium"/>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600 mb-1 block">Số điện thoại</label>
                      <input type="text" value={editForm.phone || ''}
                             onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                             placeholder="VD: 0912345678"
                             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 font-medium"/>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600 mb-1 block">Chiều cao (cm)</label>
                      <input type="number" value={editForm.height || ''}
                             onChange={(e) => setEditForm({...editForm, height: Number(e.target.value)})}
                             placeholder="VD: 175"
                             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 font-medium"/>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-600 mb-1 block">Cân nặng (kg)</label>
                      <input type="number" value={editForm.weight || ''}
                             onChange={(e) => setEditForm({...editForm, weight: Number(e.target.value)})}
                             placeholder="VD: 65"
                             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 font-medium"/>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-slate-600 mb-1 block">Mục tiêu tập luyện</label>
                      <input type="text" value={editForm.fitnessGoal || ''}
                             onChange={(e) => setEditForm({...editForm, fitnessGoal: e.target.value})}
                             placeholder="Vd: Giảm mỡ, Tăng cơ..."
                             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-slate-900 font-medium"/>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-8">
                    <button onClick={handleEditToggle}
                            className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                      Hủy
                    </button>
                    <button onClick={handleSaveProfile} disabled={isSaving}
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-70">
                      {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Lưu thay đổi
                    </button>
                  </div>
                </div>
            )}
          </div>

          <div className="flex gap-6 border-b border-slate-200 mb-8 px-2 overflow-x-auto">
            {[
              {id: 'overview', label: 'Tổng quan'},
              {id: 'workouts', label: 'Lịch tập'},
              {id: 'settings', label: 'Cài đặt'}
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                            ? 'text-emerald-600 border-b-2 border-emerald-600'
                            : 'text-black hover:text-slate-600'
                    }`}
                >
                  {tab.label}
                </button>
            ))}
          </div>

          <div className="tab-content transition-all duration-300">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'workouts' && renderWorkouts()}
            {activeTab === 'settings' && renderSettings()}
          </div>

        </div>
      </div>
  );
}