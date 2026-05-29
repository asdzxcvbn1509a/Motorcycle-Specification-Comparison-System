import { useTranslation } from 'react-i18next';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// Reference ranges สำหรับ normalize 0-100
const RANGES = {
  horsepower: { min: 20, max: 220 },
  torque: { min: 20, max: 150 },
  engineCc: { min: 100, max: 1500 },
  fuelCapacityL: { min: 5, max: 30 },
  weightKg: { min: 130, max: 280 },
};

function normalize(value, key, invert = false) {
  if (value === null || value === undefined || value === '') return 0;
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  const { min, max } = RANGES[key];
  let pct = ((n - min) / (max - min)) * 100;
  pct = Math.max(0, Math.min(100, pct));
  return Math.round(invert ? 100 - pct : pct);
}

export default function StatsRadarChart({ motorcycle }) {
  const { t } = useTranslation();
  const data = [
    { axis: t('radar.horsepower'), value: normalize(motorcycle.horsepower, 'horsepower') },
    { axis: t('radar.torque'), value: normalize(motorcycle.torque, 'torque') },
    { axis: t('radar.engineSize'), value: normalize(motorcycle.engineCc, 'engineCc') },
    { axis: t('radar.fuelCapacity'), value: normalize(motorcycle.fuelCapacityL, 'fuelCapacityL') },
    { axis: t('radar.lightWeight'), value: normalize(motorcycle.weightKg, 'weightKg', true) },
  ];

  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">{t('detail.performanceProfile')}</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name={t('detail.performanceProfile')}
              dataKey="value"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {t('radar.note')}
      </p>
    </div>
  );
}
