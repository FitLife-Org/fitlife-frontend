import { useEffect, useState } from "react";
import { Eye, Loader2, BrainCircuit } from "lucide-react";

import { usePageAnimation } from "../../../hooks/usePageAnimation";
import { aiService } from "../../../services/aiService";
import type { AiSuggestionResponse, AiSuggestionDetailResponse } from "../../../types/ai.type";
import type { PageResponse } from "../../../types/common.type";
import { showAlert } from "../../../utils/alert";
import { formatDate } from "../../../utils/formatDate";

import Card from "../../../components/common/Card";
import Table from "../../../components/common/Table";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import Loading from "../../../components/common/Loading";

export default function AdminAiSuggestionPage() {
  const containerRef = usePageAnimation();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PageResponse<AiSuggestionResponse> | null>(null);
  const [page, setPage] = useState(0);

  // Detail Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<AiSuggestionDetailResponse | null>(null);

  const fetchSuggestions = async (pageIndex = 0) => {
    try {
      setLoading(true);
      const res = await aiService.getAdminAiSuggestions(pageIndex, 10);
      setData(res);
      setPage(pageIndex);
    } catch (error) {
      console.error("GET_AI_SUGGESTIONS_ERROR:", error);
      showAlert.error("Lỗi", "Không thể tải danh sách AI Suggestion");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions(0);
  }, []);

  const handleViewDetail = async (id: number) => {
    setModalOpen(true);
    try {
      setDetailLoading(true);
      const res = await aiService.getAdminAiSuggestionDetail(id);
      setSelectedDetail(res);
    } catch (error) {
      console.error("GET_DETAIL_ERROR:", error);
      showAlert.error("Lỗi", "Không thể tải chi tiết gợi ý AI");
      setModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "SUCCESS":
      case "APPLIED":
        return "success";
      case "PENDING":
        return "warning";
      case "FAILED":
        return "danger";
      default:
        return "default";
    }
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "FULL_PLAN":
        return "purple";
      case "WORKOUT_PLAN":
        return "info";
      case "NUTRITION_PLAN":
        return "success";
      case "BODY_ANALYSIS":
        return "warning";
      default:
        return "default";
    }
  };

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (row: AiSuggestionResponse) => <span className="font-mono text-sm text-slate-500">#{row.id}</span>,
    },
    {
      key: "member",
      header: "Hội viên",
      render: (row: AiSuggestionResponse) => (
        <div>
          <p className="font-bold text-slate-800">{row.memberName || "Khách"}</p>
          <span className="text-xs text-slate-500">{row.memberCode || "-"}</span>
        </div>
      ),
    },
    {
      key: "suggestionType",
      header: "Loại yêu cầu",
      render: (row: AiSuggestionResponse) => (
        <Badge variant={getTypeVariant(row.suggestionType)}>{row.suggestionType}</Badge>
      ),
    },
    {
      key: "goal",
      header: "Mục tiêu",
      render: (row: AiSuggestionResponse) => (
        <span className="text-sm font-medium text-slate-600">{row.goal || "-"}</span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: AiSuggestionResponse) => (
        <Badge variant={getStatusVariant(row.status)}>{row.status}</Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Thời gian",
      render: (row: AiSuggestionResponse) => (
        <span className="text-sm text-slate-600">
          {row.createdAt ? formatDate(row.createdAt) : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: AiSuggestionResponse) => (
        <button
          onClick={() => handleViewDetail(row.id)}
          className="p-2 text-fit-primary hover:bg-fit-primary/10 rounded-lg transition-colors"
          title="Xem chi tiết"
        >
          <Eye className="w-5 h-5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl border border-purple-500/20 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
              Lịch sử AI Suggestion
            </h2>
            <p className="text-slate-600 text-sm mt-1 font-medium">
              Giám sát và kiểm tra các yêu cầu tư vấn AI từ hội viên
            </p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-0 ring-1 ring-slate-200 shadow-xl shadow-slate-200/40 rounded-2xl bg-white/80 backdrop-blur-xl">
        {loading ? (
          <Loading label="Đang tải danh sách gợi ý..." />
        ) : (
          <>
            <Table columns={columns} data={data?.content || []} />
            {data && data.totalPages > 1 && (
              <div className="flex justify-center gap-2 p-4 border-t border-slate-100 bg-slate-50/50">
                <Button
                  variant="outline"
                  onClick={() => fetchSuggestions(page - 1)}
                  disabled={page === 0}
                  className="px-4 py-2"
                >
                  Trang trước
                </Button>
                <span className="flex items-center px-4 font-medium text-slate-600">
                  {page + 1} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => fetchSuggestions(page + 1)}
                  disabled={page >= data.totalPages - 1}
                  className="px-4 py-2"
                >
                  Trang sau
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedDetail(null);
        }}
        title="Chi tiết Tư vấn AI"
      >
        {detailLoading ? (
          <Loading label="Đang tải chi tiết..." />
        ) : selectedDetail ? (
          <div className="space-y-6 pb-4">
            <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-slate-500 mb-1">Hội viên</p>
                <p className="font-bold text-slate-900">{selectedDetail.memberName}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Yêu cầu</p>
                <p className="font-bold text-purple-600">{selectedDetail.suggestionType}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Mục tiêu</p>
                <p className="font-medium text-slate-800">{selectedDetail.goal || "Không rõ"}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Trạng thái</p>
                <Badge variant={getStatusVariant(selectedDetail.status)}>{selectedDetail.status}</Badge>
              </div>
            </div>

            {selectedDetail.userNote && (
              <div>
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  Ghi chú của người dùng
                </h4>
                <div className="bg-blue-50 text-blue-900 p-4 rounded-xl text-sm italic">
                  "{selectedDetail.userNote}"
                </div>
              </div>
            )}

            <div>
              <h4 className="font-bold text-slate-900 mb-2">Phản hồi tóm tắt từ AI</h4>
              <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 border border-slate-200 max-h-60 overflow-y-auto whitespace-pre-wrap">
                {selectedDetail.aiResponse?.summary || selectedDetail.summary || "Không có tóm tắt."}
              </div>
            </div>

            {selectedDetail.aiResponse?.warnings && selectedDetail.aiResponse.warnings.length > 0 && (
              <div>
                <h4 className="font-bold text-red-600 mb-2">Cảnh báo</h4>
                <ul className="list-disc list-inside bg-red-50 text-red-700 p-4 rounded-xl text-sm space-y-1">
                  {selectedDetail.aiResponse.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedDetail.errorMessage && (
              <div>
                <h4 className="font-bold text-red-600 mb-2">Lỗi (Error)</h4>
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm">
                  <span className="font-bold">Code:</span> {selectedDetail.errorCode} <br/>
                  <span className="font-bold">Message:</span> {selectedDetail.errorMessage}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500">Không tìm thấy dữ liệu.</div>
        )}
      </Modal>
    </div>
  );
}
