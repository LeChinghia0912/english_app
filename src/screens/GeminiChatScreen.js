import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as GoogleGenerativeAI from "@google/generative-ai";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import * as Speech from "expo-speech";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

const GeminiChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(false);

  const API_KEY = "AIzaSyB6Tt4J8Ube9vuZfUF3CPEkDIl4aK7zZ60";

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await AsyncStorage.getItem("chatHistory");
        if (history) {
          setMessages(JSON.parse(history));
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    const startChat = async () => {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = "hello!";
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text().replace(/\*/g, "");
      setMessages((prevMessages) => [...prevMessages, { text, user: false }]);
    };

    loadChatHistory();
    startChat();
  }, []);

  useEffect(() => {
    const saveChatHistory = async () => {
      try {
        await AsyncStorage.setItem("chatHistory", JSON.stringify(messages));
      } catch (error) {
        console.error("Failed to save chat history:", error);
      }
    };

    if (messages.length > 0) saveChatHistory();
  }, [messages]);

  useSpeechRecognitionEvent("start", () => {
    console.log("Speech recognition started");
    setIsRecording(true);
  });

  useSpeechRecognitionEvent("end", () => {
    console.log("Speech recognition ended");
    setIsRecording(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    setTranscript(event.results[0]?.transcript || "");
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.error("Speech recognition error:", event);
    setIsRecording(false);
  });

  const startSpeechRecognition = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted");
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: "vi-VN",
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
      requiresOnDeviceRecognition: false,
    });
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    setLoading(true);
    const userMessage = { text: message, user: true };
    setMessages([...messages, userMessage]);

    const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = userMessage.text;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().replace(/\*/g, "");
    const aiMessage = { text, user: false };
    setMessages([...messages, userMessage, aiMessage]);
    setLoading(false);
    setUserInput("");

    if (isSpeakingEnabled) {
      Speech.speak(text);
    }
  };

  const toggleSpeaking = () => {
    setIsSpeakingEnabled(!isSpeakingEnabled);
    Speech.stop(); 
  };

  const clearMessages = async () => {
    setMessages([]);
    setIsSpeaking(false);
    setTranscript("");
    try {
      await AsyncStorage.removeItem("chatHistory");
    } catch (error) {
      console.error("Failed to clear chat history:", error);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      className={`p-3 my-2 max-w-[80%] rounded-lg ${
        item.user
          ? "bg-green-500 self-end rounded-tl-2xl"
          : "bg-gray-300 self-start rounded-tr-2xl"
      }`}
    >
      <Text
        className={`text-base ${
          item.user ? "text-white" : "text-gray-800"
        }`}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Message List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => `${item.text}-${index}`}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
        inverted
      />

      {/* Input Section */}
      <View className="p-4 bg-white shadow-lg">
        <View className="flex-row items-center space-x-3 mb-4">
          <TextInput
            placeholder="Nhập tin nhắn..."
            onChangeText={setUserInput}
            value={userInput}
            className="flex-1 bg-gray-200 rounded-full px-4 py-2 text-gray-800"
          />
          <TouchableOpacity
            className="bg-green-500 rounded-full p-3"
            onPress={() => {
              sendMessage(transcript || userInput); 
              setUserInput("");
              setTranscript("");
            }}
          >
            <FontAwesome name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons Row */}
        <View className="flex-row justify-between items-center">
          <TouchableOpacity
            className={`rounded-full p-3 ${
              isRecording ? "bg-red-500" : "bg-blue-500"
            }`}
            onPress={startSpeechRecognition}
          >
            <FontAwesome
              name={isRecording ? "microphone-slash" : "microphone"}
              size={24}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-green-500 rounded-full px-4 py-2 mx-4"
            onPress={() => {
              sendMessage(transcript);
              setTranscript("");
            }}
          >
            <Text className="text-white text-center font-bold">
              Gửi ghi âm
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-full p-3 bg-gray-500"
            onPress={clearMessages}
          >
            <Entypo name="trash" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Toggle Speaking */}
        <TouchableOpacity
          className={`p-3 mt-3 rounded-full ${
            isSpeakingEnabled ? "bg-red-500" : "bg-green-500"
          }`}
          onPress={toggleSpeaking}
        >
          <Text className="text-white text-center">
            {isSpeakingEnabled ? "Tắt giọng AI" : "Bật giọng AI"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transcript Section */}
      <View className="p-3 bg-gray-100">
        <Text className="text-center text-gray-600">
          {transcript ? `Nội dung ghi âm: ${transcript}` : "Chưa có ghi âm nào"}
        </Text>
      </View>
    </View>
  );
};

export default GeminiChatScreen;
