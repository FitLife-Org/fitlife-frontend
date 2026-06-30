import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Bot, CalendarPlus, Mic, Send, Utensils, Activity, User, Sparkles, Loader2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import type { ChatMessage } from "../../types/ai.type";

const INITIAL_MESSAGE: ChatMessage = {
  id: "msg-0",
  sender: "ai",
  text: "Chào bạn! Mình là Trợ lý AI FitLife. Mình có thể giúp bạn tạo lịch tập, gợi ý thực đơn hoặc tính toán các chỉ số cơ thể. Bạn cần hỗ trợ gì hôm nay?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const QUICK_ACTIONS = [
  { label: "Tạo lịch tập", icon: CalendarPlus, prompt: "Tạo giúp mình lịch tập 4 buổi/tuần cho người mới bắt đầu để giảm mỡ." },
  { label: "Gợi ý meal plan", icon: Utensils, prompt: "Mình cần một thực đơn 2000 kcal giàu protein, dễ chuẩn bị." },
  { label: "Phân tích BMI", icon: Activity, prompt: "Mình cao 1m75, nặng 80kg. Hãy phân tích BMI và đưa ra lời khuyên." },
  { label: "Hỏi PT", icon: Bot, prompt: "Làm sao để tập Squat đúng kỹ thuật không bị đau lưng?" },
];

