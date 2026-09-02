import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { aiService } from "../services/aiService";
import type {
    AiUsageTodayResponse,
} from "../types/ai.type";

export function useAiUsage() {
    const [usage, setUsage] =
        useState<AiUsageTodayResponse | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const loadUsage = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result =
                { used: 0, dailyLimit: 5, remaining: 5, resetAt: new Date().toISOString() };

            setUsage(result);
        } catch (requestError) {
            const message =
                requestError instanceof Error
                    ? requestError.message
                    : "Không thể tải lượt sử dụng AI.";

            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadUsage();
    }, [loadUsage]);

    return {
        usage,
        loading,
        error,
        reload: loadUsage,
    };
}