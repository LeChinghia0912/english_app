import { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import ChangeInfo from "./components/ChangeInfo";
import { useAuth } from "../../contexts/AuthContext";
import ChangePassword from "./components/ChangePassword";

const Profile = () => {
  const [modalChangePasswordVisible, setModalChangePasswordVisible] = useState(false);
  const [modalChangeInfoVisible, setModalChangeInfoVisible] = useState(false);

  const { user, logout } = useAuth();

  const handleLogOut = useCallback(() => {
    logout();
  }, []);

  return (
    <ScrollView className="p-4 bg-gray-100">
      <View className="flex items-center gap-4 mx-auto my-5">
        <Text className="text-2xl font-bold text-gray-800">
          {user.fullname}
        </Text>
        <Image
          source={require("../../../assets/avatar.png")}
          className="!w-[80px] !h-[80px] rounded-full"
          resizeMode="cover"
        />
        <TouchableOpacity
          className="px-3 py-2 bg-blue-400 w-fit rounded-lg"
          onPress={handleLogOut}
        >
          <Text className="text-white">Đăng Xuất</Text>
        </TouchableOpacity>
      </View>

      <View className="w-full p-6 bg-white rounded-lg shadow-md">
        <Text className="mb-4 text-2xl font-semibold text-gray-800">
          Thông tin cá nhân
        </Text>
        <View className="flex flex-row gap-1 mb-4">
          <Text className="text-gray-600 min-w-[80px]">Họ Và Tên</Text>
          <Text className="text-gray-800">: {user.fullname}</Text>
        </View>
        <View className="flex flex-row gap-1 mb-4">
          <Text className="text-gray-600 min-w-[80px]">Email</Text>
          <Text className="text-gray-800">: {user.email}</Text>
        </View>
      </View>

      <View className="flex gap-4 mt-10 mb-5">
        <TouchableOpacity onPress={() => setModalChangeInfoVisible(true)}>
          <Text className="text-base font-medium">Cập Nhật Thông Tin</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalChangePasswordVisible(true)}>
          <Text className="text-base font-medium">Đổi Mật Khẩu</Text>
        </TouchableOpacity>
      </View>

      {/* Modal đổi mật khẩu */}

      <ChangePassword
        setModalChangePasswordVisible={setModalChangePasswordVisible}
        modalChangePasswordVisible={modalChangePasswordVisible}
      />

      <ChangeInfo
        setModalChangeInfoVisible={setModalChangeInfoVisible}
        modalChangeInfoVisible={modalChangeInfoVisible}
      />
    </ScrollView>
  );
};

export default Profile;
