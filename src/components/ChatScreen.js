import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { Auth } from 'aws-amplify';
import { useNavigation } from '@react-navigation/native';

import { API_URL } from '@env';


const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');

  const navigation = useNavigation(); // Hook para la navegación

  const signOut = async () => {
    try {
      await Auth.signOut();
      window.location.reload(); // Forza una recarga completa para reiniciar la aplicación
    } catch (error) {
      console.log("Error al cerrar sesión:", error);
    }
  };

  const sendMessage = async () => {
    console.info("::: sendMessage :::");
    const session = await Auth.currentSession();
    const idToken  = session.getIdToken().getJwtToken();

    if (inputText.trim()) {
      // Agregar el mensaje del usuario al estado
      const newMessages = [...messages, { text: inputText, sender: 'user' }];
      setMessages(newMessages);
      setInputText('');
      console.info("::: inputText :::", inputText);
      const requestBody = {
        // Your request body data
        pregunta: inputText
      };
      console.log("::: Request Body :::", requestBody);
      console.info("<<<>>>");
      // Llamar a la API de IA (suponiendo que uses OpenAI u otra API similar)
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            //'x-api-key': API_KEY, // Aquí va tu API key de OpenAI
            "Authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        const aiResponse= data.respuesta;
        setMessages([...newMessages, { text: aiResponse, sender: 'ai' }]);
      } catch (error) {
        console.error("Error al interactuar con la IA:", error);
      }
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.message, item.sender === 'user' ? styles.userMessage : styles.aiMessage]}>
      <Text>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.chatContainer}
      />
      <TextInput
        style={styles.input}
        placeholder="Escribe tu mensaje..."
        value={inputText}
        onChangeText={setInputText}
      />
      <TouchableOpacity style={styles.button} onPress={sendMessage}>
        <Text style={styles.buttonText}>ENVIAR</Text>
      </TouchableOpacity>

      {/* Footer con el botón de Cerrar sesión */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutButtonText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  chatContainer: {
    flex: 1,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  message: {
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#daf8e3',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f0f0',
  },
  button: {
    backgroundColor: '#FFA500', // Cambia el color del botón aquí
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  signOutButton: {
    backgroundColor: '#FF6347', // Color de fondo personalizado
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: '#FFFFFF', // Color del texto
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChatScreen;
