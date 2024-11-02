import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { Auth } from 'aws-amplify';

const ConfirmSignUp = ({ navigation, route }) => {
    const [verificationCode, setVerificationCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const { email } = route.params; // Email pasado desde la pantalla de SignUp

    const handleConfirmSignUp = async () => {
        try {
            await Auth.confirmSignUp(email, verificationCode);
            alert("Registro confirmado con éxito");
            navigation.navigate('SignIn'); // Redirige a SignIn tras la confirmación exitosa
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Confirma tu cuenta</Text>
            <Text>Se envió un código de verificación a tu correo electrónico.</Text>
            <TextInput
                placeholder="Código de verificación"
                value={verificationCode}
                onChangeText={setVerificationCode}
                style={styles.input}
                keyboardType="numeric"
            />
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            <Button title="Confirmar" onPress={handleConfirmSignUp} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 },
    error: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

export default ConfirmSignUp;
