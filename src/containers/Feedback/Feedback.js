import React, { useState, useCallback } from "react";
import { FlatList, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { twMerge } from "tailwind-merge";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import * as GoogleGenerativeAI from "@google/generative-ai";

import UseFetch from "../../hooks/useFetch";
import { useAuth } from "../../contexts/AuthContext";

const FeedbackAndSuggestion = () => {
  const { token, user } = useAuth();
  const navigation = useNavigation();

  // State cho feedback
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  // State cho gợi ý học tập
  const [inputText, setInputText] = useState("");
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const API_KEY = "AIzaSyB6Tt4J8Ube9vuZfUF3CPEkDIl4aK7zZ60";

  // Xử lý đánh giá sao
  const handleStarPress = (starNumber) => setRating(starNumber);

  // Gửi feedback
  const handleSendFeedback = useCallback(async () => {
    if (rating === 0) {
      Toast.show({ type: "error", text1: "Vui lòng chọn đánh giá sao." });
      return;
    }

    if (feedbackText.trim() === "") {
      Toast.show({ type: "error", text1: "Nội dung feedback không được để trống." });
      return;
    }

    try {
      await UseFetch("feedback/created", {
        method: "post",
        headers: {
          Authorization: `Bearer ${token?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: feedbackText,
          number_star: rating,
          fullname: user.fullname,
        }),
      });

      Toast.show({ type: "success", text1: "Gửi phản hồi thành công!" });
      setRating(0);
      setFeedbackText("");

      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    } catch (error) {
      Toast.show({ type: "error", text1: "Gửi phản hồi thất bại. Vui lòng thử lại sau." });
    }
  }, [feedbackText, rating]);

  // Lấy gợi ý học tập từ AI
  const handleGetSuggestions = async () => {
    if (!inputText.trim()) {
      Toast.show({ type: "error", text1: "Vui lòng nhập nội dung để nhận gợi ý học tập." });
      return;
    }

    setLoadingSuggestions(true);
    try {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Dựa trên nội dung sau: "${inputText}", hãy đưa ra 1 số gợi ý ngắn gọn học tập hữu ích và chi tiết.`;
      const result = await model.generateContent(prompt);

      const response = result.response;
      const suggestionsList = response.text()
        .replace(/\*/g, "") 
        .split("\n") 
        .map((item) => item.trim());

      setSuggestions(suggestionsList);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      Toast.show({
        type: "error",
        text1: "Không thể lấy gợi ý học tập. Vui lòng thử lại.",
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const renderItem = ({ item }) => (
    <View className="p-2 mb-2 bg-gray-200 rounded-lg">
      <Text className="text-gray-800">{item}</Text>
    </View>
  );

  return (
    <FlatList
      className="mr-6 ml-6"
      data={[]} 
      ListHeaderComponent={
        <>
          {/* Form Feedback */}
          <View>
            <Text className="mb-6 text-2xl font-semibold text-gray-800">Đánh giá của bạn</Text>

            <View className="flex-row items-center justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
                  <Text
                    className={twMerge(
                      "text-3xl",
                      rating >= star ? "text-yellow-500" : "text-gray-300"
                    )}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="mb-2 text-lg text-gray-700">Nội dung Feedback</Text>
            <TextInput
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={4}
              placeholder="Chia sẻ ý kiến của bạn"
              className="p-4 text-gray-600 border border-gray-300 rounded-lg"
            />

            <TouchableOpacity
              onPress={handleSendFeedback}
              className="p-3 mt-6 bg-blue-500 rounded-lg"
            >
              <Text className="text-lg font-semibold text-center text-white">Gửi Feedback</Text>
            </TouchableOpacity>
          </View>

          {/* Form Gợi ý học tập */}
          <View className="mt-10">
            <Text className="mb-6 text-2xl font-semibold text-gray-800">Gợi ý học tập</Text>

            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Nhập nội dung bạn cần tư vấn học tập"
              multiline
              numberOfLines={4}
              className="p-4 text-gray-600 border border-gray-300 rounded-lg mb-4"
            />

            <TouchableOpacity
              onPress={handleGetSuggestions}
              disabled={loadingSuggestions}
              className={`p-3 bg-green-500 rounded-lg ${
                loadingSuggestions ? "opacity-50" : ""
              }`}
            >
              <Text className="text-lg font-semibold text-center text-white">
                {loadingSuggestions ? "Đang xử lý..." : "Nhận gợi ý học tập"}
              </Text>
            </TouchableOpacity>

            <View className="mt-8">
              <Text className="mb-4 text-xl font-semibold text-gray-800">Kết quả</Text>
              {loadingSuggestions ? (
                <ActivityIndicator size="large" color="#00f" />
              ) : (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  renderItem={renderItem}
                  ListEmptyComponent={
                    !loadingSuggestions && (
                      <Text className="text-center text-gray-500">
                        Chưa có gợi ý nào được tạo.
                      </Text>
                    )
                  }
                />
              )}
            </View>
          </View>
        </>
      } 
      keyExtractor={(item, index) => `${item}-${index}`}
    />
  );
};

export default FeedbackAndSuggestion;
