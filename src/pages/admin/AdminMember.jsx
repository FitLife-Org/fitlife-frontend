import React, { useState, useEffect } from 'react';
import axiosClient from "../../api/axiosClient.js";
import { Users, Search, ChevronLeft, ChevronRight, Lock, Unlock, Mail, Phone, Edit, UserPlus, UserCog } from 'lucide-react';

export default function AdminMember() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Phân trang & Tìm kiếm
    const [page, setPage] = useState(1);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // State cho Modal (Thêm/Sửa)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: ''
    });

    // 1. GỌI API LẤY DANH SÁCH
    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/admin/members?page=${page}&size=${size}&keyword=${keyword}`);
            const pageData = response.data;
            setMembers(pageData.data);
            setTotalPages(pageData.totalPages);
        } catch (error) {
            console.error("Lỗi tải danh sách hội viên:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [page, keyword]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setKeyword(searchInput);
    };

    // 2. KHÓA / MỞ KHÓA TÀI KHOẢN
    const handleToggleLock = async (id, currentStatus) => {
        const actionText = currentStatus === 'ACTIVE' ? 'KHÓA' : 'MỞ KHÓA';
        if (window.confirm(`Bạn có chắc muốn ${actionText} tài khoản này?`)) {
            try {
                await axiosClient.patch(`/admin/members/${id}/toggle-lock`);
                fetchMembers();
            } catch (error) {
                console.error("Lỗi khóa tài khoản:", error);
                alert("Đã xảy ra lỗi, vui lòng thử lại!");
            }
        }
    };

    // 3. MỞ MODAL (Cho cả THÊM và SỬA)
    const openModal = (member = null) => {
        if (member) {
            // Chế độ SỬA
            setEditingId(member.id);
            setFormData({
                fullName: member.fullName || '',
                email: member.email || '',
                phone: member.phone || ''
            });
        } else {
            // Chế độ THÊM MỚI
            setEditingId(null);
            setFormData({
                fullName: '',
                email: '',
                phone: ''
            });
        }
        setIsModalOpen(true);
    };

    // 4. SUBMIT FORM (CREATE / UPDATE)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Gọi API Update
                await axiosClient.put(`/admin/members/${editingId}`, formData);
                alert("Cập nhật thông tin hội viên thành công!");
            } else {
                // Gọi API Create
                await axiosClient.post(`/admin/members`, formData);
                alert("Thêm hội viên mới thành công!");
            }
            setIsModalOpen(false);
            fetchMembers(); // Load lại bảng
        } catch (error) {
            console.error("Lỗi lưu dữ liệu:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi lưu!");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Users className="text-blue-600" /> Quản Lý Hội Viên
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Tra cứu thông tin và quản lý trạng thái tài khoản khách hàng</p>
                    </div>
                    {/* NÚT THÊM HỘI VIÊN MỚI ĐÂY RỒI! */}
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <UserPlus size={20} /> Thêm Hội Viên
                    </button>
                </div>

                {/* Thanh công cụ: Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 border border-gray-100 flex justify-between items-center">
                    <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Tìm theo tên, email hoặc SĐT..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                        </div>
                        <button type="submit" className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 transition-colors font-medium">
                            Tìm kiếm
                        </button>
                    </form>
                    <div className="text-sm text-gray-500 font-medium">
                        Tổng số: <span className="text-blue-600 font-bold">{members.length}</span> hội viên
                    </div>
                </div>

                {/* Bảng Dữ Liệu */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                                <th className="p-4 font-semibold">Hội viên</th>
                                <th className="p-4 font-semibold">Liên hệ</th>
                                <th className="p-4 font-semibold">Ngày tham gia</th>
                                <th className="p-4 font-semibold text-center">Trạng thái</th>
                                <th className="p-4 font-semibold text-center">Hành động</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Đang tải dữ liệu...</td></tr>
                            ) : members.length === 0 ? (
                                <tr><td colSpan="5" className="text-center p-8 text-gray-500">Không tìm thấy hội viên nào.</td></tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                    {member.fullName ? member.fullName.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800">{member.fullName}</div>
                                                    <div className="text-xs text-gray-500">ID: #{member.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1 text-sm text-gray-600">
                                                <span className="flex items-center gap-1"><Mail size={14} /> {member.email}</span>
                                                <span className="flex items-center gap-1"><Phone size={14} /> {member.phone || 'Chưa cập nhật'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm">
                                            {member.joinDate}
                                        </td>
                                        <td className="p-4 text-center">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                    member.status === 'ACTIVE'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {member.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
                                                </span>
                                        </td>
                                        <td className="p-4 text-center flex justify-center gap-2">
                                            {/* Nút Edit */}
                                            <button
                                                onClick={() => openModal(member)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                                title="Chỉnh sửa thông tin"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            {/* Nút Khóa */}
                                            <button
                                                onClick={() => handleToggleLock(member.id, member.status)}
                                                className={`p-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium ${
                                                    member.status === 'ACTIVE'
                                                        ? 'text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200'
                                                        : 'text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200'
                                                }`}
                                                title={member.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                            >
                                                {member.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân trang */}
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Trang <span className="font-semibold text-gray-800">{page}</span> / {totalPages > 0 ? totalPages : 1}
                        </span>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL THÊM MỚI / CẬP NHẬT THÔNG TIN HỘI VIÊN */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                            {editingId ? <UserCog className="text-blue-600" /> : <UserPlus className="text-blue-600" />}
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingId ? 'Cập Nhật Hồ Sơ Hội Viên' : 'Thêm Hội Viên Mới'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        placeholder="Nhập họ và tên..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        placeholder="Ví dụ: 0901234567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder="Ví dụ: nva@gmail.com"
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                                >
                                    {editingId ? 'Lưu Thay Đổi' : 'Thêm Hội Viên'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}