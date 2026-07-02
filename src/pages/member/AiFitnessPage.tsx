import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Bot, CalendarPlus, Mic, Send, Utensils, Activity, User, Sparkles, Loader2, Dumbbell, Target, History, X, CheckCircle2, Wand2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader";
import type { ChatMessage, AiWorkoutPlan, AiHistoryItem } from "../../types/ai.type";
import { aiService } from "../../services/aiService";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

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

function AiPlanViewer({ plan }: { plan: AiWorkoutPlan }) {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    try {
      await aiService.applyPlan(plan);
      setApplied(true);
      toast.success("Tuyệt vời! Giáo án đã được áp dụng vào lịch tập của bạn.");
    } catch (e) {
      toast.error("Lỗi khi áp dụng giáo án.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="mt-4 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden text-left">
      <div className="bg-slate-900 text-white p-6">
        <h3 className="text-xl font-black">{plan.title}</h3>
        <p className="text-slate-300 mt-2 text-sm">{plan.summary}</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
            <Target className="w-4 h-4" /> {plan.goal}
          </span>
          <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
            <User className="w-4 h-4" /> {plan.level}
          </span>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {plan.days.map((day, idx) => (
          <div key={idx} className="border border-slate-100 rounded-2xl p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-700 w-6 h-6 flex items-center justify-center rounded-full text-xs">
                  {day.day}
                </span>
                {day.title}
              </h4>
              <span className="text-xs font-bold text-slate-500 uppercase">{day.focus}</span>
            </div>
            
            <div className="space-y-3">
              {day.exercises.map((exe, eIdx) => (
                <div key={eIdx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{exe.name}</p>
                      {exe.note && <p className="text-[11px] text-slate-500">{exe.note}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-700 text-sm">{exe.sets} <span className="text-xs text-slate-400 font-normal">sets</span></p>
                    <p className="font-black text-slate-700 text-sm">{exe.reps} <span className="text-xs text-slate-400 font-normal">reps</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {plan.notes && (
        <div className="bg-orange-50 p-6 border-t border-orange-100">
          <h5 className="font-bold text-orange-800 mb-2 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Lời khuyên
          </h5>
          <ul className="list-disc list-inside text-xs text-orange-700 space-y-1">
            {plan.notes.map((note, idx) => <li key={idx}>{note}</li>)}
          </ul>
        </div>
      )}

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
        <Button 
          variant="primary"
          disabled={applying || applied}
          onClick={handleApply}
          className={`rounded-full flex items-center gap-2 transition-all ${
            applied ? "bg-emerald-500 text-white border-none" : "bg-slate-900 text-white border-none hover:bg-slate-800"
          }`}
        >
          {applying ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
          ) : applied ? (
            <><CheckCircle2 className="w-4 h-4" /> Đã áp dụng</>
          ) : (
            <><CalendarPlus className="w-4 h-4" /> Áp dụng vào lịch tập</>
          )}
        </Button>
      </div>
    </div>
  );
}

export default function AiFitnessPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<AiHistoryItem[]>([]);
  
  // AI-FE-01: Form Modal State
  const [showAdvancedForm, setShowAdvancedForm] = useState(false);
  const [formData, setFormData] = useState({ goal: "Giảm mỡ", level: "Người mới", daysPerWeek: 4, durationMinutes: 60 });
  
  // AI-FE-04: History Detail Modal State
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AiHistoryItem | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await aiService.getAiHistory();
      setHistoryItems(data);
    };
    fetchHistory();
  }, []);

  useGSAP(() => {
    gsap.from(".quick-action-card", {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out",
    });
  }, { scope: containerRef });

  const generateAiResponse = (userText: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let aiText = "Mình đã ghi nhận yêu cầu của bạn. Hiện tại hệ thống Backend AI đang trong quá trình nâng cấp, mình sẽ phản hồi chi tiết sau nhé!";
      let planObject: AiWorkoutPlan | undefined;
      
      const lowerText = userText.toLowerCase();
      if (lowerText.includes("lịch tập") || lowerText.includes("giáo án")) {
        aiText = "Đây là giáo án tập luyện mình thiết kế riêng cho bạn. Hãy xem qua chi tiết nhé:";
        planObject = {
          title: "Giáo án Tùy chỉnh AI",
          goal: formData.goal,
          level: formData.level,
          summary: `Chương trình ${formData.daysPerWeek} ngày/tuần, mỗi buổi ${formData.durationMinutes} phút.`,
          days: [
            {
              day: 1,
              title: "Thân trên (Upper Body)",
              focus: "Ngực, Lưng, Vai",
              exercises: [
                { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", note: "Đẩy tạ đơn ghế dốc lên" },
                { name: "Lat Pulldown", sets: 3, reps: "12-15", note: "Kéo xô máy" },
              ]
            },
            {
              day: 2,
              title: "Thân dưới (Lower Body)",
              focus: "Đùi, Mông, Bụng",
              exercises: [
                { name: "Goblet Squat", sets: 4, reps: "12", note: "Squat ôm 1 cục tạ trước ngực" },
                { name: "Leg Press", sets: 3, reps: "15", note: "Đạp đùi trên máy" },
              ]
            }
          ],
          notes: [
            "Nghỉ 60-90 giây giữa các hiệp.",
            "Khởi động kỹ các khớp trước khi tập."
          ]
        };
      } else if (lowerText.includes("thực đơn") || lowerText.includes("meal plan")) {
        aiText = "Với nhu cầu 2000 kcal giàu protein, bạn có thể tham khảo:\n- Sáng: 3 quả trứng luộc, 2 lát bánh mì đen, 1 ly sữa không đường.\n- Trưa: 200g ức gà áp chảo, 1 chén cơm gạo lứt, 1 đĩa salad trộn dầu giấm.\n- Chiều (Snack): 1 quả chuối, 1 muỗng whey protein.\n- Tối: 150g cá hồi nướng, khoai lang luộc, măng tây.\n\nNhớ uống đủ 2-3 lít nước mỗi ngày nhé!";
      }

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: "ai",
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        planObject
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

  const submitAdvancedForm = () => {
    setShowAdvancedForm(false);
    const textPrompt = `Tạo giáo án nâng cao: Mục tiêu ${formData.goal}, Trình độ ${formData.level}, ${formData.daysPerWeek} buổi/tuần, ${formData.durationMinutes} phút/buổi.`;
    
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    generateAiResponse(textPrompt);
  };

  const openHistoryDetail = (item: AiHistoryItem) => {
    if (!item.planObject) {
      toast("Phiên này chỉ có chat, không có giáo án chi tiết.", { icon: "ℹ️" });
      return;
    }
    setSelectedHistoryItem(item);
    setSidebarOpen(false); // Đóng sidebar khi mở chi tiết
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative overflow-hidden">
      <div className="flex justify-between items-center pr-2">
        <PageHeader title="FitLife AI" description="Trợ lý cá nhân thông minh của bạn" />
        <Button 
          variant="outline" 
          onClick={() => setSidebarOpen(true)}
          className="rounded-full flex items-center gap-2 border-slate-200 text-slate-600 hover:text-slate-900 bg-white"
        >
          <History className="w-4 h-4" /> <span className="hidden sm:inline">Lịch sử</span>
        </Button>
      </div>
      
      {/* Drawer / Sidebar cho Lịch sử */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40 rounded-3xl"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white border-l border-slate-100 shadow-2xl z-50 flex flex-col rounded-r-3xl"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-500" /> Lịch sử AI
                </h3>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {historyItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => openHistoryDetail(item)}
                    className="p-4 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {item.type === "workout" ? <CalendarPlus className="w-4 h-4 text-emerald-500" /> : 
                       item.type === "meal" ? <Utensils className="w-4 h-4 text-orange-500" /> : 
                       <Bot className="w-4 h-4 text-blue-500" />}
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{item.summary}</p>
                    <p className="text-[10px] text-slate-400 mt-2">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal History Detail (AI-FE-04) */}
      <AnimatePresence>
        {selectedHistoryItem && selectedHistoryItem.planObject && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHistoryItem(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 rounded-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute inset-4 sm:inset-10 bg-slate-50 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              <div className="bg-white p-4 flex justify-between items-center border-b border-slate-100">
                <h3 className="font-bold text-slate-900">Chi tiết Lịch sử</h3>
                <button 
                  onClick={() => setSelectedHistoryItem(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                <AiPlanViewer plan={selectedHistoryItem.planObject} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal Advanced AI Form (AI-FE-01) */}
      <AnimatePresence>
        {showAdvancedForm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdvancedForm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-40 rounded-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl z-50"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                  <Wand2 className="w-6 h-6 text-emerald-500" /> Tạo AI Plan nâng cao
                </h3>
                <button onClick={() => setShowAdvancedForm(false)} className="text-slate-400 hover:text-slate-900"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Mục tiêu</label>
                  <select 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.goal}
                    onChange={e => setFormData({...formData, goal: e.target.value})}
                  >
                    <option>Giảm mỡ</option>
                    <option>Tăng cơ</option>
                    <option>Duy trì vóc dáng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Trình độ</label>
                  <select 
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value})}
                  >
                    <option>Người mới (Beginner)</option>
                    <option>Trung bình (Intermediate)</option>
                    <option>Nâng cao (Advanced)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Số buổi/tuần</label>
                    <Input type="number" min={1} max={7} value={formData.daysPerWeek} onChange={e => setFormData({...formData, daysPerWeek: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Phút/buổi</label>
                    <Input type="number" min={15} max={120} value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})} />
                  </div>
                </div>
                
                <Button variant="primary" className="w-full bg-slate-900 text-white rounded-xl mt-4" onClick={submitAdvancedForm}>
                  Tạo giáo án ngay
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden" ref={containerRef}>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.length === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(action.prompt);
                    setTimeout(() => handleSend(), 100);
                  }}
                  className="quick-action-card text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group"
                >
                  <action.icon className="w-6 h-6 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{action.label}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{action.prompt}</p>
                </button>
              ))}
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 max-w-3xl ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center mt-1 ${
                msg.sender === "user" ? "bg-slate-900 text-white" : "bg-emerald-500 text-white"
              }`}>
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`space-y-1 ${msg.sender === "user" ? "text-right" : ""}`}>
                <div className={`inline-block p-4 rounded-2xl ${
                  msg.sender === "user" 
                    ? "bg-slate-900 text-white rounded-tr-sm" 
                    : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                </div>
                {msg.planObject && <AiPlanViewer plan={msg.planObject} />}
                <p className="text-[10px] text-slate-400 px-2">{msg.timestamp}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-500 text-white flex items-center justify-center mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />
                <span className="text-sm text-slate-500 font-medium">AI đang suy nghĩ...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-end gap-2 max-w-4xl mx-auto relative">
            <button 
              onClick={() => setShowAdvancedForm(true)}
              className="p-3 bg-slate-100 rounded-xl text-emerald-600 hover:bg-emerald-100 transition-colors shrink-0 group"
              title="Tạo giáo án nâng cao"
            >
              <Wand2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi hoặc yêu cầu của bạn..."
                className="w-full bg-slate-50 border-transparent focus:bg-white pr-12 rounded-xl resize-none"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-500 text-white w-10 h-10 p-0 flex items-center justify-center hover:bg-emerald-600 disabled:opacity-50 border-none"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
