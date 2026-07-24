import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { staffCheckinService } from "../../services/checkinService";
import type { CheckinRecord, MemberLookupResult } from "../../types/checkin.type";

export function useStaffCheckinLogic() {
  const [activeTab, setActiveTab] = useState<"SCAN" | "MANUAL" | "STATIC">("MANUAL");
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
      const data = await staffCheckinService.getMembersCurrentlyInside();
      setActiveMembers(data);
    } catch (e) {
      console.error("Failed to load active members:", e);
    }
  };

  const fetchRecentCheckins = async () => {
    try {
      const data = await staffCheckinService.getCheckinHistory();
      setRecentCheckins(data.slice(0, 5));
    } catch (e) {
      console.error("Failed to load recent checkins:", e);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Vui lòng nhập mã thẻ hoặc SĐT.");
      return;
    }
    
    setIsSearching(true);
    try {
      const result = await staffCheckinService.lookupMember(searchQuery);
      
      setSearchResults([result]);
      setSelectedMember(result);
    } catch {
      toast.error("Không tìm thấy hội viên nào.");
      setSearchResults([]);
      setSelectedMember(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualConfirm = async () => {
    if (!selectedMember) {
      toast.error("Vui lòng chọn một hội viên.");
      return;
    }
    
    if (selectedMember.currentSubscription?.status !== "ACTIVE") {
      toast.error("Gói tập đã hết hạn, không thể check-in.");
      return;
    }

    try {
      setIsCheckingIn(true);
      await staffCheckinService.manualCheckin({ 
        memberId: selectedMember.memberId,
        memberCode: selectedMember.memberCode,
        reason: "Manual Check-in via Staff UI" 
      });
      toast.success(`Check-in thành công: ${selectedMember.fullName}`);
      setSelectedMember(null);
      setSearchQuery("");
      setSearchResults([]);
      await fetchRecentCheckins();
      await fetchActiveMembers();
    } catch (error: unknown) {
      const msg = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      toast.error(msg || "Check-in thất bại.");
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
    handleManualConfirm
  };
}
