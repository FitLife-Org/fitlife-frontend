export interface TrainerFormData {
  userId: string;
  trainerCode: string;
  specialty?: string;
}

export const validateTrainerForm = (data: TrainerFormData) => {
  const errors: Partial<Record<keyof TrainerFormData, string>> = {};

  if (!data.userId || !Number.isInteger(Number(data.userId)) || Number(data.userId) <= 0) {
    errors.userId = "Nhập ID tài khoản hợp lệ để gán làm PT.";
  }

  if (!data.trainerCode || data.trainerCode.trim().length < 2) {
    errors.trainerCode = "Mã PT phải có ít nhất 2 ký tự.";
  }

  if (!data.specialty || data.specialty.trim() === "") {
    errors.specialty = "Chuyên môn không được bỏ trống.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
