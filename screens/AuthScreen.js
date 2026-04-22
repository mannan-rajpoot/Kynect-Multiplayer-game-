import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// ─── Responsive Utilities ──────────────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const isSmall   = SCREEN_W < 360;
const isMedium  = SCREEN_W >= 360 && SCREEN_W < 414;
const isLarge   = SCREEN_W >= 414 && SCREEN_W < 768;
const isTablet  = SCREEN_W >= 768;

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

// ─── Main Component ────────────────────────────────────────────────────────
const AuthScreen = ({ onFinish }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focused,  setFocused]  = useState(null);
  const [showPass, setShowPass] = useState(false);

  const isValid = username.length > 0 && password.length > 0;

  // Animation Sequences
  const a0 = useEntrance(60);
  const a1 = useEntrance(150);
  const a3 = useEntrance(330);
  const a4 = useEntrance(420);
  const a5 = useEntrance(510);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />

      <SafeAreaView style={s.safe}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={s.scroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={true}
            >
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
                  <Text style={s.heading}>
                    Welcome{'\n'}back<Text style={s.dot}>.</Text>
                  </Text>
                  <Text style={s.sub}>
                    Sign in to access your squad's{'\n'}command center and start playing.
                  </Text>
                </Animated.View>

                {/* 3. FORM SECTION */}
                <View style={s.form}>
                  <Animated.View style={a3}>
                    <Text style={s.label}>Username or Email</Text>
                    <View style={[s.inputWrap, focused === 'user' && s.inputFocused]}>
                      <Feather
                        name="user"
                        size={rs(18)}
                        color={focused === 'user' ? '#8B5CF6' : '#3A3A4A'}
                        style={s.icoLeft}
                      />
                      <TextInput
                        style={s.input}
                        placeholder="Enter username or email"
                        placeholderTextColor="#2E2E3A"
                        value={username}
                        onChangeText={setUsername}
                        onFocus={() => setFocused('user')}
                        onBlur={() => setFocused(null)}
                        autoCapitalize="none"
                        autoCorrect={false}
                        selectionColor="#8B5CF6"
                      />
                      {username.length > 3 && (
                        <View style={s.checkCircle}>
                          <Feather name="check" size={rs(12)} color="#10B981" />
                        </View>
                      )}
                    </View>
                  </Animated.View>

                  <Animated.View style={[s.fieldGap, a4]}>
                    <Text style={s.label}>Password</Text>
                    <View style={[s.inputWrap, focused === 'pass' && s.inputFocused]}>
                      <Feather
                        name="lock"
                        size={rs(18)}
                        color={focused === 'pass' ? '#8B5CF6' : '#3A3A4A'}
                        style={s.icoLeft}
                      />
                      <TextInput
                        style={s.input}
                        placeholder="Enter your password"
                        placeholderTextColor="#2E2E3A"
                        secureTextEntry={!showPass}
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocused('pass')}
                        onBlur={() => setFocused(null)}
                        selectionColor="#8B5CF6"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPass(!showPass)}
                        activeOpacity={0.7}
                      >
                        <Feather
                          name={showPass ? 'eye-off' : 'eye'}
                          size={rs(18)}
                          color={showPass ? '#8B5CF6' : '#3A3A4A'}
                        />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={s.forgot} activeOpacity={0.7}>
                      <Text style={s.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>

                {/* 4. FOOTER SECTION */}
                <Animated.View style={[s.footer, a5]}>
                  <TouchableOpacity
                    style={[s.btn, !isValid && s.btnOff]}
                    activeOpacity={0.85}
                    onPress={() => isValid && onFinish?.({ username, password })}
                    disabled={!isValid}
                  >
                    <Text style={[s.btnText, !isValid && s.btnTextOff]}>
                      Get Started
                    </Text>
                    {isValid && (
                      <View style={s.btnArrow}>
                        <Feather name="arrow-right" size={rs(16)} color="#8B5CF6" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={s.secRow}>
                    <MaterialCommunityIcons name="shield-lock-outline" size={rs(12)} color="#2A2A35" />
                    <Text style={s.secText}>SECURED Auth</Text>
                    <View style={s.secDot} />
                    <Text style={s.secText}>END-TO-END ENCRYPTED</Text>
                  </View>

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

// ─── Stylesheet ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: isTablet ? 'center' : 'stretch',
    paddingHorizontal: isTablet ? 0 : rs(adaptive({ small: 20, medium: 24, large: 28 })),
    paddingTop: vs(adaptive({ small: 10, medium: 16, large: 20, tablet: 40 })),
    paddingBottom: vs(40),
  },
  card: {
    width: isTablet ? Math.min(SCREEN_W * 0.6, 520) : '100%',
    flex: 1,
    justifyContent: 'space-between', // Pushes footer naturally to the bottom
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(adaptive({ small: 25, medium: 32, large: 35 })),
  },
  logo: {
    color: '#FFFFFF',
    fontSize: ms(adaptive({ small: 20, medium: 22, large: 24 })),
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: rs(10),
    paddingVertical: vs(5),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  liveDot: {
    width: rs(6),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: '#10B981',
    marginRight: rs(6),
  },
  liveText: {
    color: '#10B981',
    fontSize: ms(9),
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Hero
  hero: {
    marginBottom: vs(adaptive({ small: 25, medium: 30, large: 35 })),
  },
  heading: {
    color: '#FFFFFF',
    fontSize: ms(adaptive({ small: 36, medium: 42, large: 46 })),
    fontWeight: '900',
    lineHeight: ms(adaptive({ small: 42, medium: 48, large: 52 })),
    letterSpacing: -1,
  },
  dot: { color: '#8B5CF6' },
  sub: {
    color: '#71717A',
    fontSize: ms(adaptive({ small: 14, medium: 15, large: 16 })),
    lineHeight: ms(22),
    marginTop: vs(12),
  },

  // Form
  form: {
    flex: 1, // Allows form to take space and footer to sit at bottom
  },
  fieldGap: {
    marginTop: vs(20),
  },
  label: {
    color: '#52525B',
    fontSize: ms(12),
    fontWeight: '700',
    marginBottom: vs(8),
    letterSpacing: 0.5,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: vs(adaptive({ small: 54, medium: 60, large: 62 })),
    backgroundColor: '#0A0A0A',
    borderRadius: rs(16),
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
    paddingHorizontal: rs(16),
  },
  inputFocused: {
    borderColor: '#8B5CF6',
    backgroundColor: '#0F0F1A',
  },
  icoLeft: { marginRight: rs(12) },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: ms(15),
    fontWeight: '600',
  },
  checkCircle: {
    width: rs(22),
    height: rs(22),
    borderRadius: rs(11),
    backgroundColor: 'rgba(16,185,129,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: vs(10),
  },
  forgotText: {
    color: '#52525B',
    fontSize: ms(12),
    fontWeight: '600',
  },

  // Footer
  footer: {
    marginTop: vs(40),
    alignItems: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    height: vs(adaptive({ small: 56, medium: 62, large: 64 })),
    borderRadius: rs(18),
    width: '100%',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  btnOff: {
    backgroundColor: '#161616',
    shadowOpacity: 0,
    elevation: 0,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: ms(16),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnTextOff: { color: '#3F3F46' },
  btnArrow: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(13),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: rs(12),
  },
  secRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    marginTop: vs(24),
  },
  secText: {
    color: '#3F3F46',
    fontSize: ms(9),
    fontWeight: '800',
    letterSpacing: 1,
  },
  secDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#27272A' },
  terms: {
    color: '#3F3F46',
    fontSize: ms(11),
    marginTop: vs(16),
    textAlign: 'center',
    lineHeight: ms(18),
  },
  termsLink: { color: '#8B5CF6', fontWeight: '700', textDecorationLine: 'underline' },
});

export default AuthScreen;