import { useState } from "react";
import { Sparkles, Dumbbell, Flame, Target, AlertCircle, ChevronDown, RotateCcw, Zap } from "lucide-react";

// ─── Mock Workout Data ────────────────────────────────────────────────────────
const MOCK_PLAN = {
    goal: "Build Muscle",
    totalWeeks: 8,
    weeklyVolume: "18 sets/muscle group",
    days: [
        {
            day: "Day 1",
            focus: "Chest & Triceps",
            tag: "Push",
            tagColor: "emerald",
            intensity: "High",
            duration: "55 min",
            exercises: [
                { name: "Barbell Bench Press", sets: 4, reps: "6–8", rest: "90s", muscle: "Chest" },
                { name: "Incline Dumbbell Press", sets: 3, reps: "8–10", rest: "75s", muscle: "Upper Chest" },
                { name: "Cable Fly", sets: 3, reps: "12–15", rest: "60s", muscle: "Chest" },
                { name: "Tricep Rope Pushdown", sets: 3, reps: "10–12", rest: "60s", muscle: "Triceps" },
                { name: "Overhead Tricep Ext.", sets: 3, reps: "10–12", rest: "60s", muscle: "Triceps" },
            ],
        },
        {
            day: "Day 2",
            focus: "Back & Biceps",
            tag: "Pull",
            tagColor: "sky",
            intensity: "High",
            duration: "60 min",
            exercises: [
                { name: "Deadlift", sets: 4, reps: "5", rest: "120s", muscle: "Posterior Chain" },
                { name: "Weighted Pull-Ups", sets: 3, reps: "6–8", rest: "90s", muscle: "Lats" },
                { name: "Seated Cable Row", sets: 3, reps: "10–12", rest: "75s", muscle: "Mid Back" },
                { name: "Face Pull", sets: 3, reps: "15–20", rest: "60s", muscle: "Rear Delt" },
                { name: "Barbell Curl", sets: 3, reps: "8–10", rest: "60s", muscle: "Biceps" },
            ],
        },
        {
            day: "Day 3",
            focus: "Legs & Shoulders",
            tag: "Compound",
            tagColor: "violet",
            intensity: "Very High",
            duration: "70 min",
            exercises: [
                { name: "Back Squat", sets: 4, reps: "6–8", rest: "120s", muscle: "Quads" },
                { name: "Romanian Deadlift", sets: 3, reps: "8–10", rest: "90s", muscle: "Hamstrings" },
                { name: "Leg Press", sets: 3, reps: "12–15", rest: "75s", muscle: "Quads/Glutes" },
                { name: "Seated DB Shoulder Press", sets: 4, reps: "8–10", rest: "75s", muscle: "Shoulders" },
                { name: "Lateral Raise", sets: 3, reps: "15–20", rest: "45s", muscle: "Side Delt" },
            ],
        },
    ],
};

const tagStyles = {
    emerald: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    sky: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
    violet: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
};

// ─── Skeleton Component ───────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
    return (
        <div className={`animate-pulse rounded-lg bg-slate-700/60 ${className}`} />
    );
}

