import { Wallet, Gift, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useUser } from "../context/UserContext";

interface TopUpOption {
  amount: number;
  bonus: number;
  label?: string;
}

const topUpOptions: TopUpOption[] = [
  {
    amount: 100000,
    bonus: 0,
  },
  {
    amount: 300000,
    bonus: 10000,
    label: "Bonus 10k",
  },
  {
    amount: 500000,
    bonus: 25000,
    label: "Bonus 25k",
  },
];

interface WalletTopUpProps {
  onTopUp: (amount: number, bonus: number) => void;
}

export function WalletTopUp({ onTopUp }: WalletTopUpProps) {
  const { walletBalance } = useUser();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Wallet Balance Card */}
      <Card className="border-[#00ff88]/30 shadow-[0_0_20px_rgba(0,255,136,0.15)]">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-[#00ff88] to-[#00cc6a] rounded-xl">
                <Wallet className="h-8 w-8 text-black" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Số Dư Ví FitLife</div>
                <div className="text-4xl font-bold text-[#00ff88]">
                  {walletBalance.toLocaleString("vi-VN")}đ
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top-up Options */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-[#00ff88]" />
          <h2>Chọn Mệnh Giá Nạp</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {topUpOptions.map((option) => (
            <Card
              key={option.amount}
              className={`relative transition-all duration-300 hover:scale-105 ${
                option.bonus > 0
                  ? "border-[#ff6b35] shadow-[0_0_20px_rgba(255,107,53,0.2)]"
                  : "border-border/50"
              }`}
            >
              {option.label && (
                <div className="absolute -top-3 -right-3 z-10">
                  <div className="relative">
                    {/* Ribbon */}
                    <div className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c61] px-4 py-2 rounded-lg shadow-lg transform rotate-12 flex items-center gap-1">
                      <Gift className="h-4 w-4 text-white" />
                      <span className="text-white font-bold text-sm">{option.label}</span>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b35] to-[#ff8c61] blur-md opacity-50 -z-10" />
                  </div>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-3xl">
                  {option.amount.toLocaleString("vi-VN")}đ
                </CardTitle>
                {option.bonus > 0 && (
                  <CardDescription className="text-[#ff6b35] font-medium">
                    + {option.bonus.toLocaleString("vi-VN")}đ khuyến mãi
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Số tiền nạp:</span>
                    <span className="text-foreground">
                      {option.amount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {option.bonus > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Bonus:</span>
                      <span className="text-[#ff6b35] font-medium">
                        +{option.bonus.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-3 border-t border-border/50">
                    <span>Nhận được:</span>
                    <span className="text-[#00ff88]">
                      {(option.amount + option.bonus).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>

                <Button
                  className={`w-full ${
                    option.bonus > 0
                      ? "bg-gradient-to-r from-[#ff6b35] to-[#ff8c61] hover:from-[#ff8c61] hover:to-[#ff6b35] shadow-[0_0_15px_rgba(255,107,53,0.3)]"
                      : "bg-[#00ff88] text-black hover:bg-[#00ff88]/90"
                  }`}
                  onClick={() => onTopUp(option.amount, option.bonus)}
                >
                  Nạp Ngay
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info */}
      <Card className="border-border/30 bg-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Lưu Ý Quan Trọng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <span className="text-[#00ff88]">•</span>
            Số tiền nạp sẽ được cộng vào ví FitLife của bạn ngay lập tức
          </p>
          <p className="flex items-start gap-2">
            <span className="text-[#00ff88]">•</span>
            Số dư ví có thể sử dụng để mua gói tập hoặc các dịch vụ khác
          </p>
          <p className="flex items-start gap-2">
            <span className="text-[#ff6b35]">•</span>
            Chương trình khuyến mãi bonus có thể thay đổi mà không cần báo trước
          </p>
          <p className="flex items-start gap-2">
            <span className="text-[#00ff88]">•</span>
            Liên hệ hotline <span className="text-foreground font-medium">1900-xxxx</span> nếu cần hỗ trợ
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
