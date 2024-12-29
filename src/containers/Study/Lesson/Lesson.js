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

const Lesson = ({ chapter_slug, initData }) => {
  const navigation = useNavigation();

  const lessons = get(initData, ["0", "items"]);

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
          className={`mt-4 py-2 px-4 rounded-lg ${
            item.isUnlocked ? "bg-green-500" : "bg-stone-400"
          }`}
          onPress={
            item.isUnlocked
              ? () =>
                  navigation.push("Question", {
                    chapter_slug,
                    lesson_slug: item.slug,
                    chapter_id: item.chapter_id,
                    lesson_id: item._id,
                    lesson_title: item.title,
                  })
              : null
          }
        >
          <Text className="text-center text-white">
            {item.isUnlocked ? "Bắt Đầu Học" : "Chưa mở khóa"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 p-4 mt-10 bg-white">
      <TouchableOpacity onPress={() => navigation.navigate("MainTabs")}>
        <Text className="text-xl font-bold">{`<`} Trở Lại</Text>
      </TouchableOpacity>

      <Text className="mt-10 mb-6 text-2xl font-semibold text-center text-gray-800">
        Danh Sách Bài Học
      </Text>

      <FlatList
        data={lessons}
        keyExtractor={(el) => el._id}
        renderItem={renderItem}
      />
    </View>
  );
};

export default Lesson;
