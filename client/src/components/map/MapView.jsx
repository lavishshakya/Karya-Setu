import { useEffect, useMemo } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { cn } from '@/lib/utils'

// Keyless OpenStreetMap tiles by default (fine for development and demos — see the OSM tile
// usage policy). For production, point VITE_MAP_TILES / VITE_MAP_ATTRIBUTION at a keyed provider.
// Dark mode re-tints the tile layer with a CSS filter (see .ks-map in index.css).
const TILE_URL = import.meta.env.VITE_MAP_TILES ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION =
  import.meta.env.VITE_MAP_ATTRIBUTION ??
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

/** Price-tag style pin: a pill with a short label (₹800, a worker's initials…). */
function pillIcon(label, variant = 'brand', active = false) {
  return L.divIcon({
    className: 'ks-pin',
    iconSize: [0, 0],
    html: `<div class="ks-pill ks-pill--${variant}${active ? ' ks-pill--active' : ''}">${escapeHtml(label)}</div>`,
  })
}

const meIcon = L.divIcon({ className: 'ks-pin', iconSize: [0, 0], html: '<div class="ks-me"></div>' })

// Keyed on primitives so a parent passing a fresh [lat, lng] array each render doesn't re-fly.
function Recenter({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom(), { duration: 0.8 })
  }, [map, lat, lng])
  return null
}

/**
 * markers: [{ id, position: [lat, lng], label, variant?: 'brand'|'saffron'|'danger'|'muted', tooltip? }]
 */
export default function MapView({
  center,
  zoom = 12,
  markers = [],
  selectedId,
  onSelect,
  radiusKm,
  me,
  draggable,
  onDragEnd,
  className,
}) {
  const icons = useMemo(
    () => Object.fromEntries(markers.map((m) => [m.id, pillIcon(m.label, m.variant, m.id === selectedId)])),
    [markers, selectedId],
  )

  return (
    <div className={cn('ks-map isolate overflow-hidden rounded-2xl border border-line', className)}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="size-full" attributionControl>
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} />
        <Recenter lat={center[0]} lng={center[1]} />
        {radiusKm && (
          <Circle
            center={center}
            radius={radiusKm * 1000}
            pathOptions={{ color: '#0f97b2', weight: 1.5, fillColor: '#0f97b2', fillOpacity: 0.07, dashArray: '6 6' }}
          />
        )}
        {me && <Marker position={me} icon={meIcon} zIndexOffset={-100} />}
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={m.position}
            icon={icons[m.id]}
            zIndexOffset={m.id === selectedId ? 1000 : 0}
            draggable={draggable}
            eventHandlers={{
              click: () => onSelect?.(m.id),
              dragend: (e) => onDragEnd?.(e.target.getLatLng()),
            }}
          >
            {m.tooltip && (
              <Tooltip direction="top" offset={[0, -34]} opacity={1}>
                {m.tooltip}
              </Tooltip>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
