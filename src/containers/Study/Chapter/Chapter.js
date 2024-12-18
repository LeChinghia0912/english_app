import { get } from "lodash";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
} from "react-native";

const Chapter = ({ initData }) => {
  const navigation = useNavigation();
  const chapters = get(initData, ["0", "items"]);

  const renderItem = ({ item }) => {
    return (
      <View className="p-4 mb-4 bg-gray-100 rounded-lg">
        <Image
          source={{ uri: item.poster }}
          className="w-full h-32 mb-4 rounded-lg"
          resizeMode="cover"
        />

        <Text className="text-xl font-semibold text-gray-800">{item.name}</Text>
        <Text className="mt-2 text-gray-600">{item.title}</Text>
        <TouchableOpacity
          className="px-4 py-2 mt-4 bg-green-500 rounded-lg"
          onPress={() => navigation.push("Lesson", { slug: item.slug })}
        >
          <Text className="text-center text-white">Chọn Chương Này</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="mt-10 mb-6 text-2xl font-semibold text-center text-gray-800">
        Danh Sách Chương Học
      </Text>

      <FlatList
        data={chapters}
        keyExtractor={(el) => el._id}
        renderItem={renderItem}
      />
    </View>
  );
};

export default Chapter;
