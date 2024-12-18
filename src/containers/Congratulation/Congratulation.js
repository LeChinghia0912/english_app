import { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { View, Text, TouchableOpacity, Image } from "react-native";
import ViewResult from "./components/ViewResult";
import { get } from "lodash";

const Congratulation = () => {
  const route = useRoute();
  const param = route.params || {};
  const navigation = useNavigation();

  const [score, setScore] = useState(0);
  const [modalViewResult, setModalViewResult] = useState(false);

  const answers = get(param, ["answers"], []);
  const questions = get(param, ["questions"], []);

  useEffect(() => {
    // Tính điểm số
    if (questions.length > 0 && answers.length > 0) {
      let calculatedScore = 0;
      questions.forEach((question, idx) => {
        const userAnswer = answers[idx]?.results || [];
        const correctAnswer = question?.results || [];
        if (
          userAnswer.join(" ").toLowerCase().trim() ===
          correctAnswer.join(" ").toLowerCase().trim()
        ) {
          calculatedScore += 10;
        }
      });
      setScore(calculatedScore);
    }
  }, [answers, questions]);

  const handlePressNextLesson = () => {
    navigation?.reset({
      index: 0,
      routes: [{ name: "Lesson", params: { slug: param?.param?.chapter_slug } }],
    });
  };

  return (
    <View className="items-center justify-center flex-1 p-4 bg-gray-100">
      <Image
        source={{
          uri: "https://cdn-icons-png.flaticon.com/512/3159/3159066.png",
        }}
        className="mb-6 w-36 h-36"
      />
      <Text className="mb-4 text-2xl font-bold text-green-500">
        🎉 Chúc Mừng! 🎉
      </Text>
      <Text className="mb-1 text-base text-center text-gray-700">
        Bạn đã hoàn thành bài học này!
      </Text>
      <Text className="mb-1 text-base text-center text-gray-700">
        Bạn đã thu được <Text className="font-bold">{score}</Text> điểm từ bài
        học này.
      </Text>

      <TouchableOpacity onPress={() => setModalViewResult(true)}>
        <Text className="text-xl font-bold underline text-blue-600 mb-8">
          Xem lại kết quả
        </Text>
      </TouchableOpacity>

      <ViewResult
        answers={answers}
        questions={questions}
        setModalViewResult={setModalViewResult}
        modalViewResult={modalViewResult}
      />

      <TouchableOpacity
        className="px-6 py-3 bg-green-500 rounded-lg"
        onPress={handlePressNextLesson}
      >
        <Text className="text-lg font-semibold text-white">
          Bài học tiếp theo
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Congratulation;
