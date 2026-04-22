import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar, 
  Animated, 
  Easing, 
  Dimensions, 
  Platform 
} from 'react-native';
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
import HomeScreen        from './screens/HomeScreen';

const { width: SCREEN_W } = Dimensions.get('window');

const ScreenContent = memo(({ name, onFinish }) => {
  switch (name) {
    case 'splash':  return <IntroSplashScreen onFinish={onFinish} />;
    case 'welcome': return <WelcomeScreen     onFinish={onFinish} />;
    case 'auth':    return <AuthScreen        onFinish={onFinish} />;
    case 'setup':   return <SetupScreen       onFinish={onFinish} />;
    case 'main':    return <HomeScreen        onFinish={onFinish} />;
    default: return null;
  }
});

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [nextScreen, setNextScreen] = useState(null);
  
  // Logic States
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);
  
  const destinationPath = useRef('welcome');
  const isTransitioning = useRef(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_W)).current;

  // 1. Listen for Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const setupCompleted = userDoc.exists() ? userDoc.data().setupCompleted : false;
          destinationPath.current = setupCompleted ? 'main' : 'setup';
        } else {
          destinationPath.current = 'welcome';
        }
      } catch (e) {
        destinationPath.current = 'welcome';
      } finally {
        setIsAuthReady(true); // Firebase is done
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Transition Function
  const triggerTransition = useCallback((target) => {
    if (isTransitioning.current || target === currentScreen) return;
    isTransitioning.current = true;
    
    setNextScreen(target);

    setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
        useNativeDriver: true,
      }).start(() => {
        setCurrentScreen(target);
        setNextScreen(null);
        slideAnim.setValue(SCREEN_W);
        isTransitioning.current = false;
      });
    }, 100); 
  }, [currentScreen, slideAnim]);

  // 3. WATCHER: When both Splash is done AND Auth is ready, GO!
  useEffect(() => {
    if (splashFinished && isAuthReady && currentScreen === 'splash') {
      triggerTransition(destinationPath.current);
    }
  }, [splashFinished, isAuthReady, currentScreen, triggerTransition]);

  // Handlers for screens
  const onSplashDone  = useCallback(() => setSplashFinished(true), []);
  const onWelcomeDone = useCallback(() => triggerTransition('auth'), [triggerTransition]);
  const onAuthDone    = useCallback(() => triggerTransition(destinationPath.current), [triggerTransition]);
  const onSetupDone   = useCallback(() => triggerTransition('main'), [triggerTransition]);

  const getHandler = (name) => {
    if (name === 'splash') return onSplashDone;
    if (name === 'welcome') return onWelcomeDone;
    if (name === 'auth') return onAuthDone;
    if (name === 'setup') return onSetupDone;
    return null;
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        
        {/* Base Layer */}
        <View style={styles.screenLayer}>
          <ScreenContent 
            name={currentScreen} 
            onFinish={getHandler(currentScreen)} 
          />
        </View>

        {/* Transition Layer */}
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
  container: { flex: 1, backgroundColor: '#000000' },
  screenLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000000' },
  topShadow: { 
    shadowColor: '#000', 
    shadowOffset: { width: -10, height: 0 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 15, 
    elevation: 25, 
    zIndex: 99,
    borderLeftWidth: Platform.OS === 'android' ? 1 : 0,
    borderLeftColor: 'rgba(255,255,255,0.05)',
  },
});