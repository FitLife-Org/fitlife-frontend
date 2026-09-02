import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { MemberTimelinePage } from "../types/memberTimeline.type";
const data=<T>(r:ApiResponse<T>):T=>{if(r.data==null) throw new Error("Không nhận được timeline.");return r.data};
export const memberTimelineService={
 async getMyTimeline(page=0,size=20){const r=await apiClient.get<ApiResponse<MemberTimelinePage>>("/members/me/timeline",{params:{page,size,sort:"occurredAt,desc"}});return data(r.data);},
 async getAdminTimeline(memberId:number,page=0,size=20){const r=await apiClient.get<ApiResponse<MemberTimelinePage>>(`/admin/members/${memberId}/timeline`,{params:{page,size,sort:"occurredAt,desc"}});return data(r.data);}
};
