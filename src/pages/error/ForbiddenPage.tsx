import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import { ROUTES } from "../../config/routes";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-fit-bg px-4">
      <section className="text-center">
        <p className="text-7xl font-black text-fit-orange">403</p>
        <h1 className="mt-4 text-3xl font-black text-fit-text">Bạn không có quyền truy cập</h1>
        <Link to={ROUTES.HOME}><Button className="mt-6">Quay lại</Button></Link>
      </section>
    </main>
  );
}
