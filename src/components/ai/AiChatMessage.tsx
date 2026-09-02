import {
    Bot,
    User,
} from "lucide-react";

import AiFeedbackForm from "./AiFeedbackForm";
import AiPlanViewer from "./AiPlanViewer";

import {
    aiService,
} from "../../services/aiService";

import type {
    AiChatMessageModel,
    AiSuggestionDetailResponse,
} from "../../types/ai.type";

interface AiChatMessageProps {
    message:
        AiChatMessageModel;

    onSuggestionChanged?: (
        suggestion:
        AiSuggestionDetailResponse,
    ) => void;
}

export default function AiChatMessage({
                                          message,
                                          onSuggestionChanged,
                                      }: AiChatMessageProps) {
    const isUser =
        message.sender ===
        "user";

    const suggestion =
        message.suggestionDetail;

    const reloadSuggestion =
        async (): Promise<void> => {
            if (!suggestion) {
                return;
            }

            const updated =
                await aiService
                    .getAiSuggestionDetail(
                        suggestion.id,
                    );

            onSuggestionChanged?.(
                updated,
            );
        };

    return (
        <article
            className={`
        flex
        w-full
        max-w-5xl
        gap-3
        sm:gap-4

        ${
                isUser
                    ? "ml-auto flex-row-reverse"
                    : ""
            }
      `}
        >
            <div
                className={`
          mt-1
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          text-white
          shadow-sm

          ${
                    isUser
                        ? "bg-slate-950"
                        : "bg-gradient-to-br from-emerald-500 to-violet-600"
                }
        `}
            >
                {isUser ? (
                    <User className="h-4 w-4" />
                ) : (
                    <Bot className="h-4 w-4" />
                )}
            </div>

            <div
                className={`
          min-w-0
          flex-1
          space-y-2

          ${
                    isUser
                        ? "text-right"
                        : ""
                }
        `}
            >
                <div
                    className={`
            inline-block
            max-w-2xl
            rounded-2xl
            px-4
            py-3
            text-left
            text-sm
            leading-6

            ${
                        isUser
                            ? "rounded-tr-md bg-slate-950 text-white shadow-md"
                            : "rounded-tl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                    }
          `}
                >
                    <p className="whitespace-pre-wrap">
                        {message.text}
                    </p>
                </div>

                {suggestion && (
                    <div className="mt-4 text-left">
                        <AiPlanViewer
                            suggestion={
                                suggestion
                            }
                            onChanged={
                                onSuggestionChanged
                            }
                        />

                        {suggestion.status ===
                            "SUCCESS" &&
                            !suggestion.feedback && (
                                <AiFeedbackForm
                                    suggestionId={
                                        suggestion.id
                                    }
                                    onSubmitted={() => {
                                        void reloadSuggestion();
                                    }}
                                />
                            )}
                    </div>
                )}

                <p
                    className="
            px-2
            text-[10px]
            font-semibold
            text-slate-400
          "
                >
                    {message.timestamp}
                </p>
            </div>
        </article>
    );
}