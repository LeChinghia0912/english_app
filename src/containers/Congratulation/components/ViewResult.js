import { useMemo } from "react";
import { Modal, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { twMerge } from "tailwind-merge";

const ViewResult = ({
  setModalViewResult,
  modalViewResult,
  answers = [],
  questions = [],
}) => { 
  // Kiểm tra kết quả người dùng
  const renderUserResult = useMemo(() => {
    return answers.map((el, idx) => {
      const question = questions[idx] || {};
      const userAnswer = el?.results || [];
      const correctAnswer = question?.results || [];
      const isCorrect =
        userAnswer.join(" ").toLowerCase().trim() ===
        correctAnswer.join(" ").toLowerCase().trim();

      return (
        <View
          key={idx}
          className="flex-row items-center justify-between gap-2 py-3 border-b border-gray-200"
        >
          <View className="flex-row items-center gap-2">
            <Text className="text-xl font-semibold text-gray-700">{idx + 1}.</Text>
            <Text className="max-w-[160px] line-clamp-2 text-gray-800">
              {userAnswer.join(", ")}
            </Text>
          </View>

          <Text
            className={twMerge(
              "font-bold text-sm",
              isCorrect ? "text-green-500" : "text-red-500"
            )}
          >
            {isCorrect ? "Đúng" : "Sai"}
          </Text>
        </View>
      );
    });
  }, [answers, questions]);
  // Kết quả chính xác của hệ thống
  const renderSystemResult = useMemo(() => {
    return questions.map((el, idx) => (
      <Text key={idx} className="my-2 text-base text-gray-700">
        {idx + 1}. {el?.results?.join(", ")}
      </Text>
    ));
  }, [questions]);
  
  // const resetQuiz = () => {
  //   // setAnswers([]); // Xóa tất cả câu trả lời
  //   // setSelectedOptions([]); // Xóa các tùy chọn đã chọn
  //   // setInputAnswer(""); // Xóa nội dung input
  //   // setTranscript(""); // Xóa nội dung transcript
  //   setCurrentQuestionIndex(0); // Quay lại câu hỏi đầu tiên
  // };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalViewResult}
      onRequestClose={() => setModalViewResult(false)}
    >
      <View className="items-center justify-center flex-1 bg-slate-200 bg-opacity-50">
        <View className="bg-white p-6 rounded-lg w-11/12 max-w-3xl">
          <Text className="mb-6 text-2xl font-bold text-center text-gray-800">
            Xem lại kết quả
          </Text>

          <ScrollView
            className="space-y-4"
            style={{ maxHeight: "70%" }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Đáp án chính xác
              </Text>
              {renderSystemResult}
            </View>

            <View>
              <Text className="text-lg font-semibold text-gray-800 mb-3">
                Câu trả lời của bạn
              </Text>
              {renderUserResult}
            </View>
          </ScrollView>

          <View className="mt-4 flex-row justify-between">
            {/* Button Đóng */}
            <TouchableOpacity
              className="px-6 py-3 bg-gray-500 rounded-lg flex-1 mr-2"
              onPress={() => setModalViewResult(false)}
            >
              <Text className="text-white text-lg text-center font-semibold">Đóng</Text>
            </TouchableOpacity>

            {/* Button Làm lại
            <TouchableOpacity
              className="px-6 py-3 bg-blue-500 rounded-lg flex-1 ml-2"
              onPress={() => {
                onPress={resetQuiz}
                setModalViewResult(false); 
              }}
            >
              <Text className="text-white text-lg text-center font-semibold">
                Làm lại
              </Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ViewResult;
