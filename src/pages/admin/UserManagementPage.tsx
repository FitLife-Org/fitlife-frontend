import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import Table from "../../components/common/Table";

const users = [
  { name: "Nguyễn Minh Anh", phone: "0987 654 321", package: "Gói 3 tháng", status: "Hoạt động" },
  { name: "Trần Quang Huy", phone: "0978 161 320", package: "Gói 6 tháng", status: "Hoạt động" },
  { name: "Lê Thị Thu Trang", phone: "0966 482 109", package: "Gói 1 tháng", status: "Chờ xử lý" },
];

export default function UserManagementPage() {
  return (
    <>
      <PageHeader title="Quản lý thành viên" description="Danh sách hội viên, trạng thái gói tập và thông tin liên hệ" />
      <Card className="p-6">
        <Table
          data={users}
          columns={[
            { key: "name", header: "Hội viên", render: (row) => row.name },
            { key: "phone", header: "SĐT", render: (row) => row.phone },
            { key: "package", header: "Gói tập", render: (row) => row.package },
            { key: "status", header: "Trạng thái", render: (row) => <Badge variant={row.status === "Hoạt động" ? "success" : "warning"}>{row.status}</Badge> },
          ]}
        />
      </Card>
    </>
  );
}
