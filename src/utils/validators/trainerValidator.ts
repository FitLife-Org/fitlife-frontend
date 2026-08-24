export interface TrainerFormData {
  trainerCode: string;
  specialty?: string;
  experienceYears?: string;
  certifications?: string;
  bio?: string;

  username?: string;
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
}

export const validateTrainerForm = (data: TrainerFormData, isEditing: boolean) => {
  const errors: Partial<Record<keyof TrainerFormData, string>> = {};

  if (!isEditing) {
    if (!data.username || !/^[a-zA-Z0-9_]{3,20}$/.test(data.username)) {
      errors.username = "Username phải từ 3-20 ký tự, không chứa ký tự đặc biệt.";
    }
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
      errors.email = "Email không hợp lệ.";
    }
    if (!data.password || data.password.length < 6) {
      errors.password = "Mật khẩu phải từ 6 ký tự.";
    }
    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.fullName = "Họ tên phải có ít nhất 2 ký tự.";
    }
    if (!data.phone || !/^(0[3|5|7|8|9])+([0-9]{8})\b/.test(data.phone)) {
      errors.phone = "Số điện thoại không hợp lệ (VD: 0912345678).";
    }
  }

  if (!data.trainerCode || data.trainerCode.trim().length < 2) {
    errors.trainerCode = "Mã PT phải có ít nhất 2 ký tự.";
  }

  if (!data.specialty || data.specialty.trim() === "") {
    errors.specialty = "Chuyên môn không được bỏ trống.";
  }

  if (data.experienceYears && (isNaN(Number(data.experienceYears)) || Number(data.experienceYears) < 0)) {
    errors.experienceYears = "Năm kinh nghiệm không hợp lệ.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
