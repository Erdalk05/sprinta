import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg'
import { theme } from '../../theme'

interface DataPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: DataPoint[]
  color?: string
  height?: number
  showDots?: boolean
  showGrid?: boolean
  showLabels?: boolean
  width?: number
}

export function LineChart({
  data,
  color = theme.colors.primary,
  height = 120,
  showDots = true,
  showGrid = true,
  showLabels = true,
  width: propWidth,
}: LineChartProps) {
  const W = propWidth ?? 300
  const H = height
  const padL = 8
  const padR = 8
  const padT = 10
  const padB = showLabels ? 24 : 10

  if (!data || data.length < 2) {
    return (
      <View style={[styles.empty, { height: H }]}>
        <Text style={styles.emptyText}>Henüz veri yok</Text>
      </View>
    )
  }

  const values = data.map((d) => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range  = maxVal - minVal || 1

  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const toX = (i: number) => padL + (i / (data.length - 1)) * chartW
  const toY = (v: number) => padT + ((maxVal - v) / range) * chartH

  // Build SVG path
  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }))
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')

  // Grid lines (3 horizontal)
  const gridLines = [0, 0.5, 1].map((t) => ({
    y: padT + t * chartH,
    val: Math.round(maxVal - t * range),
  }))

  // Show labels every n points to avoid crowding
  const labelStep = Math.ceil(data.length / 5)

  return (
    <Svg width={W} height={H}>
      {/* Grid */}
      {showGrid && gridLines.map((gl, i) => (
        <Line
          key={i}
          x1={padL} y1={gl.y}
          x2={W - padR} y2={gl.y}
          stroke={theme.colors.divider}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
      ))}

      {/* Line */}
      <Path
        d={pathD}
        stroke={color}
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {showDots && points.map((p, i) => (
        <Circle
          key={i}
          cx={p.x} cy={p.y}
          r={i === data.length - 1 ? 5 : 3}
          fill={i === data.length - 1 ? color : theme.colors.surface}
          stroke={color}
          strokeWidth={2}
        />
      ))}

      {/* X Labels */}
      {showLabels && data.map((d, i) => {
        if (i % labelStep !== 0 && i !== data.length - 1) return null
        return (
          <SvgText
            key={i}
            x={toX(i)}
            y={H - 4}
            fontSize={9}
            fill={theme.colors.textHint}
            textAnchor="middle"
          >
            {d.label}
          </SvgText>
        )
      })}
    </Svg>
  )
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textHint,
  },
})
