import { get } from "lodash";
import { View, Text, FlatList } from "react-native";

const Rank = ({ initData }) => {
  const ranks = get(initData, ["0", "data"]);

  // Hàm lấy emoji dựa trên thứ hạng
  const getRankEmoji = (index) => {
    switch (index) {
      case 0:
        return "🥇"; // Huy chương vàng cho vị trí số 1
      case 1:
        return "🥈"; // Huy chương bạc cho vị trí số 2
      case 2:
        return "🥉"; // Huy chương đồng cho vị trí số 3
      default:
        return "🏅"; // Huy chương cho các vị trí còn lại
    }
  };

  // Hàm render từng item trong danh sách xếp hạng
  const renderRankItem = ({ item, index }) => {
    return (
      <View className="flex-row items-center justify-between p-4 mx-4 my-2 mb-2 bg-white rounded-lg shadow-lg">
        <Text className="text-xl font-semibold text-gray-800">
          {getRankEmoji(index)} {item.user_id.fullname}
        </Text>
        <Text className="text-lg text-gray-600">{item.score} điểm</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Text className="p-4 mt-10 mb-3 text-3xl font-bold text-center text-gray-800">
        Bảng Xếp Hạng
      </Text>
      <FlatList
        data={ranks}
        renderItem={renderRankItem}
        keyExtractor={(el) => el._id}
      />
    </View>
  );
};

export default Rank;
