import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async() => {
    if (!email || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
      return;
    };

    await login(email, password);
  };
  return (
    <View className="justify-center flex-1 px-6 bg-gray-100">
      <View className="p-4 rounded-md border-[1px] border-stone-300 shadow-md bg-white">
        <Text className="mb-6 text-2xl font-bold text-center">Đăng Nhập</Text>

        <View className="mb-4">
          <Text className="mb-2 text-gray-700">Email</Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg"
            placeholder="Nhập email của bạn"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View className="mb-6">
          <Text className="mb-2 text-gray-700">Mật khẩu</Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg"
            placeholder="Nhập mật khẩu của bạn"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          className="py-3 bg-blue-500 rounded-lg"
          onPress={handleLogin}
        >
          <Text className="font-semibold text-center text-white">
            Đăng Nhập
          </Text>
        </TouchableOpacity>

        <View className="flex items-center gap-1 mt-3">
          <Text>Bạn chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text className="font-semibold text-blue-500 underline">
              Đăng Ký
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
