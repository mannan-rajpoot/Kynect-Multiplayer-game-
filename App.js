import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { View, StyleSheet, StatusBar, Animated, Easing, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Firebase
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Screens
import IntroSplashScreen from './screens/IntroSplashScreen';
import WelcomeScreen     from './screens/WelcomeScreen';
import AuthScreen        from './screens/AuthScreen';
import SetupScreen       from './screens/SetupScreen';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── MEMOIZED SCREEN WRAPPER ──────────────────────────────────────────
// This prevents the screen from re-rendering while it is in the background
const ScreenContent = memo(({ name, onFinish }) => {
  switch (name) {
    case 'splash':  return <IntroSplashScreen onFinish={onFinish} />;
    case 'welcome': return <WelcomeScreen     onFinish={onFinish} />;
    case 'auth':    return <AuthScreen        onFinish={onFinish} />;
    case 'setup':   return <SetupScreen       onFinish={onFinish} />;
    case 'main':    return <View style={styles.mainPlaceholder} />;
    default: return null;
  }
});

export default function App() {
  // Navigation States
  const [currentScreen, setCurrentScreen] = useState('splash'); // The background
  const [nextScreen, setNextScreen] = useState(null);           // The sliding layer
  
  // Logic States
  const destinationPath = useRef('welcome');
  const isTransitioning = useRef(false);

  // Animation Value
  const slideAnim = useRef(new Animated.Value(SCREEN_W)).current;

  /**
   * THE FLICKER-FREE ENGINE
   * This is the "Double-Buffer" logic.
   */
  const triggerTransition = useCallback((target) => {
    if (isTransitioning.current || target === currentScreen) return;
    isTransitioning.current = true;

    // 1. Render the NEXT screen on top of the CURRENT one (but off-screen)
    setNextScreen(target);

    // 2. We wait 60ms to ensure the "Next" screen has actually 
    // mounted and rendered its initial frame before we start sliding.
    // This removes the "blank frame" flicker.
    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 550,
        easing: Easing.bezier(0.33, 1, 0.68, 1), // Smooth ease-out
        useNativeDriver: true,
      }).start(() => {
        // 3. Only AFTER animation is 100% complete, we swap the roles.
        setCurrentScreen(target);
        setNextScreen(null);
        slideAnim.setValue(SCREEN_W);
        isTransitioning.current = false;
      });
    }, 60);
  }, [currentScreen, slideAnim]);

  /**
   * FIREBASE AUTH OBSERVER
   * We calculate the destination but we don't move until a screen says "onFinish"
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const setupCompleted = userDoc.exists() ? userDoc.data().setupCompleted : false;
          destinationPath.current = setupCompleted ? 'main' : 'setup';
        } catch {
          destinationPath.current = 'auth';
        }
      } else {
        destinationPath.current = 'welcome';
      }
    });
    return () => unsubscribe();
  }, []);

  // Completion Handlers
  const onSplashDone  = () => triggerTransition(destinationPath.current);
  const onWelcomeDone = () => triggerTransition('auth');
  const onAuthDone    = () => triggerTransition(destinationPath.current);
  const onSetupDone   = () => triggerTransition('main');

  /**
   * SELECTS THE CORRECT HANDLER FOR THE ACTIVE SCREEN
   */
  const getHandler = (name) => {
    switch (name) {
      case 'splash':  return onSplashDone;
      case 'welcome': return onWelcomeDone;
      case 'auth':    return onAuthDone;
      case 'setup':   return onSetupDone;
      default:        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* 
            LAYER 1: BOTTOM BUFFER 
            This is the screen you are coming FROM. 
            It is static and cannot flicker because its 'name' prop 
            doesn't change until the transition is totally finished.
        */}
        <View style={styles.screenLayer}>
          <ScreenContent 
            name={currentScreen} 
            onFinish={getHandler(currentScreen)} 
          />
        </View>

        {/* 
            LAYER 2: TOP BUFFER (The Slide)
            This is the screen you are going TO.
        */}
        {nextScreen && (
          <Animated.View 
            style={[
              styles.screenLayer,
              styles.topShadow,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <ScreenContent 
              name={nextScreen} 
              onFinish={getHandler(nextScreen)} 
            />
          </Animated.View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  screenLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  topShadow: {
    // This shadow adds depth and covers the "edge" of the sliding page
    shadowColor: '#000',
    shadowOffset: { width: -15, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 30,
    zIndex: 99,
  },
  mainPlaceholder: {
    flex: 1,
    backgroundColor: '#000000',
  },
});