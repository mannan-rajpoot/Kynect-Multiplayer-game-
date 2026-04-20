import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ScrollView,
  Platform,
  PixelRatio,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Responsive Font Helper
const scale = width / 375;
const normalize = (size) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
  }
};

const WelcomeScreen = ({ onFinish }) => {
  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* 1. TOP LOGO SECTION */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <View style={styles.logoInnerCircle} />
              </View>
              <Text style={styles.logoText}>Kynect</Text>
            </View>
          </View>

          {/* 2. ILLUSTRATION SECTION */}
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/Team goals-pana.png')} 
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* 3. CONTENT SECTION */}
          <View style={styles.contentContainer}>
            <Text style={styles.headline}>
              Good managers{'\n'}mean better{'\n'}sales growth.
            </Text>
            
            <Text style={styles.subheadline}>
              Join entrepreneurs driving impact and growing their businesses.
            </Text>

           
          </View>

          {/* 5. BUTTON SECTION (Inside Scroll to ensure visibility on small screens) */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.button} 
              activeOpacity={0.8}
              onPress={onFinish}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // Ensures the content takes up full height to allow center/bottom alignment
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 10 : 30,
  },
  header: {
    alignItems: 'center',
    paddingTop: height * 0.02, // Responsive top margin
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: normalize(22),
    height: normalize(22),
    borderRadius: normalize(11),
    borderWidth: 2,
    borderColor: '#9D8BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoInnerCircle: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: '#9D8BFF',
  },
  logoText: {
    color: '#FFF',
    fontSize: normalize(22),
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  imageContainer: {
    height: height * 0.4, // Takes up 40% of screen height exactly
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: height * 0.02,
  },
  illustration: {
    width: width * 0.9,
    height: '100%',
  },
  contentContainer: {
    paddingHorizontal: width * 0.08, // Responsive side padding
    justifyContent: 'center',
  },
  headline: {
    color: '#FFF',
    fontSize: normalize(34),
    fontWeight: '700',
    lineHeight: normalize(42),
  },
  subheadline: {
    color: '#999',
    fontSize: normalize(16),
    marginTop: height * 0.02,
    lineHeight: normalize(24),
  },
  pagination: {
    flexDirection: 'row',
    marginTop: height * 0.03,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
    marginRight: 8,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#ffffff',
  },
  footer: {
    paddingHorizontal: 20,
    marginTop: height * 0.04, // Space between content and button
  },
  button: {
    backgroundColor: '#ffffff',
    height: normalize(58),
    borderRadius: normalize(29),
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    // Added shadow for premium feel
    shadowColor: "#9D8BFF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonText: {
    color: '#1A1A1A',
    fontSize: normalize(18),
    fontWeight: '700',
  },
});

export default WelcomeScreen;