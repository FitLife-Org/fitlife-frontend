import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    bodyMetricService,
} from "../services/bodyMetricService";

import {
    showAlert,
} from "../utils/alert";

import {
    getApiErrorMessage,
} from "../utils/apiError";

import type {
    BmiLevel,
    BodyMetric,
    BodyMetricChartPoint,
    BodyMetricFormState,
    CreateMyBodyMetricRequest,
} from "../types/bodyMetric.type";

const INITIAL_FORM:
    BodyMetricFormState = {
    weightKg: "",
    heightCm: "",
    bodyFatPercent: "",
    muscleMassKg: "",
    note: "",
    recordedAt: "",
};

function toNumberOrUndefined(
    value: string,
): number | undefined {
    const normalized =
        value.trim();

    if (!normalized) {
        return undefined;
    }

    const parsed =
        Number(normalized);

    return Number.isFinite(parsed)
        ? parsed
        : undefined;
}

function toLocalDateTime(
    value: string,
): string | undefined {
    if (!value) {
        return undefined;
    }

    /*
     * Input datetime-local thường trả:
     * YYYY-MM-DDTHH:mm
     *
     * Backend nhận ISO LocalDateTime.
     */
    return value.length === 16
        ? `${value}:00`
        : value;
}

function getDefaultHistoryRange(): {
    from: string;
    to: string;
} {
    const now = new Date();

    const from =
        new Date(now);

    from.setMonth(
        from.getMonth() - 6,
    );

    const toLocalIso = (
        value: Date,
    ): string => {
        const offset =
            value.getTimezoneOffset() *
            60_000;

        return new Date(
            value.getTime() - offset,
        )
            .toISOString()
            .slice(0, 19);
    };

    return {
        from:
            toLocalIso(from),

        to:
            toLocalIso(now),
    };
}

export function getBmiLevel(
    bmi?: number | null,
): BmiLevel | null {
    if (
        bmi === undefined ||
        bmi === null ||
        !Number.isFinite(bmi)
    ) {
        return null;
    }

    if (bmi < 18.5) {
        return "UNDERWEIGHT";
    }

    if (bmi < 25) {
        return "NORMAL";
    }

    if (bmi < 30) {
        return "OVERWEIGHT";
    }

    return "OBESE";
}

export function getBmiLabel(
    level: BmiLevel | null,
): string {
    switch (level) {
        case "UNDERWEIGHT":
            return "Thiếu cân";

        case "NORMAL":
            return "Bình thường";

        case "OVERWEIGHT":
            return "Thừa cân";

        case "OBESE":
            return "Béo phì";

        default:
            return "Chưa xác định";
    }
}

