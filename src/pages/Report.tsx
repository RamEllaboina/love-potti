import { useState, useEffect, useRef } from "react";
import { useLang } from "@/components/LangProvider";
import { MapPin, Camera, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Report = () => {
  const { t } = useLang();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

      // Fix default icon
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

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Simulate AI analysis
    setAnalyzing(true);
    setTimeout(() => {
      const rand = Math.random();
      if (rand < 0.1) {
        setDuplicate(true);
        setAnalyzing(false);
        return;
      }
      if (rand < 0.15) {
        setInvalid(true);
        setAnalyzing(false);
        return;
      }
      const cats = ["Waste", "Water", "Road"];
      setCategory(cats[Math.floor(Math.random() * cats.length)]);
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

        {/* GPS Section */}
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
                {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </p>
              <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden border border-border" />
            </>
          )}
        </div>

        {/* Image Upload */}
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
              💡 Already Reported! Please go to the Dashboard to Upvote this issue instead of re-submitting.
            </div>
          )}

          {invalid && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              ❌ Invalid Image. Please provide a photo of a civic hazard (Waste, Water, Roads).
            </div>
          )}

          {category && (
            <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {t("category")}: <span className="gradient-text">{category}</span>
                </span>
              </div>
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
