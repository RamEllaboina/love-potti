import { useState, useEffect, useRef } from "react";
import { useLang } from "@/components/LangProvider";
import { MapPin, Camera, AlertTriangle, CheckCircle, Loader2, ShieldCheck, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CircularGauge from "@/components/CircularGauge";
import { mockReports } from "@/lib/mockData";

const DIY_SUGGESTIONS: Record<string, string[]> = {
  Waste: [
    "1. Wear gloves and a mask before handling waste.",
    "2. Separate recyclables (plastic, paper, glass) from organic waste.",
    "3. Use a dustbin or bag to collect scattered trash.",
    "4. Contact your local waste collection service for pickup.",
    "5. Dispose of organic waste in a compost pit if available.",
  ],
  Water: [
    "1. Avoid direct contact with stagnant water.",
    "2. Clear any blockages in nearby drainage channels.",
    "3. Apply mosquito repellent around the area.",
    "4. Use bleaching powder to disinfect small stagnant pools.",
    "5. Report persistent water logging to your water utility.",
  ],
  Road: [
    "1. Place visible markers (cones, branches) around the hazard.",
    "2. Alert other pedestrians and motorists verbally.",
    "3. Take photos and share on community groups for awareness.",
    "4. For small potholes, fill temporarily with gravel if safe.",
    "5. Contact the local road maintenance department immediately.",
  ],
};

const Report = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0);
  const [isMinor, setIsMinor] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const requestGPS = () => {
    setGpsError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGpsError(true),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => { requestGPS(); }, []);

  // Lazy-load leaflet map
  useEffect(() => {
    if (!coords || !mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const existing = (mapRef.current as any)?._leaflet_id;
      if (existing) return;

      const map = L.map(mapRef.current!, { zoomControl: false }).setView([coords.lat, coords.lng], 19);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      L.marker([coords.lat, coords.lng]).addTo(map);
    })();

    return () => { cancelled = true; };
  }, [coords]);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setDuplicate(false);
    setInvalid(false);
    setCategory(null);
    setConfidenceScore(0);
    setIsMinor(false);

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Simulate AI analysis with confidence score
    setAnalyzing(true);
    setTimeout(() => {
      const rand = Math.random();

      // Check for duplicates by comparing GPS proximity with existing reports
      if (coords) {
        const nearbyReport = mockReports.find(
          (r) =>
            Math.abs(r.location.lat - coords.lat) < 0.005 &&
            Math.abs(r.location.lng - coords.lng) < 0.005
        );
        if (nearbyReport && rand < 0.25) {
          setDuplicate(true);
          setAnalyzing(false);
          toast.info("💡 Duplicate detected — redirecting to Dashboard to upvote.");
          setTimeout(() => navigate("/dashboard"), 3000);
          return;
        }
      }

      // Validity check — reject humans, pets, documents
      if (rand < 0.12) {
        setInvalid(true);
        setAnalyzing(false);
        return;
      }

      // Auto-classification with confidence
      const cats = ["Waste", "Water", "Road"];
      const selectedCat = cats[Math.floor(Math.random() * cats.length)];
      const confidence = Math.floor(Math.random() * 20) + 80; // 80-99%
      const minor = Math.random() < 0.35;

      setCategory(selectedCat);
      setConfidenceScore(confidence);
      setIsMinor(minor);
      setAnalyzing(false);
    }, 2000);
  };

  const handleSubmit = () => {
    if (!coords || !category || !imageFile) return;
    setSubmitted(true);
    toast.success(t("reportSubmitted"));
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold gradient-text">{t("report")}</h1>

        {/* GPS Section — no manual address input */}
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">
              {coords ? t("gpsTracking") : gpsError ? "GPS Blocked" : "Acquiring GPS..."}
            </span>
            {!coords && !gpsError && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>

          {gpsError && (
            <button
              onClick={requestGPS}
              className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-semibold hover:opacity-90"
            >
              🔄 {t("retryGps")}
            </button>
          )}

          {coords && (
            <>
              <p className="text-xs text-muted-foreground mb-3">
                📍 {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </p>
              <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden border border-border" />
            </>
          )}
        </div>

        {/* Image Upload & AI Vision Guard */}
        <div className="glass-card rounded-xl p-6">
          <button
            onClick={() => fileRef.current?.click()}
            className="gradient-bg gradient-bg-hover w-full py-4 rounded-lg font-semibold text-primary-foreground flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
          >
            <Camera className="h-5 w-5" /> {t("capturePhoto")}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImage} />

          {imagePreview && (
            <img src={imagePreview} alt="Captured" className="mt-4 w-full h-48 object-cover rounded-lg border border-border" />
          )}

          {analyzing && (
            <div className="mt-4 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing image with AI Vision Guard...
            </div>
          )}

          {duplicate && (
            <div className="mt-4 p-4 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm">
              💡 This issue is already reported! Redirecting you to the Dashboard to Upvote.
            </div>
          )}

          {invalid && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              ❌ Invalid Data: Please upload a photo of a civic issue (Waste, Water, Roads) to proceed.
            </div>
          )}

          {category && (
            <div className="mt-4 space-y-4">
              {/* Category + Confidence */}
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      {t("category")}: <span className="gradient-text">{category}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-secondary" />
                    <span className="text-sm font-bold text-secondary">
                      AI Confidence: {confidenceScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* DIY Suggestions for Minor Issues */}
              {isMinor && category && (
                <div className="p-5 rounded-lg bg-accent/10 border border-accent/30 animate-fade-up">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-warning" />
                    <h3 className="text-sm font-bold text-foreground">🛠️ You Can Fix This!</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    This issue is categorized as <span className="text-warning font-semibold">Minor</span>. Here are some steps you can take:
                  </p>
                  <ul className="space-y-1.5">
                    {DIY_SUGGESTIONS[category]?.map((step, i) => (
                      <li key={i} className="text-sm text-foreground/80">{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        {category && coords && !submitted && (
          <button
            onClick={handleSubmit}
            className="gradient-bg gradient-bg-hover w-full py-4 rounded-xl font-bold text-primary-foreground text-lg hover:scale-[1.02] transition-all"
          >
            {t("submitReport")}
          </button>
        )}

        {submitted && (
          <div className="glass-card rounded-xl p-8 text-center">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground">{t("reportSubmitted")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
