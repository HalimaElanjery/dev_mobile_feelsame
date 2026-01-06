import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'calm' | 'deep' | 'warm';
}

export const AtmosphericBackground: React.FC<Props> = ({ children, style, variant = 'calm' }) => {
    const { isDark } = useTheme();

    // Palettes émotionnelles
    const getColors = () => {
        if (isDark) {
            // Dark Mode: Deep Space / "Midnight Thoughts"
            return ['#1A1B2E', '#16213E', '#0F3460'];
        }

        switch (variant) {
            case 'deep':
                return ['#E0C3FC', '#8EC5FC']; // Purple to Blue (Introspection)
            case 'warm':
                return ['#fa709a', '#fee140']; // Pink to Yellow (Joie/Espoir) mais très soft
            case 'calm':
            default:
                // Signature "FeelSame" : Aube douce (Soft Lavender -> Mist)
                return ['#F4F7FF', '#F0F4FD', '#E8EAF6'];
        }
    };

    return (
        <LinearGradient
            colors={getColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.container, style]}
        >
            {/* Optionnel: On pourrait ajouter des cercles flous ici pour plus de texture */}

            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
