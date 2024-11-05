import React, { useState } from 'react';
import { View, TextInput, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Auth } from 'aws-amplify';

const SignIn = ({ navigation, onSignInSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSignIn = async () => {
        try {
            await Auth.signIn(email, password);
            onSignInSuccess(); // Llama a esta función cuando el inicio de sesión sea exitoso
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

            <Text style={styles.title}>Iniciar Sesión</Text>
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
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Ingresar</Text>
            </TouchableOpacity>

            {/* Botón para navegar a SignUp */}
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                <Text style={styles.signupLink}>¿No tienes cuenta? Regístrate</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                <Text style={styles.forgotPasswordLink}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    logo: {
        width: 100, // Ajusta el ancho de la imagen según lo que necesites
        height: 100, // Ajusta la altura de la imagen
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    error: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    signupLink: {
        color: 'blue',
        marginTop: 20,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    button: {
        backgroundColor: '#FFA500', // Color naranja
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff', // Color del texto en el botón
        fontWeight: 'bold',
    },
});

export default SignIn;
