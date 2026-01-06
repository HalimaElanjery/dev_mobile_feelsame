import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../../context/ThemeContext';

interface AppLogoProps {
    size?: 'small' | 'medium' | 'large';
    variant?: 'light' | 'dark' | 'color';
}

export const AppLogo: React.FC<AppLogoProps> = ({ size = 'medium', variant = 'color' }) => {
    const { colors } = useTheme();

    const getDimensions = () => {
        switch (size) {
            case 'small': return 32;
            case 'medium': return 60;
            case 'large': return 80;
            default: return 60;
        }
    };

    const fontSize = size === 'small' ? 20 : size === 'medium' ? 32 : 48;
    const iconSize = getDimensions();

    const textColor = variant === 'light' ? '#FFF'
        : variant === 'dark' ? '#000'
            : colors.primary;

    return (
        <View style={styles.container}>
            {/* Logo Géométrique "Résonance" */}
            <Animatable.View
                animation="pulse"
                easing="ease-in-out"
                iterationCount="infinite"
                duration={4000}
                style={[styles.iconContainer, { width: iconSize, height: iconSize }]}
            >
                {/* Cercle arrière (Onde) */}
                <View style={[
                    styles.circle,
                    {
                        width: iconSize,
                        height: iconSize,
                        backgroundColor: colors.primary,
                        opacity: 0.2,
                        position: 'absolute'
                    }
                ]} />

                {/* Cercle milieu (Décalé) */}
                <View style={[
                    styles.circle,
                    {
                        width: iconSize * 0.7,
                        height: iconSize * 0.7,
                        backgroundColor: colors.secondary,
                        opacity: 0.6,
                        position: 'absolute',
                        top: iconSize * 0.15,
                        left: iconSize * 0.3
                    }
                ]} />

                {/* Cercle avant (Principal) */}
                <LinearGradient
                    colors={[colors.gradientStart, colors.gradientEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.circle,
                        {
                            width: iconSize * 0.7,
                            height: iconSize * 0.7,
                            position: 'absolute',
                            top: iconSize * 0.15,
                            left: iconSize * 0.0
                        }
                    ]}
                />
            </Animatable.View>

            <Animatable.Text
                animation="fadeIn"
                delay={200}
                style={[styles.title, { fontSize, color: textColor }]}
            >
                Feel<Text style={{ fontWeight: '300', fontStyle: 'italic' }}>Same</Text>
            </Animatable.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: 'System',
        fontWeight: '800',
        marginTop: 12,
        letterSpacing: -0.5,
    },
    iconContainer: {
        marginBottom: 4,
        justifyContent: 'center',
        alignItems: 'center',
        // Pas d'overflow hidden pour laisser dépasser les formes si besoin
    },
    circle: {
        borderRadius: 999,
    }
});
