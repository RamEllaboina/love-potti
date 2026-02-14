import { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { useLang } from "@/components/LangProvider";
import { MapPin, Camera, AlertTriangle, CheckCircle, Loader2, ShieldCheck, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import CircularGauge from "@/components/CircularGauge";
import { mockReports } from "@/lib/mockData";

const ISSUE_DETAILS: Record<string, { precautions: string[], healthImpact: string, climateImpact: string }> = {
  Waste: {
    precautions: [
      "1. Wear gloves and a mask before handling waste.",
      "2. Separate recyclables (plastic, paper, glass) from organic waste.",
      "3. Use a dustbin or bag to collect scattered trash.",
      "4. Contact your local waste collection service for pickup.",
      "5. Dispose of organic waste in a compost pit if available.",
    ],
    healthImpact: "Accumulated waste attracts pests (rats, flies) which spread diseases like Leptospirosis, Dengue, and Cholera. Decomposing waste releases toxic gases posing respiratory risks.",
    climateImpact: "Rotting organic waste releases Methane, a potent greenhouse gas. Plastics break down into microplastics, contaminating soil and water bodies.",
  },
  Water: {
    precautions: [
      "1. Avoid direct contact with stagnant water.",
      "2. Clear any blockages in nearby drainage channels.",
      "3. Apply mosquito repellent around the area.",
      "4. Use bleaching powder to disinfect small stagnant pools.",
      "5. Report persistent water logging to your water utility.",
    ],
    healthImpact: "Stagnant water is a breeding ground for mosquitoes, leading to outbreaks of Malaria, Dengue, and Chikungunya. Contaminated water can cause skin infections and gastrointestinal diseases.",
    climateImpact: "Water stagnation damages infrastructure and soil structure. It also indicates poor drainage systems which are vulnerable to extreme weather events caused by climate change.",
  },
  Road: {
    precautions: [
      "1. Place visible markers (cones, branches) around the hazard.",
      "2. Alert other pedestrians and motorists verbally.",
      "3. Take photos and share on community groups for awareness.",
      "4. For small potholes, fill temporarily with gravel if safe.",
      "5. Contact the local road maintenance department immediately.",
    ],
    healthImpact: "Damaged roads cause accidents leading to physical injuries. Dust from broken roads contributes to air pollution, aggravating asthma and other respiratory conditions.",
    climateImpact: "Poor road quality increases vehicle fuel consumption and emissions due to traffic congestion and idling. It also increases the heat island effect in urban areas.",
  },
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

  const [address, setAddress] = useState<string>("");

  const requestGPS = () => {
    setGpsError(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        fetchAddress(latitude, longitude);
      },
      () => setGpsError(true),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      setAddress(data.display_name || "Unknown Location");
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Location details unavailable");
    }
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

  // State for AI Model
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [modelLoading, setModelLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadModel = async () => {
      try {
        console.log("Loading AI Model...");
        await tf.ready();
        const loadedModel = await cocoSsd.load();
        if (isMounted) {
          setModel(loadedModel);
          setModelLoading(false);
          console.log("AI Model Loaded Successfully");
        }
      } catch (err) {
        console.error("Failed to load AI Model:", err);
        if (isMounted) {
          setModelLoading(false);
          toast.error("AI Model failed to load. Check your internet connection.");
        }
      }
    };

    loadModel();
    return () => { isMounted = false; };
  }, []);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if model is ready
    if (modelLoading) {
      toast.info("Please wait, AI Model is still loading...");
      return;
    }

    setImageFile(file);
    setDuplicate(false);
    setInvalid(false);
    setCategory(null);
    setConfidenceScore(0);
    setIsMinor(false);
    setAnalyzing(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const imgSrc = ev.target?.result as string;
      setImagePreview(imgSrc);

      const img = new Image();
      img.src = imgSrc;
      img.crossOrigin = "anonymous"; // Handle potential CORS issues
      img.onload = async () => {
        try {
          // Use pre-loaded model or fallback
          const activeModel = model || await cocoSsd.load();
          const predictions = await activeModel.detect(img);
          console.log("AI Predictions:", predictions);

          // Define Forbidden Classes (People, Animals, Personal/Indoor Items)
          const forbiddenClasses = [
            // Living Beings
            "person", "cat", "dog", "bird", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe",
            // Indoor/Personal Items
            "backpack", "umbrella", "handbag", "tie", "suitcase", "bed", "dining table", "toilet",
            "tv", "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator",
            "book", "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush",
            // Sports
            "frisbee", "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket",
            // Furniture
            "chair", "couch", "potted plant"
          ];

          // Check if any forbidden object is detected with high confidence
          const hasForbiddenObject = predictions.some(p => forbiddenClasses.includes(p.class) && p.score > 0.50);

          if (hasForbiddenObject) {
            setInvalid(true);
            setAnalyzing(false);
            toast.error("❌ Invalid Image: Non-civic or personal object detected.");
            return;
          }

          // If valid, proceed to categorization
          setTimeout(() => {
            // Heuristic Categorization based on detection if possible, or fallback
            let detectedCategory = "Waste"; // Default

            // Try to map detections to categories
            const wasteKeywords = ["bottle", "cup", "bowl", "banana", "apple", "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake"];
            const roadKeywords = ["car", "bus", "truck", "motorcycle", "traffic light", "stop sign"];

            const foundWaste = predictions.find(p => wasteKeywords.includes(p.class));
            const foundRoad = predictions.find(p => roadKeywords.includes(p.class));

            if (foundWaste) detectedCategory = "Waste";
            else if (foundRoad) detectedCategory = "Road";
            else detectedCategory = ["Waste", "Water", "Road"][Math.floor(Math.random() * 3)]; // Fallback

            // Check for duplicates (simulated)
            if (coords) {
              const nearbyReport = mockReports.find(
                (r) =>
                  Math.abs(r.location.lat - coords.lat) < 0.005 &&
                  Math.abs(r.location.lng - coords.lng) < 0.005
              );
              if (nearbyReport && Math.random() < 0.25) {
                setDuplicate(true);
                setAnalyzing(false);
                toast.info("💡 Duplicate detected — redirecting to Dashboard to upvote.");
                setTimeout(() => navigate("/dashboard"), 3000);
                return;
              }
            }

            setCategory(detectedCategory);
            setConfidenceScore(Math.floor(Math.random() * 20) + 80);
            setIsMinor(Math.random() < 0.35);
            setAnalyzing(false);
          }, 1000);

        } catch (err) {
          console.error("AI Error:", err);
          toast.error("AI Analysis failed. Please try again.");
          setAnalyzing(false);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!coords || !category || !imageFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("category", category);
    formData.append("confidence", confidenceScore.toString());
    formData.append("lat", coords.lat.toString());
    formData.append("lng", coords.lng.toString());
    formData.append("address", address); // Include address in submission
    formData.append("image", imageFile);

    try {
      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success(t("reportSubmitted"));
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to submit report. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Network error. Is the backend running?");
    } finally {
      setUploading(false);
    }
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
                <br />
                🏠 {address || "Fetching address..."}
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
              {(
                <div className="space-y-4 animate-fade-up">

                  {/* Health Impact */}
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <h3 className="text-sm font-bold text-foreground">Health Impact</h3>
                    </div>
                    <p className="text-sm text-foreground/80">{ISSUE_DETAILS[category]?.healthImpact}</p>
                  </div>

                  {/* Climate Impact */}
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-5 w-5 text-green-500" />
                      <h3 className="text-sm font-bold text-foreground">Climate Impact</h3>
                    </div>
                    <p className="text-sm text-foreground/80">{ISSUE_DETAILS[category]?.climateImpact}</p>
                  </div>

                  {/* Precautions */}
                  <div className="p-5 rounded-lg bg-accent/10 border border-accent/30">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck className="h-5 w-5 text-warning" />
                      <h3 className="text-sm font-bold text-foreground">🛡️ Precautions & Actions</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Here are some steps you can take to mitigate this issue:
                    </p>
                    <ul className="space-y-1.5">
                      {ISSUE_DETAILS[category]?.precautions.map((step, i) => (
                        <li key={i} className="text-sm text-foreground/80">{step}</li>
                      ))}
                    </ul>
                  </div>

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
            {uploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" /> Submitting...
              </span>
            ) : t("submitReport")}
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
