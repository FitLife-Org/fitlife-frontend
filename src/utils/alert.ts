import Swal, { SweetAlertOptions } from 'sweetalert2';

// Cấu hình chung cho SweetAlert2 để phù hợp với theme FitLife
const fitAlert = Swal.mixin({
  customClass: {
    confirmButton: 'fit-auth-button w-auto px-8 mx-2',
    cancelButton: 'px-8 py-3 rounded-2xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors mx-2',
    popup: 'rounded-3xl border border-fit-border shadow-2xl',
    title: 'text-2xl font-black text-slate-900',
    htmlContainer: 'text-slate-600 font-medium'
  },
  buttonsStyling: false,
  confirmButtonText: 'Đồng ý',
  cancelButtonText: 'Hủy'
});

export const showAlert = {
  success: (title: string, text?: string, options?: SweetAlertOptions) => {
    return fitAlert.fire({
      icon: 'success',
      title,
      text,
      ...options
    });
  },
  
  error: (title: string, text?: string, options?: SweetAlertOptions) => {
    return fitAlert.fire({
      icon: 'error',
      title,
      text,
      ...options
    });
  },
  
  warning: (title: string, text?: string, options?: SweetAlertOptions) => {
    return fitAlert.fire({
      icon: 'warning',
      title,
      text,
      ...options
    });
  },
  
  info: (title: string, text?: string, options?: SweetAlertOptions) => {
    return fitAlert.fire({
      icon: 'info',
      title,
      text,
      ...options
    });
  },
  
  confirm: (title: string, text?: string, options?: SweetAlertOptions) => {
    return fitAlert.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      ...options
    });
  }
};
