import { useState } from "react";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

import UseFetch from "../../../hooks/useFetch";

const Register = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [level, setLevel] = useState("");
  const [phone, setPhone] = useState("");

  const handleRegister = async () => {
    if (
      !email ||
      !fullname ||
      !password ||
      !confirmPassword ||
      !age ||
      !level ||
      !phone
    ) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Thông báo", "Mật khẩu không khớp!");
      return;
    }

    try {
      await UseFetch("auth/register", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullname,
          password,
          age,
          level,
          phone,
        }),
      });
      Toast.show({
        type: "success",
        text1: "Đăng ký thành công! Vui lòng đăng nhập để sử dụng ứng dụng.",
      });
      setEmail("");
      setFullname("");
      setAge("");
      setLevel("");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      navigation.navigate("Login");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Đã xảy ra lỗi trong quá trình đăng ký, thử lại sau!",
      });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ justifyContent: "center", flexGrow: 1 }}
      className="flex-1 px-6 bg-gray-100 py-5"
    >
      <View className="p-4 rounded-md border-[1px] border-stone-300 shadow-md bg-white">
        <Text className="mb-6 text-2xl font-bold text-center">Đăng Ký</Text>

        {/* Full Name Input */}
        <View className="mb-4">
          <Text className="mb-2 text-gray-700">Họ và Tên</Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg"
            placeholder="Nhập họ và tên"
            value={fullname}
            onChangeText={setFullname}
          />
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="mb-2 text-gray-700">Email</Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg"
            placeholder="Nhập email của bạn"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Tuổi */}
        <View className="mb-4">
          <Text className="mb-2 text-gray-700">Tuổi</Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg"
            placeholder="Nhập tuổi của bạn"
            value={age}
            onChangeText={setAge}
          />
        </View>

        {/* Trình độ học vấn */}
        <View className="mb-4">
          <Text className="mb-2 text-gray-700">Trình độ học vấn</Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg"
            placeholder="Nhập trình độ học vấn của bạn"
            value={level}
            onChangeText={setLevel}
          />
        </View>

        {/* SDT */}
        <View className="mb-4">
          <Text className="mb-2 text-gray-700">Số điện thoại</Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg"
            placeholder="Nhập số điện thoại của bạn"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <Text className="mb-2 text-gray-700">Mật khẩu</Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* Confirm Password Input */}
        <View className="mb-6">
          <Text className="mb-2 text-gray-700">Xác nhận mật khẩu</Text>
          <TextInput
            className="p-3 bg-white border border-gray-300 rounded-lg"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="py-3 bg-blue-500 rounded-lg"
          onPress={handleRegister}
        >
          <Text className="font-semibold text-center text-white">Đăng Ký</Text>
        </TouchableOpacity>

        <View className="flex items-center gap-1 mt-3">
          <Text>Bạn Đã Có Tài Khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text className="font-semibold text-blue-500 underline">
              Đăng Nhập
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Register;
