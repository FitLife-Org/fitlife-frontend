import {
  useState,
} from "react";

import {
  CheckCircle2,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import toast from "react-hot-toast";

import Button from "../common/Button";

import { aiService } from "../../services/aiService";
import { getApiErrorMessage } from "../../utils/apiError";

import type {
  AiFeedbackResponse,
} from "../../types/ai.type";

interface AiFeedbackFormProps {
  suggestionId: number;
  onSubmitted?: (
    feedback: AiFeedbackResponse,
  ) => void;
}

export default function AiFeedbackForm({
  suggestionId,
  onSubmitted,
}: AiFeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [useful, setUseful] = useState<boolean | undefined>(
    undefined,
  );
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (rating < 1 || rating > 5) {
      toast.error("Vui lòng chọn mức đánh giá từ 1 đến 5 sao.");
      return;
    }

    if (comment.trim().length > 2000) {
      toast.error("Nhận xét không được vượt quá 2000 ký tự.");
      return;
    }

    try {
      setSubmitting(true);

      const feedback = await aiService.submitFeedback(
        suggestionId,
        {
          rating,
          useful,
          comment: comment.trim() || undefined,
        },
      );

      setSubmitted(true);
      onSubmitted?.(feedback);

      toast.success("Cảm ơn bạn đã đánh giá kết quả AI.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể gửi đánh giá AI.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        Đánh giá của bạn đã được ghi nhận.
      </div>
    );
  }

  const activeRating = hoverRating || rating;

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="font-black text-slate-900">
        Đánh giá kết quả AI
      </h4>

      <p className="mt-1 text-xs text-slate-500">
        Phản hồi giúp FitLife cải thiện chất lượng kế hoạch.
      </p>

      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            disabled={submitting}
            aria-label={`Đánh giá ${value} sao`}
            onMouseEnter={() => setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(value)}
            className="rounded-lg p-1 transition hover:bg-amber-50 disabled:cursor-not-allowed"
          >
            <Star
              className={`h-6 w-6 transition ${
                activeRating >= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-300"
              }`}
            />
          </button>
        ))}

        {rating > 0 && (
          <span className="ml-2 text-xs font-bold text-slate-500">
            {rating}/5
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm font-bold text-slate-700">
          Kết quả này có hữu ích không?
        </p>

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => setUseful(true)}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
              useful === true
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            Hữu ích
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => setUseful(false)}
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
              useful === false
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ThumbsDown className="h-4 w-4" />
            Chưa hữu ích
          </button>
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor={`ai-feedback-${suggestionId}`}
          className="mb-2 block text-sm font-bold text-slate-700"
        >
          Nhận xét thêm
        </label>

        <textarea
          id={`ai-feedback-${suggestionId}`}
          rows={3}
          maxLength={2000}
          disabled={submitting}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Điểm nào phù hợp hoặc cần cải thiện?"
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        <p className="mt-1 text-right text-[11px] text-slate-400">
          {comment.length}/2000
        </p>
      </div>

      <Button
        variant="primary"
        isLoading={submitting}
        loadingText="Đang gửi đánh giá..."
        onClick={handleSubmit}
        className="mt-3 w-full"
      >
        Gửi đánh giá
      </Button>
    </section>
  );
}
