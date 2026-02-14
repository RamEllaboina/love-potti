interface CircularGaugeProps {
  value: number;
  label: string;
  size?: number;
  color?: "green" | "purple" | "warning" | "danger";
}

const CircularGauge = ({ value, label, size = 160, color = "green" }: CircularGaugeProps) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const colorMap = {
    green: "hsl(150, 100%, 41%)",
    purple: "hsl(271, 76%, 53%)",
    warning: "hsl(45, 100%, 51%)",
    danger: "hsl(0, 72%, 51%)",
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(240, 6%, 20%)"
            strokeWidth="8"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorMap[color]}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{value}%</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

export default CircularGauge;
