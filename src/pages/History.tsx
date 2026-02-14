import { useState, useEffect } from "react";
import { useLang } from "@/components/LangProvider";
import { mockReports } from "@/lib/mockData";
import CircularGauge from "@/components/CircularGauge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, Shield } from "lucide-react";

interface ReportData {
  _id: string;
  category: string;
  description: string;
  location: { lat: number; lng: number };
  imageUrl: string;
  status: "solved" | "in_progress" | "not_solved";
  upvotes: number;
  createdAt: string;
  address?: string; // Optional as backend might not return address yet
}

const History = () => {
  const { t } = useLang();
  const [view, setView] = useState<"user" | "admin">("user");
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/reports");
        if (res.ok) {
          const data = await res.json();
          // Map backend data to match frontend structure if needed
          const formattedData = data.map((r: any) => ({
            ...r,
            id: r._id, // Map _id to id for compatibility
            description: r.description || "No description provided",
            address: `${r.location.lat.toFixed(4)}, ${r.location.lng.toFixed(4)}` // Fallback address
          }));
          setReports(formattedData);
        } else {
          console.error("Failed to fetch reports");
          setReports(mockReports as any); // Fallback to mock data
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
        setReports(mockReports as any); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const userReports = reports.length > 0 ? reports.slice(0, 3) : mockReports.slice(0, 3); // Just for demo, assuming user owns first few
  const allReports = reports.length > 0 ? reports : mockReports;

  const statusCounts = {
    not_solved: allReports.filter((r) => r.status === "not_solved").length,
    in_progress: allReports.filter((r) => r.status === "in_progress").length,
    solved: allReports.filter((r) => r.status === "solved").length,
  };

  const trustScore = Math.round((statusCounts.solved / allReports.length) * 100);

  const adminBarData = [
    { name: t("notSolved"), count: statusCounts.not_solved, fill: "hsl(0, 72%, 51%)" },
    { name: t("inProgress"), count: statusCounts.in_progress, fill: "hsl(45, 100%, 51%)" },
    { name: t("solved"), count: statusCounts.solved, fill: "hsl(150, 100%, 41%)" },
  ];

  const categoryBarData = [
    { name: t("waste"), count: allReports.filter((r) => r.category === "Waste").length },
    { name: t("water"), count: allReports.filter((r) => r.category === "Water").length },
    { name: t("road"), count: allReports.filter((r) => r.category === "Road").length },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-7 w-7 text-secondary" />
            <h1 className="text-3xl font-bold gradient-text">{t("history")}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView("user")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === "user" ? "gradient-bg text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"}`}
            >
              📋 My Reports
            </button>
            <button
              onClick={() => setView("admin")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${view === "admin" ? "gradient-bg text-primary-foreground" : "glass-card text-muted-foreground hover:text-foreground"}`}
            >
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Admin Log</span>
            </button>
          </div>
        </div>

        {view === "user" ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Your Submitted Reports</h2>
            {userReports.length === 0 ? (
              <p className="text-muted-foreground text-sm">No reports yet.</p>
            ) : (
              userReports.map((r) => (
                <div key={r.id} className="glass-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="gradient-bg text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                        {r.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{r.address}</span>
                    </div>
                    <p className="text-sm text-foreground">{r.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(r.timestamp).toLocaleDateString()} · 👍 {r.upvotes} upvotes
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${r.status === "solved"
                        ? "bg-primary/20 text-primary"
                        : r.status === "in_progress"
                          ? "bg-warning/20 text-warning"
                          : "bg-destructive/20 text-destructive"
                      }`}
                  >
                    {r.status === "solved" ? "🟢 " + t("solved") : r.status === "in_progress" ? "🟡 " + t("inProgress") : "🔴 " + t("notSolved")}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Admin Master Log</h2>

            {/* Trust Score */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-6 flex items-center justify-center">
                <CircularGauge value={trustScore} label={t("trustScore")} size={180} color="green" />
              </div>

              <div className="glass-card rounded-xl p-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">Status Overview</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={adminBarData}>
                    <XAxis dataKey="name" tick={{ fill: "hsl(240,5%,60%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(240,5%,60%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(240,8%,10%)", border: "1px solid hsl(240,6%,20%)", borderRadius: 8 }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {adminBarData.map((entry, i) => (
                        <XAxis key={i} dataKey="name" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Reports by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryBarData}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(240,5%,60%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(240,5%,60%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(240,8%,10%)", border: "1px solid hsl(240,6%,20%)", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="url(#catGradient)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="catGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(150, 100%, 41%)" />
                      <stop offset="100%" stopColor="hsl(271, 76%, 53%)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* All Reports Table */}
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">All Community Reports ({allReports.length})</h3>
              <div className="space-y-3">
                {allReports.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <span className="gradient-bg text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                      {r.category}
                    </span>
                    <span className="flex-1 text-sm text-foreground truncate">{r.description}</span>
                    <span className="text-xs text-muted-foreground">{r.address}</span>
                    <span className="text-xs">👍 {r.upvotes}</span>
                    <span
                      className={`text-xs font-bold ${r.status === "solved" ? "text-primary" : r.status === "in_progress" ? "text-warning" : "text-destructive"
                        }`}
                    >
                      {r.status === "solved" ? "🟢" : r.status === "in_progress" ? "🟡" : "🔴"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
