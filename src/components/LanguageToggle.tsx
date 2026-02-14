import { useLang } from "./LangProvider";
import { Language } from "@/lib/translations";

const LanguageToggle = () => {
  const { lang, setLang } = useLang();
  const langs: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "te", label: "తెలుగు" },
    { code: "hi", label: "हिंदी" },
  ];

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-1 glass-card rounded-lg p-1.5">
      {langs.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
            lang === l.code
              ? "gradient-bg text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;
