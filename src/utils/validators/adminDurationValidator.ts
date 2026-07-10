import { z } from "zod";

export const adminDurationSchema = z.object({
  code: z
    .string()
    .min(3, "Mã thời hạn phải từ 3 ký tự")
    .max(50, "Mã thời hạn không được vượt quá 50 ký tự")
    .regex(/^[A-Z0-9_]+$/, "Mã thời hạn chỉ bao gồm chữ in hoa, số và dấu gạch dưới"),
  name: z
    .string()
    .min(3, "Tên thời hạn phải từ 3 ký tự")
    .max(100, "Tên thời hạn không được vượt quá 100 ký tự"),
  months: z
    .number()
    .min(1, "Số tháng tối thiểu là 1")
    .max(60, "Số tháng tối đa là 60"),
  discountPercent: z
    .number()
    .min(0, "Phần trăm giảm giá không được âm")
    .max(100, "Phần trăm giảm giá không được vượt quá 100"),
  status: z.enum(["ACTIVE", "INACTIVE", "LOCKED", "PENDING", "EXPIRED", "CANCELLED"]).optional(),
});

export const validateAdminDurationForm = (data: unknown) => {
  return adminDurationSchema.safeParse(data);
};
