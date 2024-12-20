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

const Stack = createStackNavigator();

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
                    // Si el usuario está autenticado, muestra la pantalla de Chat y el botón de cerrar sesión
                    <Stack.Screen
                        name="ChatScreen"
                        component={ChatScreen}
                        options={{
                            headerTitle: () => (
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Money Mentor</Text>
                                    <Image
                                        source={require('./src/assets/images/logo.png')}
                                        style={{ width: 60, height: 60 }}
                                    />
                                </View>
                            ),
                            headerRight: () => (                                
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>By FinanceTeach</Text>
                            ),
                        }}
                
                    />

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
