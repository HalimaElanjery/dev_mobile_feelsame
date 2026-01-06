import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'elevated' | 'flat' | 'outlined';
    padding?: number;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'elevated',
    padding = 16
}) => {
    const { colors, isDark } = useTheme();

    const getVariantStyle = () => {
        switch (variant) {
            case 'elevated':
                return {
                    backgroundColor: colors.card,
                    ...Platform.select({
                        ios: {
                            shadowColor: colors.shadow,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: isDark ? 0.3 : 0.08,
                            shadowRadius: 12,
                        },
                        android: {
                            elevation: 4,
                        },
                        web: {
                            boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
                        }
                    })
                };
            case 'outlined':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: colors.border,
                };
            case 'flat':
            default:
                return {
                    backgroundColor: colors.surface,
                };
        }
    };

    return (
        <View style={[
            styles.base,
            getVariantStyle(),
            { padding },
            style
        ]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: 20, // Plus arrondi = plus moderne
        marginBottom: 16,
    },
});
