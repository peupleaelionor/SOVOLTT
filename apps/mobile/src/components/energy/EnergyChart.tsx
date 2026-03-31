// src/components/energy/EnergyChart.tsx — Graphique d'énergie simplifié avec SVG
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { colors, typography, spacing } from '../../theme';

interface DataPoint {
  label: string;
  value: number;
}

interface EnergyChartProps {
  data: DataPoint[];
  title?: string;
  unit?: string;
  color?: string;
  height?: number;
}

export function EnergyChart({
  data,
  title,
  unit = 'kWh',
  color = colors.primary,
  height = 200,
}: EnergyChartProps) {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.empty}>Aucune donnée disponible</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartWidth = 320;
  const chartHeight = height - 50;
  const barWidth = Math.max((chartWidth - 40) / data.length - 4, 8);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <Svg width={chartWidth} height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
        {/* Lignes de grille horizontales */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <Line
            key={ratio}
            x1="30"
            y1={10 + chartHeight * (1 - ratio)}
            x2={chartWidth}
            y2={10 + chartHeight * (1 - ratio)}
            stroke={colors.borderLight}
            strokeWidth={1}
          />
        ))}

        {/* Barres */}
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * chartHeight;
          const x = 35 + index * ((chartWidth - 40) / data.length);
          const y = 10 + chartHeight - barHeight;

          return (
            <React.Fragment key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={color}
                opacity={0.85}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                fontSize={9}
                fill={colors.textLight}
              >
                {point.label}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Étiquettes Y */}
        <SvgText x={2} y={15} fontSize={9} fill={colors.textLight}>
          {maxValue.toFixed(0)}{unit}
        </SvgText>
        <SvgText x={2} y={10 + chartHeight} fontSize={9} fill={colors.textLight}>
          0
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  empty: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
