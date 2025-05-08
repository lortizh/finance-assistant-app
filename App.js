import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
      if (typeof window !== 'undefined' && window.location) {
          window.location.reload();
      }
    } catch (error) {
      console.log("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar la sesión.");
    }
  };

  return {
    headerLeft: () => (
        <Image
            source={require('./src/assets/images/logo.png')}
            style={styles.headerLogoLeft}
        />
    ),
    headerTitle: () => (
        <Text style={styles.headerTitleText}>Money Mentor</Text>
    ),
    headerRight: () => (
      <View style={styles.headerRightContainer}>
        {userEmail && (
            <Text style={styles.userEmailText} numberOfLines={1}>{userEmail}</Text>
        )}
        <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
          <Image 
            source={require('./src/assets/images/close_session.png')} 
            style={styles.logoutIcon}
          />
        </TouchableOpacity>
      </View>
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
                            options={getSharedHeaderOptions(user)}
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
    headerLogoLeft: { // Estilo para el logo en la izquierda
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginLeft: 15, // Espacio desde el borde izquierdo (o desde el botón de back)
    },
    headerTitleText: {
        fontSize: 18, // Ligeramente más pequeño para dar espacio
        fontWeight: 'bold',
        color: '#000',
        // React Navigation intentará centrarlo en el espacio disponible
        // O puedes forzar alineación: textAlign: 'left', marginLeft: -X (ajuste manual)
    },
    headerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    userEmailText: {
        fontSize: 12,
        color: '#333',
        marginRight: 8,
        maxWidth: 100,
    },
    logoutButton: {
        padding: 5,
    },
    logoutIcon: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
    },
});
// --- FIN AJUSTE ---

export default App;
