import React, { useState, useEffect } from "react";
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
  const [showStopIcon, setShowStopIcon] = useState(false);
  const [transcript, setTranscript] = useState("");

  const API_KEY = "AIzaSyB6Tt4J8Ube9vuZfUF3CPEkDIl4aK7zZ60";

  useEffect(() => {
    const startChat = async () => {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = "hello! ";
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      setMessages([
        {
          text,
          user: false,
        },
      ]);
    };
    startChat();
  }, []);

  useSpeechRecognitionEvent("start", () =>
    console.log("Speech recognition started")
  );
  useSpeechRecognitionEvent("end", () => {
    console.log("Speech recognition ended");
    if (transcript) {
      sendMessage(transcript);
    }
  });
  useSpeechRecognitionEvent("result", (event) => {
    setTranscript(event.results[0]?.transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.error("Speech recognition error:", event);
  });

  const startSpeechRecognition = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted");
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
      requiresOnDeviceRecognition: false,
    });
  };

  const sendMessage = async (message) => {
    setLoading(true);
    const userMessage = { text: message, user: true };
    setMessages([...messages, userMessage]);

    const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = userMessage.text;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    setMessages([...messages, { text, user: false }]);
    setLoading(false);
    setUserInput("");

    if (text && !isSpeaking) {
      Speech.speak(text);
      setIsSpeaking(true);
      setShowStopIcon(true);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      Speech.speak(messages[messages.length - 1].text);
      setIsSpeaking(true);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setIsSpeaking(false);
    setTranscript("");
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
    <View className="flex-1 bg-gray-100 mt-12">
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => `${item.text}-${index}`}
        inverted
      />
      <View className="flex-row items-center p-3 bg-white">
        <TouchableOpacity
          className="p-3 bg-blue-500 rounded-full h-12 w-12 flex justify-center items-center"
          onPress={toggleSpeech}
        >
          <FontAwesome
            name={isSpeaking ? "microphone-slash" : "microphone"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        <TextInput
          placeholder="Type a message"
          onChangeText={setUserInput}
          value={userInput}
          onSubmitEditing={() => sendMessage(userInput)}
          className="flex-1 p-3 bg-gray-200 rounded-full mx-3 h-12"
        />
        <TouchableOpacity
          className="p-3 bg-green-500 rounded-full h-12 w-12 flex justify-center items-center"
          onPress={() => sendMessage(userInput)}
        >
          <FontAwesome name="send" size={20} color="white" />
        </TouchableOpacity>
        {showStopIcon && (
          <TouchableOpacity
            className="p-3 bg-red-500 rounded-full h-12 w-12 flex justify-center items-center ml-2"
            onPress={clearMessages}
          >
            <Entypo name="controller-stop" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        className="p-3 bg-green-500 rounded-full flex justify-center items-center m-3"
        onPress={startSpeechRecognition}
      >
        <FontAwesome name="microphone" size={24} color="white" />
      </TouchableOpacity>
      <Text className="p-3 text-gray-700 text-center">
        {transcript ? `${transcript}` : "Trò chuyện cùng AI"}
      </Text>
    </View>
  );
};

export default GeminiChatScreen;
