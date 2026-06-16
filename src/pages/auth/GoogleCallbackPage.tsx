import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/common/Loading";
import { ROUTES } from "../../config/routes";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(ROUTES.MEMBER_HOME, { replace: true });
  }, [navigate]);

  return <Loading label="Đang xử lý đăng nhập Google" />;
}
