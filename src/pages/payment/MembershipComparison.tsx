import { Check, X, Crown, Star, Sparkles, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { useUser } from "../context/UserContext";

interface Feature {
  name: string;
  basic: boolean;
  standard: boolean;
  vip: boolean;
}

interface Package {
  id: "basic" | "standard" | "vip";
  name: string;
  price: number;
  duration: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
  best?: boolean;
}

const features: Feature[] = [
  { name: "Truy cập phòng gym mọi lúc", basic: true, standard: true, vip: true },
  { name: "Sử dụng thiết bị cơ bản", basic: true, standard: true, vip: true },
  { name: "Phòng tắm & tủ khóa", basic: true, standard: true, vip: true },
  { name: "WiFi miễn phí", basic: true, standard: true, vip: true },
  { name: "Check-in & BMI tracking", basic: true, standard: true, vip: true },
  { name: "Đặt lịch lớp Yoga & Aerobic", basic: false, standard: true, vip: true },
  { name: "Tư vấn PT cơ bản (2 buổi/tháng)", basic: false, standard: true, vip: true },
  { name: "Đo lường thành phần cơ thể", basic: false, standard: true, vip: true },
  { name: "AI gợi ý luyện tập nâng cao", basic: false, standard: false, vip: true },
  { name: "Hỗ trợ PT chuyên nghiệp (8 buổi/tháng)", basic: false, standard: false, vip: true },
  { name: "Kế hoạch dinh dưỡng riêng", basic: false, standard: false, vip: true },
  { name: "Massage phục hồi (2 buổi/tháng)", basic: false, standard: false, vip: true },
  { name: "Tủ đồ VIP riêng biệt", basic: false, standard: false, vip: true },
  { name: "Quyền mang 1 người tập cùng", basic: false, standard: false, vip: true },
];

const packages: Package[] = [
  {
    id: "basic",
    name: "Basic",
    price: 500000,
    duration: "1 tháng",
    description: "Phù hợp cho người mới bắt đầu",
    icon: <Star className="h-6 w-6" />,
  },
  {
    id: "standard",
    name: "Standard",
    price: 1200000,
    duration: "3 tháng",
    description: "Lựa chọn phổ biến nhất",
    icon: <Sparkles className="h-6 w-6" />,
    popular: true,
  },
  {
    id: "vip",
    name: "VIP",
    price: 3000000,
    duration: "6 tháng",
    description: "Trải nghiệm cao cấp nhất",
    icon: <Crown className="h-6 w-6" />,
    best: true,
  },
];

interface MembershipComparisonProps {
  onSelectPackage: (packageId: "basic" | "standard" | "vip", price: number) => void;
}

export function MembershipComparison({ onSelectPackage }: MembershipComparisonProps) {
  const { membershipTier } = useUser();

  return (
    <div className="space-y-12">
      {/* Package Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative flex flex-col transition-all duration-300 hover:scale-105 ${
              pkg.id === "vip"
                ? "border-[#ffd700] shadow-[0_0_30px_rgba(255,215,0,0.3)] bg-gradient-to-br from-[#1a1510] to-[#2a1f10]"
                : pkg.popular
                ? "border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.2)]"
                : "border-border/50"
            }`}
            style={{
              ...(pkg.id === "vip" && {
                boxShadow: "0 0 40px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2)",
              }),
            }}
          >
            {pkg.best && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-black px-4 py-1 shadow-lg flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Best Choice
                </Badge>
              </div>
            )}

            {pkg.popular && !pkg.best && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00ff88] text-black">
                Phổ Biến Nhất
              </Badge>
            )}

            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    pkg.id === "vip"
                      ? "bg-gradient-to-br from-[#ffd700] to-[#ffed4e] text-black"
                      : pkg.popular
                      ? "bg-[#00ff88]/10 text-[#00ff88]"
                      : "bg-muted/50"
                  }`}
                >
                  {pkg.icon}
                </div>
                <CardTitle
                  className={
                    pkg.id === "vip"
                      ? "text-[#ffd700]"
                      : pkg.popular
                      ? "text-[#00ff88]"
                      : ""
                  }
                >
                  {pkg.name}
                </CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                {pkg.description}
              </CardDescription>
              <div className="mt-4">
                <span
                  className={`text-3xl font-bold ${
                    pkg.id === "vip"
                      ? "text-[#ffd700]"
                      : pkg.popular
                      ? "text-[#00ff88]"
                      : ""
                  }`}
                >
                  {pkg.price.toLocaleString("vi-VN")}đ
                </span>
                <span className="text-muted-foreground">/{pkg.duration}</span>
              </div>
            </CardHeader>

            <CardFooter className="mt-auto">
              <Button
                className={`w-full ${
                  pkg.id === "vip"
                    ? "bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-black hover:from-[#ffed4e] hover:to-[#ffd700] shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                    : pkg.popular
                    ? "bg-[#00ff88] text-black hover:bg-[#00ff88]/90 shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                    : ""
                }`}
                variant={pkg.id === "vip" || pkg.popular ? "default" : "outline"}
                onClick={() => onSelectPackage(pkg.id, pkg.price)}
                disabled={membershipTier === pkg.id}
              >
                {membershipTier === pkg.id ? "Gói Hiện Tại" : "Chọn Gói Này"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Zap className="h-6 w-6 text-[#00ff88]" />
          <h2 className="text-center">So Sánh Chi Tiết Quyền Lợi</h2>
        </div>
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="text-left p-4 font-medium">Quyền Lợi</th>
                {packages.map((pkg) => (
                  <th key={pkg.id} className="p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          pkg.id === "vip"
                            ? "bg-gradient-to-br from-[#ffd700] to-[#ffed4e] text-black"
                            : pkg.popular
                            ? "bg-[#00ff88]/10 text-[#00ff88]"
                            : "bg-muted/50"
                        }`}
                      >
                        {pkg.icon}
                      </div>
                      <span
                        className={
                          pkg.id === "vip"
                            ? "text-[#ffd700]"
                            : pkg.popular
                            ? "text-[#00ff88]"
                            : ""
                        }
                      >
                        {pkg.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr
                  key={index}
                  className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4">{feature.name}</td>
                  <td className="p-4 text-center">
                    {feature.basic ? (
                      <Check className="h-5 w-5 text-[#00ff88] mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-[#ef4444] mx-auto" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {feature.standard ? (
                      <Check className="h-5 w-5 text-[#00ff88] mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-[#ef4444] mx-auto" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {feature.vip ? (
                      <Check className="h-5 w-5 text-[#ffd700] mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-[#ef4444] mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
