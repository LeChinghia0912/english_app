import React, { useState, useEffect } from "react";
import * as GoogleGenerativeAI from "@google/generative-ai";
import { View, ActivityIndicator } from "react-native";
import * as Speech from "expo-speech";
import * as SpeechRecognition from "expo-speech-recognition";
import FlashMessage, { showMessage } from "react-native-flash-message";
import GeminiChatScreen from "../../screens/GeminiChatScreen";

const GeminiChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStopIcon, setShowStopIcon] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const API_KEY = "AIzaSyB6Tt4J8Ube9vuZfUF3CPEkDIl4aK7zZ60";

  useEffect(() => {
    const startChat = async () => {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = "hello! ";
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text().replace(/\*/g, "").trim();
      showMessage({
        message: "Welcome to Gemini Chat 🤖",
        description: text,
        type: "info",
        icon: "info",
        duration: 2000,
      });
      setMessages([
        {
          text,
          user: false,
        },
      ]);
    };
    startChat();
  }, []);

  const sendMessage = async () => {
    setLoading(true);
    const userMessage = {
      text: userInput.replace(/\*/g, "").trim(),
      user: true,
    };
    setMessages((prev) => [...prev, userMessage]);

    const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = userMessage.text;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().replace(/\*/g, "").trim();
    setMessages((prev) => [...prev, { text, user: false }]);
    setLoading(false);
    setUserInput("");

    if (text && !isSpeaking) {
      Speech.speak(text, {
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });
      setIsSpeaking(true);
      setShowStopIcon(true);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      setShowStopIcon(false);
    } else {
      const lastMessage = messages[messages.length - 1]?.text;
      if (lastMessage) {
        Speech.speak(lastMessage, {
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
        });
        setIsSpeaking(true);
      }
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setIsSpeaking(false);
    setShowStopIcon(false);
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      const result = await SpeechRecognition.startAsync();
      if (result && result.transcription) {
        setUserInput(result.transcription.replace(/[^a-zA-Z0-9 .,!?]/g, ""));
      }
    } catch (error) {
      console.error("Speech recognition error:", error);
    } finally {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopAsync();
    setIsListening(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlashMessage position="bot" />
      {loading && <ActivityIndicator size="large" color="#000" />}
      <GeminiChatScreen
        messages={messages}
        userInput={userInput}
        setUserInput={setUserInput}
        sendMessage={sendMessage}
        toggleSpeech={toggleSpeech}
        clearMessages={clearMessages}
        isSpeaking={isSpeaking}
        showStopIcon={showStopIcon}
        isListening={isListening}
        startListening={startListening}
        stopListening={stopListening}
      />
    </View>
  );
};

export default GeminiChatContainer;
