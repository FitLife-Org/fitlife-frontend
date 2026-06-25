import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { ROUTES } from "../../config/routes";
import { authService } from "../../services/authService";
import { showAlert } from "../../utils/alert";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      showAlert.success("Thành công", "Nếu email của bạn tồn tại trong hệ thống, chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.");
      setEmail("");
    } catch (error: any) {
      showAlert.error("Lỗi", error.message || "Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center fit-page px-4">
      <form className="w-full max-w-md fit-card p-8" onSubmit={handleSubmit}>
        <h1 className="fit-title">Quên mật khẩu</h1>
        <p className="fit-subtitle">Nhập email để nhận hướng dẫn đặt lại mật khẩu.</p>
        
        <div className="mt-6">
          <Input 
            label="Email" 
            type="email" 
            value={email} 
            onChange={(event) => setEmail(event.target.value)} 
            required 
          />
        </div>
        
        <Button className="mt-6 w-full" type="submit" isLoading={loading}>
          Gửi hướng dẫn
        </Button>
        
        <Link className="mt-6 block text-center text-sm fit-auth-link" to={ROUTES.LOGIN}>
          Quay lại đăng nhập
        </Link>
      </form>
    </main>
  );
}
