import type { RegionId } from '../types'
import { REGION_LIST, REGIONS } from '../lib/regions'

type Props = {
  region: RegionId
  onRegion: (id: RegionId) => void
  compact?: boolean
}

export function RegionPicker({ region, onRegion, compact }: Props) {
  const current = REGIONS[region]

  return (
    <div className={`region-picker ${compact ? 'is-compact' : ''}`}>
      <p className="picker-label">Destino</p>
      <div className="region-grid">
        {REGION_LIST.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`region-card ${region === item.id ? 'is-on' : ''}`}
            onClick={() => onRegion(item.id)}
          >
            <strong>
              <span>{item.flag}</span>
              {item.name}
            </strong>
            <em>{item.formal}</em>
            <small>{item.paper === 'letter' ? 'Letter' : 'A4'}</small>
          </button>
        ))}
      </div>
      {!compact && (
        <ul className="region-tips">
          {current.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
