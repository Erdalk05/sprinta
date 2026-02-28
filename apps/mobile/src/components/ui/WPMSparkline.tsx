/**
 * WPM Sparkline — Kompakt SVG grafik (ChunkRSVP geçmiş WPM verisi için)
 * react-native-svg kullanır, LineChart'tan daha minimal ve satır içi.
 */
import React, { useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg'
import { useAppTheme } from '../../theme/useAppTheme'
import type { WPMDataPoint } from '@sprinta/api'

interface WPMSparklineProps {
  data: WPMDataPoint[]
  width?: number
  height?: number
  color?: string
  showLast?: boolean   // son noktayı vurgula
  showArea?: boolean   // altına gradient dolgu
}

export function WPMSparkline({
  data,
  width: W = 200,
  height: H = 48,
  color,
  showLast = true,
  showArea = true,
}: WPMSparklineProps) {
  const t = useAppTheme()
  const lineColor = color ?? t.colors.primary

  const { pathD, areaD, points, minV, maxV } = useMemo(() => {
    if (!data || data.length < 2) return { pathD: '', areaD: '', points: [], minV: 0, maxV: 1 }

    const values = data.map((d) => d.avgWPM)
    const minV = Math.min(...values)
    const maxV = Math.max(...values)
    const range = maxV - minV || 1

    const padL = 4
    const padR = 4
    const padT = 6
    const padB = 6
    const chartW = W - padL - padR
    const chartH = H - padT - padB

    const toX = (i: number) => padL + (i / (data.length - 1)) * chartW
    const toY = (v: number) => padT + ((maxV - v) / range) * chartH

    const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.avgWPM) }))

    const pathD = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ')

    const areaD = [
      pathD,
      `L${pts[pts.length - 1].x.toFixed(1)},${(H - padB).toFixed(1)}`,
      `L${pts[0].x.toFixed(1)},${(H - padB).toFixed(1)}`,
      'Z',
    ].join(' ')

    return { pathD, areaD, points: pts, minV, maxV }
  }, [data, W, H])

  if (!data || data.length < 2) {
    return (
      <View style={[styles.empty, { width: W, height: H }]}>
        <Text style={[styles.emptyTxt, { color: t.colors.textHint }]}>Henüz veri yok</Text>
      </View>
    )
  }

  const lastPt = points[points.length - 1]

  return (
    <Svg width={W} height={H}>
      <Defs>
        <LinearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={lineColor} stopOpacity={0.25} />
          <Stop offset="1" stopColor={lineColor} stopOpacity={0.0} />
        </LinearGradient>
      </Defs>

      {/* Alan dolgu */}
      {showArea && (
        <Path d={areaD} fill="url(#wpmGrad)" />
      )}

      {/* Çizgi */}
      <Path
        d={pathD}
        stroke={lineColor}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Son nokta vurgusu */}
      {showLast && lastPt && (
        <>
          <Circle cx={lastPt.x} cy={lastPt.y} r={5} fill={lineColor} opacity={0.2} />
          <Circle cx={lastPt.x} cy={lastPt.y} r={3} fill={lineColor} />
        </>
      )}
    </Svg>
  )
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTxt: {
    fontSize: 11,
  },
})
