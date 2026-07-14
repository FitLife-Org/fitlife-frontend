import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { checkinService } from "../../services/checkinService";
import type { CheckinRecord, MemberLookupResult } from "../../types/checkin.type";

export function useStaffCheckinLogic() {
  const [activeTab, setActiveTab] = useState<"SCAN" | "MANUAL" | "STATIC">("SCAN");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MemberLookupResult[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberLookupResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState<CheckinRecord[]>([]);
  const [activeMembers, setActiveMembers] = useState<CheckinRecord[]>([]);

  useEffect(() => {
    fetchRecentCheckins();
    fetchActiveMembers();
  }, []);

  const fetchActiveMembers = async () => {
    try {
      const data = await checkinService.getActiveMembers();
      setActiveMembers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRecentCheckins = async () => {
    try {
      const data = await checkinService.getCheckinHistory({ limit: 5 });
      setRecentCheckins(data.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Vui lòng nhập số điện thoại hoặc mã hội viên.");
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await checkinService.lookupMember(searchQuery);
      
      setSearchResults(results);
      if (results.length === 1) {
        setSelectedMember(results[0]);
      } else if (results.length === 0) {
        toast.error("Không tìm thấy hội viên nào.");
      }
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm hội viên.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleQrSuccess = async (decodedText: string) => {
    if (isCheckingIn) return; 

    try {
      setIsCheckingIn(true);
      const record = await checkinService.scanQr({ qrToken: decodedText });
      const actionName = record.type === "CHECK_OUT" ? "Check-out" : "Check-in";
      toast.success(`${actionName} thành công: ${record.memberName || 'Hội viên'}`);
      await fetchRecentCheckins();
      await fetchActiveMembers();
    } catch (error) {
      toast.error("Mã QR không hợp lệ hoặc đã hết hạn.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleManualConfirm = async () => {
    if (!selectedMember) {
      toast.error("Vui lòng chọn một hội viên.");
      return;
    }
    if (selectedMember.packageStatus !== "ACTIVE") {
      toast.error("Gói tập đã hết hạn, không thể check-in.");
      return;
    }

    try {
      setIsCheckingIn(true);
      const record = await checkinService.manualCheckin({ memberId: selectedMember.id, note: "Manual Check-in via Staff UI" });
      const actionName = record.type === "CHECK_OUT" ? "Check-out" : "Check-in";
      toast.success(`${actionName} thành công: ${selectedMember.fullName}`);
      setSelectedMember(null);
      setSearchQuery("");
      setSearchResults([]);
      await fetchRecentCheckins();
      await fetchActiveMembers();
    } catch (error) {
      toast.error("Check-in thất bại.");
    } finally {
      setIsCheckingIn(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedMember,
    setSelectedMember,
    isSearching,
    isCheckingIn,
    recentCheckins,
    activeMembers,
    handleSearch,
    handleQrSuccess,
    handleManualConfirm
  };
}
