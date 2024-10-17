import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const apiUrl= process.env.REACT_APP_API_URL;
  const apiKey = process.env.REACT_APP_API_KEY;
  
  const sendMessage = async () => {
    console.info("::: sendMessage :::");
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
      console.info("::: Request Body :::", requestBody);
      console.info("<<<>>>");
      // Llamar a la API de IA (suponiendo que uses OpenAI u otra API similar)
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-functions-key': apiKey, // Aquí va tu API key de OpenAI
          },
          body: JSON.stringify(requestBody),
        });
        
        const data = await response.json();
        const aiResponse = data.respuesta;
        console.info("::: AI Response :::", aiResponse);

        // Agregar respuesta de IA al estado
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
      <Button title="Enviar" onPress={sendMessage} />
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
});

export default ChatScreen;
