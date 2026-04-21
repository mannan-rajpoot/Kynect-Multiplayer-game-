import React from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const scale = width / 375;
const normalize = (size) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

const WelcomeScreen = ({ onFinish }) => {
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background glows */}
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.inner}>

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
            
              <Text style={styles.logoText}>Kynect</Text>
            </View>

            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          {/* IMAGE */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/Team goals-pana.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* CONTENT */}
          <View style={styles.contentContainer}>

            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowLine} />
              <Text style={styles.eyebrowText}>MULTIPLAYER GAMING</Text>
              <View style={styles.eyebrowLine} />
            </View>

            <Text style={styles.headline}>
              Play fast.{'\n'}
              Connect instantly.{'\n'}
              <Text style={styles.headlineAccent}>Win together.</Text>
            </Text>

            <Text style={styles.subheadline}>
              Real-time multiplayer games with friends or random players.
              Challenge. Compete. Conquer.
            </Text>

          </View>

          {/* FOOTER */}
          <View style={styles.footer}>



            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.85}
              onPress={onFinish}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              Free to play • No account required
            </Text>

          </View>

        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },

  safeArea: {
    flex: 1,
  },

  inner: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 10 : 28,
  },

  /* GLOW BACKGROUND */
  topGlow: {
    position: 'absolute',
    top: -width * 0.3,
    right: -width * 0.2,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: '#8B5CF6',
    opacity: 0.08,
  },

  bottomGlow: {
    position: 'absolute',
    bottom: -width * 0.25,
    left: -width * 0.15,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: '#22D3EE',
    opacity: 0.05,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.02,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },

  logoIcon: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    borderWidth: 2,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  logoInnerCircle: {
    width: normalize(9),
    height: normalize(9),
    borderRadius: 5,
    backgroundColor: '#8B5CF6',
  },

  logoText: {
    color: '#FFFFFF',
    fontSize: normalize(22),
    fontWeight: '800',
  },

  liveBadge: {
    position: 'absolute',
    right: width * 0.06,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    top: 19
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#22D3EE',
    marginRight: 5,
  },

  liveText: {
    color: '#22D3EE',
    fontSize: normalize(10),
    fontWeight: '700',
  },

  /* IMAGE */
  imageContainer: {
    height: height * 0.38,
    justifyContent: 'center',
    alignItems: 'center',
  },

  illustration: {
    width: width * 0.9,
    height: '100%',
  },

  /* CONTENT */
  contentContainer: {
    paddingHorizontal: width * 0.08,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  eyebrowLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
  },

  eyebrowText: {
    color: '#8B5CF6',
    fontSize: normalize(10),
    fontWeight: '700',
    letterSpacing: 2,
    marginHorizontal: 10,
  },

  headline: {
    color: '#FFFFFF',
    fontSize: normalize(32),
    fontWeight: '800',
    lineHeight: normalize(40),
  },

  headlineAccent: {
    color: '#8B5CF6',
  },

  subheadline: {
    color: '#A1A1AA',
    fontSize: normalize(14),
    marginTop: 14,
    lineHeight: normalize(22),
  },

  /* FOOTER */
  footer: {
    paddingHorizontal: width * 0.06,
    alignItems: 'center',
  },

  pagination: {
    flexDirection: 'row',
    marginBottom: 18,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
    marginRight: 7,
  },

  activeDot: {
    width: 22,
    backgroundColor: '#8B5CF6',
  },

  button: {
    backgroundColor: '#8B5CF6',
    height: normalize(54),
    borderRadius: normalize(27),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: '800',
  },

  footerNote: {
    color: '#666',
    fontSize: normalize(12),
    marginTop: 10,
  },
});

export default WelcomeScreen;