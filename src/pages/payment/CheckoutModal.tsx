import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Wallet, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { useUser } from "../context/UserContext";
import { Alert, AlertDescription } from "./ui/alert";

type PaymentMethod = "wallet" | "vnpay" | "momo";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  itemName: string;
  amount: number;
  onConfirm: (method: PaymentMethod) => void;
  type?: "membership" | "topup";
}

export function CheckoutModal({
  open,
  onClose,
  itemName,
  amount,
  onConfirm,
  type = "membership",
}: CheckoutModalProps) {
  const { walletBalance } = useUser();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    type === "membership" && walletBalance >= amount ? "wallet" : "vnpay"
  );
  const canUseWallet = walletBalance >= amount && type === "membership";

  const handleConfirm = () => {
    onConfirm(paymentMethod);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-[#00ff88]/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-[#00ff88]" />
            </div>
            Xác Nhận Thanh Toán
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Chọn phương thức thanh toán cho <span className="text-foreground font-medium">{itemName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Display */}
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 p-6 rounded-xl border border-border/50">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Tổng thanh toán</div>
              <div className="text-4xl font-bold text-[#00ff88]">
                {amount.toLocaleString("vi-VN")}đ
              </div>
            </div>
          </div>

          {/* Wallet Balance (only for membership) */}
          {type === "membership" && (
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/30">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Số dư ví hiện tại:</span>
              </div>
              <span className={`font-bold ${walletBalance >= amount ? "text-[#00ff88]" : "text-[#ef4444]"}`}>
                {walletBalance.toLocaleString("vi-VN")}đ
              </span>
            </div>
          )}

          {/* Payment Methods */}
          <div>
            <h4 className="mb-3 text-sm font-medium">Phương thức thanh toán</h4>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            >
              <div className="space-y-3">
                {/* Wallet Option - Only for membership */}
                {type === "membership" && (
                  <div
                    className={`flex items-center space-x-3 border rounded-xl p-4 transition-all ${
                      !canUseWallet
                        ? "opacity-40 cursor-not-allowed"
                        : paymentMethod === "wallet"
                        ? "border-[#00ff88] bg-[#00ff88]/5 shadow-[0_0_15px_rgba(0,255,136,0.1)]"
                        : "border-border/50 hover:border-[#00ff88]/50 hover:bg-muted/30 cursor-pointer"
                    }`}
                    onClick={() => canUseWallet && setPaymentMethod("wallet")}
                  >
                    <RadioGroupItem value="wallet" id="wallet" disabled={!canUseWallet} />
                    <Label
                      htmlFor="wallet"
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                    >
                      <div className="p-2 bg-[#00ff88]/10 rounded-lg">
                        <Wallet className="h-5 w-5 text-[#00ff88]" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Ví FitLife</div>
                        {!canUseWallet && (
                          <div className="text-xs text-[#ef4444]">Số dư không đủ</div>
                        )}
                      </div>
                    </Label>
                  </div>
                )}

                {/* VNPay */}
                <div
                  className={`flex items-center space-x-3 border rounded-xl p-4 transition-all ${
                    paymentMethod === "vnpay"
                      ? "border-[#ff6b35] bg-[#ff6b35]/5 shadow-[0_0_15px_rgba(255,107,53,0.1)]"
                      : "border-border/50 hover:border-[#ff6b35]/50 hover:bg-muted/30 cursor-pointer"
                  }`}
                  onClick={() => setPaymentMethod("vnpay")}
                >
                  <RadioGroupItem value="vnpay" id="vnpay" />
                  <Label htmlFor="vnpay" className="flex items-center gap-3 flex-1 cursor-pointer">
                    <div className="p-2 bg-[#ff6b35]/10 rounded-lg">
                      <CreditCard className="h-5 w-5 text-[#ff6b35]" />
                    </div>
                    <div>
                      <div className="font-medium">VNPay</div>
                      <div className="text-xs text-muted-foreground">Thanh toán qua VNPay</div>
                    </div>
                  </Label>
                </div>

                {/* Momo */}
                <div
                  className={`flex items-center space-x-3 border rounded-xl p-4 transition-all ${
                    paymentMethod === "momo"
                      ? "border-pink-500 bg-pink-500/5 shadow-[0_0_15px_rgba(236,72,153,0.1)]"
                      : "border-border/50 hover:border-pink-500/50 hover:bg-muted/30 cursor-pointer"
                  }`}
                  onClick={() => setPaymentMethod("momo")}
                >
                  <RadioGroupItem value="momo" id="momo" />
                  <Label htmlFor="momo" className="flex items-center gap-3 flex-1 cursor-pointer">
                    <div className="p-2 bg-pink-500/10 rounded-lg">
                      <CreditCard className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <div className="font-medium">Momo</div>
                      <div className="text-xs text-muted-foreground">Ví điện tử Momo</div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Warning for insufficient wallet balance */}
          {type === "membership" && !canUseWallet && paymentMethod === "wallet" && (
            <Alert variant="destructive" className="border-[#ef4444]/50 bg-[#ef4444]/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Số dư ví không đủ. Vui lòng nạp thêm hoặc chọn phương thức thanh toán khác.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-[#00ff88] text-black hover:bg-[#00ff88]/90 shadow-[0_0_15px_rgba(0,255,136,0.2)]"
          >
            Xác Nhận Thanh Toán
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