export default function AiFitnessPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatListRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useGSAP(() => {
    gsap.from(".quick-action-card", {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
    });
  }, { scope: containerRef });

  // Simulate AI Response
  const generateAiResponse = (userText: string) => {
    setIsTyping(true);
    
    // Simulate network delay
    setTimeout(() => {
      let aiText = "Mình đã ghi nhận yêu cầu của bạn. Hiện tại hệ thống Backend AI đang trong quá trình nâng cấp, mình sẽ phản hồi chi tiết sau nhé!";
      
      const lowerText = userText.toLowerCase();
      if (lowerText.includes("lịch tập")) {
        aiText = "Dựa trên yêu cầu của bạn, mình gợi ý lịch tập chia nhóm cơ (Split Routine):\n\n- Thứ 2: Ngực, Vai, Tay sau\n- Thứ 3: Lưng, Tay trước\n- Thứ 4: Nghỉ ngơi\n- Thứ 5: Chân, Mông, Bụng\n- Thứ 6: Toàn thân (Full body) hoặc Cardio\n- Cuối tuần: Nghỉ ngơi.\n\nBạn có muốn mình điều chỉnh số buổi hoặc bài tập cụ thể không?";
      } else if (lowerText.includes("thực đơn") || lowerText.includes("meal plan")) {
        aiText = "Với nhu cầu 2000 kcal giàu protein, bạn có thể tham khảo:\n- Sáng: 3 quả trứng luộc, 2 lát bánh mì đen, 1 ly sữa không đường.\n- Trưa: 200g ức gà áp chảo, 1 chén cơm gạo lứt, 1 đĩa salad trộn dầu giấm.\n- Chiều (Snack): 1 quả chuối, 1 muỗng whey protein.\n- Tối: 150g cá hồi nướng, khoai lang luộc, măng tây.\n\nNhớ uống đủ 2-3 lít nước mỗi ngày nhé!";
      } else if (lowerText.includes("bmi") || lowerText.includes("cao")) {
        aiText = "Chỉ số BMI của bạn là 26.1 (Thừa cân nhẹ).\n\nLời khuyên: Bạn nên áp dụng chế độ thâm hụt calo nhẹ (khoảng 300-500 kcal/ngày) kết hợp tập luyện sức mạnh 3-4 buổi/tuần và cardio 2 buổi/tuần để giảm mỡ hiệu quả mà vẫn giữ được cơ bắp.";
      } else if (lowerText.includes("squat")) {
        aiText = "Để tập Squat không bị đau lưng, bạn cần chú ý:\n1. Gồng chặt cơ bụng (Bracing) trước khi hạ người.\n2. Giữ lưng thẳng tự nhiên, không võng hoặc gù.\n3. Đẩy hông ra sau trước khi gập gối.\n4. Trọng tâm dồn vào giữa bàn chân.\n5. Đừng xuống quá sâu nếu độ linh hoạt chưa tốt (tránh hiện tượng butt wink).";
      }

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: "ai",
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, newMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInput("");
    generateAiResponse(newMsg.text);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div ref={containerRef} className="space-y-6 h-[calc(100vh-80px)] flex flex-col pb-6">
      <div className="flex-none">
        <PageHeader 
          title="AI Fitness Assistant"
          description="Trợ lý cá nhân ảo hỗ trợ lên lịch tập, thực đơn và giải đáp thắc mắc fitness 24/7." 
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px] flex-1 min-h-0">
        <div className="flex flex-col min-h-0 bg-white/50 rounded-3xl border border-slate-200/60 shadow-sm backdrop-blur-xl overflow-hidden">
          {/* Quick Actions */}
          <div className="p-4 border-b border-slate-100 bg-white/40 flex-none overflow-x-auto custom-scrollbar">
            <div className="flex gap-3 min-w-max">
              {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
                <button
                  key={label}
                  onClick={() => handleQuickAction(prompt)}
                  className="quick-action-card flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md hover:text-emerald-600 text-slate-600 text-sm font-medium transition-all duration-300 active:scale-95"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth" ref={chatListRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="flex-shrink-0">
                    {msg.sender === "user" ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md border-2 border-white">
                        <User className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md border-2 border-white">
                        <Bot className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                    <div 
                      className={`px-5 py-3.5 rounded-2xl shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap ${
                        msg.sender === "user" 
                          ? "bg-slate-900 text-white rounded-tr-sm" 
                          : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1.5 font-medium px-1">{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[85%] flex-row">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-md border-2 border-white flex-shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white border border-slate-100 shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white/80 border-t border-slate-100 flex-none backdrop-blur-md">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full p-1.5 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-400 transition-all shadow-sm">
              <button className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi hoặc yêu cầu của bạn..."
                className="flex-1 bg-transparent px-2 text-slate-700 outline-none placeholder:text-slate-400 text-[15px]"
                disabled={isTyping}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-md flex items-center justify-center"
              >
                {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 translate-x-px -translate-y-px" />}
              </button>
            </div>
            <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
              AI có thể mắc sai lầm. Hãy kiểm tra lại các thông tin quan trọng.
            </p>
          </div>
        </div>

        {/* Sidebar Cards */}
        <aside className="space-y-4 flex-none hidden xl:block overflow-y-auto custom-scrollbar pb-4 pr-2">
          <Card className="p-5 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><CalendarPlus className="w-5 h-5"/></div>
              <h3 className="font-bold text-slate-800">Lịch tập hiện tại</h3>
            </div>
            <p className="text-sm text-slate-600 font-medium">Push (Ngực - Vai - Tay sau)</p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden"><div className="h-full w-[40%] bg-blue-500 rounded-full"/></div>
              <span className="text-xs font-bold text-slate-500">2/5 buổi</span>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Utensils className="w-5 h-5"/></div>
              <h3 className="font-bold text-slate-800">Mục tiêu dinh dưỡng</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Calo</span><span className="font-bold text-slate-700">2,100 kcal</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Protein</span><span className="font-bold text-emerald-600">150g</span></div>
            </div>
          </Card>

          <Card className="p-5 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Activity className="w-5 h-5"/></div>
              <h3 className="font-bold text-slate-800">Chỉ số BMI</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-slate-800">22.4</span>
              <span className="text-sm font-bold text-emerald-600 mb-1 bg-emerald-50 px-2 py-0.5 rounded">Bình thường</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Dựa trên cân nặng 70kg, chiều cao 1m77</p>
          </Card>
          
          <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles className="w-24 h-24"/></div>
            <h3 className="font-bold text-lg mb-2 relative z-10">Premium AI</h3>
            <p className="text-sm text-slate-300 relative z-10 mb-4">Nâng cấp để mở khóa phân tích video tư thế tập và gọi điện trực tiếp với AI Coach.</p>
            <button className="w-full py-2 bg-white text-slate-900 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors relative z-10">Nâng cấp ngay</button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
