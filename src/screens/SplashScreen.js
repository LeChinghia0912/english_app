import React, { useEffect } from "react";
import { View, Text, Image } from "react-native";
import { useAuth } from "../contexts/AuthContext"; // Lấy trạng thái đăng nhập từ AuthProvider

const SplashScreen = ({ navigation }) => {
  const { isLoggedIn } = useAuth(); // Trạng thái đăng nhập

  useEffect(() => {
    const timer = setTimeout(() => {
      // Điều hướng tùy vào trạng thái đăng nhập
      if (isLoggedIn) {
        navigation.replace("MainTabs"); // Chuyển đến Home nếu đã đăng nhập
      } else {
        navigation.replace("Onboarding"); // Chuyển đến Onboarding nếu chưa đăng nhập
      }
    }, 3000); // Splash Screen hiển thị trong 3 giây

    return () => clearTimeout(timer);
  }, [isLoggedIn, navigation]);

  return (
    <View className="flex-1 flex-center bg-gradient-to-t bg-blue-500 to-blue-300">
      {/* Logo hoặc hình ảnh */}
      <Image
        source={require("../../assets/wordbuddy.png")} // Đường dẫn tới logo
        className="flex-1 w-80 h-full"
        resizeMode="contain"
      />
    </View>
  );
};

export default SplashScreen;
