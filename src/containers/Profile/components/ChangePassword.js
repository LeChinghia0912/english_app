import { useState } from "react";
import Toast from "react-native-toast-message";
import { Button, Modal, Text, TextInput, View } from "react-native";

import UseFetch from "../../../hooks/useFetch";
import { useAuth } from "../../../contexts/AuthContext";

const ChangePassword = ({ setModalChangePasswordVisible, modalChangePasswordVisible }) => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { token } = useAuth();

  // Hàm xử lý đổi mật khẩu
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Mật khẩu mới và xác nhận mật khẩu không khớp",
      });
      
      return;
    };

    try {
      await UseFetch("auth/change-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token?.access_token}`,
        },
        body: JSON.stringify({
          currentPassword: password,
          newPassword,
        }),
      });

      Toast.show({
        type: "success",
        text1: "Mật khẩu đã được thay đổi thành công!",
      });

      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Thao tác thất bại, vui lòng thư lại sau",
      });
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalChangePasswordVisible}
      onRequestClose={() => setModalChangePasswordVisible(false)}
    >
      <View className="items-center justify-center flex-1 bg-opacity-50">
        <View className="p-6 bg-white rounded-lg shadow-lg w-80">
          <Text className="mb-5 text-2xl font-bold text-gray-800">
            Đổi mật khẩu!
          </Text>

          <View className="mb-4">
            <Text className="text-gray-600">Mật khẩu hiện tại</Text>
            <TextInput
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <View className="mb-4">
            <Text className="text-gray-600">Mật khẩu mới</Text>
            <TextInput
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
          <View className="mb-6">
            <Text className="text-gray-600">Xác nhận mật khẩu mới</Text>
            <TextInput
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <View className="flex gap-3">
            <Button
              title="Đổi mật khẩu"
              onPress={handleChangePassword}
              color="#4CAF50"
            />

            <Button
              title="Đóng"
              color="#555"
              onPress={() => setModalChangePasswordVisible(false)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChangePassword;
