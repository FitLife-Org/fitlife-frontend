import type { CheckinRecord, CheckInTodayStatisticsResponse } from "../../types/checkin.type";

const CHECKIN_STORAGE_KEY = "fitlife_checkin_history_v1";

const DEFAULT_INITIAL_HISTORY: CheckinRecord[] = [
  {
    id: 101,
    memberId: 1,
    memberName: "Nguyễn Tuấn Khoa",
    memberCode: "MEM001",
    checkInTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    checkOutTime: new Date(Date.now() - 3600000 * 1).toISOString(),
    status: "SUCCESS",
    type: "CHECK_IN",
    note: "Tự quét QR thành công"
  },
  {
    id: 100,
    memberId: 1,
    memberName: "Nguyễn Tuấn Khoa",
    memberCode: "MEM001",
    checkInTime: new Date(Date.now() - 86400000).toISOString(),
    checkOutTime: new Date(Date.now() - 86400000 + 5400000).toISOString(),
    status: "SUCCESS",
    type: "CHECK_IN",
    note: "Check-in lễ tân"
  }
];

export function getStoredCheckinHistory(): CheckinRecord[] {
  try {
    const raw = localStorage.getItem(CHECKIN_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_HISTORY));
      return DEFAULT_INITIAL_HISTORY;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading checkin history from localStorage:", e);
    return DEFAULT_INITIAL_HISTORY;
  }
}

export function saveCheckinHistoryToStorage(history: CheckinRecord[]): void {
  try {
    localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Error saving checkin history to localStorage:", e);
  }
}

export function addCheckinRecordToStorage(record: Omit<CheckinRecord, "id">): CheckinRecord {
  const current = getStoredCheckinHistory();
  const newRecord: CheckinRecord = {
    ...record,
    id: Date.now()
  };
  const updated = [newRecord, ...current];
  saveCheckinHistoryToStorage(updated);
  return newRecord;
}

export function checkoutMemberInStorage(memberId: number): CheckinRecord | null {
  const history = getStoredCheckinHistory();
  const index = history.findIndex(r => r.memberId === memberId && !r.checkOutTime && r.status === "SUCCESS");
  if (index !== -1) {
    history[index] = {
      ...history[index],
      checkOutTime: new Date().toISOString(),
      type: "CHECK_OUT"
    };
    saveCheckinHistoryToStorage(history);
    return history[index];
  }
  return null;
}

export function getMembersCurrentlyInsideFromStorage(): CheckinRecord[] {
  const history = getStoredCheckinHistory();
  return history.filter(r => r.status === "SUCCESS" && !r.checkOutTime);
}

export function getTodayStatisticsFromStorage(): CheckInTodayStatisticsResponse {
  const history = getStoredCheckinHistory();
  const today = new Date().toDateString();
  const todayRecords = history.filter(r => new Date(r.checkInTime).toDateString() === today);
  
  return {
    totalCheckIns: todayRecords.length,
    successfulCheckIns: todayRecords.filter(r => r.status === "SUCCESS").length,
    failedCheckIns: todayRecords.filter(r => r.status === "FAILED").length
  };
}
