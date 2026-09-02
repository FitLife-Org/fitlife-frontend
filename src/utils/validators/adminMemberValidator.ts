import {
  showAlert,
} from "../alert";

import type {
  AdminMemberCreateRequest,
  AdminMemberUpdateRequest,
  MemberProfile,
} from "../../types/member.type";

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const EMAIL_REGEX =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_REGEX =
    /^(0|\+84)[0-9]{9,10}$/;

const USERNAME_REGEX =
    /^[a-zA-Z0-9._-]{4,50}$/;

const MIN_MEMBER_AGE =
    10;

/* ============================================================
 * HELPERS
 * ============================================================ */

function normalizeText(
    value?: string | null,
): string {
  return value?.trim() ?? "";
}

function normalizeEmail(
    value?: string | null,
): string {
  return normalizeText(
      value,
  ).toLowerCase();
}

function normalizePhone(
    value?: string | null,
): string {
  return normalizeText(
      value,
  );
}

function normalizeUsername(
    value?: string | null,
): string {
  return normalizeText(
      value,
  ).toLowerCase();
}

function showValidationError(
    message: string,
): false {
  showAlert.error(
      "Dữ liệu không hợp lệ",
      message,
  );

  return false;
}

/* ============================================================
 * DATE OF BIRTH
 * ============================================================ */

function validateDateOfBirth(
    value?: string | null,
): boolean {
  if (!value) {
    return true;
  }

  /*
   * Input type="date" thường có format:
   * YYYY-MM-DD
   *
   * Parse theo local date để tránh timezone
   * làm lệch ngày.
   */
  const parts =
      value.split("-");

  if (parts.length !== 3) {
    return showValidationError(
        "Ngày sinh không hợp lệ.",
    );
  }

  const year =
      Number(parts[0]);

  const month =
      Number(parts[1]);

  const day =
      Number(parts[2]);

  if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day)
  ) {
    return showValidationError(
        "Ngày sinh không hợp lệ.",
    );
  }

  const dob =
      new Date(
          year,
          month - 1,
          day,
      );

  /*
   * Chặn các ngày JS tự normalize.
   *
   * Ví dụ:
   * 2026-02-31
   * có thể bị Date tự chuyển sang tháng 3.
   */
  if (
      dob.getFullYear() !== year ||
      dob.getMonth() !==
      month - 1 ||
      dob.getDate() !== day
  ) {
    return showValidationError(
        "Ngày sinh không hợp lệ.",
    );
  }

  const today =
      new Date();

  today.setHours(
      0,
      0,
      0,
      0,
  );

  dob.setHours(
      0,
      0,
      0,
      0,
  );

  if (dob >= today) {
    return showValidationError(
        "Ngày sinh phải ở trong quá khứ.",
    );
  }

  let age =
      today.getFullYear() -
      dob.getFullYear();

  const monthDifference =
      today.getMonth() -
      dob.getMonth();

  if (
      monthDifference < 0 ||
      (
          monthDifference === 0 &&
          today.getDate() <
          dob.getDate()
      )
  ) {
    age -= 1;
  }

  if (
      age <
      MIN_MEMBER_AGE
  ) {
    return showValidationError(
        `Hội viên phải từ ${MIN_MEMBER_AGE} tuổi trở lên.`,
    );
  }

  return true;
}

/* ============================================================
 * CREATE-ONLY VALIDATION
 * ============================================================ */

function validateCreateFields(
    data:
    AdminMemberCreateRequest,

    existingMembers:
    MemberProfile[],

): boolean {
  const username =
      normalizeText(
          data.username,
      );

  if (!username) {
    return showValidationError(
        "Tên đăng nhập không được để trống.",
    );
  }

  if (
      !USERNAME_REGEX.test(
          username,
      )
  ) {
    return showValidationError(
        "Tên đăng nhập phải từ 4 đến 50 ký tự và chỉ được chứa chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.",
    );
  }

  const password =
      data.password ?? "";

  if (!password) {
    return showValidationError(
        "Mật khẩu không được để trống.",
    );
  }

  if (
      password.length < 6 ||
      password.length > 100
  ) {
    return showValidationError(
        "Mật khẩu phải từ 6 đến 100 ký tự.",
    );
  }

  const normalizedUsername =
      normalizeUsername(
          username,
      );

  const usernameExists =
      existingMembers.some(
          (member) =>
              normalizeUsername(
                  member.username,
              ) ===
              normalizedUsername,
      );

  if (usernameExists) {
    return showValidationError(
        "Tên đăng nhập đã tồn tại trong hệ thống.",
    );
  }

  return true;
}

/* ============================================================
 * MAIN VALIDATOR
 * ============================================================ */