function LoadingSkeleton() {
    return (
        <div className="mt-10 space-y-6">
            {/* AI thinking header */}
            <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/20">
                    <Sparkles size={16} className="text-emerald-400 animate-spin" style={{ animationDuration: "2s" }} />
                    <span className="absolute inset-0 rounded-full border border-emerald-500/40 animate-ping" />
                </div>
                <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-48" />
                    <Skeleton className="h-2.5 w-32" />
                </div>
            </div>

            {/* Processing steps */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-5 space-y-3">
                {["Analyzing body metrics…", "Matching injury constraints…", "Optimizing rep ranges…", "Building weekly split…"].map((step, i) => (
                    <div key={i} className="flex items-center gap-3" style={{ animationDelay: `${i * 0.15}s` }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-xs text-slate-400 font-mono">{step}</p>
                        <Skeleton className="h-2 ml-auto" style={{ width: `${60 + i * 10}px` }} />
                    </div>
                ))}
            </div>

            {/* Skeleton cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-14" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <div className="space-y-2.5 pt-2 border-t border-slate-700/40">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="flex items-center gap-3">
                                    <Skeleton className="h-2 w-2 rounded-full flex-shrink-0" />
                                    <Skeleton className="h-3 flex-1" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Workout Card ─────────────────────────────────────────────────────────────
function WorkoutCard({ data, index }) {
    return (
        <div
            className="group relative rounded-2xl border border-slate-700/60 bg-slate-800/60 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-slate-600 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-0.5"
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            {/* Top accent line */}
            <div className={`h-0.5 w-full ${data.tagColor === "emerald" ? "bg-gradient-to-r from-emerald-500 to-teal-500" : data.tagColor === "sky" ? "bg-gradient-to-r from-sky-500 to-blue-500" : "bg-gradient-to-r from-violet-500 to-purple-500"}`} />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">{data.day}</p>
                        <h3 className="text-base font-bold text-slate-100 leading-tight">{data.focus}</h3>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${tagStyles[data.tagColor]}`}>
            {data.tag}
          </span>
                </div>

                {/* Meta pills */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-700/50 px-2.5 py-1 rounded-full">
            <Flame size={10} className="text-orange-400" /> {data.intensity}
          </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-700/50 px-2.5 py-1 rounded-full">
            <Target size={10} className="text-emerald-400" /> {data.duration}
          </span>
                </div>

                {/* Exercise list */}
                <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2.5">Exercises</p>
                    {data.exercises.map((ex, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-slate-900/50 hover:bg-slate-700/40 transition-colors duration-150 group/ex"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-200 truncate leading-tight">{ex.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{ex.muscle}</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <p className="text-xs font-bold text-emerald-400">{ex.sets}×{ex.reps}</p>
                                <p className="text-[10px] text-slate-600">rest {ex.rest}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AiWorkout() {
    const [form, setForm] = useState({
        height: "",
        weight: "",
        goal: "Build Muscle",
        injuries: "",
    });
    const [state, setState] = useState("idle"); // idle | loading | result

    const handleChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    };

    const handleGenerate = () => {
        setState("loading");
        setTimeout(() => setState("result"), 2800);
    };

    const handleReset = () => {
        setState("idle");
        setForm({ height: "", weight: "", goal: "Build Muscle", injuries: "" });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            {/* Background noise texture */}
            <div
                className="fixed inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Ambient glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12">

                {/* ── Page Header ── */}
                <div className="mb-10">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5 tracking-wide">
                        <Zap size={12} className="fill-emerald-400" />
                        AI-Powered · Google Gemini
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-50 tracking-tight mb-2.5">
                        Smart Workout<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Planner
            </span>
                    </h1>
                    <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                        Enter your stats and let Gemini AI craft a personalized training schedule — factoring in your goals, body metrics, and injury history.
                    </p>
                </div>

                {/* ── Input Card ── */}
                <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-sm p-6 sm:p-7 shadow-2xl shadow-black/40 mb-2">
                    {/* Card inner glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/3 to-transparent pointer-events-none" />

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-800">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                                <Dumbbell size={14} className="text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-200">Your Profile</h2>
                                <p className="text-[11px] text-slate-600">Used to personalize your workout plan</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Height */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Height</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="height"
                                        value={form.height}
                                        onChange={handleChange}
                                        placeholder="175"
                                        className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-medium">cm</span>
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Weight</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="weight"
                                        value={form.weight}
                                        onChange={handleChange}
                                        placeholder="75"
                                        className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-medium">kg</span>
                                </div>
                            </div>

                            {/* Goal */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Fitness Goal</label>
                                <div className="relative">
                                    <select
                                        name="goal"
                                        value={form.goal}
                                        onChange={handleChange}
                                        className="w-full appearance-none bg-slate-800/60 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all cursor-pointer"
                                    >
                                        <option value="Build Muscle">🏋️ Build Muscle</option>
                                        <option value="Lose Fat">🔥 Lose Fat</option>
                                        <option value="Improve Endurance">⚡ Improve Endurance</option>
                                        <option value="General Fitness">🎯 General Fitness</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Injury History */}
                            <div className="space-y-1.5 sm:col-span-1">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle size={10} className="text-amber-500" />
                    Injury History
                    <span className="font-normal normal-case text-slate-700">(optional)</span>
                  </span>
                                </label>
                                <textarea
                                    name="injuries"
                                    value={form.injuries}
                                    onChange={handleChange}
                                    placeholder="e.g. Lower back strain, right knee pain…"
                                    rows={3}
                                    className="w-full bg-slate-800/60 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
                                />
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-800">
                            <button
                                onClick={handleGenerate}
                                disabled={state === "loading"}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-slate-950 text-sm font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Sparkles size={15} className={state === "loading" ? "animate-spin" : ""} />
                                {state === "loading" ? "Generating…" : "Generate with AI"}
                            </button>
                            {state === "result" && (
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-600 px-4 py-3 rounded-xl transition-all duration-200"
                                >
                                    <RotateCcw size={13} /> Reset
                                </button>
                            )}
                            <p className="ml-auto hidden sm:block text-[11px] text-slate-700">Powered by Google Gemini</p>
                        </div>
                    </div>
                </div>

                {/* ── Loading State ── */}
                {state === "loading" && <LoadingSkeleton />}

                {/* ── Results ── */}
                {state === "result" && (
                    <div className="mt-10 space-y-6" style={{ animation: "fadeUp 0.5s ease both" }}>
                        {/* Results header */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-slate-800">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-500">AI Generated</span>
                                </div>
                                <h2 className="text-xl font-black text-slate-100">Weekly Workout Schedule</h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Optimized for <span className="text-emerald-400 font-semibold">{MOCK_PLAN.goal}</span> · {MOCK_PLAN.totalWeeks}-week program · {MOCK_PLAN.weeklyVolume}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-center px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                                    <p className="text-lg font-black text-slate-100">{MOCK_PLAN.days.length}</p>
                                    <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Days</p>
                                </div>
                                <div className="text-center px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
                                    <p className="text-lg font-black text-slate-100">{MOCK_PLAN.days.reduce((a, d) => a + d.exercises.length, 0)}</p>
                                    <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Exercises</p>
                                </div>
                            </div>
                        </div>

                        {/* Workout cards grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {MOCK_PLAN.days.map((day, i) => (
                                <WorkoutCard key={i} data={day} index={i} />
                            ))}
                        </div>

                        {/* Footer note */}
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                            <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                This plan is AI-generated based on your inputs. Consult a certified trainer or physician before starting any new exercise program, especially if you have existing injuries.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}