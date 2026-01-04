# Guide des Animations Professionnelles

Ce guide explique comment utiliser les bibliothèques d'animation professionnelles intégrées dans l'application FeelSame.

## 📚 Bibliothèques Installées

### 1. **react-native-animatable** ⭐
Bibliothèque d'animations déclaratives, simple et performante.

**Utilisation :**
```tsx
import * as Animatable from 'react-native-animatable';

<Animatable.View animation="fadeInUp" duration={500}>
  <Text>Contenu animé</Text>
</Animatable.View>
```

**Animations disponibles :**
- `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`
- `slideInUp`, `slideInDown`, `slideInLeft`, `slideInRight`
- `bounceIn`, `bounceInUp`, `bounceInDown`
- `zoomIn`, `zoomOut`
- `pulse`, `shake`, `rubberBand`

### 2. **react-native-reanimated** ⚡
Bibliothèque d'animation haute performance (déjà installée).

**Utilisation :**
```tsx
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

const opacity = useSharedValue(0);

useEffect(() => {
  opacity.value = withSpring(1);
}, []);

<Animated.View style={{ opacity }}>
  <Text>Animation fluide</Text>
</Animated.View>
```

### 3. **lottie-react-native** 🎨
Animations vectorielles professionnelles (comme After Effects).

**Utilisation :**
```tsx
import LottieView from 'lottie-react-native';

<LottieView
  source={require('./animation.json')}
  autoPlay
  loop
  style={{ width: 200, height: 200 }}
/>
```

**Ressources :**
- [LottieFiles](https://lottiefiles.com) - Bibliothèque gratuite d'animations

### 4. **expo-linear-gradient** 🌈
Dégradés linéaires pour des boutons et backgrounds stylisés.

**Utilisation :**
```tsx
import { LinearGradient } from 'expo-linear-gradient';

<LinearGradient
  colors={['#2196f3', '#1976d2']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.gradient}
>
  <Text>Bouton avec dégradé</Text>
</LinearGradient>
```

### 5. **expo-blur** 🔲
Effets de flou (blur) pour overlays et modals.

**Utilisation :**
```tsx
import { BlurView } from 'expo-blur';

<BlurView intensity={80} style={styles.blur}>
  <Text>Contenu avec flou</Text>
</BlurView>
```

### 6. **react-native-paper** 🎭
Bibliothèque de composants Material Design.

**Utilisation :**
```tsx
import { Button, Card, TextInput } from 'react-native-paper';

<Button mode="contained" onPress={handlePress}>
  Bouton Material
</Button>
```

## 🎯 Composants Animés Prêts à l'Emploi

### AnimatedButton
Bouton avec animations intégrées.

```tsx
import { AnimatedButton } from '../components/AnimatedButton';

<AnimatedButton
  title="Cliquez-moi"
  onPress={handlePress}
  variant="primary"
  animation="pulse"
/>
```

### AnimatedCard
Carte avec animation d'entrée.

```tsx
import { AnimatedCard } from '../components/AnimatedCard';

<AnimatedCard animation="fadeInUp" delay={100}>
  <Text>Contenu de la carte</Text>
</AnimatedCard>
```

### GradientButton
Bouton avec dégradé linéaire.

```tsx
import { GradientButton } from '../components/GradientButton';

<GradientButton
  title="Bouton Gradient"
  onPress={handlePress}
  colors={['#2196f3', '#9c27b0']}
/>
```

### LottieAnimation
Composant pour animations Lottie.

```tsx
import { LottieAnimation } from '../components/LottieAnimation';

<LottieAnimation
  source={require('./assets/loading.json')}
  autoPlay
  loop
  width={200}
  height={200}
/>
```

## 💡 Exemples d'Intégration

### Animation de liste
```tsx
{items.map((item, index) => (
  <AnimatedCard
    key={item.id}
    animation="fadeInUp"
    delay={index * 100}
  >
    <Text>{item.title}</Text>
  </AnimatedCard>
))}
```

### Bouton avec feedback haptique
```tsx
import * as Haptics from 'expo-haptics';

<AnimatedButton
  title="Toucher"
  onPress={() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleAction();
  }}
  animation="bounce"
/>
```

### Modal avec blur
```tsx
import { BlurView } from 'expo-blur';
import * as Animatable from 'react-native-animatable';

<BlurView intensity={80} style={StyleSheet.absoluteFill}>
  <Animatable.View animation="zoomIn" duration={300}>
    <View style={styles.modal}>
      <Text>Modal avec flou</Text>
    </View>
  </Animatable.View>
</BlurView>
```

## 🚀 Bonnes Pratiques

1. **Performance** : Utilisez `react-native-reanimated` pour les animations complexes
2. **Simplicité** : Utilisez `react-native-animatable` pour les animations simples
3. **Feedback** : Ajoutez des haptics avec `expo-haptics` pour une meilleure UX
4. **Délais** : Ajoutez des délais progressifs pour les listes animées
5. **Lottie** : Utilisez Lottie pour les animations complexes et vectorielles

## 📖 Ressources

- [react-native-animatable Docs](https://github.com/oblador/react-native-animatable)
- [react-native-reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)
- [LottieFiles](https://lottiefiles.com)
- [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

