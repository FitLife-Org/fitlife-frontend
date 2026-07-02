import { showAlert } from "../alert";
import type { AdminPackageCreateRequest, AdminPackageUpdateRequest } from "../../types/package.type";

export const validateAdminPackageForm = (
  formData: AdminPackageCreateRequest | AdminPackageUpdateRequest,
  isCreate: boolean
): boolean => {
  if (isCreate) {
    const data = formData as AdminPackageCreateRequest;
    if (!data.code || data.code.trim() === "") {
      showAlert.error("Lỗi", "Mã gói tập không được để trống");
      return false;
    }
    if (data.code.length > 50) {
      showAlert.error("Lỗi", "Mã gói tập không được vượt quá 50 ký tự");
      return false;
    }
  }

  if (!formData.name || formData.name.trim() === "") {
    showAlert.error("Lỗi", "Tên gói tập không được để trống");
    return false;
  }
  
  if (formData.name.length > 150) {
    showAlert.error("Lỗi", "Tên gói tập không được vượt quá 150 ký tự");
    return false;
  }

  if (!formData.packageType || formData.packageType.trim() === "") {
    showAlert.error("Lỗi", "Loại gói tập không được để trống");
    return false;
  }

  if (formData.packageType.length > 50) {
    showAlert.error("Lỗi", "Loại gói tập không được vượt quá 50 ký tự");
    return false;
  }

  if (formData.basePrice === undefined || formData.basePrice === null || formData.basePrice < 0) {
    showAlert.error("Lỗi", "Giá tiền cơ bản phải lớn hơn hoặc bằng 0");
    return false;
  }

  if (formData.ptSessionsPerMonth === undefined || formData.ptSessionsPerMonth === null || formData.ptSessionsPerMonth < 0) {
    showAlert.error("Lỗi", "Số buổi PT mỗi tháng phải lớn hơn hoặc bằng 0");
    return false;
  }

  if (formData.thumbnailUrl && formData.thumbnailUrl.length > 500) {
    showAlert.error("Lỗi", "Đường dẫn hình ảnh không được vượt quá 500 ký tự");
    return false;
  }

  return true;
};
