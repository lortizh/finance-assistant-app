import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Button, Image } from 'react-native';
import { Auth } from 'aws-amplify';
import { useNavigation } from '@react-navigation/native';

import { API_URL } from '@env';


const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const navigation = useNavigation();
  const [isAiTyping, setIsAiTyping] = useState(false);

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
      const userMessage = { 
        text: inputText, 
        sender: 'user', 
        timestamp: new Date() 
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      const currentInput = inputText;
      setInputText('');
      setIsAiTyping(true);

      const requestBody = {
        user_query: currentInput
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

        console.log("::: Response :::", response.body);
        const data = await response.json();
        const aiResponse= data.respuesta;
        const aiMessage = {
          text: aiResponse, 
          sender: 'ai', 
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error("Error al interactuar con la IA:", error);
        const errorMessage = {
          text: "Oops! No pude procesar tu solicitud.", 
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsAiTyping(false);
      }
    }
  };

  const renderItem = ({ item }) => {
    const isUser = item.sender === 'user';

    // Placeholder para Avatares
    const Avatar = ({ sender }) => (
      <View style={[styles.avatarContainer, sender === 'user' ? styles.userAvatar : styles.aiAvatar]}>
        <Text style={styles.avatarText}>{sender === 'user' ? 'U' : 'IA'}</Text>
      </View>
    );

    let displayTime = '';
    if (item.timestamp instanceof Date) {
      displayTime = item.timestamp.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
    }

    return (
      <View style={[styles.messageRow, isUser ? styles.userMessageRow : styles.aiMessageRow]}>
        {!isUser && <Avatar sender="ai" />}
        <View style={[styles.messageBubble, isUser ? styles.userMessageBubble : styles.aiMessageBubble]}>
          <Text style={isUser ? styles.userMessageText : styles.aiMessageText}>{item.text}</Text>
          {displayTime ? (
            <Text style={[styles.timestampText, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
              {displayTime}
            </Text>
          ) : null}
        </View>
        {isUser && <Avatar sender="user" />}
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      <View style={styles.container}>
        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.chatContainer}
          contentContainerStyle={{ paddingBottom: 10 }}
        />
        {isAiTyping && (
          <View style={styles.typingIndicatorContainer}>
            <Text style={styles.typingIndicatorText}>Money Mentor está escribiendo...</Text>
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholder="Consulta a Money Mentor o Registra un gasto/ingreso..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.button} onPress={sendMessage}>
          <Text style={styles.buttonText}>ENVIAR</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          
        </View>
      </View>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ExpenseControlScreen')}
      >
        <Image 
          source={require('../assets/images/expense_button.png')}
          style={styles.fabIcon}
        />
        <Text style={styles.fabText}>Gastos</Text>
      </TouchableOpacity>
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
  messageRow: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  userAvatar: {
    backgroundColor: '#007AFF',
  },
  aiAvatar: {
    backgroundColor: '#FFA500',
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    maxWidth: '75%',
  },
  userMessageBubble: {
    backgroundColor: '#daf8e3',
  },
  aiMessageBubble: {
    backgroundColor: '#f1f0f0',
  },
  userMessageText: {
    color: '#000',
  },
  aiMessageText: {
    color: '#000',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  footerButton: {
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  footerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#FF6347',
  },
  typingIndicatorContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  typingIndicatorText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  timestampText: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  userTimestamp: {
    alignSelf: 'flex-end',
  },
  aiTimestamp: {
    alignSelf: 'flex-start',
  },
  fab: {
    position: 'absolute',
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
    right: 20,
    bottom: 90,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    paddingBottom: 2,
  },
  fabIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginBottom: 2,
  },
  fabText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ChatScreen;
