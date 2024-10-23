// App.js en React Native - app-login-aws
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Image, View, Button, Text } from 'react-native'; // Importa el componente Image

import ChatScreen from "./src/components/ChatScreen";

/** IMPORTS PARA AMPLIFY*/
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from './src/aws-exports';
import { withAuthenticator } from 'aws-amplify-react-native';
Amplify.configure(awsconfig);

const App = () => {
	
	const Stack = createStackNavigator();
  
  async function signOut() {
		try {
			await Auth.signOut();
		} catch (error) {
			console.log(error);
		}
	}	
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Chat">
        <Stack.Screen name="Chat" component={ChatScreen} 
			options={{
        headerTitle: () => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Título del asistente */}
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Money Mentor</Text>
            
            {/* Aquí se renderiza el logo */}
            <Image
              source={require('./src/assets/images/logo.png')} // Ruta a tu logo
              style={{ width: 60, height: 60 }} // Ajusta el tamaño del logo
            />
          </View>
        ),
      }} 
		/>
      </Stack.Navigator>
      <button onClick={signOut}> Salir </button>
    </NavigationContainer>
  );


};

export default withAuthenticator(App);
