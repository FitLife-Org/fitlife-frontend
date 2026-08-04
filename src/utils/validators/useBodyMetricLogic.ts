import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";

import toast from "react-hot-toast";

import {
  bodyMetricService,
} from "../../services/bodyMetricService";

import {
  getApiErrorMessage,
} from "../apiError";

import type {
  CreateMyBodyMetricRequest,
} from "../../types/bodyMetric.type";

interface BodyMetricFormData {
  weightKg: string;
  heightCm: string;
  bodyFatPercent: string;
  muscleMassKg: string;
}

const INITIAL_FORM_DATA:
    BodyMetricFormData = {
  weightKg: "",
  heightCm: "",
  bodyFatPercent: "",
  muscleMassKg: "",
};

interface UseBodyMetricLogicResult {
  showAddModal: boolean;
  submitting: boolean;
  formData: BodyMetricFormData;

  setFormData:
      Dispatch<
          SetStateAction<
              BodyMetricFormData
          >
      >;

  handleSubmit: (
      event:
      FormEvent<HTMLFormElement>,
  ) => Promise<void>;

  handleOpenModal: () => void;
  handleCloseModal: () => void;
}

function parseOptionalNumber(
    value: string,
): number | undefined {
  const normalized =
      value.trim();

  if (!normalized) {
    return undefined;
  }

  const parsed =
      Number(normalized);

  return Number.isFinite(parsed)
      ? parsed
      : undefined;
}

export function useBodyMetricLogic(
    onSuccess: (
        newRecord?:
        CreateMyBodyMetricRequest,
    ) => Promise<void> | void,
): UseBodyMetricLogicResult {
  const [
    showAddModal,
    setShowAddModal,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    formData,
    setFormData,
  ] =
      useState<BodyMetricFormData>(
          INITIAL_FORM_DATA,
      );

  const resetForm = (): void => {
    setFormData(
        INITIAL_FORM_DATA,
    );
  };

  const validateForm =
      (): boolean => {
        const weightKg =
            Number(
                formData.weightKg,
            );

        const heightCm =
            parseOptionalNumber(
                formData.heightCm,
            );

        const bodyFatPercent =
            parseOptionalNumber(
                formData.bodyFatPercent,
            );

        const muscleMassKg =
            parseOptionalNumber(
                formData.muscleMassKg,
            );

        if (
            !formData.weightKg.trim() ||
            !Number.isFinite(weightKg)
        ) {
          toast.error(
              "Vui lòng nhập cân nặng hợp lệ.",
          );

          return false;
        }

        if (
            weightKg < 20 ||
            weightKg > 300
        ) {
          toast.error(
              "Cân nặng phải từ 20 đến 300 kg.",
          );

          return false;
        }

        if (
            heightCm !== undefined &&
            (
                heightCm < 50 ||
                heightCm > 250
            )
        ) {
          toast.error(
              "Chiều cao phải từ 50 đến 250 cm.",
          );

          return false;
        }

        if (
            bodyFatPercent !==
            undefined &&
            (
                bodyFatPercent < 0 ||
                bodyFatPercent > 80
            )
        ) {
          toast.error(
              "Tỷ lệ mỡ phải từ 0 đến 80%.",
          );

          return false;
        }

        if (
            muscleMassKg !==
            undefined &&
            (
                muscleMassKg < 0 ||
                muscleMassKg > 200
            )
        ) {
          toast.error(
              "Khối lượng cơ phải từ 0 đến 200 kg.",
          );

          return false;
        }

        return true;
      };

  const handleSubmit = async (
      event:
      FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (
        submitting ||
        !validateForm()
    ) {
      return;
    }

    const heightCm =
        parseOptionalNumber(
            formData.heightCm,
        );

    const bodyFatPercent =
        parseOptionalNumber(
            formData.bodyFatPercent,
        );

    const muscleMassKg =
        parseOptionalNumber(
            formData.muscleMassKg,
        );

    const request:
        CreateMyBodyMetricRequest = {
      weightKg:
          Number(
              formData.weightKg,
          ),

      ...(heightCm !== undefined
          ? {
            heightCm,
          }
          : {}),

      ...(bodyFatPercent !==
      undefined
          ? {
            bodyFatPercent,
          }
          : {}),

      ...(muscleMassKg !==
      undefined
          ? {
            muscleMassKg,
          }
          : {}),
    };

    try {
      setSubmitting(true);

      await bodyMetricService
          .createMyBodyMetric(
              request,
          );

      toast.success(
          "Cập nhật chỉ số thành công.",
      );

      setShowAddModal(false);
      resetForm();

      await onSuccess(
          request,
      );
    } catch (
        error: unknown
        ) {
      toast.error(
          getApiErrorMessage(
              error,
              "Không thể cập nhật chỉ số cơ thể.",
          ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenModal =
      (): void => {
        if (submitting) {
          return;
        }

        setShowAddModal(true);
      };

  const handleCloseModal =
      (): void => {
        if (submitting) {
          return;
        }

        setShowAddModal(false);
        resetForm();
      };

  return {
    showAddModal,
    submitting,
    formData,
    setFormData,
    handleSubmit,
    handleOpenModal,
    handleCloseModal,
  };
}