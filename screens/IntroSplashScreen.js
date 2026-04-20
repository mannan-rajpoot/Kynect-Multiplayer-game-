import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  StatusBar,
  Easing,
  Text,
  Dimensions,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive icon size: 18% of screen width feels balanced on all devices
const ICON_SIZE = wp('18%');
// How far apart icon and text split — tuned so combined width stays centred
const SPLIT_DISTANCE = ICON_SIZE * 1.1;

const IntroSplashScreen = ({ onFinish }) => {
  const iconOpacity   = useRef(new Animated.Value(0)).current;
  const iconScale     = useRef(new Animated.Value(0.4)).current;
  const iconTranslateX = useRef(new Animated.Value(0)).current;
  const textOpacity   = useRef(new Animated.Value(0)).current;
  const textTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Icon appears in centre
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.back(1.3)),
          useNativeDriver: true,
        }),
      ]),

      // Brief pause before split
      Animated.delay(350),

      // 2. Icon slides left, text fades in from centre sliding right
      Animated.parallel([
        Animated.timing(iconTranslateX, {
          toValue: -SPLIT_DISTANCE,
          duration: 900,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 700,
          delay: 150,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateX, {
          toValue: ICON_SIZE * 0.55,
          duration: 900,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 1800);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.logoContainer}>
        {/* Icon */}
        <Animated.Image
          source={require('../assets/transparent icon.png')}
          style={[
            styles.icon,
            {
              opacity: iconOpacity,
              transform: [
                { scale: iconScale },
                { translateX: iconTranslateX },
              ],
            },
          ]}
          resizeMode="contain"
        />

        {/* Brand name */}
        <Animated.View
          style={[
            styles.textWrapper,
            {
              opacity: textOpacity,
              transform: [{ translateX: textTranslateX }],
            },
          ]}
        >
          <Text style={styles.brandName} allowFontScaling={false}>
            kynect
          </Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: ICON_SIZE * 1.4,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    position: 'absolute',
  },
  textWrapper: {
    position: 'absolute',
    alignItems: 'flex-start',
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: ICON_SIZE * 0.72,   // scales proportionally with icon
    fontWeight: '700',
    letterSpacing: -1.5,
    fontFamily: 'System',
  },
});

export default IntroSplashScreen;