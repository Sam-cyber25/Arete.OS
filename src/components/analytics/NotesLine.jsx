import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import { useApp }            from '../../context/AppContext'
import { getNotesPerWeek }   from '../../utils/dateHelpers'

const CustomTooltip = ({ active, payload, label }) => {
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
        {label}
      </p>
      <p className="font-mono" style={{ fontSize: '13px', color: 'var(--gold)' }}>
        {payload[0].value} notes
      </p>
    </div>
  )
}

export default function NotesLine() {
  const { notes } = useApp()
  const data = getNotesPerWeek(notes)

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 5, right: 0, left: -32, bottom: 0 }}>
        <XAxis
          dataKey="week"
          tick={{ fill: 'var(--faint)', fontSize: 10, fontFamily: '"Cinzel", serif', letterSpacing: '0.06em' }}
          axisLine={{ stroke: 'var(--divider)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--faint)', fontSize: 10, fontFamily: '"JetBrains Mono", monospace' }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(201,168,76,0.15)', strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="notes"
          stroke="var(--gold)"
          strokeWidth={1}
          dot={false}
          activeDot={{ r: 3, fill: 'var(--gold)', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
