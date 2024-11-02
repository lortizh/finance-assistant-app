import React, { useState } from 'react';
import { View, TextInput, Button, CheckBox, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Auth } from 'aws-amplify';

const SignUp = ({ navigation, onSignUpSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [consentGiven, setConsentGiven] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSignUp = async () => {
        try {
            await Auth.signUp({
                username: email,
                password,
                attributes: { email },
            });
            navigation.navigate('ConfirmSignUp', { email }); // Navega a ConfirmSignUp con el correo
        } catch (error) {
            setErrorMessage(error.message);
        }
    };    

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Registro</Text>
            <TextInput
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <TextInput
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
            />
            <View style={styles.checkboxContainer}>
                <CheckBox
                    value={consentGiven}
                    onValueChange={setConsentGiven}
                />
                <Text>
                    He leído y acepto la{" "}
                    <Text
                        style={styles.link}
                        onPress={() => Linking.openURL('https://tu-dominio.com/politica-de-privacidad')}
                    >
                        Política de Privacidad
                    </Text>
                </Text>
            </View>
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            <Button title="Registrarse" onPress={handleSignUp} disabled={!consentGiven} />
            
            {/* Botón para volver a SignIn */}
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
                <Text style={styles.signinLink}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    link: { color: 'blue', textDecorationLine: 'underline' },
    signinLink: { color: 'blue', marginTop: 20, textAlign: 'center', textDecorationLine: 'underline' },
    error: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

export default SignUp;
