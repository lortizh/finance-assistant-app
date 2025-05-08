import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from './src/aws-exports';
Amplify.configure(awsconfig);

import ChatScreen from "./src/components/ChatScreen";
import SignUp from "./src/components/SignUp";  // El componente personalizado de SignUp
import SignIn from "./src/components/SignIn";  // Otro componente personalizado de SignIn
import ConfirmSignUp from "./src/components/ConfirmSignUp";
import ForgotPassword from "./src/components/ForgotPassword";
import ResetPassword from "./src/components/ResetPassword";
import ExpenseControlScreen from "./src/components/ExpenseControlScreen"; // Importar la nueva pantalla

const Stack = createStackNavigator();

const getSharedHeaderOptions = (user) => {
  let userEmail = user?.attributes?.email || null;

  return {
    headerTitleAlign: 'center',
    headerTitle: () => (
        // Logo y Texto juntos para que se centren como un bloque
        <View style={styles.headerTitleGroupContainer}>
            <Image
                source={require('./src/assets/images/logo.png')}
                style={styles.headerLogo}
            />
            <Text style={styles.headerTitleText}>Money Mentor</Text>
        </View>
    ),
    // No definir headerLeft aquí para permitir el botón de retroceso por defecto
    headerRight: () => (
      userEmail ? (
        <View style={styles.headerRightContainer}>
          <Text style={styles.userEmailText}>{userEmail}</Text>
        </View>
      ) : null
    ),
    headerStyle: {
        // backgroundColor: '#f4511e',
    },
    headerTintColor: '#000', // Color para el botón de retroceso y título por defecto
  };
};

const App = () => {
    const [user, setUser] = useState(null);

    // Verificar si el usuario está autenticado al cargar la aplicación
    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const authUser = await Auth.currentAuthenticatedUser();
            setUser(authUser);
        } catch {
            setUser(null);
        }
    };

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {user ? (
                    // Si el usuario está autenticado, muestra las pantallas de la app
                    <>
                        <Stack.Screen
                            name="ChatScreen"
                            component={ChatScreen}
                            options={getSharedHeaderOptions(user)}
                        />
                        <Stack.Screen
                            name="ExpenseControlScreen"
                            component={ExpenseControlScreen}
                            options={(props) => ({ // Usar función para acceder a props.navigation
                                ...getSharedHeaderOptions(user),
                                // Opciones específicas para ExpenseControlScreen si fueran necesarias
                                // Por ejemplo, si ChatScreen NO debe tener botón de back pero Expense SÍ:
                                // headerLeft: props.navigation.canGoBack() ? undefined : () => null, // Lógica compleja
                                // La forma más simple es que React Nav lo maneje por defecto
                            })}
                        />
                    </>

                ) : (
                    // Si el usuario no está autenticado, muestra las pantallas de SignUp o SignIn
                    <>
                        <Stack.Screen name="SignIn" options={{ headerShown: false }}>
                            {(props) => <SignIn {...props} onSignInSuccess={checkUser} />}
                        </Stack.Screen>
                        <Stack.Screen name="SignUp" options={{ headerShown: false }}>
                            {(props) => <SignUp {...props} onSignUpSuccess={() => props.navigation.navigate("SignIn")} />}
                        </Stack.Screen>
                        <Stack.Screen name="ConfirmSignUp" component={ConfirmSignUp} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                        <Stack.Screen name="ResetPassword" component={ResetPassword} />
                    </>
                )}
            </Stack.Navigator>

        </NavigationContainer>
    );
};

// --- AJUSTE: Añadir estilos para el header --- 
const styles = StyleSheet.create({
    headerTitleGroupContainer: { // Contenedor para el grupo de logo y texto en el título
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // Espacio entre logo y texto
    },
    headerLogo: { // Estilo solo para el logo cuando está junto al título
        width: 30, // Un poco más pequeño para que quepa bien
        height: 30,
        resizeMode: 'contain',
    },
    headerTitleText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    headerRightContainer: {
        marginRight: 15,
        alignItems: 'flex-end',
    },
    userEmailText: {
        fontSize: 12,
        color: '#333',
    },
});
// --- FIN AJUSTE ---

export default App;
