import {
  useState,
  type FormEvent,
} from "react";

import toast from "react-hot-toast";

import { bodyMetricService } from "../../services/bodyMetricService";
import { getApiErrorMessage } from "../apiError";

import type {
  MyBodyMetricCreateRequest,
} from "../../types/bodyMetric.type";

interface BodyMetricFormData {
  weightKg: string;
  heightCm: string;
  bodyFatPercent: string;
  muscleMassKg: string;
}

const INITIAL_FORM_DATA: BodyMetricFormData = {
  weightKg: "",
  heightCm: "",
  bodyFatPercent: "",
  muscleMassKg: "",
};

interface UseBodyMetricLogicResult {
  showAddModal: boolean;
  submitting: boolean;
  formData: BodyMetricFormData;

  setFormData: React.Dispatch<
      React.SetStateAction<BodyMetricFormData>
  >;

  handleSubmit: (
      event: FormEvent<HTMLFormElement>,
  ) => Promise<void>;

  handleOpenModal: () => void;
  handleCloseModal: () => void;
}

export function useBodyMetricLogic(
    onSuccess: (
        newRecord?: MyBodyMetricCreateRequest,
    ) => Promise<void> | void,
): UseBodyMetricLogicResult {
  const [showAddModal, setShowAddModal] =
      useState(false);

  const [submitting, setSubmitting] =
      useState(false);

  const [formData, setFormData] =
      useState<BodyMetricFormData>(
          INITIAL_FORM_DATA,
      );

  const resetForm = (): void => {
    setFormData(INITIAL_FORM_DATA);
  };

  const validateForm = (): boolean => {
    const weightKg =
        Number(formData.weightKg);

    const heightCm =
        Number(formData.heightCm);

    const bodyFatPercent =
        Number(formData.bodyFatPercent);

    const muscleMassKg =
        Number(formData.muscleMassKg);

    if (
        !formData.weightKg ||
        Number.isNaN(weightKg) ||
        weightKg <= 0
    ) {
      toast.error(
          "Vui lòng nhập cân nặng hợp lệ.",
      );

      return false;
    }

    if (
        formData.heightCm &&
        (
            Number.isNaN(heightCm) ||
            heightCm <= 0
        )
    ) {
      toast.error(
          "Chiều cao phải lớn hơn 0.",
      );

      return false;
    }

    if (
        formData.bodyFatPercent &&
        (
            Number.isNaN(bodyFatPercent) ||
            bodyFatPercent <= 0 ||
            bodyFatPercent > 100
        )
    ) {
      toast.error(
          "Tỷ lệ mỡ phải lớn hơn 0 và không vượt quá 100%.",
      );

      return false;
    }

    if (
        formData.muscleMassKg &&
        (
            Number.isNaN(muscleMassKg) ||
            muscleMassKg <= 0
        )
    ) {
      toast.error(
          "Lượng cơ bắp phải lớn hơn 0.",
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (
      event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (
        submitting ||
        !validateForm()
    ) {
      return;
    }

    const request:
        MyBodyMetricCreateRequest = {
      weightKg:
          Number(formData.weightKg),

      heightCm:
          formData.heightCm
              ? Number(formData.heightCm)
              : undefined,

      bodyFatPercent:
          formData.bodyFatPercent
              ? Number(
                  formData.bodyFatPercent,
              )
              : undefined,

      muscleMassKg:
          formData.muscleMassKg
              ? Number(
                  formData.muscleMassKg,
              )
              : undefined,
    };

    try {
      setSubmitting(true);

      await bodyMetricService
          .createMyMetric(request);

      toast.success(
          "Cập nhật chỉ số thành công.",
      );

      setShowAddModal(false);
      resetForm();

      await onSuccess(request);
    } catch (error: unknown) {
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

  const handleOpenModal = (): void => {
    if (submitting) {
      return;
    }

    setShowAddModal(true);
  };

  const handleCloseModal = (): void => {
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