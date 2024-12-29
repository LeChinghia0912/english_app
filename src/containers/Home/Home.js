import { get } from "lodash";
import { useMemo } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";

import { useAuth } from "../../contexts/AuthContext";
import { twMerge } from "tailwind-merge";

const HomeScreen = ({ initData }) => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const chapters = get(initData, ["0", "items"]);
  const feedbacks = get(initData, ["1", "items"]);

  const renderChapters = useMemo(() => {
    if (typeof chapters == "undefined") return null;

    return chapters.map((item, idx) => (
      <View key={idx} className="p-4 mb-4 bg-gray-100 rounded-lg shadow-lg">
        <Image
          source={{ uri: item.poster }}
          className="w-full h-32 mb-4 rounded-lg"
          resizeMode="cover"
        />
        <Text className="text-xl font-semibold text-gray-800">{item.name}</Text>
        <Text className="mt-2 text-gray-600">{item.title}</Text>
        <TouchableOpacity className="bg-blue-400 mt-3 py-3 px-3.5 rounded-sm" onPress={() => navigation.push("Lesson", { slug: item.slug })}>
          <Text className="font-semibold text-center text-white">HỌC NGAY</Text>
        </TouchableOpacity>
      </View>
    ));
  }, [chapters]);

  const renderFeedbacks = useMemo(() => {
    if (typeof feedbacks == "undefined") return <Text>Không có feedback nào!</Text>;

    return feedbacks.map((el, idx) => (
      <View key={idx} className="p-4 mb-4 bg-gray-100 rounded-lg shadow-sm">
        <Text className="text-lg font-semibold text-gray-800">
          {el.fullname}
        </Text>
        <View className="flex-row items-center mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Text
              key={star}
              className={twMerge(
                "text-3xl",
                el.number_star >= star ? "text-yellow-500" : "text-gray-300"
              )}
            >
              ★
            </Text>
          ))}
        </View>
        <Text className="mt-2 text-gray-600">{el.content}</Text>
      </View>
    ));
  }, [feedbacks]);

  return (
    <ScrollView className="flex-1 w-full p-6">
      <View className="flex flex-row items-center justify-between gap-2 p-6 mb-5 -m-6  rounded-3xl bg-gradient-to-r bg-blue-300">
        <View className="flex flex-row items-center gap-2">
          <Image
            source={require("../../../assets/avatar.png")}
            className="!w-[50px] !h-[50px] rounded-full"
            resizeMode="cover"
          />

          <View>
            <Text className="font-medium">Xin chào</Text>
            <Text className="text-xl font-bold">{user.fullname}</Text>
          </View>
        </View>
      </View>

      {/* Tiêu đề chính */}
      <Text className="mb-6 text-4xl font-bold text-gray-800">
        Chào mừng đến với Ứng dụng Học Tiếng Anh
      </Text>

      {/* Mô tả ngắn gọn */}
      <Text className="mb-6 text-lg text-gray-600">
        Hãy bắt đầu hành trình học tiếng Anh của bạn ngay hôm nay với các bài
        học thú vị và dễ hiểu.
      </Text>


      {/* Phần danh sách bài học */}
      <Text className="mb-4 text-2xl font-semibold text-gray-800">
        Các Chương học nổi bật
      </Text>

      {renderChapters}

      {/* Feedback từ người dùng */}
      <Text className="mt-6 mb-4 text-2xl font-semibold text-gray-800">
        Feedback từ người dùng
      </Text>

      {renderFeedbacks}

      {/* Nút học ngay */}
      <TouchableOpacity
        onPress={() => navigation.push("Lesson", { slug: "chuong-1" })}
        className="p-4 mt-6 mb-10 bg-blue-500 rounded-lg"
      >
        <Text className="text-lg font-semibold text-center text-white">
          Bắt đầu học ngay
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

export default HomeScreen;
