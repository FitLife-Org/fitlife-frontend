import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { ROUTES } from "../../config/routes";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="flex min-h-screen items-center justify-center fit-page px-4">
      <form className="w-full max-w-md fit-card p-8" onSubmit={handleSubmit}>
        <h1 className="fit-title">Quên mật khẩu</h1>
        <p className="fit-subtitle">Nhập email để nhận hướng dẫn đặt lại mật khẩu.</p>
        {submitted && <div className="mt-5 rounded-lg border border-fit-primary/20 bg-fit-primarySoft px-4 py-3 text-sm text-fit-primaryHover">Nếu email tồn tại, hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu.</div>}
        <div className="mt-6">
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <Button className="mt-6 w-full" type="submit">
          Gửi hướng dẫn
        </Button>
        <Link className="mt-6 block text-center text-sm fit-auth-link" to={ROUTES.LOGIN}>
          Quay lại đăng nhập
        </Link>
      </form>
    </main>
  );
}
