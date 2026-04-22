import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  PixelRatio,
  ScrollView,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Local Persistence
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase imports
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

// ─── Responsive Utilities ──────────────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const isSmall  = SCREEN_W < 360;
const isMedium = SCREEN_W >= 360 && SCREEN_W < 414;
const isLarge  = SCREEN_W >= 414 && SCREEN_W < 768;
const isTablet = SCREEN_W >= 768;

const CONTENT_W = isTablet ? Math.min(SCREEN_W * 0.6, 520) : SCREEN_W;
const BASE_W = 375;
const BASE_H = 812;

const scale  = CONTENT_W / BASE_W;
const vscale = SCREEN_H  / BASE_H;

const rs = (size) =>
  Math.round(PixelRatio.roundToNearestPixel(
    isTablet ? size * Math.min(scale, 1.25) : size * scale
  ));

const vs = (size) =>
  Math.round(PixelRatio.roundToNearestPixel(
    size * Math.max(vscale, isSmall ? 0.82 : 0.88)
  ));

const ms = (size, factor = 0.5) =>
  Math.round(size + (rs(size) - size) * factor);

const adaptive = ({ small, medium, large, tablet }) => {
  if (isTablet) return tablet ?? large ?? medium ?? small;
  if (isLarge)  return large  ?? medium ?? small;
  if (isMedium) return medium ?? small;
  return small;
};

// ─── Entrance Animation Hook ───────────────────────────────────────────────
const useEntrance = (delay = 0) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 520, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 520, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
};

// ─── Toast Component ───────────────────────────────────────────────────────
const TOAST_TYPE = { SUCCESS: 'success', ERROR: 'error', INFO: 'info' };
const TOAST_COLORS = {
  [TOAST_TYPE.SUCCESS]: { border: '#10B981', icon: 'check-circle', iconColor: '#10B981' },
  [TOAST_TYPE.ERROR]:   { border: '#EF4444', icon: 'alert-circle',  iconColor: '#EF4444' },
  [TOAST_TYPE.INFO]:    { border: '#8B5CF6', icon: 'info',          iconColor: '#8B5CF6' },
};

const Toast = memo(({ message, type, visible }) => {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 0,   duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const config = TOAST_COLORS[type] ?? TOAST_COLORS[TOAST_TYPE.INFO];
  return (
    <Animated.View style={[toastStyles.container, { borderColor: config.border, opacity, transform: [{ translateY }] }]} pointerEvents="none">
      <Feather name={config.icon} size={rs(16)} color={config.iconColor} style={toastStyles.icon} />
      <Text style={toastStyles.message}>{message}</Text>
    </Animated.View>
  );
});

const toastStyles = StyleSheet.create({
  container: { position: 'absolute', top: vs(60), left: rs(20), right: rs(20), zIndex: 9999, flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderWidth: 1, borderRadius: rs(14), paddingHorizontal: rs(16), paddingVertical: vs(13), shadowColor: '#8B5CF6', shadowOpacity: 0.2, shadowRadius: 12, elevation: 10 },
  icon: { marginRight: rs(10) },
  message: { color: '#FFFFFF', fontSize: ms(13), fontWeight: '600', flex: 1 },
});

const useToast = () => {
  const [toast, setToast] = useState({ visible: false, message: '', type: TOAST_TYPE.INFO });
  const timerRef = useRef(null);
  const showToast = useCallback((message, type = TOAST_TYPE.INFO, duration = 2500) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ visible: true, message, type });
    timerRef.current = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), duration);
  }, []);
  return { toast, showToast };
};

// ─── Firebase Helpers ──────────────────────────────────────────────────────
const toFakeEmail = (username) => `${username.toLowerCase().trim()}@kynect.app`;
const usernameExists = async (username) => {
  const snap = await getDoc(doc(db, 'usernames', username.toLowerCase().trim()));
  return snap.exists();
};

