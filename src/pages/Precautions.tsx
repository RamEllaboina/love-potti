import { useLang } from "@/components/LangProvider";
import { Shield } from "lucide-react";

const Precautions = () => {
  const { t } = useLang();

  const items = [
    { emoji: "😷", title: "Masks", advice: t("maskAdvice") },
    { emoji: "🧤", title: "Gloves", advice: t("gloveAdvice") },
    { emoji: "🥾", title: "Boots", advice: t("bootAdvice") },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-3xl space-y-8">
        <div className="flex items-center gap-3">
          <Shield className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold gradient-text">{t("precautions")}</h1>
        </div>

        <div className="glass-card rounded-xl p-6">
          <p className="text-sm text-muted-foreground mb-2">⚠️ AI-Generated Safety Analysis</p>
          <p className="text-foreground font-medium">
            Toxic fumes detected in the reported area — use an N95 mask. Avoid direct skin contact with contaminated surfaces.
          </p>
        </div>

        <div className="grid gap-6">
          {items.map((item, i) => (
            <div
              key={i}
              className="glass-card rounded-xl p-8 flex items-center gap-6 hover:scale-[1.02] transition-all animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-6xl">{item.emoji}</span>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-muted-foreground">{item.advice}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Precautions;
