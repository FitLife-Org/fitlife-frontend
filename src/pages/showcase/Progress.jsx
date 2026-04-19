import { useState } from "react";
import {
    Flame, Zap, Trophy, Target, TrendingDown, Activity,
    Dumbbell, Calendar, Star, Award, Heart, ShieldCheck,
    ChevronUp, ChevronDown, Coins
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MEMBER = {
    name: "Nguyen Minh Khoa",
    avatar: "NMK",
    plan: "Platinum",
    joinDate: "Jan 2024",
    bmi: 22.5,
    bmiStatus: "Normal Weight",
    height: 175,
    currentWeight: 69,
    startWeight: 78,
    targetWeight: 65,
    bodyFat: 16.2,
    muscleMass: 54.8,
    calories: 2140,
    calorieGoal: 2500,
};

const WEIGHT_HISTORY = [
    { month: "Oct", weight: 78 },
    { month: "Nov", weight: 76.2 },
    { month: "Dec", weight: 74.5 },
    { month: "Jan", weight: 73.1 },
    { month: "Feb", weight: 71.8 },
    { month: "Mar", weight: 70.3 },
    { month: "Apr", weight: 69.0 },
];

const WEEKLY_ACTIVITY = [
    { day: "Mon", sessions: 1, calories: 420 },
    { day: "Tue", sessions: 0, calories: 0 },
    { day: "Wed", sessions: 1, calories: 580 },
    { day: "Thu", sessions: 1, calories: 390 },
    { day: "Fri", sessions: 2, calories: 710 },
    { day: "Sat", sessions: 1, calories: 460 },
    { day: "Sun", sessions: 0, calories: 0 },
];

const METRICS = [
    { label: "Body Fat", value: "16.2", unit: "%", prev: 19.4, icon: Activity, color: "text-rose-400", bg: "bg-rose-500/10" },
    { label: "Muscle Mass", value: "54.8", unit: "kg", prev: 52.1, icon: Dumbbell, color: "text-sky-400", bg: "bg-sky-500/10" },
    { label: "Resting HR", value: "62", unit: "bpm", prev: 68, icon: Heart, color: "text-pink-400", bg: "bg-pink-500/10" },
    { label: "Calories", value: "2,140", unit: "kcal", prev: 1980, icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10" },
];

const ACHIEVEMENTS = [
    {
        id: 1, icon: Flame, label: "7-Day Streak", desc: "Trained 7 days in a row",
        earned: true, date: "Apr 14", color: "from-orange-500 to-amber-400", glow: "shadow-orange-500/30",
    },
    {
        id: 2, icon: Dumbbell, label: "Iron Lifter", desc: "Logged 50 strength sessions",
        earned: true, date: "Mar 29", color: "from-slate-500 to-slate-400", glow: "shadow-slate-400/30",
    },
    {
        id: 3, icon: TrendingDown, label: "Fat Burner", desc: "Lost 5kg since joining",
        earned: true, date: "Feb 18", color: "from-emerald-500 to-teal-400", glow: "shadow-emerald-500/30",
    },
    {
        id: 4, icon: Star, label: "Early Bird", desc: "10 sessions before 7 AM",
        earned: false, date: null, color: "from-slate-700 to-slate-600", glow: "",
    },
    {
        id: 5, icon: Trophy, label: "Century Club", desc: "Complete 100 sessions",
        earned: false, date: null, color: "from-slate-700 to-slate-600", glow: "",
    },
];

const FITCOINS_HISTORY = [
    { label: "Morning Session Bonus", amount: +50, date: "Today" },
    { label: "7-Day Streak Reward", amount: +200, date: "Apr 14" },
    { label: "Nutrition Log Complete", amount: +30, date: "Apr 13" },
    { label: "Redeemed: Protein Shake", amount: -80, date: "Apr 10" },
];

// ─── BMI Scale ────────────────────────────────────────────────────────────────
function BmiScale({ bmi }) {
    // BMI range 15–35 mapped to 0–100%
    const pos = Math.min(100, Math.max(0, ((bmi - 15) / 20) * 100));
    const zones = [
        { label: "Under", color: "bg-sky-400", width: "20%" },
        { label: "Normal", color: "bg-emerald-400", width: "30%" },
        { label: "Over", color: "bg-amber-400", width: "25%" },
        { label: "Obese", color: "bg-rose-500", width: "25%" },
    ];
    return (
        <div className="mt-4">
            <div className="relative h-2.5 rounded-full overflow-hidden flex">
                {zones.map((z) => (
                    <div key={z.label} className={`${z.color} opacity-70`} style={{ width: z.width }} />
                ))}
                {/* Needle */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-900 shadow-lg shadow-slate-900/40 transition-all duration-700"
                    style={{ left: `${pos}%` }}
                />
            </div>
            <div className="flex justify-between mt-1.5">
                {zones.map((z) => (
                    <span key={z.label} className="text-[9px] font-bold uppercase tracking-wider text-slate-600" style={{ width: z.width }}>
            {z.label}
          </span>
                ))}
            </div>
        </div>
    );
}

// ─── Bar Chart (CSS) ──────────────────────────────────────────────────────────
function WeightChart({ data }) {
    const min = Math.min(...data.map((d) => d.weight)) - 1;
    const max = Math.max(...data.map((d) => d.weight)) + 1;
    const range = max - min;

    return (
        <div className="relative">
            {/* Y-axis guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ bottom: "24px", top: 0 }}>
                {[max, (max + min) / 2, min].map((v) => (
                    <div key={v} className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-600 w-7 text-right">{v.toFixed(0)}</span>
                        <div className="flex-1 border-t border-slate-800/60 border-dashed" />
                    </div>
                ))}
            </div>

            {/* Bars */}
            <div className="flex items-end gap-2 pl-10 pt-2 pb-6 relative" style={{ height: "160px" }}>
                {data.map((d, i) => {
                    const heightPct = ((d.weight - min) / range) * 100;
                    const isLast = i === data.length - 1;
                    return (
                        <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                            <div className="relative w-full flex items-end justify-center" style={{ height: "120px" }}>
                                {isLast && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">
                                        {d.weight} kg
                                    </div>
                                )}
                                <div
                                    className={`w-full rounded-t-lg transition-all duration-700 ${isLast ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-slate-700 group-hover:bg-slate-600"}`}
                                    style={{ height: `${heightPct}%`, minHeight: "6px" }}
                                />
                            </div>
                            <span className={`text-[10px] font-semibold ${isLast ? "text-emerald-400" : "text-slate-600"}`}>
                {d.month}
              </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Activity Heatmap row ─────────────────────────────────────────────────────
function ActivityRow({ data }) {
    const maxCal = Math.max(...data.map((d) => d.calories), 1);
    return (
        <div className="flex gap-2 mt-3">
            {data.map((d) => {
                const intensity = d.calories / maxCal;
                return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-800">
                            <div
                                className="absolute inset-0 bg-emerald-500 transition-opacity duration-300"
                                style={{ opacity: d.sessions === 0 ? 0.04 : 0.15 + intensity * 0.7 }}
                            />
                            {d.sessions > 0 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Flame size={12} className="text-emerald-400" />
                                </div>
                            )}
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 uppercase">{d.day}</span>
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-white text-[9px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
                            {d.calories > 0 ? `${d.calories} kcal` : "Rest day"}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Progress.jsx ─────────────────────────────────────────────────────────────
export default function Progress() {
    const [activeTab, setActiveTab] = useState("overview");

    const weightLost = MEMBER.startWeight - MEMBER.currentWeight;
    const weightToGo = MEMBER.currentWeight - MEMBER.targetWeight;
    const totalJourney = MEMBER.startWeight - MEMBER.targetWeight;
    const progressPct = Math.round((weightLost / totalJourney) * 100);

    return (
        <div
            className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8"
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
        >
            {/* Ambient glow */}
            <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/4 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-5xl mx-auto space-y-5">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Health Dashboard</p>
                        <h1 className="text-2xl font-black text-slate-50 tracking-tight">My Progress</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-300">{MEMBER.name}</p>
                            <p className="text-[10px] text-slate-600">Member since {MEMBER.joinDate}</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-emerald-500/25">
                            {MEMBER.avatar}
                        </div>
                    </div>
                </div>

                {/* ── Top Row: BMI + Weight Goal ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* BMI Widget */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative">
                            <div className="flex items-start justify-between mb-1">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Body Mass Index</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-slate-50 tracking-tight">{MEMBER.bmi}</span>
                                        <span className="text-sm text-slate-500 font-medium">kg/m²</span>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  <ShieldCheck size={10} />
                                    {MEMBER.bmiStatus}
                </span>
                            </div>
                            <div className="flex gap-4 mt-3 text-xs text-slate-500">
                                <span>Height <span className="text-slate-300 font-semibold">{MEMBER.height} cm</span></span>
                                <span>Weight <span className="text-slate-300 font-semibold">{MEMBER.currentWeight} kg</span></span>
                            </div>
                            <BmiScale bmi={MEMBER.bmi} />
                        </div>
                    </div>

                    {/* Weight Goal */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Weight Loss Journey</p>

                        <div className="flex items-center justify-between mb-5">
                            <div className="text-center">
                                <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">Started</p>
                                <p className="text-2xl font-black text-slate-400">{MEMBER.startWeight}</p>
                                <p className="text-[9px] text-slate-600">kg</p>
                            </div>
                            <div className="flex-1 mx-4">
                                <div className="flex justify-center mb-1">
                                    <span className="text-[10px] font-bold text-emerald-400">−{weightLost} kg lost</span>
                                </div>
                                <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000 relative"
                                        style={{ width: `${progressPct}%` }}
                                    >
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-500 shadow-md" />
                                    </div>
                                </div>
                                <div className="flex justify-center mt-1">
                                    <span className="text-[10px] text-slate-600">{progressPct}% complete</span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] uppercase tracking-wider text-slate-600 mb-1">Target</p>
                                <p className="text-2xl font-black text-emerald-400">{MEMBER.targetWeight}</p>
                                <p className="text-[9px] text-slate-600">kg</p>
                            </div>
                        </div>

                        {/* Sub-metrics */}
                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
                            {[
                                { label: "Lost", val: `${weightLost} kg`, color: "text-emerald-400" },
                                { label: "Current", val: `${MEMBER.currentWeight} kg`, color: "text-slate-200" },
                                { label: "To Go", val: `${weightToGo} kg`, color: "text-amber-400" },
                            ].map((m) => (
                                <div key={m.label} className="text-center">
                                    <p className={`text-base font-black ${m.color}`}>{m.val}</p>
                                    <p className="text-[9px] uppercase tracking-wider text-slate-600 mt-0.5">{m.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Body Metrics Row ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {METRICS.map((m) => {
                        const Icon = m.icon;
                        const improved = m.label === "Body Fat" || m.label === "Resting HR"
                            ? m.prev > parseFloat(m.value.replace(",", ""))
                            : m.prev < parseFloat(m.value.replace(",", ""));
                        const diff = Math.abs(parseFloat(m.value.replace(",", "")) - m.prev).toFixed(1);
                        return (
                            <div key={m.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 hover:border-slate-700 transition-colors">
                                <div className={`w-8 h-8 rounded-xl ${m.bg} flex items-center justify-center mb-3`}>
                                    <Icon size={15} className={m.color} />
                                </div>
                                <p className="text-xl font-black text-slate-100">
                                    {m.value}<span className="text-xs font-normal text-slate-500 ml-0.5">{m.unit}</span>
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5 mb-2">{m.label}</p>
                                <div className={`inline-flex items-center gap-0.5 text-[9px] font-bold ${improved ? "text-emerald-400" : "text-rose-400"}`}>
                                    {improved ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
                                    {diff} {m.unit} vs last month
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Weight history bar chart */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Weight History</p>
                                <p className="text-sm font-bold text-slate-300 mt-0.5">Last 7 months</p>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                −{weightLost} kg total
              </span>
                        </div>
                        <WeightChart data={WEIGHT_HISTORY} />
                    </div>

                    {/* Weekly activity */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">This Week</p>
                                <p className="text-sm font-bold text-slate-300 mt-0.5">Activity Heatmap</p>
                            </div>
                            <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Flame size={9} />
                                {WEEKLY_ACTIVITY.reduce((a, d) => a + d.calories, 0).toLocaleString()} kcal
              </span>
                        </div>

                        <ActivityRow data={WEEKLY_ACTIVITY} />

                        {/* Calorie progress bar */}
                        <div className="mt-5 pt-4 border-t border-slate-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Daily Calorie Goal</span>
                                <span className="text-[10px] font-bold text-slate-400">
                  {MEMBER.calories.toLocaleString()} / {MEMBER.calorieGoal.toLocaleString()} kcal
                </span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
                                    style={{ width: `${(MEMBER.calories / MEMBER.calorieGoal) * 100}%` }}
                                />
                            </div>
                            <p className="text-[9px] text-slate-600 mt-1.5">
                                {MEMBER.calorieGoal - MEMBER.calories} kcal remaining today
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Gamification Row ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* FitCoin Balance */}
                    <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 to-slate-900/80 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                    <Zap size={15} className="text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/80">FitLife Rewards</p>
                                    <p className="text-xs font-semibold text-slate-400">Fit_coin Wallet</p>
                                </div>
                            </div>

                            <div className="mb-5">
                                <p className="text-4xl font-black text-amber-400 tracking-tight">
                                    1,250
                                    <span className="text-lg text-amber-600 ml-1.5">FC</span>
                                </p>
                                <p className="text-[10px] text-slate-600 mt-1">≈ 125,000 VND redeemable value</p>
                            </div>

                            <div className="space-y-2">
                                {FITCOINS_HISTORY.map((h, i) => (
                                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-800/60 last:border-0">
                                        <div>
                                            <p className="text-[11px] font-semibold text-slate-400 leading-tight">{h.label}</p>
                                            <p className="text-[9px] text-slate-700">{h.date}</p>
                                        </div>
                                        <span className={`text-xs font-black ${h.amount > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {h.amount > 0 ? "+" : ""}{h.amount} FC
                    </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Achievements</p>
                                <p className="text-sm font-bold text-slate-300 mt-0.5">
                                    {ACHIEVEMENTS.filter((a) => a.earned).length} / {ACHIEVEMENTS.length} Unlocked
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                                <Trophy size={11} className="text-amber-500" />
                                <span>{ACHIEVEMENTS.filter((a) => a.earned).length * 200} pts earned</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {ACHIEVEMENTS.map((a) => {
                                const Icon = a.icon;
                                return (
                                    <div
                                        key={a.id}
                                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 text-center
                      ${a.earned
                                            ? "border-slate-700 bg-slate-800/60 hover:border-slate-600 hover:-translate-y-0.5"
                                            : "border-slate-800/60 bg-slate-900/40 opacity-40"
                                        }`}
                                    >
                                        {/* Badge icon */}
                                        <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center ${a.earned ? `shadow-lg ${a.glow}` : ""}`}>
                                            <Icon size={22} className="text-white" strokeWidth={1.5} />
                                            {a.earned && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-800 flex items-center justify-center">
                                                    <span className="text-[7px] text-white font-black">✓</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-[11px] font-black text-slate-200 leading-tight">{a.label}</p>
                                            <p className="text-[9px] text-slate-600 mt-0.5 leading-tight">{a.desc}</p>
                                            {a.date && (
                                                <p className="text-[9px] text-emerald-600 font-semibold mt-1">{a.date}</p>
                                            )}
                                            {!a.earned && (
                                                <p className="text-[9px] text-slate-700 font-semibold mt-1">Locked</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Progress toward next badge */}
                        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-4">
                            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                                <Star size={14} className="text-slate-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-slate-500">Next: Early Bird</span>
                                    <span className="text-[10px] text-slate-600">6 / 10 sessions</span>
                                </div>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-[60%] bg-gradient-to-r from-slate-600 to-slate-400 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}