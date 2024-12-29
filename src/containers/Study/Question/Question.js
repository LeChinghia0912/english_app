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
  ActivityIndicator,
} from "react-native";
import UseFetch from "../../../hooks/useFetch";
import { useAuth } from "../../../contexts/AuthContext";
import * as GoogleGenerativeAI from "@google/generative-ai";

const Question = ({ param, initData }) => {
  const { token } = useAuth();
  const navigation = useNavigation();
  const questions = get(initData, ["0", "items"]);

  const [answers, setAnswers] = useState([]);
  const [inputAnswer, setInputAnswer] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [relatedWords, setRelatedWords] = useState([]);
  const [loadingVocabulary, setLoadingVocabulary] = useState(false);

  const API_KEY = "AIzaSyB6Tt4J8Ube9vuZfUF3CPEkDIl4aK7zZ60";
  const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);

  const currentQuestion = questions && questions[currentQuestionIndex];

  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => setRecognizing(false));
  useSpeechRecognitionEvent("result", (event) => {
    setTranscript(event.results[0]?.transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.error("Speech recognition error:", event);
  });

  const fetchRelatedVocabulary = useCallback(async () => {
    if (!currentQuestion?.label) return;

    setLoadingVocabulary(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Analyze the topic of the question: "${currentQuestion.label}" and provide 5 related vocabulary words.`;
      const result = await model.generateContent(prompt);
      const response = result.response;
      const vocabulary = response.text().split(",");
      setRelatedWords(vocabulary.map((word) => word.trim()));
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
    } finally {
      setLoadingVocabulary(false);
    }
  }, [currentQuestion?.label]);

  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted", result);
      setRecording(true);
      return;
    }
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
    fetchRelatedVocabulary();
  }, [fetchRelatedVocabulary]);

  useEffect(() => {
    if(typeof questions == "undefined") return;
    console.log(questions.length)

    if(currentQuestionIndex >= questions.length) {
      console.log("Lọt vào đây")
      submitAnswers();
    }
  }, [currentQuestionIndex, questions])

  const handleNext = () => {
    if (
      (currentQuestion?.layer === 1 || currentQuestion?.layer === 3) &&
      selectedOptions.length === 0
    ) {
      Alert.alert("Vui lòng chọn ít nhất một câu trả lời");
      return;
    }

    if (currentQuestion?.layer === 4 && !transcript) {
      Alert.alert("Vui lòng thu âm câu trả lời");
      return;
    }

    const currentAnswer = {
      question_id: currentQuestion?._id,
      results:
        currentQuestion?.layer === 4
          ? [transcript]
          : currentQuestion?.layer === 2
          ? [inputAnswer]
          : selectedOptions,
    };

    setAnswers((prevAnswers) => [...prevAnswers, currentAnswer]);

    if (currentQuestionIndex < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptions([]);
      setInputAnswer("");
      setTranscript("");
    }
  };

  const submitAnswers = async () => {
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
      Toast.show({ type: "success", text1: "Bạn đã hoàn thành bài kiểm tra!" });
      navigation.push("Congratulation", { answers, questions, param });
    } catch (error) {
      Toast.show({ type: "error", text1: "Lỗi kết nối, vui lòng thử lại sau" });
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

    // Chỉ phát âm đáp án nếu không phải layer 3
    if (currentQuestion?.layer !== 3) {
      Speech?.speak(option, {
        language: "en",
        pitch: 1.0,
        rate: 0.5,
      });
    }
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
    <ScrollView
      className="p-4 mt-10 bg-gray-100"
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: 26,
      }}
    >
      <View className="mb-6">
        <Text className="text-2xl font-semibold text-blue-400 text-center mb-6">
          {param?.lesson_title || "Tiêu đề bài học chưa xác định"}
        </Text>
        <Text className="text-xl font-bold text-gray-800">
          Câu hỏi {currentQuestionIndex + 1}:
        </Text>
        <Text className="mt-8 mb-8 text-2xl font-bold text-center text-gray-800">
          {currentQuestion?.label}
        </Text>
        <Image
          className="object-contain h-64 w-full"
          source={{ uri: currentQuestion?.poster }}
        />
      </View>

      {/* Hiển thị đáp án tùy theo layer */}
      {currentQuestion?.layer === 2 ? (
        <TextInput
          value={inputAnswer}
          onChangeText={setInputAnswer}
          placeholder="Nhập câu trả lời"
          className="p-3 mt-2 border border-gray-300 rounded-lg"
        />
      ) : currentQuestion?.layer === 3 ? (
        <View>
          {/* Nút nghe đáp án */}
          <TouchableOpacity
            onPress={handleListen}
            className="py-3 px-3.5 rounded-sm border-[1px] border-stone-200 mb-4 shadow-sm w-fit mx-auto"
          >
            <Text className="text-xl font-bold text-center">🔊 Nghe</Text>
          </TouchableOpacity>

          {/* Hiển thị danh sách lựa chọn */}
          {renderOptions(currentQuestion?.options)}
        </View>
      ) : currentQuestion?.layer === 4 ? (
        <View>
        <TouchableOpacity
            onPress={handleListen}
            className="py-3 px-3.5 rounded-sm border-[1px] border-stone-200 mb-4 shadow-sm w-fit mx-auto"
          >
            <Text className="text-xl font-bold text-center">🔊 Nghe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleStart}
            className="px-6 py-3 mb-4 bg-green-500 rounded-lg"
          >
            <Text className="text-lg text-center text-white">
              {recognizing ? "Dừng thu âm" : "Bắt đầu thu âm"}
            </Text>
          </TouchableOpacity>
          <Text className="mt-2 text-gray-800">
            {transcript
              ? `Câu trả lời của bạn: ${transcript}`
              : "Chưa có ghi âm nào"}
          </Text>
          {/* Nút Reset */}
          <TouchableOpacity
            onPress={() => setTranscript("")} // Reset lại nội dung transcript
            className="px-6 py-3 mt-4 bg-red-500 rounded-lg"
          >
            <Text className="text-lg text-center text-white">Làm lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        renderOptions(currentQuestion?.options)
      )}

      {loadingVocabulary ? (
        <View style={{ alignItems: "center", marginVertical: 16 }}>
          <ActivityIndicator size="large" color="#888888" />
          <Text
            style={{
              color: "#888888",
              fontSize: 16,
              fontStyle: "italic",
              marginTop: 8,
            }}
          >
            Đang tải từ vựng...
          </Text>
        </View>
      ) : relatedWords.length > 0 ? (
        <View
          style={{
            marginTop: 16,
            padding: 16,
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#444444",
              marginBottom: 12,
            }}
          >
            Từ vựng liên quan:
          </Text>
          {relatedWords.map((word, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 8,
                borderBottomWidth: index < relatedWords.length - 1 ? 1 : 0,
                borderBottomColor: "#E0E0E0",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: "#ccd602",
                  borderRadius: 4,
                  marginRight: 12,
                }}
              />
              <Text style={{ color: "#555555", fontSize: 16 }}>{word}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={{
              marginTop: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: "#ccd602",
              borderRadius: 8,
              alignItems: "center",
            }}
            onPress={fetchRelatedVocabulary}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
              Tìm kiếm thêm
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ alignItems: "center", marginVertical: 16 }}>
          <Text style={{ color: "#888888", fontSize: 16, textAlign: "center" }}>
            Không có từ vựng liên quan.
          </Text>
        </View>
      )}

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
