import {
  Calendar,
  Edit2,
  Eye,
  Lock,
  Plus,
  Search,
  Unlock,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Loading from "../../components/common/Loading";
import Modal from "../../components/common/Modal";

import MemberTimeline from "../../components/member/MemberTimeline";

import { useMemberTimeline } from "../../hooks/useMemberTimeline";
import { usePageAnimation } from "../../hooks/usePageAnimation";
import { useUserManagement } from "../../hooks/useUserManagement";

import type {
  FitnessGoal,
  Gender,
  MemberProfile,
  MemberStatus,
} from "../../types/member.type";

/* ============================================================
 * STATUS
 * ============================================================ */

function renderStatusBadge(
    status: MemberStatus,
) {
  switch (status) {
    case "ACTIVE":
      return (
          <Badge variant="success">
            Hoạt động
          </Badge>
      );

    case "INACTIVE":
      return (
          <Badge variant="default">
            Ngưng hoạt động
          </Badge>
      );

    case "SUSPENDED":
      return (
          <Badge variant="danger">
            Bị khóa
          </Badge>
      );

    default:
      return (
          <Badge variant="default">
            {status}
          </Badge>
      );
  }
}

/* ============================================================
 * DISPLAY HELPERS
 * ============================================================ */

function getGenderLabel(
    gender?: Gender | null,
): string {
  switch (gender) {
    case "MALE":
      return "Nam";

    case "FEMALE":
      return "Nữ";

    case "OTHER":
      return "Khác";

    default:
      return "Chưa cập nhật";
  }
}

function getFitnessGoalLabel(
    goal?: FitnessGoal | null,
): string {
  switch (goal) {
    case "LOSE_WEIGHT":
      return "Giảm cân / giảm mỡ";

    case "GAIN_MUSCLE":
      return "Tăng cơ";

    case "MAINTAIN":
      return "Duy trì thể trạng";

    case "IMPROVE_HEALTH":
      return "Cải thiện sức khỏe";

    case "INCREASE_ENDURANCE":
      return "Tăng sức bền";

    default:
      return "Chưa cập nhật";
  }
}

function formatDate(
    value?: string | null,
): string {
  if (!value) {
    return "-";
  }

  /*
   * LocalDate từ Backend thường là YYYY-MM-DD.
   * Parse thủ công để tránh lệch ngày do timezone.
   */
  const parts =
      value.split("-");

  if (parts.length === 3) {
    const year =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    const day =
        Number(parts[2]);

    if (
        Number.isInteger(year) &&
        Number.isInteger(month) &&
        Number.isInteger(day)
    ) {
      return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
    }
  }

  return value;
}

/* ============================================================
 * PAGE
 * ============================================================ */

export default function UserManagementPage() {
  const containerRef =
      usePageAnimation();

  const {
    members,
    loading,

    searchTerm,
    statusFilter,

    setSearchTerm,
    setStatusFilter,

    detailModalOpen,
    setDetailModalOpen,

    showFormView,
    setShowFormView,

    selectedMember,

    detailTab,
    setDetailTab,

    memberSubscriptions,
    memberCheckins,

    detailLoading,

    isEditMode,

    formValues,
    setFormValues,

    formLoading,

    handleOpenDetail,
    handleOpenCreate,
    handleOpenEdit,
    handleFormSubmit,
    handleToggleStatus,

    totalCount,
    activeCount,
    
    
  } = useUserManagement();

  /* ========================================================
   * TIMELINE
   * ======================================================== */

  const {
    items:
        timelineItems,

    loading:
        timelineLoading,

    loadingMore:
        timelineLoadingMore,

    error:
        timelineError,

    hasMore:
        timelineHasMore,

    loadMore:
        loadMoreTimeline,
  } =
      useMemberTimeline({
        memberId:
        selectedMember?.id,

        adminMode:
            true,
      });

  /* ========================================================
   * LOCAL FILTER
   * ======================================================== */

  const normalizedSearch =
      searchTerm
          .trim()
          .toLowerCase();

  const filteredMembers =
      members.filter(
          (member) => {
            const matchesSearch =
                !normalizedSearch ||
                (
                    member.memberCode ??
                    ""
                )
                    .toLowerCase()
                    .includes(
                        normalizedSearch,
                    ) ||
                (
                    member.fullName ??
                    ""
                )
                    .toLowerCase()
                    .includes(
                        normalizedSearch,
                    ) ||
                (
                    member.phone ??
                    ""
                )
                    .toLowerCase()
                    .includes(
                        normalizedSearch,
                    ) ||
                (
                    member.email ??
                    ""
                )
                    .toLowerCase()
                    .includes(
                        normalizedSearch,
                    );

            const matchesStatus =
                statusFilter === "ALL" ||
                member.status ===
                statusFilter;

            return (
                matchesSearch &&
                matchesStatus
            );
          },
      );

  /* ========================================================
   * ANIMATION
   * ======================================================== */

  useGSAP(
      () => {
        if (
            !loading &&
            filteredMembers.length >
            0
        ) {
          gsap.from(
              ".member-row",
              {
                y: 20,
                opacity: 0,
                stagger: 0.05,
                duration: 0.4,
                ease: "power2.out",
                clearProps:
                    "all",
              },
          );
        }
      },
      {
        dependencies: [
          loading,
          filteredMembers.length,
        ],
      },
  );

  /* ========================================================
   * FORM VIEW
   * ======================================================== */

  if (showFormView) {
    return (
        <div className="space-y-6">
          {/* HEADER */}

          <div className="flex items-center gap-4">
            <Button
                variant="outline"
                onClick={() =>
                    setShowFormView(
                        false,
                    )
                }
            >
              Quay lại
            </Button>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isEditMode
                    ? "Chỉnh sửa thông tin hội viên"
                    : "Thêm hội viên mới"}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {isEditMode
                    ? "Cập nhật thông tin hồ sơ. Trạng thái tài khoản được quản lý riêng."
                    : "Tạo tài khoản và hồ sơ hội viên mới."}
              </p>
            </div>
          </div>

          <Card className="p-5">
            <form
                onSubmit={
                  handleFormSubmit
                }
                className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* CREATE ONLY */}

                {!isEditMode && (
                    <>
                      <Input
                          label="Tên đăng nhập *"
                          name="username"
                          value={
                              formValues
                                  .username ??
                              ""
                          }
                          onChange={(
                              event,
                          ) =>
                              setFormValues(
                                  (
                                      previous,
                                  ) => ({
                                    ...previous,

                                    username:
                                    event
                                        .target
                                        .value,
                                  }),
                              )
                          }
                          placeholder="Tên đăng nhập từ 4 ký tự"
                          required
                      />

                      <Input
                          label="Mật khẩu *"
                          name="password"
                          type="password"
                          value={
                              formValues
                                  .password ??
                              ""
                          }
                          onChange={(
                              event,
                          ) =>
                              setFormValues(
                                  (
                                      previous,
                                  ) => ({
                                    ...previous,

                                    password:
                                    event
                                        .target
                                        .value,
                                  }),
                              )
                          }
                          placeholder="Mật khẩu từ 6 ký tự"
                          required
                      />
                    </>
                )}

                {/* FULL NAME */}

                <div
                    className={
                      isEditMode
                          ? "md:col-span-2"
                          : ""
                    }
                >
                  <Input
                      label="Họ và tên *"
                      name="fullName"
                      value={
                          formValues
                              .fullName ??
                          ""
                      }
                      onChange={(
                          event,
                      ) =>
                          setFormValues(
                              (
                                  previous,
                              ) => ({
                                ...previous,

                                fullName:
                                event
                                    .target
                                    .value,
                              }),
                          )
                      }
                      placeholder="Nhập họ và tên hội viên"
                      required
                  />
                </div>

                {/* PHONE */}

                <Input
                    label="Số điện thoại"
                    name="phone"
                    value={
                        formValues.phone ??
                        ""
                    }
                    onChange={(
                        event,
                    ) =>
                        setFormValues(
                            (
                                previous,
                            ) => ({
                              ...previous,

                              phone:
                              event
                                  .target
                                  .value,
                            }),
                        )
                    }
                    placeholder="Ví dụ: 0912345678"
                />

                {/* EMAIL */}

                <div>
                  <Input
                      label="Email *"
                      name="email"
                      type="email"
                      value={
                          formValues.email ??
                          ""
                      }
                      onChange={(
                          event,
                      ) =>
                          setFormValues(
                              (
                                  previous,
                              ) => ({
                                ...previous,

                                email:
                                event
                                    .target
                                    .value,
                              }),
                          )
                      }
                      placeholder="member@fitlife.vn"
                      required
                  />

                  {isEditMode && (
                      <p className="mt-1.5 text-xs leading-5 text-amber-600">
                        Nếu đổi email, địa chỉ mới cần được xác thực lại.
                      </p>
                  )}
                </div>

                {/* GENDER */}

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Giới tính
                  </label>

                  <select
                      value={
                          formValues.gender ??
                          ""
                      }
                      onChange={(
                          event,
                      ) =>
                          setFormValues(
                              (
                                  previous,
                              ) => ({
                                ...previous,

                                gender:
                                    event.target
                                        .value ===
                                    ""
                                        ? null
                                        : event
                                            .target
                                            .value as Gender,
                              }),
                          )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-fit-primary focus:outline-none focus:ring-2 focus:ring-fit-primary/10"
                  >
                    <option value="">
                      -- Chọn giới tính --
                    </option>

                    <option value="MALE">
                      Nam
                    </option>

                    <option value="FEMALE">
                      Nữ
                    </option>

                    <option value="OTHER">
                      Khác
                    </option>
                  </select>
                </div>

                {/* DOB */}

                <Input
                    label="Ngày sinh"
                    name="dateOfBirth"
                    type="date"
                    value={
                        formValues
                            .dateOfBirth ??
                        ""
                    }
                    onChange={(
                        event,
                    ) =>
                        setFormValues(
                            (
                                previous,
                            ) => ({
                              ...previous,

                              dateOfBirth:
                              event
                                  .target
                                  .value,
                            }),
                        )
                    }
                />

                {/* ADDRESS */}

                <div className="md:col-span-3">
                  <Input
                      label="Địa chỉ"
                      name="address"
                      value={
                          formValues.address ??
                          ""
                      }
                      onChange={(
                          event,
                      ) =>
                          setFormValues(
                              (
                                  previous,
                              ) => ({
                                ...previous,

                                address:
                                event
                                    .target
                                    .value,
                              }),
                          )
                      }
                      placeholder="Nhập địa chỉ của hội viên"
                  />
                </div>

                {/* FITNESS GOAL */}

                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Mục tiêu tập luyện
                  </label>

                  <select
                      value={
                          formValues
                              .fitnessGoal ??
                          ""
                      }
                      onChange={(
                          event,
                      ) =>
                          setFormValues(
                              (
                                  previous,
                              ) => ({
                                ...previous,

                                fitnessGoal:
                                    event.target
                                        .value ===
                                    ""
                                        ? null
                                        : event
                                            .target
                                            .value as FitnessGoal,
                              }),
                          )
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-fit-primary focus:outline-none focus:ring-2 focus:ring-fit-primary/10"
                  >
                    <option value="">
                      -- Chọn mục tiêu --
                    </option>

                    <option value="LOSE_WEIGHT">
                      Giảm cân / giảm mỡ
                    </option>

                    <option value="GAIN_MUSCLE">
                      Tăng cơ
                    </option>

                    <option value="MAINTAIN">
                      Duy trì thể trạng
                    </option>

                    <option value="IMPROVE_HEALTH">
                      Cải thiện sức khỏe
                    </option>

                    <option value="INCREASE_ENDURANCE">
                      Tăng sức bền
                    </option>
                  </select>
                </div>

                {/* CURRENT STATUS - READ ONLY */}

                {isEditMode &&
                    selectedMember && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700">
                            Trạng thái hiện tại
                          </label>

                          <div className="mt-2 flex min-h-[46px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4">
                            {renderStatusBadge(
                                selectedMember.status,
                            )}
                          </div>

                          <p className="mt-1.5 text-xs text-slate-400">
                            Dùng nút khóa/mở khóa trong danh sách để thay đổi trạng thái.
                          </p>
                        </div>
                    )}

                {/* EMERGENCY CONTACT */}

                <Input
                    label="Người liên hệ khẩn cấp"
                    name="emergencyContactName"
                    value={
                        formValues
                            .emergencyContactName ??
                        ""
                    }
                    onChange={(
                        event,
                    ) =>
                        setFormValues(
                            (
                                previous,
                            ) => ({
                              ...previous,

                              emergencyContactName:
                              event
                                  .target
                                  .value,
                            }),
                        )
                    }
                />

                <Input
                    label="SĐT liên hệ khẩn cấp"
                    name="emergencyContactPhone"
                    value={
                        formValues
                            .emergencyContactPhone ??
                        ""
                    }
                    onChange={(
                        event,
                    ) =>
                        setFormValues(
                            (
                                previous,
                            ) => ({
                              ...previous,

                              emergencyContactPhone:
                              event
                                  .target
                                  .value,
                            }),
                        )
                    }
                />

                {/* HEALTH NOTE */}

                <div className="md:col-span-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Ghi chú sức khỏe
                  </label>

                  <textarea
                      rows={4}
                      value={
                          formValues
                              .healthNote ??
                          ""
                      }
                      onChange={(
                          event,
                      ) =>
                          setFormValues(
                              (
                                  previous,
                              ) => ({
                                ...previous,

                                healthNote:
                                event
                                    .target
                                    .value,
                              }),
                          )
                      }
                      placeholder="Tiền sử bệnh, chấn thương, lưu ý khi tập luyện..."
                      className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-fit-primary focus:outline-none focus:ring-2 focus:ring-fit-primary/10"
                  />
                </div>
              </div>

              {/* ACTION */}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                        setShowFormView(
                            false,
                        )
                    }
                >
                  Hủy
                </Button>

                <Button
                    type="submit"
                    isLoading={
                      formLoading
                    }
                    loadingText={
                      isEditMode
                          ? "Đang cập nhật..."
                          : "Đang tạo..."
                    }
                >
                  {isEditMode
                      ? "Lưu thay đổi"
                      : "Lưu hội viên"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
    );
  }

  /* ========================================================
   * MAIN LIST
   * ======================================================== */

  return (
      <div
          ref={containerRef}
          className="mx-auto max-w-7xl space-y-6"
      >
        {/* PAGE HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Quản lý hội viên
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Quản lý hồ sơ, trạng thái và lịch sử hoạt động của hội viên.
            </p>
          </div>

          <Button
              onClick={
                handleOpenCreate
              }
          >
            <Plus className="h-4 w-4" />

            Thêm hội viên
          </Button>
        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard
              icon={
                <Users className="h-6 w-6" />
              }
              label="Tổng hội viên"
              value={
                totalCount
              }
              iconClass="bg-slate-50 text-slate-600"
          />

          <SummaryCard
              icon={
                <UserCheck className="h-6 w-6" />
              }
              label="Đang hoạt động"
              value={
                activeCount
              }
              iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
              icon={
                <UserX className="h-6 w-6" />
              }
              label="Ngưng hoạt động"
              value={
                0
              }
              iconClass="bg-slate-100 text-slate-600"
          />

          <SummaryCard
              icon={
                <Lock className="h-6 w-6" />
              }
              label="Đang bị khóa"
              value={
                0
              }
              iconClass="bg-rose-50 text-rose-600"
          />
        </div>

        {/* FILTER + TABLE */}

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-100 bg-slate-50/30 p-5">
            {/* SEARCH */}

            <div className="relative w-full lg:w-96">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                  type="text"
                  placeholder="Tìm theo mã, tên, SĐT, email..."
                  value={
                    searchTerm
                  }
                  onChange={(
                      event,
                  ) =>
                      setSearchTerm(
                          event.target
                              .value,
                      )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm transition focus:border-fit-primary focus:outline-none focus:ring-2 focus:ring-fit-primary/10"
              />
            </div>

            {/* STATUS FILTER */}

            <div className="min-w-[210px]">
              <label
                  htmlFor="member-status-filter"
                  className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500"
              >
                Lọc trạng thái
              </label>

              <select
                  id="member-status-filter"
                  value={
                    statusFilter
                  }
                  onChange={(
                      event,
                  ) =>
                      setStatusFilter(
                          event.target
                              .value as
                              | MemberStatus
                              | "ALL",
                      )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:border-fit-primary focus:outline-none focus:ring-2 focus:ring-fit-primary/10"
              >
                <option value="ALL">
                  Tất cả trạng thái
                </option>

                <option value="ACTIVE">
                  Hoạt động
                </option>

                <option value="INACTIVE">
                  Ngưng hoạt động
                </option>

                <option value="SUSPENDED">
                  Bị khóa
                </option>
              </select>
            </div>
          </div>

          {/* TABLE */}

          {loading ? (
              <Loading label="Đang tải danh sách hội viên..." />
          ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">
                      Mã HV
                    </th>

                    <th className="px-6 py-4">
                      Hội viên
                    </th>

                    <th className="px-6 py-4">
                      Liên hệ
                    </th>

                    <th className="px-6 py-4">
                      Giới tính
                    </th>

                    <th className="px-6 py-4">
                      Ngày sinh
                    </th>

                    <th className="px-6 py-4">
                      Ngày tham gia
                    </th>

                    <th className="px-6 py-4">
                      Trạng thái
                    </th>

                    <th className="px-6 py-4 text-center">
                      Thao tác
                    </th>
                  </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50">
                  {filteredMembers.length ===
                  0 ? (
                      <tr>
                        <td
                            colSpan={
                              8
                            }
                            className="px-6 py-12 text-center font-medium text-slate-400"
                        >
                          Không tìm thấy hội viên phù hợp.
                        </td>
                      </tr>
                  ) : (
                      filteredMembers.map(
                          (
                              member,
                          ) => (
                              <tr
                                  key={
                                    member.id
                                  }
                                  className="member-row group transition-colors hover:bg-slate-50/50"
                              >
                                {/* CODE */}

                                <td className="px-6 py-4 text-xs font-bold text-slate-900">
                                  {member.memberCode ||
                                      `MEM${String(
                                          member.id,
                                      ).padStart(
                                          4,
                                          "0",
                                      )}`}
                                </td>

                                {/* MEMBER */}

                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-sm font-bold text-slate-600">
                                      {member.avatarUrl ? (
                                          <img
                                              src={
                                                member.avatarUrl
                                              }
                                              alt={
                                                member.fullName
                                              }
                                              className="h-full w-full object-cover"
                                          />
                                      ) : (
                                          <span>
                                  {(
                                      member.fullName ||
                                      "?"
                                  ).charAt(
                                      0,
                                  )}
                                </span>
                                      )}
                                    </div>

                                    <div>
                                      <p className="text-[13px] font-bold text-slate-900">
                                        {
                                          member.fullName
                                        }
                                      </p>

                                      <p className="mt-0.5 text-[11px] text-slate-400">
                                        @{member.username}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* CONTACT */}

                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-0.5 text-[13px]">
                            <span className="font-medium text-slate-700">
                              {member.phone ||
                                  "-"}
                            </span>

                                    <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400">
                                {
                                  member.email
                                }
                              </span>

                                      {member.emailVerified ===
                                      false ? (
                                          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-600">
                                  Chưa xác thực
                                </span>
                                      ) : null}
                                    </div>
                                  </div>
                                </td>

                                {/* GENDER */}

                                <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                                  {getGenderLabel(
                                      member.gender,
                                  )}
                                </td>

                                {/* DOB */}

                                <td className="px-6 py-4 text-[13px] font-medium text-slate-500">
                                  {formatDate(
                                      member.dateOfBirth,
                                  )}
                                </td>

                                {/* JOIN DATE */}

                                <td className="px-6 py-4 text-[13px] font-medium text-slate-500">
                                  {formatDate(
                                      member.joinDate,
                                  )}
                                </td>

                                {/* STATUS */}

                                <td className="px-6 py-4">
                                  {renderStatusBadge(
                                      member.status,
                                  )}
                                </td>

                                {/* ACTION */}

                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOpenDetail(
                                                member,
                                            )
                                        }
                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-fit-primarySoft hover:text-fit-primary"
                                        title="Xem chi tiết"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOpenEdit(
                                                member,
                                            )
                                        }
                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-fit-adminSoft hover:text-fit-admin"
                                        title="Chỉnh sửa"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleToggleStatus(
                                                member,
                                            )
                                        }
                                        className={`rounded-lg p-2 transition ${
                                            member.status ===
                                            "SUSPENDED"
                                                ? "text-emerald-600 hover:bg-emerald-50"
                                                : "text-rose-600 hover:bg-rose-50"
                                        }`}
                                        title={
                                          member.status ===
                                          "SUSPENDED"
                                              ? "Mở khóa tài khoản"
                                              : "Khóa tài khoản"
                                        }
                                    >
                                      {member.status ===
                                      "SUSPENDED" ? (
                                          <Unlock className="h-4 w-4" />
                                      ) : (
                                          <Lock className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                          ),
                      )
                  )}
                  </tbody>
                </table>
              </div>
          )}
        </Card>

        {/* ====================================================
       * DETAIL MODAL
       * ==================================================== */}

        <Modal
            title={`Chi tiết hội viên: ${
                selectedMember
                    ?.fullName ??
                ""
            }`}
            open={
              detailModalOpen
            }
            onClose={() =>
                setDetailModalOpen(
                    false,
                )
            }
        >
          {selectedMember && (
              <div className="max-h-[80vh] space-y-4 overflow-y-auto pr-1">
                {/* TABS */}

                <div className="flex overflow-x-auto border-b border-slate-200">
                  <DetailTabButton
                      active={
                          detailTab ===
                          "profile"
                      }
                      label="Thông tin cá nhân"
                      onClick={() =>
                          setDetailTab(
                              "profile",
                          )
                      }
                  />

                  <DetailTabButton
                      active={
                          detailTab ===
                          "subscription"
                      }
                      label="Lịch sử gói tập"
                      onClick={() =>
                          setDetailTab(
                              "subscription",
                          )
                      }
                  />

                  <DetailTabButton
                      active={
                          detailTab ===
                          "checkin"
                      }
                      label="Lịch sử Check-in"
                      onClick={() =>
                          setDetailTab(
                              "checkin",
                          )
                      }
                  />

                  <DetailTabButton
                      active={
                          detailTab ===
                          "timeline"
                      }
                      label="Dòng thời gian"
                      onClick={() =>
                          setDetailTab(
                              "timeline",
                          )
                      }
                  />
                </div>

                {detailLoading ? (
                    <Loading label="Đang tải dữ liệu chi tiết..." />
                ) : (
                    <div className="mt-4">
                      {/* PROFILE */}

                      {detailTab ===
                          "profile" && (
                              <div className="space-y-4">
                                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-fit-primarySoft text-lg font-bold text-fit-primary">
                                    {(
                                        selectedMember.fullName ||
                                        "?"
                                    ).charAt(
                                        0,
                                    )}
                                  </div>

                                  <div>
                                    <h4 className="font-bold text-slate-900">
                                      {
                                        selectedMember.fullName
                                      }
                                    </h4>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                      Mã số:{" "}
                                      {selectedMember.memberCode ||
                                          "Chưa có"}
                                    </p>

                                    <div className="mt-2">
                                      {renderStatusBadge(
                                          selectedMember.status,
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                  <DetailField
                                      label="Email"
                                      value={
                                        selectedMember.email
                                      }
                                  />

                                  <DetailField
                                      label="Xác thực email"
                                      value={
                                        selectedMember.emailVerified ===
                                        false
                                            ? "Chưa xác thực"
                                            : selectedMember.emailVerified ===
                                            true
                                                ? "Đã xác thực"
                                                : "Chưa có dữ liệu"
                                      }
                                  />

                                  <DetailField
                                      label="Số điện thoại"
                                      value={
                                          selectedMember.phone ||
                                          "-"
                                      }
                                  />

                                  <DetailField
                                      label="Giới tính"
                                      value={getGenderLabel(
                                          selectedMember.gender,
                                      )}
                                  />

                                  <DetailField
                                      label="Ngày sinh"
                                      value={formatDate(
                                          selectedMember.dateOfBirth,
                                      )}
                                  />

                                  <DetailField
                                      label="Ngày tham gia"
                                      value={formatDate(
                                          selectedMember.joinDate,
                                      )}
                                  />

                                  <DetailField
                                      label="Mục tiêu"
                                      value={getFitnessGoalLabel(
                                          selectedMember.fitnessGoal,
                                      )}
                                  />

                                  <DetailField
                                      label="Trạng thái"
                                      value={
                                        selectedMember.status ===
                                        "ACTIVE"
                                            ? "Hoạt động"
                                            : selectedMember.status ===
                                            "SUSPENDED"
                                                ? "Bị khóa"
                                                : "Ngưng hoạt động"
                                      }
                                  />
                                </div>

                                <DetailField
                                    label="Địa chỉ"
                                    value={
                                        selectedMember.address ||
                                        "Chưa cập nhật"
                                    }
                                />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                  <DetailField
                                      label="Người liên hệ khẩn cấp"
                                      value={
                                          selectedMember.emergencyContactName ||
                                          "Chưa cập nhật"
                                      }
                                  />

                                  <DetailField
                                      label="SĐT khẩn cấp"
                                      value={
                                          selectedMember.emergencyContactPhone ||
                                          "Chưa cập nhật"
                                      }
                                  />
                                </div>

                                <DetailField
                                    label="Ghi chú sức khỏe"
                                    value={
                                        selectedMember.healthNote ||
                                        "Chưa cập nhật"
                                    }
                                />
                              </div>
                          )}

                      {/* SUBSCRIPTIONS */}

                      {detailTab ===
                          "subscription" && (
                              <div className="space-y-3">
                                <h4 className="pl-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                                  Lịch sử đăng ký gói
                                </h4>

                                {memberSubscriptions.length ===
                                0 ? (
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center text-xs font-medium text-slate-400">
                                      Hội viên chưa có đăng ký gói tập nào.
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                      {memberSubscriptions.map(
                                          (
                                              subscription,
                                          ) => (
                                              <div
                                                  key={
                                                    subscription.id
                                                  }
                                                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
                                              >
                                                <div className="space-y-1">
                                                  <div className="text-sm font-bold text-slate-800">
                                                    {subscription
                                                            .package
                                                            ?.name ??
                                                        "Gói tập"}
                                                  </div>

                                                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />

                                    {subscription.startDate ||
                                        "-"}
                                  </span>

                                                    <span>
                                    đến
                                  </span>

                                                    <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />

                                                      {subscription.endDate ||
                                                          "-"}
                                  </span>
                                                  </div>
                                                </div>

                                                <Badge
                                                    variant={
                                                      subscription.status ===
                                                      "ACTIVE"
                                                          ? "success"
                                                          : subscription.status ===
                                                          "EXPIRED"
                                                              ? "purple"
                                                              : "default"
                                                    }
                                                >
                                                  {
                                                    subscription.status
                                                  }
                                                </Badge>
                                              </div>
                                          ),
                                      )}
                                    </div>
                                )}
                              </div>
                          )}

                      {/* CHECKIN */}

                      {detailTab ===
                          "checkin" && (
                              <div className="space-y-3">
                                <h4 className="pl-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                                  Lịch sử check-in
                                </h4>

                                {memberCheckins.length ===
                                0 ? (
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center text-xs font-medium text-slate-400">
                                      Hội viên chưa có lượt check-in nào.
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-xl border border-slate-100">
                                      <table className="min-w-full divide-y divide-slate-100 text-xs">
                                        <thead className="bg-slate-50 font-semibold text-slate-500">
                                        <tr>
                                          <th className="px-4 py-2.5 text-left">
                                            Thời gian
                                          </th>

                                          <th className="px-4 py-2.5 text-left">
                                            Ghi chú
                                          </th>
                                        </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-50 text-slate-600">
                                        {memberCheckins.map(
                                            (
                                                record,
                                            ) => (
                                                <tr
                                                    key={
                                                      record.id
                                                    }
                                                >
                                                  <td className="px-4 py-3 font-semibold text-slate-700">
                                                    {new Date(
                                                        record.checkInTime,
                                                    ).toLocaleString(
                                                        "vi-VN",
                                                    )}
                                                  </td>

                                                  <td className="px-4 py-3">
                                                    {record.note ||
                                                        "Hợp lệ"}
                                                  </td>
                                                </tr>
                                            ),
                                        )}
                                        </tbody>
                                      </table>
                                    </div>
                                )}
                              </div>
                          )}

                      {/* TIMELINE */}

                      {detailTab ===
                          "timeline" && (
                              <div className="space-y-3">
                                <h4 className="pl-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                                  Dòng thời gian hoạt động
                                </h4>

                                <MemberTimeline
                                    items={
                                      timelineItems
                                    }
                                    loading={
                                      timelineLoading
                                    }
                                    loadingMore={
                                      timelineLoadingMore
                                    }
                                    error={
                                      timelineError
                                    }
                                    hasMore={
                                      timelineHasMore
                                    }
                                    onLoadMore={() =>
                                        void loadMoreTimeline()
                                    }
                                />
                              </div>
                          )}
                    </div>
                )}

                <div className="flex justify-end border-t border-slate-100 pt-4">
                  <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                          setDetailModalOpen(
                              false,
                          )
                      }
                  >
                    Đóng
                  </Button>
                </div>
              </div>
          )}
        </Modal>
      </div>
  );
}

/* ============================================================
 * CHILD COMPONENTS
 * ============================================================ */

function SummaryCard({
                       icon,
                       label,
                       value,
                       iconClass,
                     }: {
  icon:
      React.ReactNode;

  label:
      string;

  value:
      number;

  iconClass:
      string;
}) {
  return (
      <Card className="flex items-center gap-4 p-5">
        <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <h3 className="mt-1 text-2xl font-black leading-tight text-slate-900">
            {value}
          </h3>
        </div>
      </Card>
  );
}

function DetailTabButton({
                           active,
                           label,
                           onClick,
                         }: {
  active:
      boolean;

  label:
      string;

  onClick:
      () => void;
}) {
  return (
      <button
          type="button"
          onClick={
            onClick
          }
          className={`min-w-max flex-1 border-b-2 px-3 py-2.5 text-center text-sm font-semibold transition ${
              active
                  ? "border-fit-primary text-fit-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
      >
        {label}
      </button>
  );
}

function DetailField({
                       label,
                       value,
                     }: {
  label:
      string;

  value:
      string;
}) {
  return (
      <div className="flex flex-col rounded-xl border border-slate-100 p-3">
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>

        <span className="mt-1 break-words text-sm font-medium text-slate-800">
        {value}
      </span>
      </div>
  );
}