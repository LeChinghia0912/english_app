import { useState } from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";

const steps = [
  {
    id: "1",
    title: "Chào mừng đến với ứng dụng của chúng tôi!",
    description: "Khám phá những tính năng thú vị để học tiếng Anh hiệu quả.",
    image: require("../../assets/onboarding_Illustration_1.png"),
  },
  {
    id: "2",
    title: "Luyện tập mỗi ngày",
    description: "Cải thiện kỹ năng tiếng Anh thông qua bài học đa dạng.",
    image: require("../../assets/onboarding_Illustration_2.png"),
  },
  {
    id: "3",
    title: "Theo dõi tiến trình",
    description: "Quản lý và theo dõi quá trình học tập của bạn dễ dàng.",
    image: require("../../assets/onboarding_Illustration_3.png"),
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigation.replace("Login"); // Chuyển đến màn hình chính
    }
  };

  return (
    <View className="items-center justify-center flex-1 p-4 bg-white">
      <Image
        source={steps[currentStep].image}
        className="w-64 h-64 mb-6"
        resizeMode="contain"
      />
      <View className="p-4 bg-white shadow-lg">
        <Text className="mb-4 text-2xl font-bold text-center text-gray-800">
          {steps[currentStep].title}
        </Text>
        <Text className="mb-8 text-center text-gray-600">
          {steps[currentStep].description}
        </Text>

        <TouchableOpacity
          onPress={handleNext}
          className="px-6 py-3 bg-blue-500 rounded-lg"
        >
          <Text className="text-lg font-semibold text-center text-white">
            {currentStep < steps.length - 1 ? "Tiếp tục" : "Bắt đầu"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen;
