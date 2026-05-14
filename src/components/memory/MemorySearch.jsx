export default function MemorySearch({ value, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search memory..."
        className="input-underline font-garamond"
        style={{ fontSize: '16px', paddingLeft: 0 }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="btn-ghost absolute right-0 bottom-2"
          style={{ fontSize: '9px', letterSpacing: '0.14em' }}
        >
          Clear
        </button>
      )}
    </div>
  )
}
