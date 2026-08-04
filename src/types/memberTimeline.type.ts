import type { PageResponse } from "./common.type";
export type MemberTimelineType="MEMBER_PROFILE"|"SUBSCRIPTION"|"INVOICE"|"PAYMENT"|"CHECKIN"|"BODY_METRIC"|"AI_SUGGESTION"|"WORKOUT"|"NUTRITION"|"SYSTEM";
export interface MemberTimelineItem { id:number; memberId:number; type:MemberTimelineType; title:string; description?:string|null; referenceId?:number|null; referenceType?:string|null; status?:string|null; occurredAt:string; createdAt:string; }
export type MemberTimelinePage=PageResponse<MemberTimelineItem>;
