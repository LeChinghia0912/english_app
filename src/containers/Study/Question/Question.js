import { get } from "lodash";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

import Toast from "react-native-toast-message";
import { useState, useEffect, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Image,
} from "react-native";

import UseFetch from "../../../hooks/useFetch";
import { useAuth } from "../../../contexts/AuthContext";

const Question = ({ param, initData }) => {
  const { token } = useAuth();
  const navigation = useNavigation();
  const questions = get(initData, ["0", "items"]);

  const [answers, setAnswers] = useState([]); // Lưu trữ câu trả lời cuối cùng
  const [inputAnswer, setInputAnswer] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");

  const currentQuestion = questions && questions[currentQuestionIndex];

  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => setRecognizing(false));
  useSpeechRecognitionEvent("result", (event) => {
    setTranscript(event.results[0]?.transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("error code:", event.error, "error message:", event.message);
  });

  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted", result);
      setRecording(true);
      return;
    }
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
      requiresOnDeviceRecognition: false,
      addsPunctuation: false,
      contextualStrings: ["Carlsen", "Nepomniachtchi", "Praggnanandhaa"],
    });
  };

  useEffect(() => {
    const fetchingData = async () => {
      if (answers.length === questions?.length) {
        try {
          await UseFetch(
            `lesson/submit?chapter_id=${param?.chapter_id}&lesson_id=${param?.lesson_id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token?.access_token}`,
              },
              body: JSON.stringify(answers),
            }
          );

          Toast.show({
            type: "success",
            text1: "Bạn đã hoàn thành bài kiểm tra!",
          });

          navigation.push("Congratulation", { answers, questions, param });
        } catch (error) {
          Toast.show({
            type: "error",
            text1: "Lỗi kết nối, Vui lòng thử lại sau",
          });
        }
      }
    };

    fetchingData();
  }, [answers]); // Sẽ chạy khi answers thay đổi

  const handleNext = () => {
    if (
      (currentQuestion.layer === 1 || currentQuestion.layer === 3) &&
      selectedOptions.length === 0
    ) {
      Alert.alert("Vui lòng chọn ít nhất một câu trả lời");
      return;
    }

    if (currentQuestion.layer === 4 && !transcript) {
      Alert.alert("Vui lòng thu âm câu trả lời");
      return;
    }

    // Kiểm tra nếu câu hỏi có layer là 3, lấy câu trả lời từ audio
    const currentAnswer = {
      question_id: currentQuestion?._id,
      results:
        currentQuestion?.layer === 4
          ? [transcript]
          : currentQuestion?.layer === 2
          ? [inputAnswer]
          : selectedOptions,
    };

    // Cập nhật câu trả lời vào mảng answers
    setAnswers((prevAnswers) => [...prevAnswers, currentAnswer]);

    if (currentQuestionIndex < questions.length - 1) {
      // Chuyển sang câu hỏi tiếp theo
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptions([]); // Reset tùy chọn đã chọn
      setInputAnswer(""); // Reset ô input nếu có
      setTranscript("");
    }
  };

  const handleChoiceQuestion = (option) => {
    if (currentQuestion.mutiSelect) {
      // Thêm hoặc xóa lựa chọn trong mảng
      setSelectedOptions((prevSelectedOptions) =>
        prevSelectedOptions.includes(option)
          ? prevSelectedOptions.filter((item) => item !== option)
          : [...prevSelectedOptions, option]
      );
    } else {
      // Cập nhật lựa chọn đơn
      setSelectedOptions([option]);
    }

    // Phát âm thanh
    Speech?.speak(option, {
      language: "en",
      pitch: 1.0,
      rate: 1.0,
    });
  };

  const handleListen = useCallback(() => {
    if (typeof currentQuestion == "undefined") return null;

    const result = currentQuestion.results?.join(" ");

    // Phát âm thanh
    Speech?.speak(result, {
      language: "en",
      pitch: 1.0,
      rate: 1.0,
    });
  }, [currentQuestion]);

  const renderOptions = (options) => {
    if (typeof options == "undefined") return null;

    return options.map((option, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => handleChoiceQuestion(option)}
        className={`p-3 mt-2 rounded-lg ${
          selectedOptions.includes(option) ? "bg-blue-500" : "bg-gray-200"
        }`}
      >
        <Text
          className={`text-lg ${
            selectedOptions.includes(option) ? "text-white" : "text-gray-800"
          }`}
        >
          {option}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <ScrollView className="p-4 mt-10 bg-gray-100">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800">
          Câu hỏi {currentQuestionIndex + 1}:
        </Text>
        <Text className="mt-2 text-xl text-gray-800">
          {currentQuestion?.label}
        </Text>

        <Image
          className="mx-auto mt-6 mb-3 w-full h-36 bg-auto"
          source={{ uri: currentQuestion?.poster }}
        />
      </View>

      {/* Render các tùy chọn câu hỏi */}
      {currentQuestion?.layer === 2 ? (
        <TextInput
          value={inputAnswer}
          onChangeText={setInputAnswer}
          placeholder="Nhập câu trả lời"
          className="p-3 mt-2 border border-gray-300 rounded-lg"
        />
      ) : currentQuestion?.layer === 3 ? (
        <View>
          <TouchableOpacity
            onPress={handleListen}
            className="py-3 px-3.5 rounded-sm border-[1px] border-stone-200 mb-4 shadow-sm w-fit mx-auto"
          >
            <Text className="text-xl font-bold text-center">🔊</Text>
          </TouchableOpacity>

          {renderOptions(currentQuestion?.options)}
        </View>
      ) : currentQuestion?.layer === 4 ? (
        <View className="flex items-center justify-center mt-4">
          <Text className="mb-4 text-lg text-gray-800">
            Hãy thu âm câu trả lời của bạn:
          </Text>
          <TouchableOpacity
            onPress={
              !recognizing
                ? handleStart
                : () => ExpoSpeechRecognitionModule.stop()
            }
            className="p-6 bg-blue-500 rounded-full"
          >
            <Text className="text-xl text-white">
              {recognizing ? "Dừng thu âm" : "Bắt đầu thu âm"}
            </Text>
          </TouchableOpacity>

          <Text>{transcript}</Text>
        </View>
      ) : (
        renderOptions(currentQuestion?.options)
      )}

      {/* Nút Next */}
      <TouchableOpacity
        className="px-6 py-3 mt-6 bg-blue-500 rounded-lg"
        onPress={handleNext}
      >
        <Text className="text-lg text-center text-white">Tiếp theo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Question;
