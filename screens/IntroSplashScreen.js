import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';

const { width } = Dimensions.get('window');

// Added { onFinish } prop
const IntroSplashScreen = ({ onFinish }) => {
  // Animation Controller Values (Exactly as provided)
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconTranslateX = useRef(new Animated.Value(0)).current;
  
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateX = useRef(new Animated.Value(40)).current; 
  const textScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.sequence([
      // PHASE 1: The Impact Entry
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(700), // Cinematic pause

      // PHASE 2: The "Split" Reveal
      Animated.parallel([
        Animated.timing(iconTranslateX, {
          toValue: -75, 
          duration: 900,
          easing: Easing.bezier(0.23, 1, 0.32, 1),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateX, {
          toValue: 35, 
          duration: 900,
          easing: Easing.bezier(0.23, 1, 0.32, 1),
          useNativeDriver: true,
        }),
        Animated.timing(textScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        })
      ]),
      
      Animated.delay(1000), // Hold the final look for a moment
    ]).start(() => {
      // Trigger the transition once animation is done
      if (onFinish) onFinish();
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <View style={styles.contentWrapper}>
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              opacity: iconOpacity,
              transform: [
                { scale: iconScale },
                { translateX: iconTranslateX }
              ],
            },
          ]}
        >
          <Animated.Image
            source={require('../assets/k-icon.png')} 
            style={styles.icon}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.textWrapper,
            {
              opacity: textOpacity,
              transform: [
                { translateX: textTranslateX },
                { scale: textScale }
              ],
            },
          ]}
        >
          <Text style={styles.appName}>Kynect</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: textOpacity }]}>
        <View style={styles.indicator} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 230,
    height: 200,
    left: 8,
    top: 3
  },
  textWrapper: {
    position: 'absolute',
    justifyContent: 'center',
  },
  appName: {
    color: '#FFF',
    fontSize: 46,
    fontWeight: '800',
    letterSpacing: -2,
    fontFamily: 'System', 
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  indicator: {
    width: 30,
    height: 3,
    backgroundColor: '#333',
    borderRadius: 10,
  }
});

export default IntroSplashScreen;