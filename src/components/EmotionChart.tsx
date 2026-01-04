/**
 * Composant EmotionChart
 * Graphique en barres des émotions
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface EmotionData {
  emotion: string;
  value: number;
  color: string;
  emoji: string;
}

interface EmotionChartProps {
  data: EmotionData[];
  title?: string;
}

export const EmotionChart: React.FC<EmotionChartProps> = ({
  data,
  title = 'Vos émotions cette semaine',
}) => {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * 120 : 0;
          
          return (
            <View key={item.emotion} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <Text style={styles.barValue}>{item.value}</Text>
                <Animatable.View
                  animation="slideInUp"
                  delay={index * 100}
                  duration={800}
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: item.color,
                    }
                  ]}
                />
              </View>
              <View style={styles.labelContainer}>
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.label}>{item.emotion}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    paddingHorizontal: 8,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 60,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 140,
    marginBottom: 8,
  },
  bar: {
    width: 24,
    borderRadius: 12,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  labelContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});