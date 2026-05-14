import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts'
import { useApp }              from '../../context/AppContext'
import { getWeeklyTaskData }   from '../../utils/dateHelpers'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background:  'var(--surface)',
        border:      '1px solid var(--border)',
        padding:     '8px 14px',
      }}
    >
      <p className="font-cinzel" style={{ fontSize: '9px', color: 'var(--faint)', letterSpacing: '0.1em', marginBottom: 4 }}>
        {label}
      </p>
      <p className="font-mono" style={{ fontSize: '13px', color: 'var(--gold)' }}>
        {payload[0].value} tasks
      </p>
    </div>
  )
}

export default function WeeklyBar() {
  const { tasks } = useApp()
  const data = getWeeklyTaskData(tasks)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 0, left: -32, bottom: 0 }} barCategoryGap="40%">
        <XAxis
          dataKey="name"
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
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,168,76,0.05)' }} />
        <Bar
          dataKey="tasks"
          fill="var(--gold)"
          radius={[0, 0, 0, 0]}
          maxBarSize={8}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
