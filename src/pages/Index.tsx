import { Link } from "react-router-dom";
import { useLang } from "@/components/LangProvider";
import { MapPin, Shield, BarChart3, AlertTriangle } from "lucide-react";

const Home = () => {
  const { t } = useLang();

  const features = [
    { icon: MapPin, title: t("smartReporting"), desc: t("smartReportingDesc") },
    { icon: AlertTriangle, title: t("healthMonitor"), desc: t("healthMonitorDesc") },
    { icon: Shield, title: t("safetyGuide"), desc: t("safetyGuideDesc") },
    { icon: BarChart3, title: t("communityDash"), desc: t("communityDashDesc") },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary blur-[120px]" />
        </div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold gradient-text mb-4 animate-fade-up">
            {t("heroTitle")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-3 animate-fade-up-delay-1">
            {t("heroSubtitle")}
          </p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8 animate-fade-up-delay-2">
            {t("heroDesc")}
          </p>
          <div className="flex items-center justify-center gap-4 animate-fade-up-delay-3">
            <Link
              to="/report"
              className="gradient-bg gradient-bg-hover px-8 py-3 rounded-lg font-semibold text-primary-foreground transition-all hover:scale-105"
            >
              {t("getStarted")}
            </Link>
            <Link
              to="/dashboard"
              className="glass-card px-8 py-3 rounded-lg font-semibold text-foreground hover:scale-105 transition-all"
            >
              {t("viewDashboard")}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">{t("features")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-6 hover:scale-105 transition-all group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="gradient-bg rounded-lg p-3 w-fit mb-4 group-hover:glow-green transition-all">
                  <f.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
