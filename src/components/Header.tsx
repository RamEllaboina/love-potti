import { Link, useLocation } from "react-router-dom";
import { useLang } from "./LangProvider";
import { Eye } from "lucide-react";

const Header = () => {
  const { t } = useLang();
  const location = useLocation();

  const tabs = [
    { path: "/", label: t("home") },
    { path: "/report", label: t("report") },
    { path: "/health", label: t("health") },
    { path: "/precautions", label: t("precautions") },
    { path: "/dashboard", label: t("dashboard") },
    { path: "/history", label: t("history") },
    { path: "/feedback", label: t("feedback") },
  ];

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/civic-lens-logo.svg" alt="CivicLens Logo" className="h-8 w-8 object-contain rounded-full" />
          <span className="text-xl font-bold gradient-text">CivicLens</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === tab.path
                  ? "gradient-bg text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        {/* Mobile nav */}
        <nav className="flex md:hidden items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${location.pathname === tab.path
                  ? "gradient-bg text-primary-foreground"
                  : "text-muted-foreground"
                }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
