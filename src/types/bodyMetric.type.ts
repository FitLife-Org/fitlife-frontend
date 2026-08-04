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

export interface CreateMyBodyMetricRequest {
    weightKg: number;

    /**
     * Lần đo đầu tiên bắt buộc có chiều cao.
     * Những lần sau có thể bỏ trống để backend dùng chiều cao gần nhất.
     */
    heightCm?: number;

    bodyFatPercent?: number;
    muscleMassKg?: number;

    note?: string;

    /**
     * Nếu không truyền, backend dùng thời điểm hiện tại.
     */
    recordedAt?: string;
}

export interface BodyMetricHistoryParams {
    from: string;
    to: string;
}

export interface BodyMetricListParams {
    page?: number;
    size?: number;
    sort?: string;
}

export interface BodyMetricFormState {
    weightKg: string;
    heightCm: string;
    bodyFatPercent: string;
    muscleMassKg: string;
    note: string;
    recordedAt: string;
}

export interface BodyMetricChartPoint {
    id: number;
    label: string;
    recordedAt: string;
    weightKg: number;
    bmi: number;
    bodyFatPercent?: number | null;
    muscleMassKg?: number | null;
}

export type BmiLevel =
    | "UNDERWEIGHT"
    | "NORMAL"
    | "OVERWEIGHT"
    | "OBESE";