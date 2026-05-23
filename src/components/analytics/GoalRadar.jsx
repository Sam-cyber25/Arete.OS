import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip,
} from 'recharts'
import { useApp }      from '../../context/AppContext'
import { useIsMobile } from '../../hooks/useIsMobile'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--surface)',
        border:     '1px solid var(--border)',
        padding:    '8px 14px',
      }}
    >
      <p className="font-cinzel" style={{ fontSize: '9px', color: 'var(--faint)', letterSpacing: '0.1em', marginBottom: 4 }}>
        {payload[0].payload.subject}
      </p>
      <p className="font-mono" style={{ fontSize: '13px', color: 'var(--gold)' }}>
        {payload[0].value}%
      </p>
    </div>
  )
}

const SHORT_LABELS = {
  'AIR 1 in CBSE Class 10 Boards':           'Academic',
  'Generate Independent Freelance Income':     'Business',
  'Body Recomposition (120g+ protein daily)': 'Health',
  'Daily Spiritual Practice':                  'Spiritual',
  'MMA Training — Footwork & Striking':       'Combat',
  'Project Arête — Character Transformation': 'Self',
}

export default function GoalRadar() {
  const { goals }  = useApp()
  const isMobile   = useIsMobile()

  const data = goals.map((g) => ({
    subject:  SHORT_LABELS[g.title] || g.category,
    value:    g.progress,
    fullMark: 100,
  }))

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 180 : 240}>
      <RadarChart data={data} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
        <PolarGrid
          stroke="var(--divider)"
          strokeWidth={1}
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="subject"
          tick={{
            fill:        'var(--faint)',
            fontSize:    10,
            fontFamily:  '"Cinzel", serif',
            letterSpacing: '0.06em',
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          name="Progress"
          dataKey="value"
          stroke="var(--gold)"
          fill="var(--gold)"
          fillOpacity={0.06}
          strokeWidth={1}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
