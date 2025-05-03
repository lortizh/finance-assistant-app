import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, View, Text, Image } from 'react-native';
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

// Definir opciones de header compartidas
const sharedHeaderOptions = {
    headerTitleAlign: 'center', // Centrar el título
    headerTitle: () => (
        <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: 8 // Añadir espacio entre texto e imagen
            // Quitar justifyContent y width fijo
        }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Money Mentor</Text>
            <Image
                source={require('./src/assets/images/logo.png')} 
                style={{ width: 40, height: 40, resizeMode: 'contain' }} 
            />
        </View>
    ),
    // headerRight: () => (
    //     <Text style={{ fontSize: 16, fontWeight: 'bold', marginRight: 10 }}>By FinanceTeach</Text>
    // ),
    headerStyle: {
        // backgroundColor: '#f4511e',
    },
    headerTintColor: '#000',
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
                            options={sharedHeaderOptions} // Usar opciones compartidas
                        />
                        <Stack.Screen
                            name="ExpenseControlScreen"
                            component={ExpenseControlScreen}
                            options={sharedHeaderOptions} // Usar opciones compartidas
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

export default App;
