import React, { useState, useEffect } from 'react';
import axiosClient from "../../api/axiosClient.js";
import { Users, Search, ChevronLeft, ChevronRight, Lock, Unlock, Mail, Phone } from 'lucide-react';

export default function AdminMember() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Phân trang & Tìm kiếm
    const [page, setPage] = useState(1);
    const [size] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // 1. GỌI API LẤY DANH SÁCH HỘI VIÊN
    const fetchMembers = async () => {
        setLoading(true);
        try {
            // Lưu ý: Backend cần có API này (GET /admin/members)
            const response = await axiosClient.get(`/admin/members?page=${page}&size=${size}&keyword=${keyword}`);
            const pageData = response.data;
            setMembers(pageData.data);
            setTotalPages(pageData.totalPages);
        } catch (error) {
            console.error("Lỗi tải danh sách hội viên:", error);
            // Giả lập data nếu BE chưa có API để em xem UI trước (XÓA ĐOẠN NÀY KHI CÓ API THẬT)
            setMembers([
                { id: 1, fullName: 'Nguyễn Văn A', email: 'nva@gmail.com', phone: '0901234567', status: 'ACTIVE', joinDate: '2026-03-01' },
                { id: 2, fullName: 'Trần Thị B', email: 'ttb@gmail.com', phone: '0987654321', status: 'BANNED', joinDate: '2026-03-10' }
            ]);
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

    // 2. XỬ LÝ KHÓA/MỞ KHÓA TÀI KHOẢN
    const handleToggleLock = async (id, currentStatus) => {
        const actionText = currentStatus === 'ACTIVE' ? 'KHÓA' : 'MỞ KHÓA';
        if (window.confirm(`Bạn có chắc muốn ${actionText} tài khoản này?`)) {
            try {
                // Backend cần có API này (PATCH /admin/members/{id}/toggle-lock)
                await axiosClient.patch(`/admin/members/${id}/toggle-lock`);
                fetchMembers();
            } catch (error) {
                console.error("Lỗi khóa tài khoản:", error);
                alert("Đã xảy ra lỗi, vui lòng thử lại!");
            }
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
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleToggleLock(member.id, member.status)}
                                                className={`p-2 rounded-lg transition-colors flex items-center justify-center mx-auto gap-2 text-sm font-medium ${
                                                    member.status === 'ACTIVE'
                                                        ? 'text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200'
                                                        : 'text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200'
                                                }`}
                                                title={member.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                            >
                                                {member.status === 'ACTIVE' ? <><Lock size={16} /> Khóa</> : <><Unlock size={16} /> Mở khóa</>}
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
        </div>
    );
}