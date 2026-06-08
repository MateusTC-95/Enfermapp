import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/api'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, Feather } from '@expo/vector-icons';

// ─── PALETA PETRÓLEO + OLIVA ──────────────────────────────────────────────────
const PETROLEO      = '#1B4D4D';
const PETROLEO_VIVO = '#2A7A7A';
const PETROLEO_BG   = '#E0EBEB';
const OLIVA         = '#5C6B2E';
const OLIVA_VIVA    = '#7A8F3A';
const OLIVA_BG      = '#ECF0DC';
const CREAM         = '#F7F5F0';
const WHITE         = '#FFFFFF';
const TEXT_DARK     = '#1A1A1A';
const TEXT_MID      = '#6B6B6B';
const BORDER        = '#E0DDD6';
// ───────────────────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const router = useRouter();
  const [tipo, setTipo] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  
  const selectOption = (item: string) => {
    setTipo(item);
    setShowDropdown(false);
  };

  const handleLogin = async () => {
    if (!tipo || !usuario || !senha) {
      Alert.alert("Campos Obrigatórios", "Por favor, preencha o tipo de conta, usuário e senha.");
      return;
    }

    try {
      const tipoNormalizado = tipo.toLowerCase() === 'administrador' ? 'admin' : tipo.toLowerCase();
      
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('nome_usuario', usuario)
        .eq('senha', senha)
        .eq('tipo_conta', tipoNormalizado)
        .single();

      if (error || !data) {
        Alert.alert(
          "Acesso Negado", 
          "Usuário ou senha incorretos para este tipo de conta. Verifique os dados e tente novamente."
        );
        return;
      }

      // CORREÇÃO CRÚCIAL: Limpa resíduos de id antigos e grava os dados da conta atualizada
      await AsyncStorage.removeItem('id_usuario'); 
      await AsyncStorage.setItem('nome_logado', data.nome_usuario);
      await AsyncStorage.setItem('id_usuario', String(data.id_usuario)); // <-- Salvando o ID correto do usuário (Ex: 167)

      router.replace(`/${tipoNormalizado}/dashboard` as any);

    } catch (error) {
      Alert.alert("Erro de Conexão", "Não foi possível falar com o servidor. Verifique sua internet.");
      console.error(error);
    }
  };

  const tiposConta = [
    { label: 'Cliente', desc: 'Acessar como usuário', icon: 'person-outline' as const },
    { label: 'Profissional', desc: 'Acessar como prestador', icon: 'build-outline' as const },
    { label: 'Administrador', desc: 'Painel de gestão', icon: 'settings-outline' as const }
  ];

  const isFormValid = tipo && usuario && senha;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Título */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Bem-vindo</Text>
            <Text style={styles.titleAccent}>de volta</Text>
          </View>

          {/* Dropdown Tipo de Conta */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.inputLabel}>Tipo de conta</Text>
            <TouchableOpacity 
              activeOpacity={0.8}
              style={[
                styles.dropdown, 
                showDropdown && styles.dropdownActive,
                tipo && !showDropdown && styles.dropdownSelected
              ]} 
              onPress={toggleDropdown}
            >
              <View style={styles.dropdownContent}>
                <Text style={[
                  styles.dropdownText, 
                  !tipo && styles.dropdownPlaceholder
                ]}>
                  {tipo || "Selecione uma opção"}
                </Text>
                <View style={styles.arrowContainer}>
                  <Ionicons 
                    name={showDropdown ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={PETROLEO} 
                  />
                </View>
              </View>
            </TouchableOpacity> 

            {showDropdown && (
              <View style={styles.optionsContainer}>
                {tiposConta.map((item, index) => (
                  <TouchableOpacity 
                    key={item.label} 
                    activeOpacity={0.7}
                    style={[
                      styles.option,
                      index === 0 && styles.optionFirst,
                      tipo === item.label && styles.optionSelected
                    ]} 
                    onPress={() => selectOption(item.label)}
                  >
                    <View style={[
                      styles.optionIcon,
                      tipo === item.label && styles.optionIconSelected
                    ]}>
                      <Ionicons 
                        name={item.icon} 
                        size={20} 
                        color={tipo === item.label ? PETROLEO : TEXT_MID} 
                      />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={[
                        styles.optionTitle,
                        tipo === item.label && styles.optionTitleSelected
                      ]}>
                        {item.label}
                      </Text>
                      <Text style={styles.optionDescription}>{item.desc}</Text>
                    </View>
                    {tipo === item.label && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark" size={14} color={WHITE} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Nome de usuário */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.inputLabel}>Nome de usuário</Text>
            <View style={[
              styles.inputBox,
              focusedField === 'usuario' && styles.inputBoxFocused
            ]}>
              <Feather 
                name="user" 
                size={18} 
                color={focusedField === 'usuario' ? PETROLEO : '#ABABAB'} 
                style={styles.leadingIcon} 
              />
              <TextInput 
                style={styles.input} 
                value={usuario} 
                onChangeText={setUsuario} 
                autoCapitalize="none"
                placeholder="Digite seu usuário"
                placeholderTextColor="#ABABAB"
                onFocus={() => setFocusedField('usuario')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Senha */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.inputLabel}>Senha</Text>
            <View style={[
              styles.inputBox,
              focusedField === 'senha' && styles.inputBoxFocused
            ]}>
              <Feather 
                name="lock" 
                size={18} 
                color={focusedField === 'senha' ? PETROLEO : '#ABABAB'} 
                style={styles.leadingIcon} 
              />
              <TextInput 
                style={styles.input} 
                value={senha} 
                onChangeText={setSenha} 
                secureTextEntry={!mostrarSenha}
                placeholder="Digite sua senha"
                placeholderTextColor="#ABABAB"
                onFocus={() => setFocusedField('senha')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity 
                activeOpacity={0.7}
                style={styles.eyeButton} 
                onPress={() => setMostrarSenha(!mostrarSenha)}
              >
                <Feather 
                  name={mostrarSenha ? "eye" : "eye-off"} 
                  size={20} 
                  color={TEXT_MID} 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              activeOpacity={0.85}
              style={[
                styles.nextButton,
                !isFormValid && styles.nextButtonDisabled
              ]} 
              onPress={handleLogin}
              disabled={!isFormValid}
            >
              <Text style={[
                styles.nextButtonText,
                !isFormValid && styles.nextButtonTextDisabled
              ]}>
                Entrar
              </Text>
              <Ionicons 
                name="arrow-forward" 
                size={18} 
                color={isFormValid ? WHITE : TEXT_MID} 
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
            
            <Text style={styles.hintText}>
              {!isFormValid 
                ? 'Preencha todos os campos para continuar' 
                : 'Pronto para acessar'}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  scrollContent: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 20 },
  titleSection: { marginBottom: 35 },
  title: { fontSize: 34, fontWeight: '700', color: TEXT_DARK, letterSpacing: -0.5 },
  titleAccent: { fontSize: 34, fontWeight: '300', color: PETROLEO_VIVO, letterSpacing: -0.5 },
  inputLabel: { fontSize: 12, color: OLIVA, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 },
  fieldWrapper: { marginBottom: 20 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, borderRadius: 12, borderWidth: 1.5, borderColor: '#D5D1C8', height: 54, paddingHorizontal: 16, overflow: 'hidden' },
  inputBoxFocused: { borderColor: PETROLEO, shadowColor: PETROLEO, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  leadingIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: TEXT_DARK, height: '100%' },
  eyeButton: { height: '100%', justifyContent: 'center', paddingLeft: 8 },
  dropdown: { backgroundColor: WHITE, borderRadius: 12, borderWidth: 1.5, borderColor: '#D5D1C8', height: 54, justifyContent: 'center' },
  dropdownActive: { borderColor: PETROLEO, shadowColor: PETROLEO, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  dropdownSelected: { borderColor: OLIVA },
  dropdownContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  dropdownText: { fontSize: 16, color: TEXT_DARK, fontWeight: '500' },
  dropdownPlaceholder: { color: '#ABABAB', fontWeight: '400' },
  arrowContainer: { width: 26, height: 26, borderRadius: 6, backgroundColor: PETROLEO_BG, justifyContent: 'center', alignItems: 'center' },
  optionsContainer: { marginTop: 8, backgroundColor: WHITE, borderRadius: 14, borderWidth: 1.5, borderColor: BORDER, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 6 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F0EDE8' },
  optionFirst: { borderTopWidth: 0 },
  optionSelected: { backgroundColor: OLIVA_BG },
  optionIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F0EDE8', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  optionIconSelected: { backgroundColor: PETROLEO_BG },
  optionTextContainer: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: TEXT_DARK, marginBottom: 2 },
  optionTitleSelected: { color: PETROLEO },
  optionDescription: { fontSize: 12, color: TEXT_MID },
  checkmark: { width: 22, height: 22, borderRadius: 11, backgroundColor: PETROLEO, justifyContent: 'center', alignItems: 'center' },
  footer: { marginTop: 'auto', paddingTop: 30, paddingBottom: 20 },
  nextButton: { backgroundColor: PETROLEO, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, shadowColor: PETROLEO, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  nextButtonDisabled: { backgroundColor: BORDER, shadowOpacity: 0, elevation: 0 },
  nextButtonText: { color: WHITE, fontSize: 15, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  nextButtonTextDisabled: { color: TEXT_MID },
  hintText: { textAlign: 'center', marginTop: 14, fontSize: 13, color: OLIVA_VIVA, fontWeight: '500' },
});