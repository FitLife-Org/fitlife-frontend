import {
  z,
} from "zod";

const numericField = (
    requiredMessage: string,
) =>
    z.preprocess(
        (value) => {
          if (
              value === "" ||
              value === null ||
              value === undefined
          ) {
            return undefined;
          }

          if (
              typeof value ===
              "string"
          ) {
            const parsed =
                Number(value);

            return Number.isNaN(
                parsed,
            )
                ? value
                : parsed;
          }

          return value;
        },

        z.number({
          error:
          requiredMessage,
        }),
    );

export const adminDurationSchema =
    z.object({
      code:
          z
              .string()
              .trim()
              .min(
                  3,
                  "Mã thời hạn phải từ 3 ký tự",
              )
              .max(
                  50,
                  "Mã thời hạn không được vượt quá 50 ký tự",
              )
              .regex(
                  /^[A-Z0-9_]+$/,
                  "Mã thời hạn chỉ gồm chữ in hoa, số và dấu gạch dưới",
              ),

      name:
          z
              .string()
              .trim()
              .min(
                  3,
                  "Tên thời hạn phải từ 3 ký tự",
              )
              .max(
                  100,
                  "Tên thời hạn không được vượt quá 100 ký tự",
              ),

      months:
          numericField(
              "Số tháng là bắt buộc",
          )
              .pipe(
                  z
                      .number()
                      .int(
                          "Số tháng phải là số nguyên",
                      )
                      .min(
                          1,
                          "Số tháng tối thiểu là 1",
                      )
                      .max(
                          60,
                          "Số tháng tối đa là 60",
                      ),
              ),

      discountPercent:
          numericField(
              "Phần trăm giảm giá là bắt buộc",
          )
              .pipe(
                  z
                      .number()
                      .min(
                          0,
                          "Phần trăm giảm giá không được âm",
                      )
                      .max(
                          100,
                          "Phần trăm giảm giá không được vượt quá 100",
                      ),
              ),

      gymPackageId:
          numericField(
              "Vui lòng chọn gói tập",
          )
              .pipe(
                  z
                      .number()
                      .int(
                          "Gói tập không hợp lệ",
                      )
                      .min(
                          1,
                          "Gói tập không hợp lệ",
                      ),
              ),

      price:
          numericField(
              "Giá cơ bản là bắt buộc",
          )
              .pipe(
                  z
                      .number()
                      .min(
                          0,
                          "Giá cơ bản không được âm",
                      ),
              ),

      discountPrice:
          z.preprocess(
              (value) => {
                if (
                    value === "" ||
                    value === null ||
                    value === undefined
                ) {
                  return undefined;
                }

                return typeof value ===
                "string"
                    ? Number(value)
                    : value;
              },

              z
                  .number()
                  .min(
                      0,
                      "Giá khuyến mãi không được âm",
                  )
                  .optional(),
          ),

      status:
          z
              .enum([
                "ACTIVE",
                "INACTIVE",
              ])
              .optional(),
    })
        .refine(
            (data) =>
                data.discountPrice ===
                undefined ||
                data.discountPrice <=
                data.price,
            {
              message:
                  "Giá khuyến mãi không được lớn hơn giá cơ bản",
              path: [
                "discountPrice",
              ],
            },
        );

export type AdminDurationFormData =
    z.infer<
        typeof adminDurationSchema
    >;

export const validateAdminDurationForm =
    (
        data: unknown,
    ) =>
        adminDurationSchema.safeParse(
            data,
        );