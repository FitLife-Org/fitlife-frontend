import { showAlert } from "../alert";

import type {
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
} from "../../types/user.type";

const USERNAME_REGEX =
    /^[a-zA-Z0-9_]+$/;

const EMAIL_REGEX =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PHONE_REGEX =
    /^(0|\+84)[0-9]{9,10}$/;

export const validateAdminAccountForm = (
    formData:
        | AdminUserCreateRequest
        | AdminUserUpdateRequest,

    isCreate: boolean,
): boolean => {
  const username =
      formData.username.trim();

  const email =
      formData.email.trim();

  const fullName =
      formData.fullName.trim();

  const phone =
      formData.phone.trim();

  if (
      username.length < 4 ||
      username.length > 50
  ) {
    showAlert.error(
        "Dữ liệu chưa hợp lệ",
        "Username phải từ 4 đến 50 ký tự.",
    );

    return false;
  }

  if (
      !USERNAME_REGEX.test(username)
  ) {
    showAlert.error(
        "Dữ liệu chưa hợp lệ",
        "Username chỉ được chứa chữ cái, chữ số và dấu gạch dưới.",
    );

    return false;
  }

  if (!email) {
    showAlert.error(
        "Dữ liệu chưa hợp lệ",
        "Email không được để trống.",
    );

    return false;
  }

  if (!EMAIL_REGEX.test(email)) {
    showAlert.error(
        "Dữ liệu chưa hợp lệ",
        "Email không hợp lệ.",
    );

    return false;
  }

  if (email.length > 100) {
    showAlert.error(
        "Dữ liệu chưa hợp lệ",
        "Email không được vượt quá 100 ký tự.",
    );

    return false;
  }

  if (!fullName) {
    showAlert.error(
        "Dữ liệu chưa hợp lệ",
        "Họ và tên không được để trống.",
    );

    return false;
  }

  if (fullName.length > 100) {
    showAlert.error(
        "Dữ liệu chưa hợp lệ",
        "Họ và tên không được vượt quá 100 ký tự.",
    );

    return false;
  }

  if (!phone) {
    showAlert.error(
        "Dữ liệu chưa hợp lệ",
        "Số điện thoại không được để trống.",
    );

    return false;
  }

  if (!PHONE_REGEX.test(phone)) {
    showAlert.error(
        "Dữ liệu chưa hợp lệ",
        "Số điện thoại không hợp lệ.",
    );

    return false;
  }

  if (isCreate) {
    if (!("password" in formData)) {
      showAlert.error(
          "Dữ liệu chưa hợp lệ",
          "Thiếu mật khẩu tài khoản.",
      );

      return false;
    }

    if (
        formData.password.length < 6 ||
        formData.password.length > 100
    ) {
      showAlert.error(
          "Dữ liệu chưa hợp lệ",
          "Mật khẩu phải từ 6 đến 100 ký tự.",
      );

      return false;
    }

    if (!formData.roleCode) {
      showAlert.error(
          "Dữ liệu chưa hợp lệ",
          "Vui lòng chọn vai trò.",
      );

      return false;
    }
  }

  return true;
};