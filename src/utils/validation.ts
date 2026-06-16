export const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isVietnamesePhone = (value: string): boolean => /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(value);
