import { useLang } from "@/components/LangProvider";
import CircularGauge from "@/components/CircularGauge";
import { AlertTriangle, Clock, Bug, Skull } from "lucide-react";

const Health = () => {
  const { t } = useLang();

  const stages = [
    {
      icon: Clock,
      title: t("riskLow"),
      desc: t("riskLowDesc"),
      color: "border-primary/50 bg-primary/5",
      badge: "bg-primary/20 text-primary",
      level: "LOW",
    },
    {
      icon: Bug,
      title: t("riskMedium"),
      desc: t("riskMediumDesc"),
      color: "border-warning/50 bg-warning/5",
      badge: "bg-warning/20 text-warning",
      level: "MEDIUM",
    },
    {
      icon: Skull,
      title: t("riskHigh"),
      desc: t("riskHighDesc"),
      color: "border-destructive/50 bg-destructive/5",
      badge: "bg-destructive/20 text-destructive",
      level: "HIGH",
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl space-y-8">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-7 w-7 text-warning" />
          <h1 className="text-3xl font-bold gradient-text">{t("health")}</h1>
        </div>

        {/* Risk Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Health Risk Timeline (3-Stage AI Analysis)</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-warning to-destructive hidden md:block" />
            <div className="space-y-6">
              {stages.map((s, i) => (
                <div key={i} className={`glass-card rounded-xl p-6 border ${s.color} ml-0 md:ml-14 relative animate-fade-up`} style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="absolute -left-[3.25rem] top-6 hidden md:flex items-center justify-center w-10 h-10 rounded-full glass-card border border-border">
                    <s.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="md:hidden">
                      <s.icon className="h-6 w-6 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.badge}`}>{s.level}</span>
                        <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Environmental Impact Gauges */}
        <div className="glass-card rounded-xl p-8">
          <h2 className="text-xl font-semibold text-foreground mb-8 text-center">Environmental Impact Gauges</h2>
          <div className="flex flex-wrap justify-center gap-12">
            <CircularGauge value={67} label={t("carbonFootprint")} size={180} color="purple" />
            <CircularGauge value={43} label={t("soilToxicity")} size={180} color="warning" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health;
