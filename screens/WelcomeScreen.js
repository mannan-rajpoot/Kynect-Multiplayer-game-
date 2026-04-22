import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  PixelRatio,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Responsive Utilities ──────────────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const isSmall   = SCREEN_W < 360;
const isMedium  = SCREEN_W >= 360 && SCREEN_W < 414;
const isTablet  = SCREEN_W >= 768;

const BASE_W = 375;
const BASE_H = 812;

const rs = (size) => Math.round(PixelRatio.roundToNearestPixel(size * (SCREEN_W / BASE_W)));
const vs = (size) => Math.round(PixelRatio.roundToNearestPixel(size * (SCREEN_H / BASE_H)));
const ms = (size, factor = 0.5) => Math.round(size + (rs(size) - size) * factor);

const adaptive = ({ small, medium, large, tablet }) => {
  if (isTablet) return tablet ?? large ?? medium ?? small;
  return medium ?? small;
};

// ─── Entrance Animation Hook ───────────────────────────────────────────────
const useEntrance = (delay = 0) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(25)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 600, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
};

// ─── Main Component ────────────────────────────────────────────────────────
const WelcomeScreen = ({ onFinish }) => {
  
  // Animation sequences matching AuthScreen
  const a0 = useEntrance(100);  // Logo
  const a1 = useEntrance(250);  // Illustration
  const a2 = useEntrance(400);  // Headline
  const a3 = useEntrance(550);  // Subheadline
  const a4 = useEntrance(700);  // Footer

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <SafeAreaView style={s.safe}>
        <View style={s.inner}>
          
          {/* 1. HEADER / LOGO */}
          <Animated.View style={[s.header, a0]}>
            <Text style={s.logo}>Kynect<Text style={s.dot}>.</Text></Text>
          </Animated.View>

          {/* 2. ILLUSTRATION */}
          <Animated.View style={[s.imageContainer, a1]}>
            <Image
              source={require('../assets/Team goals-pana.png')}
              style={s.illustration}
              resizeMode="contain"
            />
          </Animated.View>

          {/* 3. CONTENT SECTION */}
          <View style={s.contentContainer}>
            <Animated.View style={[s.eyebrowRow, a2]}>
              <View style={s.eyebrowLine} />
              <Text style={s.eyebrowText}>MULTIPLAYER GAMING</Text>
              <View style={s.eyebrowLine} />
            </Animated.View>

            <Animated.View style={a2}>
              <Text style={s.headline}>
                Play fast.{'\n'}
                Connect instantly.{'\n'}
                <Text style={s.headlineAccent}>Win together.</Text>
              </Text>
            </Animated.View>

            <Animated.View style={a3}>
              <Text style={s.subheadline}>
                Real-time multiplayer games with friends or random players.
                Challenge. Compete. Conquer.
              </Text>
            </Animated.View>
          </View>

          {/* 4. FOOTER / BUTTON */}
          <Animated.View style={[s.footer, a4]}>
            <TouchableOpacity
              style={s.button}
              activeOpacity={0.85}
              onPress={onFinish}
            >
              <Text style={s.buttonText}>Get Started</Text>
              <View style={s.btnArrow}>
                 <Text style={s.arrowChar}>→</Text>
              </View>
            </TouchableOpacity>

            <Text style={s.footerNote}>
              Free to play | Secured Access
            </Text>
          </Animated.View>

        </View>
      </SafeAreaView>
    </View>
  );
};

// ─── Stylesheet ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: '#000000' // Pure Black Background
  },
  safe: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: vs(20),
  },

  /* HEADER */
  header: {
    alignItems: 'center',
    paddingTop: vs(20),
  },
  logo: {
    color: '#FFFFFF',
    fontSize: ms(24),
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  dot: { color: '#8B5CF6' },

  /* IMAGE */
  imageContainer: {
    height: SCREEN_H * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: SCREEN_W * 0.85,
    height: '100%',
  },

  /* CONTENT */
  contentContainer: {
    paddingHorizontal: rs(30),
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  eyebrowLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  eyebrowText: {
    color: '#8B5CF6',
    fontSize: ms(9),
    fontWeight: '800',
    letterSpacing: 2,
    marginHorizontal: rs(10),
  },
  headline: {
    color: '#FFFFFF',
    fontSize: ms(adaptive({ small: 30, medium: 34, large: 38 })),
    fontWeight: '900',
    lineHeight: ms(adaptive({ small: 38, medium: 42, large: 46 })),
    letterSpacing: -1,
  },
  headlineAccent: {
    color: '#8B5CF6',
  },
  subheadline: {
    color: '#71717A',
    fontSize: ms(14),
    marginTop: vs(15),
    lineHeight: ms(22),
  },

  /* FOOTER */
  footer: {
    paddingHorizontal: rs(30),
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#8B5CF6',
    height: vs(60),
    borderRadius: rs(18),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    // High contrast shadow for pure black background
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.6,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: ms(16),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnArrow: {
    width: rs(24),
    height: rs(24),
    borderRadius: rs(12),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: rs(12),
  },
  arrowChar: {
    color: '#8B5CF6', 
    fontWeight: '900', 
    fontSize: ms(14)
  },
  footerNote: {
    color: '#3F3F46',
    fontSize: ms(11),
    marginTop: vs(15),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;