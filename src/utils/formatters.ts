export const formatVnd = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '0 ₫';
  }

  const amount = typeof value === 'string' ? Number(value) : value;

  if (Number.isNaN(amount)) {
    return '0 ₫';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDateTime = (value: string | Date | null | undefined): string => {
  if (!value) {
    return '—';
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

