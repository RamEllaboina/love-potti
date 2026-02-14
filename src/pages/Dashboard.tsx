import { useState } from "react";
import { useLang } from "@/components/LangProvider";
import { mockReports, Report } from "@/lib/mockData";
import CircularGauge from "@/components/CircularGauge";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ThumbsUp, BarChart3 } from "lucide-react";
import confetti from "canvas-confetti";

const COLORS = ["hsl(0, 72%, 51%)", "hsl(45, 100%, 51%)", "hsl(150, 100%, 41%)"];

const Dashboard = () => {
  const { t } = useLang();
  const [reports, setReports] = useState<Report[]>(mockReports);

  const statusCounts = {
    not_solved: reports.filter((r) => r.status === "not_solved").length,
    in_progress: reports.filter((r) => r.status === "in_progress").length,
    solved: reports.filter((r) => r.status === "solved").length,
  };

  const pieData = [
    { name: t("notSolved"), value: statusCounts.not_solved },
    { name: t("inProgress"), value: statusCounts.in_progress },
    { name: t("solved"), value: statusCounts.solved },
  ];

  const barData = [
    { name: t("waste"), count: reports.filter((r) => r.category === "Waste").length },
    { name: t("water"), count: reports.filter((r) => r.category === "Water").length },
    { name: t("road"), count: reports.filter((r) => r.category === "Road").length },
  ];

  const trustScore = Math.round((statusCounts.solved / reports.length) * 100);

  const setStatus = (id: string, status: Report["status"]) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    if (status === "solved") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  const upvote = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl space-y-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">{t("dashboard")}</h1>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Current Status Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(240,8%,10%)", border: "1px solid hsl(240,6%,20%)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Community Progress</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fill: "hsl(240,5%,60%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(240,5%,60%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(240,8%,10%)", border: "1px solid hsl(240,6%,20%)", borderRadius: 8 }} />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(150, 100%, 41%)" />
                    <stop offset="100%" stopColor="hsl(271, 76%, 53%)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card rounded-xl p-6 flex items-center justify-center">
            <CircularGauge value={trustScore} label={t("trustScore")} size={180} color="green" />
          </div>
        </div>

        {/* Report Cards */}
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="glass-card rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="gradient-bg text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    {r.category}
                  </span>
                  <span className="text-xs text-muted-foreground">{r.address}</span>
                </div>
                <p className="text-sm text-foreground">{r.description}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setStatus(r.id, "not_solved")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    r.status === "not_solved" ? "bg-destructive/20 text-destructive" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  🔴 {t("notSolved")}
                </button>
                <button
                  onClick={() => setStatus(r.id, "in_progress")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    r.status === "in_progress" ? "bg-warning/20 text-warning" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  🟡 {t("inProgress")}
                </button>
                <button
                  onClick={() => setStatus(r.id, "solved")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    r.status === "solved" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  🟢 {t("solved")}
                </button>
              </div>

              <button
                onClick={() => upvote(r.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card hover:scale-105 transition-all text-sm text-foreground"
              >
                <ThumbsUp className="h-4 w-4" /> {r.upvotes}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
