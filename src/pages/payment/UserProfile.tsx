import { Crown, Star, Sparkles, Wallet, Lock, Calendar, Dumbbell, Users, Utensils, Shirt, Zap, User as UserIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useUser, MembershipTier } from "../context/UserContext";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface Feature {
  icon: React.ReactNode;
  name: string;
  description: string;
  requiredTier: MembershipTier;
}

const features: Feature[] = [
  {
    icon: <Calendar className="h-5 w-5" />,
    name: "Đặt lịch lớp",
    description: "Đặt lịch Yoga, Aerobic",
    requiredTier: "standard",
  },
  {
    icon: <Dumbbell className="h-5 w-5" />,
    name: "Tư vấn PT",
    description: "2-8 buổi/tháng",
    requiredTier: "standard",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    name: "AI gợi ý nâng cao",
    description: "Luyện tập thông minh",
    requiredTier: "vip",
  },
  {
    icon: <Utensils className="h-5 w-5" />,
    name: "Dinh dưỡng riêng",
    description: "Kế hoạch cá nhân hóa",
    requiredTier: "vip",
  },
  {
    icon: <Users className="h-5 w-5" />,
    name: "Mang bạn tập cùng",
    description: "1 người/buổi",
    requiredTier: "vip",
  },
  {
    icon: <Shirt className="h-5 w-5" />,
    name: "Tủ đồ VIP",
    description: "Riêng biệt & rộng rãi",
    requiredTier: "vip",
  },
];

const tierInfo = {
  basic: {
    name: "Basic",
    icon: <Star className="h-8 w-8" />,
    color: "text-gray-400",
    bgGradient: "from-gray-600 to-gray-500",
    borderColor: "border-gray-500",
    glowColor: "shadow-[0_0_20px_rgba(156,163,175,0.3)]",
  },
  standard: {
    name: "Standard",
    icon: <Sparkles className="h-8 w-8" />,
    color: "text-[#00ff88]",
    bgGradient: "from-[#00ff88] to-[#00cc6a]",
    borderColor: "border-[#00ff88]",
    glowColor: "shadow-[0_0_25px_rgba(0,255,136,0.4)]",
  },
  vip: {
    name: "VIP",
    icon: <Crown className="h-8 w-8" />,
    color: "text-[#ffd700]",
    bgGradient: "from-[#ffd700] to-[#ffed4e]",
    borderColor: "border-[#ffd700]",
    glowColor: "shadow-[0_0_30px_rgba(255,215,0,0.5)]",
  },
};

export function UserProfile() {
  const { membershipTier, walletBalance } = useUser();

  const currentTier = membershipTier ? tierInfo[membershipTier] : null;

  const isFeatureAvailable = (requiredTier: MembershipTier): boolean => {
    if (!membershipTier || !requiredTier) return false;
    const tierLevels = { basic: 1, standard: 2, vip: 3 };
    return tierLevels[membershipTier] >= tierLevels[requiredTier];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card className="border-border/30 overflow-hidden">
        <div className="bg-gradient-to-r from-[#00ff88]/10 via-[#ff6b35]/10 to-[#00ff88]/10 p-6 border-b border-border/30">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-[#00ff88]">
              <AvatarFallback className="bg-gradient-to-br from-[#00ff88] to-[#00cc6a] text-black text-2xl">
                <UserIcon className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl mb-1">Thành Viên FitLife</h2>
              <p className="text-sm text-muted-foreground">Quản lý tài khoản và quyền lợi của bạn</p>
            </div>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Membership Status */}
          <div>
            <h3 className="mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#00ff88]" />
              Hạng Thẻ Hiện Tại
            </h3>
            {currentTier ? (
              <Card className={`${currentTier.borderColor} border-2 ${currentTier.glowColor}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 bg-gradient-to-br ${currentTier.bgGradient} rounded-xl ${currentTier.glowColor}`}>
                      {currentTier.icon}
                    </div>
                    <div className="flex-1">
                      <Badge className={`bg-gradient-to-r ${currentTier.bgGradient} text-black mb-2`}>
                        {currentTier.name} Member
                      </Badge>
                      <div className={`text-3xl font-bold ${currentTier.color}`}>
                        {currentTier.name}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Thành viên {currentTier.name}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-2 border-border/50">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex p-4 bg-muted/50 rounded-full mb-4">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Bạn chưa có gói thành viên nào
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Hãy chọn gói phù hợp để bắt đầu hành trình rèn luyện!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Wallet Balance */}
          <div>
            <h3 className="mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#00ff88]" />
              Số Dư Ví
            </h3>
            <Card className="border-[#00ff88]/30 shadow-[0_0_20px_rgba(0,255,136,0.15)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-[#00ff88] to-[#00cc6a] rounded-xl shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                    <Wallet className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Ví FitLife</div>
                    <div className="text-3xl font-bold text-[#00ff88]">
                      {walletBalance.toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Features Access - Quick Actions Grid */}
      <Card className="border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[#00ff88]" />
            Quyền Lợi & Tính Năng
          </CardTitle>
          <CardDescription>
            Các tính năng bạn có thể sử dụng dựa trên gói thành viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const available = isFeatureAvailable(feature.requiredTier);
              const tierLevel = feature.requiredTier ? tierInfo[feature.requiredTier] : null;

              return (
                <Button
                  key={index}
                  variant="outline"
                  disabled={!available}
                  className={`h-auto p-4 flex items-start gap-3 justify-start transition-all ${
                    available
                      ? "border-[#00ff88]/30 hover:border-[#00ff88] hover:bg-[#00ff88]/5 hover:shadow-[0_0_15px_rgba(0,255,136,0.1)]"
                      : "border-dashed opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-lg shrink-0 ${
                      available
                        ? "bg-gradient-to-br from-[#00ff88] to-[#00cc6a] text-black"
                        : "bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {available ? feature.icon : <Lock className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium">{feature.name}</h4>
                      {!available && tierLevel && (
                        <Badge
                          variant="secondary"
                          className={`text-xs bg-gradient-to-r ${tierLevel.bgGradient} text-black`}
                        >
                          {tierLevel.name}+
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </Button>
              );
            })}
          </div>

          {!membershipTier && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center border border-dashed border-border/50">
              <p className="text-sm text-muted-foreground">
                Mua gói thành viên để mở khóa các tính năng cao cấp
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats (Optional) */}
      {membershipTier && (
        <Card className="border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-[#00ff88]" />
              Thống Kê Hoạt Động
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground">Buổi tập trong tháng</span>
                <span className="font-bold text-[#00ff88]">12/30</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground">Mục tiêu calories</span>
                <span className="font-bold text-[#ff6b35]">2,400/3,000 kcal</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