// ─── Main Component ────────────────────────────────────────────────────────
const AuthScreen = ({ onFinish }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login'); 

  const { toast, showToast } = useToast();
  
  const modeAnim = useRef(new Animated.Value(0)).current;
  const a0 = useEntrance(60);
  const a1 = useEntrance(150);
  const a3 = useEntrance(330);
  const a4 = useEntrance(420);
  const a5 = useEntrance(510);

  const switchToSignup = useCallback(() => {
    Animated.timing(modeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    setMode('signup');
  }, []);

  const switchToLogin = useCallback(() => {
    Animated.timing(modeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    setMode('login');
  }, []);

  const isValid = username.trim().length >= 3 && password.length >= 6;

  const handleContinue = useCallback(async () => {
    if (!isValid || isLoading) return;
    Keyboard.dismiss();

    const trimmedUsername = username.trim().toLowerCase();
    setIsLoading(true);
    const fakeEmail = toFakeEmail(trimmedUsername);

    try {
      if (mode === 'login') {
        const exists = await usernameExists(trimmedUsername);
        if (!exists) {
          switchToSignup();
          showToast('No account found. Create one?', TOAST_TYPE.INFO);
          setIsLoading(false);
          return;
        }

        await signInWithEmailAndPassword(auth, fakeEmail, password);
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          lastLogin: serverTimestamp(),
        });

        // Persist username just in case they are sent back to setup screen
        await AsyncStorage.setItem('pendingUsername', trimmedUsername);

        showToast('Welcome back 👋', TOAST_TYPE.SUCCESS);
        setTimeout(() => onFinish?.(), 1000); 

      } else {
        const exists = await usernameExists(trimmedUsername);
        if (exists) {
          showToast('Username already taken', TOAST_TYPE.ERROR);
          setIsLoading(false);
          return;
        }

        const { user } = await createUserWithEmailAndPassword(auth, fakeEmail, password);
        const batch = writeBatch(db);

        batch.set(doc(db, 'usernames', trimmedUsername), { uid: user.uid });
        batch.set(doc(db, 'users', user.uid), {
          username: trimmedUsername,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          setupCompleted: false, 
        });

        await batch.commit();

        // PERSIST USERNAME LOCALLY: This ensures SetupScreen can see it even after reload
        await AsyncStorage.setItem('pendingUsername', trimmedUsername);

        showToast('Account created successfully 🎉', TOAST_TYPE.SUCCESS);
        setTimeout(() => onFinish?.(), 1000);
      }
    } catch (err) {
      const code = err?.code ?? '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        showToast('Incorrect password', TOAST_TYPE.ERROR);
      } else {
        showToast('Something went wrong', TOAST_TYPE.ERROR);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isValid, isLoading, username, password, mode, showToast, switchToSignup, onFinish]);

  const buttonLabel = mode === 'signup' ? 'Create Account' : 'Continue';
  const headingText = mode === 'signup' ? `Create\naccount` : `Welcome\nback`;

  const signupHintOpacity = modeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const signupHintTransY  = modeAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />

      <SafeAreaView style={s.safe}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={s.card}>

                {/* 1. TOP BAR */}
                <Animated.View style={[s.topBar, a0]}>
                  <Text style={s.logo}>Kynect</Text>
                  <View style={s.liveBadge}>
                    <View style={s.liveDot} />
                    <Text style={s.liveText}>SYSTEM ONLINE</Text>
                  </View>
                </Animated.View>

                {/* 2. HERO SECTION */}
                <Animated.View style={[s.hero, a1]}>
                  <Text style={s.heading}>{headingText}<Text style={s.dot}>.</Text></Text>
                  <Text style={s.sub}>
                    {mode === 'signup' 
                      ? "Pick a username and password to\njoin your squad's command center."
                      : "Sign in to access your squad's\ncommand center and start playing."}
                  </Text>

                  {mode === 'signup' && (
                    <Animated.View style={[s.signupHint, { opacity: signupHintOpacity, transform: [{ translateY: signupHintTransY }] }]}>
                      <Feather name="info" size={rs(11)} color="#8B5CF6" />
                      <Text style={s.signupHintText}>New user? Register below</Text>
                    </Animated.View>
                  )}
                </Animated.View>

                {/* 3. FORM SECTION */}
                <View style={s.form}>
                  <Animated.View style={a3}>
                    <Text style={s.label}>Username</Text>
                    <View style={[s.inputWrap, focused === 'user' && s.inputFocused]}>
                      <Feather name="user" size={rs(18)} color={focused === 'user' ? '#8B5CF6' : '#3A3A4A'} style={s.icoLeft} />
                      <TextInput
                        style={s.input}
                        placeholder="Enter your username"
                        placeholderTextColor="#2E2E3A"
                        value={username}
                        onChangeText={setUsername}
                        onFocus={() => setFocused('user')}
                        onBlur={() => setFocused(null)}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                      />
                      {username.length >= 3 && (
                        <View style={s.checkCircle}><Feather name="check" size={rs(12)} color="#10B981" /></View>
                      )}
                    </View>
                  </Animated.View>

                  <Animated.View style={[s.fieldGap, a4]}>
                    <Text style={s.label}>Password</Text>
                    <View style={[s.inputWrap, focused === 'pass' && s.inputFocused]}>
                      <Feather name="lock" size={rs(18)} color={focused === 'pass' ? '#8B5CF6' : '#3A3A4A'} style={s.icoLeft} />
                      <TextInput
                        style={s.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#2E2E3A"
                        secureTextEntry={!showPass}
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocused('pass')}
                        onBlur={() => setFocused(null)}
                        editable={!isLoading}
                      />
                      <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                        <Feather name={showPass ? 'eye-off' : 'eye'} size={rs(18)} color={showPass ? '#8B5CF6' : '#3A3A4A'} />
                      </TouchableOpacity>
                    </View>
                    {mode === 'login' && (
                      <TouchableOpacity style={s.forgot} activeOpacity={0.7}>
                        <Text style={s.forgotText}>Forgot password?</Text>
                      </TouchableOpacity>
                    )}
                  </Animated.View>
                </View>

                {/* 4. FOOTER SECTION */}
                <Animated.View style={[s.footer, a5]}>
                  <TouchableOpacity
                    style={[s.btn, (!isValid || isLoading) && s.btnOff]}
                    onPress={handleContinue}
                    disabled={!isValid || isLoading}
                    activeOpacity={0.85}
                  >
                    {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : (
                      <>
                        <Text style={[s.btnText, !isValid && s.btnTextOff]}>{buttonLabel}</Text>
                        {isValid && <View style={s.btnArrow}><Feather name="arrow-right" size={rs(16)} color="#8B5CF6" /></View>}
                      </>
                    )}
                  </TouchableOpacity>

                  {/* CONDITIONAL LOGIC FOR THE LINK/SECURITY ROW */}
                  {mode === 'signup' ? (
                    <TouchableOpacity 
                      style={s.switchBtn} 
                      onPress={switchToLogin}
                      disabled={isLoading}
                    >
                      <Text style={s.switchText}>
                        Already have an account? <Text style={s.switchTextHighlight}>Login</Text>
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={s.secRow}>
                      <MaterialCommunityIcons name="shield-lock-outline" size={rs(12)} color="#2A2A35" />
                      <Text style={s.secText}>AES-256 SECURED</Text>
                      <View style={s.secDot} />
                      <Text style={s.secText}>END-TO-END ENCRYPTED</Text>
                    </View>
                  )}

                  <Text style={s.terms}>
                    By continuing you agree to our{' '}
                    <Text style={s.termsLink}>Terms</Text>
                    {' & '}
                    <Text style={s.termsLink}>Privacy Policy</Text>
                  </Text>
                </Animated.View>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: rs(adaptive({ small: 20, medium: 24, large: 28 })),
    paddingTop: vs(adaptive({ small: 10, medium: 16, large: 20, tablet: 40 })),
    paddingBottom: vs(40),
  },
  card: { flex: 1, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: vs(adaptive({ small: 25, medium: 32, large: 35 })) },
  logo: { color: '#FFFFFF', fontSize: ms(adaptive({ small: 20, medium: 22, large: 24 })), fontWeight: '900', letterSpacing: -0.5 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.08)', paddingHorizontal: rs(10), paddingVertical: vs(5), borderRadius: 8, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  liveDot: { width: rs(6), height: rs(6), borderRadius: rs(3), backgroundColor: '#10B981', marginRight: rs(6) },
  liveText: { color: '#10B981', fontSize: ms(9), fontWeight: '800', letterSpacing: 0.5 },
  hero: { marginBottom: vs(adaptive({ small: 25, medium: 30, large: 35 })) },
  heading: { color: '#FFFFFF', fontSize: ms(adaptive({ small: 36, medium: 42, large: 46 })), fontWeight: '900', lineHeight: ms(adaptive({ small: 42, medium: 48, large: 52 })), letterSpacing: -1 },
  dot: { color: '#8B5CF6' },
  sub: { color: '#71717A', fontSize: ms(adaptive({ small: 14, medium: 15, large: 16 })), lineHeight: ms(22), marginTop: vs(12) },
  signupHint: { flexDirection: 'row', alignItems: 'center', gap: rs(6), marginTop: vs(10), backgroundColor: 'rgba(139, 92, 246, 0.08)', borderWidth: 1, borderColor: 'rgba(139, 92, 246, 0.2)', borderRadius: rs(8), paddingHorizontal: rs(10), paddingVertical: vs(6), alignSelf: 'flex-start' },
  signupHintText: { color: '#8B5CF6', fontSize: ms(11), fontWeight: '600' },
  form: { flex: 1 },
  fieldGap: { marginTop: vs(20) },
  label: { color: '#52525B', fontSize: ms(12), fontWeight: '700', marginBottom: vs(8), letterSpacing: 0.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', height: vs(adaptive({ small: 54, medium: 60, large: 62 })), backgroundColor: '#0A0A0A', borderRadius: rs(16), borderWidth: 1.5, borderColor: '#1A1A1A', paddingHorizontal: rs(16) },
  inputFocused: { borderColor: '#8B5CF6', backgroundColor: '#0F0F1A' },
  icoLeft: { marginRight: rs(12) },
  input: { flex: 1, color: '#FFFFFF', fontSize: ms(15), fontWeight: '600' },
  checkCircle: { width: rs(22), height: rs(22), borderRadius: rs(11), backgroundColor: 'rgba(16,185,129,0.15)', justifyContent: 'center', alignItems: 'center' },
  forgot: { alignSelf: 'flex-end', marginTop: vs(10) },
  forgotText: { color: '#52525B', fontSize: ms(12), fontWeight: '600' },
  footer: { marginTop: vs(40), alignItems: 'center' },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B5CF6', height: vs(adaptive({ small: 56, medium: 62, large: 64 })), borderRadius: rs(18), width: '100%', elevation: 8, shadowColor: '#8B5CF6', shadowOpacity: 0.4, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  btnOff: { backgroundColor: '#161616', shadowOpacity: 0, elevation: 0 },
  btnText: { color: '#FFFFFF', fontSize: ms(16), fontWeight: '800', letterSpacing: 0.5 },
  btnTextOff: { color: '#3F3F46' },
  btnArrow: { width: rs(26), height: rs(26), borderRadius: rs(13), backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginLeft: rs(12) },
  secRow: { flexDirection: 'row', alignItems: 'center', gap: rs(6), marginTop: vs(24) },
  secText: { color: '#3F3F46', fontSize: ms(9), fontWeight: '800', letterSpacing: 1 },
  secDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#27272A' },
  switchBtn: { marginTop: vs(24) },
  switchText: { color: '#52525B', fontSize: ms(13), fontWeight: '600' },
  switchTextHighlight: { color: '#8B5CF6', fontWeight: '800' },
  terms: { color: '#3F3F46', fontSize: ms(11), marginTop: vs(16), textAlign: 'center', lineHeight: ms(18) },
  termsLink: { color: '#52525B', fontWeight: '700', textDecorationLine: 'underline' },
});

export default AuthScreen;