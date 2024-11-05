import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { Auth } from 'aws-amplify';

const ResetPassword = ({ route, navigation }) => {
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { email } = route.params; // Email pasado desde ForgotPassword

    const handleResetPassword = async () => {
        try {
            await Auth.forgotPasswordSubmit(email, verificationCode, newPassword);
            alert("Contraseña actualizada con éxito");
            navigation.navigate('SignIn'); // Redirige a SignIn tras el restablecimiento exitoso
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Restablecer Contraseña</Text>
            <TextInput
                placeholder="Código de verificación"
                value={verificationCode}
                onChangeText={setVerificationCode}
                style={styles.input}
                keyboardType="numeric"
            />
            <TextInput
                placeholder="Nueva contraseña"
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
                secureTextEntry
            />
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            <Button title="Restablecer Contraseña" onPress={handleResetPassword} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 },
    error: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

export default ResetPassword;