export function useBodyMetric() {
    const [
        metrics,
        setMetrics,
    ] = useState<BodyMetric[]>([]);

    const [
        latestMetric,
        setLatestMetric,
    ] =
        useState<BodyMetric | null>(
            null,
        );

    const [
        history,
        setHistory,
    ] = useState<BodyMetric[]>([]);

    const [
        formData,
        setFormData,
    ] =
        useState<BodyMetricFormState>(
            INITIAL_FORM,
        );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        formOpen,
        setFormOpen,
    ] = useState(false);

    const [
        currentPage,
        setCurrentPage,
    ] = useState(0);

    const [
        totalPages,
        setTotalPages,
    ] = useState(0);

    const pageSize = 10;

    const loadMetrics =
        useCallback(
            async (
                page = 0,
            ): Promise<void> => {
                const result =
                    await bodyMetricService
                        .getMyBodyMetrics({
                            page,
                            size: pageSize,
                            sort:
                                "recordedAt,desc",
                        });

                setMetrics(
                    result.content,
                );

                setCurrentPage(
                    result.page,
                );

                setTotalPages(
                    result.totalPages,
                );
            },
            [],
        );

    const loadLatest =
        useCallback(
            async (): Promise<void> => {
                try {
                    const result =
                        await bodyMetricService
                            .getLatestMyBodyMetric();

                    setLatestMetric(
                        result,
                    );
                } catch (
                    error: unknown
                    ) {
                    /*
                     * Member mới chưa có metric là empty state,
                     * không phải lỗi làm hỏng toàn trang.
                     */
                    console.warn(
                        "LOAD_LATEST_BODY_METRIC_ERROR:",
                        error,
                    );

                    setLatestMetric(
                        null,
                    );
                }
            },
            [],
        );

    const loadHistory =
        useCallback(
            async (): Promise<void> => {
                try {
                    const range =
                        getDefaultHistoryRange();

                    const result =
                        await bodyMetricService
                            .getMyBodyMetricHistory(
                                range,
                            );

                    setHistory(
                        result,
                    );
                } catch (
                    error: unknown
                    ) {
                    console.warn(
                        "LOAD_BODY_METRIC_HISTORY_ERROR:",
                        error,
                    );

                    setHistory([]);
                }
            },
            [],
        );

    const loadAll =
        useCallback(
            async (): Promise<void> => {
                try {
                    setLoading(true);

                    await Promise.all([
                        loadMetrics(0),
                        loadLatest(),
                        loadHistory(),
                    ]);
                } catch (
                    error: unknown
                    ) {
                    console.error(
                        "LOAD_BODY_METRIC_PAGE_ERROR:",
                        error,
                    );

                    await showAlert.error(
                        "Không thể tải dữ liệu",
                        getApiErrorMessage(
                            error,
                        ),
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                loadHistory,
                loadLatest,
                loadMetrics,
            ],
        );

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    const setField = <
        K extends keyof BodyMetricFormState,
    >(
        field: K,
        value:
        BodyMetricFormState[K],
    ): void => {
        setFormData(
            (previous) => ({
                ...previous,
                [field]: value,
            }),
        );
    };

    const resetForm = (): void => {
        setFormData(
            INITIAL_FORM,
        );
    };

    const openCreateForm = (): void => {
        setFormData({
            ...INITIAL_FORM,

            heightCm:
                latestMetric?.heightCm
                    ? String(
                        latestMetric.heightCm,
                    )
                    : "",
        });

        setFormOpen(true);
    };

    const closeCreateForm = (): void => {
        if (saving) {
            return;
        }

        setFormOpen(false);
        resetForm();
    };

    const validateForm =
        (): string | null => {
            const weight =
                toNumberOrUndefined(
                    formData.weightKg,
                );

            const height =
                toNumberOrUndefined(
                    formData.heightCm,
                );

            const bodyFat =
                toNumberOrUndefined(
                    formData.bodyFatPercent,
                );

            const muscleMass =
                toNumberOrUndefined(
                    formData.muscleMassKg,
                );

            if (
                weight === undefined
            ) {
                return "Vui lòng nhập cân nặng.";
            }

            if (
                weight < 20 ||
                weight > 300
            ) {
                return "Cân nặng phải từ 20 đến 300 kg.";
            }

            /*
             * Lần đầu chưa có latest metric thì chiều cao bắt buộc.
             */
            if (
                !latestMetric &&
                height === undefined
            ) {
                return "Lần đo đầu tiên phải nhập chiều cao.";
            }

            if (
                height !== undefined &&
                (
                    height < 50 ||
                    height > 250
                )
            ) {
                return "Chiều cao phải từ 50 đến 250 cm.";
            }

            if (
                bodyFat !== undefined &&
                (
                    bodyFat < 0 ||
                    bodyFat > 80
                )
            ) {
                return "Tỷ lệ mỡ phải từ 0 đến 80%.";
            }

            if (
                muscleMass !== undefined &&
                (
                    muscleMass < 0 ||
                    muscleMass > 200
                )
            ) {
                return "Khối lượng cơ phải từ 0 đến 200 kg.";
            }

            if (
                formData.note.length >
                1000
            ) {
                return "Ghi chú không được vượt quá 1000 ký tự.";
            }

            if (
                formData.recordedAt
            ) {
                const recordedDate =
                    new Date(
                        formData.recordedAt,
                    );

                if (
                    Number.isNaN(
                        recordedDate.getTime(),
                    )
                ) {
                    return "Thời gian đo không hợp lệ.";
                }

                if (
                    recordedDate >
                    new Date()
                ) {
                    return "Thời gian đo không được ở tương lai.";
                }
            }

            return null;
        };

    const createMetric =
        async (): Promise<void> => {
            const validationMessage =
                validateForm();

            if (
                validationMessage
            ) {
                await showAlert.warning(
                    "Dữ liệu chưa hợp lệ",
                    validationMessage,
                );

                return;
            }

            const request:
                CreateMyBodyMetricRequest = {
                weightKg:
                    Number(
                        formData.weightKg,
                    ),

                ...(formData.heightCm.trim()
                    ? {
                        heightCm:
                            Number(
                                formData.heightCm,
                            ),
                    }
                    : {}),

                ...(formData.bodyFatPercent
                    .trim()
                    ? {
                        bodyFatPercent:
                            Number(
                                formData
                                    .bodyFatPercent,
                            ),
                    }
                    : {}),

                ...(formData.muscleMassKg
                    .trim()
                    ? {
                        muscleMassKg:
                            Number(
                                formData
                                    .muscleMassKg,
                            ),
                    }
                    : {}),

                ...(formData.note.trim()
                    ? {
                        note:
                            formData.note.trim(),
                    }
                    : {}),

                ...(formData.recordedAt
                    ? {
                        recordedAt:
                            toLocalDateTime(
                                formData.recordedAt,
                            ),
                    }
                    : {}),
            };

            try {
                setSaving(true);

                await bodyMetricService
                    .createMyBodyMetric(
                        request,
                    );

                await Promise.all([
                    loadMetrics(0),
                    loadLatest(),
                    loadHistory(),
                ]);

                setFormOpen(false);
                resetForm();

                await showAlert.success(
                    "Thành công",
                    "Đã ghi nhận chỉ số cơ thể mới.",
                );
            } catch (
                error: unknown
                ) {
                console.error(
                    "CREATE_BODY_METRIC_ERROR:",
                    error,
                );

                await showAlert.error(
                    "Không thể lưu chỉ số",
                    getApiErrorMessage(
                        error,
                    ),
                );
            } finally {
                setSaving(false);
            }
        };

    const changePage =
        async (
            page: number,
        ): Promise<void> => {
            if (
                page < 0 ||
                (
                    totalPages > 0 &&
                    page >= totalPages
                )
            ) {
                return;
            }

            try {
                setLoading(true);

                await loadMetrics(
                    page,
                );
            } catch (
                error: unknown
                ) {
                await showAlert.error(
                    "Không thể tải trang",
                    getApiErrorMessage(
                        error,
                    ),
                );
            } finally {
                setLoading(false);
            }
        };

    const chartData =
        useMemo<
            BodyMetricChartPoint[]
        >(
            () =>
                [...history]
                    .sort(
                        (
                            first,
                            second,
                        ) =>
                            new Date(
                                first.recordedAt,
                            ).getTime() -
                            new Date(
                                second.recordedAt,
                            ).getTime(),
                    )
                    .map(
                        (metric) => ({
                            id:
                            metric.id,

                            label:
                                new Date(
                                    metric.recordedAt,
                                )
                                    .toLocaleDateString(
                                        "vi-VN",
                                        {
                                            day: "2-digit",
                                            month: "2-digit",
                                        },
                                    ),

                            recordedAt:
                            metric.recordedAt,

                            weightKg:
                            metric.weightKg,

                            bmi:
                            metric.bmi,

                            bodyFatPercent:
                            metric.bodyFatPercent,

                            muscleMassKg:
                            metric.muscleMassKg,
                        }),
                    ),
            [history],
        );

    const bmiLevel =
        useMemo(
            () =>
                getBmiLevel(
                    latestMetric?.bmi,
                ),
            [
                latestMetric?.bmi,
            ],
        );

    return {
        metrics,
        latestMetric,
        chartData,

        formData,
        formOpen,

        loading,
        saving,

        currentPage,
        totalPages,

        bmiLevel,
        bmiLabel:
            getBmiLabel(
                bmiLevel,
            ),

        setField,

        openCreateForm,
        closeCreateForm,
        createMetric,

        changePage,

        reload:
        loadAll,
    };
}