import { Bot, CalendarPlus, Mic, Send, Utensils } from "lucide-react";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";

export default function AiFitnessPage() {
  return (
    <>
      <PageHeader title="AI Assistant" description="Trợ lý thông minh hỗ trợ lịch tập, dinh dưỡng và theo dõi tiến độ" />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Tạo lịch tập", CalendarPlus],
              ["Gợi ý meal plan", Utensils],
              ["Phân tích BMI", Bot],
              ["Hỏi PT", Bot],
            ].map(([label, Icon]) => (
              <Card className="p-5" key={label as string}>
                <div className="flex items-center gap-3 font-bold text-fit-text">
                  <Icon className="h-7 w-7 text-fit-primary" />
                  {label as string}
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-6 p-6">
            <div className="ml-auto max-w-xl rounded-2xl bg-fit-primarySoft p-5 text-fit-text">
              Mình muốn tăng cơ giảm mỡ, bạn hãy tạo giúp mình lịch tập 5 buổi/tuần phù hợp nhé!
              <p className="mt-3 text-right text-xs text-fit-muted">10:30</p>
            </div>
            <div className="mt-5 flex gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fit-primarySoft text-fit-primary"><Bot /></div>
              <div className="max-w-2xl rounded-2xl border border-fit-primary/20 bg-white shadow-sm p-5 leading-7 text-fit-text">
                Chào Minh! Dựa trên mục tiêu tăng cơ giảm mỡ và tần suất 5 buổi/tuần, mình gợi ý lịch tập:
                <ul className="mt-3 space-y-1">
                  <li>✓ Thứ 2: Push (Ngực - Vai - Tay sau)</li>
                  <li>✓ Thứ 3: Pull (Lưng - Tay trước)</li>
                  <li>✓ Thứ 4: Chân & Mông</li>
                  <li>✓ Thứ 5: Nghỉ / Cardio nhẹ</li>
                  <li>✓ Thứ 6: Full Body</li>
                </ul>
                <p className="mt-3">Mỗi buổi từ 60-75 phút, kết hợp dinh dưỡng phù hợp để đạt hiệu quả tốt nhất.</p>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-3 rounded-3xl border border-fit-border p-3">
              <input className="flex-1 bg-transparent px-3 outline-none" placeholder="Nhập câu hỏi của bạn..." />
              <button className="rounded-full border border-fit-border p-3 text-fit-muted" type="button"><Mic className="h-5 w-5" /></button>
              <button className="rounded-full bg-fit-primary p-4 text-white" type="button"><Send className="h-5 w-5" /></button>
            </div>
            <p className="mt-3 text-center text-xs text-fit-muted">AI Assistant có thể mắc lỗi. Vui lòng tham khảo ý kiến chuyên gia trước khi áp dụng.</p>
          </Card>
        </div>
        <aside className="space-y-6">
          <MiniCard title="Lịch tập hôm nay" value="Push (Ngực - Vai - Tay sau)" />
          <MiniCard title="Gợi ý dinh dưỡng" value="2.100 kcal - 150g protein" />
          <MiniCard title="Chỉ số cơ thể" value="BMI 22.4 - Bình thường" />
        </aside>
      </div>
    </>
  );
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return <Card className="p-6"><h2 className="text-xl font-bold text-fit-text">{title}</h2><p className="mt-4 text-fit-muted">{value}</p><div className="mt-4 h-3 rounded-full bg-slate-100"><div className="h-3 w-2/3 rounded-full bg-fit-primary" /></div></Card>;
}
