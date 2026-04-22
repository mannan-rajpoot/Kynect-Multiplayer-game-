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
  Animated,
  ActivityIndicator,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase
import { db, auth, storage } from '../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ─── Perfect Responsive Utilities ──────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BASE_W = 375;
const BASE_H = 812;

// Scales sizes based on screen width
const rs = (size) => Math.round(PixelRatio.roundToNearestPixel(size * (SCREEN_W / BASE_W)));
// Scales sizes based on screen height
const vs = (size) => Math.round(PixelRatio.roundToNearestPixel(size * (SCREEN_H / BASE_H)));
// Modular scale for text (stops text from exploding on tablets)
const ms = (size, factor = 0.5) => {
  const newSize = size + (rs(size) - size) * factor;
  return Math.round(Platform.OS === 'ios' ? newSize : newSize - 1);
};

// ─── Entrance Animation Hook ───────────────────────────────────────────────
const useEntrance = (delay = 0) => {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(15)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
};

// ─── Main Component ────────────────────────────────────────────────────────
const SetupScreen = ({ onFinish }) => {
  const [username, setUsername] = useState('...');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState(null);
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  // Staggered Entrance
  const aHeader = useEntrance(100);
  const aAvatar = useEntrance(200);
  const aForm   = useEntrance(300);
  const aButton = useEntrance(450);

  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const localUser = await AsyncStorage.getItem('pendingUsername');
        if (localUser) {
          setUsername(localUser);
        } else {
          const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (snap.exists()) setUsername(snap.data().username);
        }
      } catch (e) {
        console.error("Identity fetch error:", e);
      }
    };
    fetchIdentity();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const uploadImageAsync = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(storage, `avatars/${auth.currentUser.uid}`);
    await uploadBytes(fileRef, blob);
    return await getDownloadURL(fileRef);
  };

  const isValid = gender !== null;

  const handleComplete = async () => {
    if (!isValid || isLoading) return;
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      let photoURL = null;
      if (image) photoURL = await uploadImageAsync(image);

      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        bio: bio.trim(),
        gender: gender,
        photoURL: photoURL,
        setupCompleted: true,
      });

      await AsyncStorage.removeItem('pendingUsername');
      onFinish?.(); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => (username === '...' ? '?' : username.slice(0, 2).toUpperCase());

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <ScrollView 
            contentContainerStyle={s.scroll} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            decelerationRate="fast"
          >
            
            {/* 1. HEADER */}
            <Animated.View style={[s.header, aHeader]}>
              <Text style={s.logo}>Kynect<Text style={s.dot}>.</Text></Text>
              <Text style={s.heading}>Identity{'\n'}<Text style={s.dot}>Configuration.</Text></Text>
              <Text style={s.sub}>Every legend needs a profile. Finalize your settings to enter the arena.</Text>
            </Animated.View>

            {/* 2. AVATAR */}
            <Animated.View style={[s.avatarContainer, aAvatar]}>
              <TouchableOpacity onPress={pickImage} style={s.avatarFrame} activeOpacity={0.9}>
                {image ? (
                  <Image source={{ uri: image }} style={s.avatarImg} />
                ) : (
                  <View style={s.initialsBg}>
                    <Text style={s.initialsText}>{getInitials()}</Text>
                  </View>
                )}
                <View style={s.cameraBadge}>
                  <Feather name="plus" size={rs(16)} color="#FFF" />
                </View>
              </TouchableOpacity>
              <Text style={s.avatarLabel}>SET AVATAR</Text>
            </Animated.View>

            {/* 3. FORM */}
            <Animated.View style={[s.form, aForm]}>
              {/* Username (Read Only) */}
              <Text style={s.label}>UNIQUE HANDLE</Text>
              <View style={s.idBox}>
                <MaterialCommunityIcons name="at" size={rs(18)} color="#8B5CF6" />
                <Text style={s.idText}>{username}</Text>
                <Feather name="lock" size={rs(12)} color="#3A3A4A" style={{ marginLeft: 'auto' }} />
              </View>

              {/* Gender Selection */}
              <Text style={s.label}>GENDER</Text>
              <View style={s.genderRow}>
                {['Male', 'Female', 'Other'].map((g) => (
                  <TouchableOpacity 
                    key={g} 
                    onPress={() => setGender(g)}
                    style={[s.genderBtn, gender === g && s.genderBtnActive]}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.genderBtnText, gender === g && s.genderBtnTextActive]}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Bio */}
              <Text style={s.label}>BIO (OPTIONAL)</Text>
              <View style={[s.inputWrap, s.textAreaWrap, focused === 'bio' && s.inputFocused]}>
                <TextInput
                  style={[s.input, s.textArea]}
                  placeholder="Tell the squad who you are..."
                  placeholderTextColor="#2E2E3A"
                  multiline
                  value={bio}
                  onChangeText={setBio}
                  onFocus={() => setFocused('bio')}
                  onBlur={() => setFocused(null)}
                  editable={!isLoading}
                />
              </View>
            </Animated.View>

            {/* 4. FOOTER */}
            <Animated.View style={[s.footer, aButton]}>
              <View style={s.buttonShadowWrap}>
                <TouchableOpacity
                  style={[s.btn, (!isValid || isLoading) && s.btnOff]}
                  onPress={handleComplete}
                  disabled={!isValid || isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={[s.btnText, !isValid && s.btnTextOff]}>Enter System</Text>
                      {isValid && (
                        <View style={s.btnArrow}>
                          <Feather name="arrow-right" size={rs(16)} color="#8B5CF6" />
                        </View>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <Text style={s.secText}>
                <Feather name="shield" size={10} color="#3F3F46" /> AES-256 SECURED CONNECTION
              </Text>
            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000' },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: rs(28),
    paddingTop: vs(20),
    paddingBottom: vs(50),
  },
  
  /* Header */
  header: { marginBottom: vs(25) },
  logo: { color: '#FFFFFF', fontSize: ms(20), fontWeight: '900', letterSpacing: -0.5 },
  dot: { color: '#8B5CF6' },
  heading: { color: '#FFFFFF', fontSize: ms(38), fontWeight: '900', lineHeight: ms(44), letterSpacing: -1, marginTop: vs(15) },
  sub: { color: '#71717A', fontSize: ms(14), lineHeight: ms(22), marginTop: vs(10) },

  /* Avatar */
  avatarContainer: { alignItems: 'center', marginBottom: vs(30) },
  avatarFrame: { width: rs(100), height: rs(100), borderRadius: rs(50), backgroundColor: '#0A0A0A', borderWidth: 2, borderColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: '92%', height: '92%', borderRadius: rs(50) },
  initialsBg: { width: '92%', height: '92%', borderRadius: rs(50), backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  initialsText: { color: '#FFFFFF', fontSize: ms(32), fontWeight: '900' },
  cameraBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: '#8B5CF6', width: rs(32), height: rs(32), borderRadius: rs(16), justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#000' },
  avatarLabel: { color: '#52525B', fontSize: ms(10), fontWeight: '800', marginTop: vs(12), letterSpacing: 1.5 },

  /* Form */
  form: { flex: 1 },
  label: { color: '#3F3F46', fontSize: ms(11), fontWeight: '800', marginBottom: vs(8), letterSpacing: 1, marginTop: vs(15) },
  idBox: { flexDirection: 'row', alignItems: 'center', height: vs(58), backgroundColor: '#0F0F0F', borderRadius: rs(16), borderWidth: 1.5, borderColor: '#1A1A1A', paddingHorizontal: rs(18), gap: rs(10) },
  idText: { color: '#FFFFFF', fontSize: ms(16), fontWeight: '700' },
  
  genderRow: { flexDirection: 'row', gap: rs(10) },
  genderBtn: { flex: 1, height: vs(54), borderRadius: rs(14), backgroundColor: '#0A0A0A', borderWidth: 1.5, borderColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  genderBtnActive: { borderColor: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.05)' },
  genderBtnText: { color: '#3F3F46', fontSize: ms(13), fontWeight: '700' },
  genderBtnTextActive: { color: '#FFFFFF', fontWeight: '800' },

  inputWrap: { flexDirection: 'row', alignItems: 'center', height: vs(58), backgroundColor: '#0A0A0A', borderRadius: rs(16), borderWidth: 1.5, borderColor: '#1A1A1A', paddingHorizontal: rs(16) },
  inputFocused: { borderColor: '#8B5CF6', backgroundColor: '#0F0F1A' },
  textAreaWrap: { height: vs(100), alignItems: 'flex-start', paddingTop: vs(12) },
  input: { flex: 1, color: '#FFFFFF', fontSize: ms(15), fontWeight: '600' },
  textArea: { height: '100%', textAlignVertical: 'top' },

  /* Footer */
  footer: { marginTop: vs(30), alignItems: 'center' },
  buttonShadowWrap: {
    width: '100%',
    borderRadius: rs(18),
    backgroundColor: '#8B5CF6',
    ...Platform.select({
      ios: { shadowColor: '#8B5CF6', shadowOpacity: 0.45, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 10 },
    }),
  },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: vs(62), borderRadius: rs(18), width: '100%' },
  btnOff: { backgroundColor: '#161616', elevation: 0 },
  btnText: { color: '#FFFFFF', fontSize: ms(16), fontWeight: '800', letterSpacing: 0.5 },
  btnTextOff: { color: '#3F3F46' },
  btnArrow: { width: rs(26), height: rs(26), borderRadius: rs(13), backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginLeft: rs(12) },
  secText: { color: '#3F3F46', fontSize: ms(9), fontWeight: '800', marginTop: vs(20), letterSpacing: 1 },
});

export default SetupScreen;