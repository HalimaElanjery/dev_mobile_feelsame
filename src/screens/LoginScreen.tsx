import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppLogo } from '../components/Branding/AppLogo';
import { Input } from '../components/Input';
import { AtmosphericBackground } from '../components/UI/AtmosphericBackground';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const { colors, isDark } = useTheme();

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email requis');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email invalide');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Mot de passe requis');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.success) Alert.alert('Erreur', result.error || 'Erreur connexion');
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success) Alert.alert('Google', result.error || 'Erreur Google');
    } catch (error) {
      Alert.alert('Erreur', 'Erreur Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AtmosphericBackground variant="calm">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* En-tête avec Logo et Slogan */}
          <View style={styles.headerContainer}>
            <AppLogo size="large" />
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Welcome back, you've been missed!
            </Text>
          </View>

          {/* Formulaire Card */}
          <View style={[styles.form, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="hello@feelsame.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <View style={{ height: 16 }} />

            <Input
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              error={passwordError}
            />

            <TouchableOpacity
              style={{ alignSelf: 'flex-end', marginTop: 8 }}
              onPress={() => Alert.alert('Info', 'Fonctionnalité bientôt disponible')}
            >
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonContainer, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>{loading ? 'Connexion...' : 'Se connecter'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Séparateur */}
            <View style={styles.separatorContainer}>
              <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.separatorText, { color: colors.textSecondary }]}>OU</Text>
              <View style={[styles.separatorLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              style={[
                styles.googleButton,
                { borderColor: colors.border, backgroundColor: isDark ? '#2A2A35' : '#FFF' }
              ]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Text style={{ marginRight: 10, fontSize: 18 }}>G</Text>
              <Text style={[styles.googleButtonText, { color: colors.text }]}>
                Continuer avec Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pied de page inscription */}
          <View style={styles.registerLink}>
            <Text style={{ color: colors.textSecondary }}>Pas encore membre ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: colors.secondary, fontWeight: '700' }}>Créer un compte</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </AtmosphericBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: '70%',
    lineHeight: 22,
  },
  form: {
    borderRadius: 24,
    padding: 32,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 10px 40px rgba(0,0,0,0.05)',
      }
    }),
  },
  buttonContainer: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      }
    }),
  },
  gradientButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
});
