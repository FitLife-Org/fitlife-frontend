export interface BodyMetric {
    id: number;

    memberId: number;
    memberCode?: string | null;

    fullName?: string | null;
    email?: string | null;
    phone?: string | null;

    weightKg: number;
    heightCm: number;
    bmi: number;

    bodyFatPercent?: number | null;
    muscleMassKg?: number | null;

    note?: string | null;

    recordedAt: string;

    createdById?: number | null;
    createdByName?: string | null;

    isDeleted?: boolean;

    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface BodyMetricSummary {
    id: number;

    memberId: number;
    memberCode?: string | null;
    fullName?: string | null;

    weightKg: number;
    heightCm: number;
    bmi: number;

    recordedAt: string;
}

export interface BodyMetricCreateRequest {
    memberId: number;

    weightKg: number;
    heightCm: number;

    bodyFatPercent?: number;
    muscleMassKg?: number;

    note?: string;
    recordedAt?: string;
}

export interface BodyMetricUpdateRequest {
    weightKg?: number;
    heightCm?: number;

    bodyFatPercent?: number | null;
    muscleMassKg?: number | null;

    note?: string | null;
    recordedAt?: string;
}

export interface MyBodyMetricCreateRequest {
    weightKg: number;
    heightCm?: number;

    bodyFatPercent?: number;
    muscleMassKg?: number;

    note?: string;
}

export type BodyMetricName =
    | "weightKg"
    | "bodyFatPercent"
    | "muscleMassKg"
    | "bmi";

export type BodyMetricTrend =
    | "up"
    | "down"
    | "stable";

export interface BodyMetricProgress {
    metric: BodyMetricName;

    startValue: number;
    currentValue: number;
    change: number;

    trend: BodyMetricTrend;
}

export interface BodyMetricSearchParams {
    memberId?: number;
    keyword?: string;

    from?: string;
    to?: string;

    page?: number;
    size?: number;
}