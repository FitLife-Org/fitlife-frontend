export interface TrainerFormData {
  fullName: string;
  specialty?: string;
  phone?: string;
  email?: string;
}

export const validateTrainerForm = (data: TrainerFormData) => {
  const errors: Partial<Record<keyof TrainerFormData, string>> = {};

  if (!data.fullName || data.fullName.trim().length < 3) {
    errors.fullName = "Họ tên phải có ít nhất 3 ký tự.";
  }

  if (data.phone && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(data.phone.trim())) {
    errors.phone = "Số điện thoại không hợp lệ (VD: 0912345678).";
  }

  if (data.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email.trim())) {
    errors.email = "Email không hợp lệ.";
  }

  if (!data.specialty || data.specialty.trim() === "") {
    errors.specialty = "Chuyên môn không được bỏ trống.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
