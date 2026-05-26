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

export default function GoalRadar() {
  const { goals }  = useApp()
  const isMobile   = useIsMobile()

  const radarData = [
    { subject: 'Academic',  value: goals.find((g) => g.category === 'Academic')?.progress  ?? 0, fullMark: 100 },
    { subject: 'Business',  value: goals.find((g) => g.category === 'Business')?.progress  ?? 0, fullMark: 100 },
    { subject: 'Health',    value: goals.find((g) => g.category === 'Health')?.progress    ?? 0, fullMark: 100 },
    { subject: 'Spiritual', value: goals.find((g) => g.category === 'Spiritual')?.progress ?? 0, fullMark: 100 },
    { subject: 'Combat',    value: goals.find((g) => g.category === 'Combat')?.progress    ?? 0, fullMark: 100 },
    { subject: 'Self',      value: goals.find((g) => g.category === 'Self')?.progress      ?? 0, fullMark: 100 },
  ]

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
      <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="#2A2520" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{
            fill:          '#A89880',
            fontSize:      11,
            fontFamily:    'Cinzel, serif',
            letterSpacing: '0.1em',
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          name="Progress"
          dataKey="value"
          stroke="#C9A84C"
          fill="#C9A84C"
          fillOpacity={0.08}
          strokeWidth={1}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
