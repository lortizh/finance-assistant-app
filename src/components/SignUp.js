import React, { useState } from 'react';
import { View, TextInput, Button, CheckBox, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { Auth } from 'aws-amplify';

const SignUp = ({ navigation, onSignUpSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [consentGiven, setConsentGiven] = useState(false);
    const [dataSharingConsent, setDataSharingConsent] = useState(false);
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
            {/* Agrega la imagen aquí */}
            <Image
                source={require('../assets/images/logo_signin.png')} // Reemplaza con la ruta de tu imagen
                style={styles.logo}
            />

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
                <Text>
                {" "} Y autorizo{" "}
                    <Text
                        style={styles.link}
                        onPress={() => Linking.openURL('https://tu-dominio.com/tratamiento-datos-personales')}
                    >
                        Tratamiento de Datos
                    </Text>                    
                </Text>
            </View>

            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

            <TouchableOpacity
                style={[styles.button, !consentGiven && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={!consentGiven}
            >
                <Text style={styles.buttonText}>Registrarse</Text>
            </TouchableOpacity>

            {/* Botón para volver a SignIn */}
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
                <Text style={styles.signinLink}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    logo: {
        width: 100, // Ajusta el ancho de la imagen según lo que necesites
        height: 100, // Ajusta la altura de la imagen
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    link: { color: 'blue', textDecorationLine: 'underline' },
    signinLink: { color: 'blue', marginTop: 20, textAlign: 'center', textDecorationLine: 'underline' },
    error: { color: 'red', marginBottom: 10, textAlign: 'center' },
    button: {
        backgroundColor: '#FFA500', // Color naranja cuando el botón está habilitado
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#FFA500', // Mismo color o uno más claro si prefieres
        opacity: 0.5, // Baja opacidad para dar el efecto de deshabilitado
    },
    buttonText: {
        color: '#fff', // Color del texto en el botón
        fontWeight: 'bold',
    },
});

export default SignUp;
