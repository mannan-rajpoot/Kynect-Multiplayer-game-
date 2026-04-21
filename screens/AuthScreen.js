import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Scale utility for responsiveness
const scale = width / 375;
const normalize = (size) => Math.round(PixelRatio.roundToNearestPixel(size * scale));

const AuthScreen = ({ onFinish }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState(null); // 'user' or 'pass'

  const handleContinue = () => {
    if (username && password) {
      onFinish({ username, password });
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Dynamic Background Glows */}
      <View style={[styles.glow, styles.topGlow]} />
      <View style={[styles.glow, styles.bottomGlow]} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* 1. Header Section */}
            <View style={styles.header}>
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>SECURE ACCESS</Text>
              </View>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in to Kynect and jump back into the action with your squad.
              </Text>
            </View>

            {/* 2. Form Section */}
            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>USERNAME</Text>
                <View style={[
                  styles.inputContainer, 
                  focusedInput === 'user' && styles.inputContainerFocused
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your username"
                    placeholderTextColor="#555"
                    value={username}
                    onChangeText={setUsername}
                    onFocus={() => setFocusedInput('user')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={[
                  styles.inputContainer, 
                  focusedInput === 'pass' && styles.inputContainerFocused
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••••••"
                    placeholderTextColor="#555"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput('pass')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
                <TouchableOpacity style={styles.forgotPass}>
                  <Text style={styles.forgotPassText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Decorative Trust Section */}
            <View style={styles.trustCard}>
              <View style={styles.shieldIcon}>
                <View style={styles.shieldInner} />
              </View>
              <View style={styles.trustTextContainer}>
                <Text style={styles.trustTitle}>End-to-end Encrypted</Text>
                <Text style={styles.trustSub}>Your credentials are protected by industry standard security protocols.</Text>
              </View>
            </View>

            {/* 4. Footer Section (Bottom) */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  (!username || !password) && styles.buttonDisabled
                ]}
                activeOpacity={0.8}
                onPress={handleContinue}
                disabled={!username || !password}
              >
                <Text style={styles.buttonText}>Continue to Arena</Text>
              </TouchableOpacity>
              
              <Text style={styles.termsText}>
                By logging in, you agree to our <Text style={styles.link}>Terms of Service</Text>
              </Text>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#0F0F10', // Deep metallic black
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.07,
    paddingTop: height * 0.05,
    paddingBottom: 20,
    justifyContent: 'space-between', // Ensures footer stays at bottom if screen is tall
  },
  /* GLOW EFFECTS */
  glow: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    opacity: 0.12,
  },
  topGlow: {
    top: -width * 0.3,
    right: -width * 0.2,
    backgroundColor: '#8B5CF6',
  },
  bottomGlow: {
    bottom: -width * 0.3,
    left: -width * 0.2,
    backgroundColor: '#22D3EE',
  },
  /* HEADER */
  header: {
    marginBottom: normalize(30),
  },
  brandBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  brandBadgeText: {
    color: '#8B5CF6',
    fontSize: normalize(10),
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: normalize(34),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: normalize(15),
    color: '#94A3B8',
    marginTop: 10,
    lineHeight: normalize(22),
  },
  /* FORM */
  form: {
    gap: 20,
  },
  inputWrapper: {
    width: '100%',
  },
  label: {
    color: '#64748B',
    fontSize: normalize(11),
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  inputContainer: {
    height: normalize(56),
    backgroundColor: '#1E1E20',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2D2D30',
    paddingHorizontal: 16,
    justifyContent: 'center',
    // Smooth transition simulation
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 10,
  },
  inputContainerFocused: {
    borderColor: '#8B5CF6',
    backgroundColor: '#1A1625',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  input: {
    color: '#FFFFFF',
    fontSize: normalize(16),
    fontWeight: '500',
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotPassText: {
    color: '#8B5CF6',
    fontSize: normalize(13),
    fontWeight: '600',
  },
  /* TRUST CARD */
  trustCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 20,
    marginTop: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  shieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  shieldInner: {
    width: 14,
    height: 18,
    borderWidth: 2,
    borderColor: '#22D3EE',
    borderRadius: 2,
  },
  trustTextContainer: {
    flex: 1,
  },
  trustTitle: {
    color: '#F1F5F9',
    fontSize: normalize(13),
    fontWeight: '700',
  },
  trustSub: {
    color: '#64748B',
    fontSize: normalize(11),
    marginTop: 2,
  },
  /* FOOTER */
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#8B5CF6',
    width: '100%',
    height: normalize(58),
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#2D2D30',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: normalize(17),
    fontWeight: '800',
  },
  termsText: {
    color: '#475569',
    fontSize: normalize(12),
    marginTop: 18,
    textAlign: 'center',
  },
  link: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
});

export default AuthScreen;