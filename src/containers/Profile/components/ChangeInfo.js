import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { Modal, View, Text, Button, TextInput } from "react-native";

const ChangeInfo = ({ setModalChangeInfoVisible, modalChangeInfoVisible }) => {
  const [age, setAge] = useState("");
  const [level, setLevel] = useState("");
  const [phone, setPhone] = useState("");
  const [fullname, setFullname] = useState("");

  const handleChangeInfo = useCallback(async () => {
    if (!fullname || !age || !level || !phone) {
      alert("Vui lòng nhập họ và tên");
      return;
    }

    try {
      await UseFetch("auth/change-info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname,
          age,
          level,
          phone,
        }),
      });

      Toast.show({
        type: "success",
        text1: "Thay đổi thông tin thành công!",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Đã xảy ra lỗi trong quá trình đăng ký, thử lại sau!",
      });
    }
  }, [fullname]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalChangeInfoVisible}
      onRequestClose={() => setModalChangeInfoVisible(false)}
    >
      <View className="items-center justify-center flex-1 bg-opacity-50">
        <View className="p-6 bg-white rounded-lg shadow-lg w-80">
          <Text className="mb-5 text-2xl font-bold text-gray-800">
            Thay đổi thông Tin Cá Nhân
          </Text>

          <View className="mb-4">
            <Text className="text-gray-600">Số điện thoại</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Nhập sô điện thoại của bạn"
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-600">Tuổi</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="Nhập tuổi của bạn"
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-600">Trình độc học vấn</Text>
            <TextInput
              value={level}
              onChangeText={setLevel}
              placeholder="Nhập trình độ học vấn"
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-600">Họ và tên</Text>
            <TextInput
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg"
              placeholder="Nhập họ và tên"
              value={fullname}
              onChangeText={setFullname}
            />
          </View>

          <View className="flex gap-3 rounded-2xl bg-white p-4">
            <Button
              color="#4CAF50"
              title="Đổi thông tin"
              onPress={handleChangeInfo}
            />

            <Button
              color="#555"
              title="Đóng"
              onPress={() => setModalChangeInfoVisible(false)}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChangeInfo;
