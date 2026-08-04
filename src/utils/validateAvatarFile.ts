const ALLOWED_TYPES =
    new Set<string>([
        "image/jpeg",
        "image/png",
        "image/webp",
    ]);

const MAX_SIZE =
    5 * 1024 * 1024;

export function validateAvatarFile(
    file: File,
): string | null {
    if (
        !ALLOWED_TYPES.has(
            file.type,
        )
    ) {
        return "Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.";
    }

    if (
        file.size >
        MAX_SIZE
    ) {
        return "Ảnh không được vượt quá 5 MB.";
    }

    return null;
}