export const validateAdminMemberForm = (
    formData:
        | AdminMemberCreateRequest
        | AdminMemberUpdateRequest,

    isCreate:
    boolean,

    existingMembers:
    MemberProfile[] = [],

    currentMemberId?: number,
): boolean => {

  /* ========================================================
   * CREATE FIELDS
   * ======================================================== */

  if (isCreate) {
    const createData =
        formData as
            AdminMemberCreateRequest;

    if (
        !validateCreateFields(
            createData,
            existingMembers,
        )
    ) {
      return false;
    }
  }

  /* ========================================================
   * FULL NAME
   * ======================================================== */

  const fullName =
      normalizeText(
          formData.fullName,
      );

  /*
   * Create: bắt buộc.
   *
   * Update:
   * nếu field được gửi thì
   * không được gửi chuỗi rỗng.
   */
  if (
      isCreate ||
      formData.fullName !== undefined
  ) {
    if (!fullName) {
      return showValidationError(
          "Họ và tên không được để trống.",
      );
    }

    if (
        fullName.length >
        150
    ) {
      return showValidationError(
          "Họ và tên không được vượt quá 150 ký tự.",
      );
    }
  }

  /* ========================================================
   * EMAIL
   * ======================================================== */

  const email =
      normalizeEmail(
          formData.email,
      );

  if (isCreate && !email) {
    return showValidationError(
        "Email không được để trống.",
    );
  }

  if (
      formData.email !== undefined
  ) {
    if (!email) {
      return showValidationError(
          "Email không được để trống.",
      );
    }

    if (
        email.length >
        150
    ) {
      return showValidationError(
          "Email không được vượt quá 150 ký tự.",
      );
    }

    if (
        !EMAIL_REGEX.test(
            email,
        )
    ) {
      return showValidationError(
          "Email không hợp lệ. Ví dụ hợp lệ: member@fitlife.vn.",
      );
    }
  }

  /* ========================================================
   * PHONE
   * ======================================================== */

  const phone =
      normalizePhone(
          formData.phone,
      );

  if (
      phone &&
      !PHONE_REGEX.test(
          phone,
      )
  ) {
    return showValidationError(
        "Số điện thoại không hợp lệ. Số điện thoại phải bắt đầu bằng 0 hoặc +84.",
    );
  }

  /* ========================================================
   * DATE OF BIRTH
   * ======================================================== */

  if (
      !validateDateOfBirth(
          formData.dateOfBirth,
      )
  ) {
    return false;
  }

  /* ========================================================
   * ADDRESS
   * ======================================================== */

  const address =
      normalizeText(
          formData.address,
      );

  if (
      address.length >
      255
  ) {
    return showValidationError(
        "Địa chỉ không được vượt quá 255 ký tự.",
    );
  }

  /* ========================================================
   * EMERGENCY CONTACT NAME
   * ======================================================== */

  const emergencyContactName =
      normalizeText(
          formData
              .emergencyContactName,
      );

  if (
      emergencyContactName.length >
      100
  ) {
    return showValidationError(
        "Tên người liên hệ khẩn cấp không được vượt quá 100 ký tự.",
    );
  }

  /* ========================================================
   * EMERGENCY CONTACT PHONE
   * ======================================================== */

  const emergencyContactPhone =
      normalizePhone(
          formData
              .emergencyContactPhone,
      );

  if (
      emergencyContactPhone &&
      !PHONE_REGEX.test(
          emergencyContactPhone,
      )
  ) {
    return showValidationError(
        "Số điện thoại liên hệ khẩn cấp không hợp lệ.",
    );
  }

  /* ========================================================
   * HEALTH NOTE
   * ======================================================== */

  const healthNote =
      normalizeText(
          formData.healthNote,
      );

  if (
      healthNote.length >
      1000
  ) {
    return showValidationError(
        "Ghi chú sức khỏe không được vượt quá 1000 ký tự.",
    );
  }

  /* ========================================================
   * DUPLICATE CHECK
   * ======================================================== */

  const otherMembers =
      existingMembers.filter(
          (member) =>
              member.id !==
              currentMemberId,
      );

  if (email) {
    const duplicateEmail =
        otherMembers.some(
            (member) =>
                normalizeEmail(
                    member.email,
                ) ===
                email,
        );

    if (duplicateEmail) {
      return showValidationError(
          "Email đã tồn tại trong hệ thống.",
      );
    }
  }

  if (phone) {
    const duplicatePhone =
        otherMembers.some(
            (member) =>
                normalizePhone(
                    member.phone,
                ) ===
                phone,
        );

    if (duplicatePhone) {
      return showValidationError(
          "Số điện thoại đã tồn tại trong hệ thống.",
      );
    }
  }

  return true;
};