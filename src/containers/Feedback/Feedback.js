import { twMerge } from "tailwind-merge";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { useNavigation } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity } from "react-native";

import UseFetch from "../../hooks/useFetch";
import { useAuth } from "../../contexts/AuthContext";

const Feedback = () => {
  const { token, user } = useAuth();
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const navigation = useNavigation();

  // Xử lý khi người dùng chọn đánh giá sao
  const handleStarPress = (starNumber) => {
    setRating(starNumber);
  };

  const handleSendFeedback = useCallback(async () => {
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

      Toast.show({
        type: "success",
        text1: "Gửi phản hồi thành công!",
      });
      setRating(0);
      setFeedbackText("");

      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],  // 'Home' là tên screen bạn muốn reload
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Gửi phản hồi thất bại. Vui lòng thử lại sau.",
      });
    }
  }, [feedbackText, rating]);

  return (
    <View className="flex-1 p-6 bg-white">
      <Text className="mb-6 text-2xl font-semibold text-gray-800">
        Đánh giá của bạn
      </Text>

      {/* Phần đánh giá sao */}
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

      {/* Phần nội dung feedback */}
      <Text className="mb-2 text-lg text-gray-700">Nội dung Feedback</Text>
      <TextInput
        value={feedbackText}
        onChangeText={setFeedbackText}
        multiline
        numberOfLines={4}
        placeholder="Chia sẻ ý kiến của bạn"
        className="p-4 text-gray-600 border border-gray-300 rounded-lg"
      />

      {/* Nút gửi feedback */}
      <TouchableOpacity
        onPress={handleSendFeedback}
        className="p-3 mt-6 bg-blue-500 rounded-lg"
      >
        <Text className="text-lg font-semibold text-center text-white">
          Gửi Feedback
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Feedback;
