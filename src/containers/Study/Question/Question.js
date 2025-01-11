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
  const [speechRate, setSpeechRate] = useState(0.8);
  const [accuracyPercentage, setAccuracyPercentage] = useState(0);
  const [showVocabulary, setShowVocabulary] = useState(false);

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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Vui lòng cung cấp danh sách 5 từ vựng tiếng Anh liên quan đến chủ đề 
      "${currentQuestion.label}". Kèm theo mỗi từ là nghĩa dịch tiếng Việt. Hãy trình bày theo định dạng sau:
          [Từ vựng tiếng Anh] -- [ Nghĩa tiếng Việt ] .
          `;
      const result = await model.generateContent(prompt);
      const response = result.response;
      const vocabulary = response
        .text()
        .replace(/\*/g, "") 
        .split(",")
        .map((word) => word.trim());
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
    if (typeof questions == "undefined") return;
    console.log(questions.length);

    if (currentQuestionIndex >= questions.length) {
      console.log("Lọt vào đây");
      submitAnswers();
    }
  }, [currentQuestionIndex, questions]);
  useEffect(() => {
    let isMounted = true;

    const fetchAccuracy = async () => {
      // Kiểm tra nếu transcript hoặc currentQuestion không tồn tại
      if (
        !transcript ||
        typeof currentQuestion?.label !== "string" ||
        !currentQuestion.label.trim()
      ) {
        console.warn("Missing or invalid transcript or reference text.");
        if (isMounted) setAccuracyPercentage(0);
        return;
      }
    
      // Hàm tính toán WER (Word Error Rate)
      const calculateWER = (reference, hypothesis) => {
        const refWords = reference.split(/\s+/); // Tách từ tham chiếu
        const hypWords = hypothesis.split(/\s+/); // Tách từ của người dùng
    
        const refLen = refWords.length;
        const hypLen = hypWords.length;
    
        // Tạo ma trận khoảng cách
        const dp = Array.from({ length: refLen + 1 }, () =>
          Array(hypLen + 1).fill(0)
        );
    
        // Khởi tạo giá trị cho ma trận
        for (let i = 0; i <= refLen; i++) dp[i][0] = i;
        for (let j = 0; j <= hypLen; j++) dp[0][j] = j;
    
        // Điền ma trận khoảng cách
        for (let i = 1; i <= refLen; i++) {
          for (let j = 1; j <= hypLen; j++) {
            if (refWords[i - 1] === hypWords[j - 1]) {
              dp[i][j] = dp[i - 1][j - 1]; // Không có lỗi
            } else {
              dp[i][j] = Math.min(
                dp[i - 1][j - 1] + 1, // Thay thế (substitution)
                dp[i - 1][j] + 1,     // Xóa (deletion)
                dp[i][j - 1] + 1      // Thêm (insertion)
              );
            }
          }
        }
    
        // Số lỗi chỉnh sửa tối thiểu
        const errors = dp[refLen][hypLen];
    
        // Tính WER
        return (errors / refLen) * 100;
      };
    
      try {
        const referenceText = currentQuestion.label.trim();
        const userTranscript = transcript.trim();
    
        // Tính WER
        const wer = calculateWER(referenceText, userTranscript);
        const accuracy = Math.max(0, 100 - wer); // Độ chính xác = 100% - WER%
    
        // Cập nhật kết quả
        if (isMounted) setAccuracyPercentage(accuracy);
      } catch (error) {
        console.error("Error calculating WER accuracy:", error);
        if (isMounted) setAccuracyPercentage(0);
      }
    };

    fetchAccuracy();

    return () => {
      isMounted = false;
    };
  }, [transcript, currentQuestion?.label]);

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

    // Đáp án của người dùng
    const userAnswer =
      currentQuestion?.layer === 4
        ? [transcript]
        : currentQuestion?.layer === 2
        ? [inputAnswer]
        : selectedOptions;

    // Đáp án đúng từ dữ liệu câu hỏi
    const correctAnswer = currentQuestion?.results;

    // Kiểm tra đáp án
    const isCorrect =
      Array.isArray(correctAnswer) &&
      Array.isArray(userAnswer) &&
      correctAnswer.every((ans) => userAnswer.includes(ans)) &&
      userAnswer.every((ans) => correctAnswer.includes(ans));

    // Hiển thị thông báo
    if (isCorrect) {
      Toast.show({
        type: "success",
        text1: "🎉 Chính xác! 🎉",
        text2: "Bạn làm tốt lắm! 💪🤩",
        visibilityTime: 2000,
        position: "top",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "😥 Oops! Sai mất rồi! 😥",
        text2: "Cố lên nhé, bạn sẽ làm được! 🔥✊",
        visibilityTime: 2000,
        position: "top",
      });
    }

    // Lưu đáp án của người dùng
    const currentAnswer = {
      question_id: currentQuestion?._id,
      results: userAnswer,
    };

    setAnswers((prevAnswers) => [...prevAnswers, currentAnswer]);

    // Chuyển sang câu hỏi tiếp theo
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
      setSelectedOptions((prevSelectedOptions) =>
        prevSelectedOptions.includes(option)
          ? prevSelectedOptions.filter((item) => item !== option)
          : [...prevSelectedOptions, option]
      );
    } else {
      setSelectedOptions([option]);
    }

    if (currentQuestion?.layer !== 3) {
      Speech?.speak(option, {
        language: "en",
        pitch: 1.0,
        rate: speechRate,
      });
    }
  };

  const handleListen = useCallback(() => {
    if (typeof currentQuestion == "undefined") return null;

    const result = currentQuestion.results?.join(" ");

    Speech?.speak(result, {
      language: "en",
      pitch: 1.0,
      rate: speechRate,
    });
  }, [currentQuestion, speechRate]);

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-xl font-bold">{`<`} Quay lại</Text>
        </TouchableOpacity>
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

      {currentQuestion?.layer !== 2 && (
        <View className="flex-row my-4">
          <View className="flex-row my-4">
            <TouchableOpacity
              className={`mx-2 p-3 rounded-lg ${
                speechRate === 2.0 ? "bg-green-500" : "bg-gray-300"
              }`}
              onPress={() => setSpeechRate(speechRate === 2.0 ? 0.8 : 2.0)}
            >
              <Text
                style={{ color: speechRate === 2.0 ? "#FFFFFFF" : "#000000" }}
              >
                Nhanh
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
        <View style={{ padding: 16 }}>
          {/* Nút nghe đáp án */}
          <TouchableOpacity
            onPress={handleListen}
            className="py-3 px-4 rounded-lg border border-gray-300 mb-4 shadow-sm self-center"
          >
            <Text className="text-xl font-bold text-center">🔊 Nghe</Text>
          </TouchableOpacity>

          {/* Nút bắt đầu hoặc dừng thu âm */}
          <TouchableOpacity
            onPress={handleStart}
            className={`py-3 px-6 rounded-lg mb-4 self-center ${
              recognizing ? "bg-red-500" : "bg-green-500"
            }`}
          >
            <View>
              <Text
                className="text-xl font-bold text-white text-center"
                // style={{ fontSize: 16, color: "#FFFFFF", textAlign: "center" }}
              >
                {recognizing ? "Dừng thu âm" : "Bắt đầu thu âm"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Hiển thị câu trả lời */}
          <View>
            <Text className="text-2xl text-gray-600 mb-2 text-center">
              {transcript
                ? `Câu trả lời của bạn: ${transcript}`
                : "Chưa có ghi âm nào"}
            </Text>
          </View>
          {/* Hiển thị độ chính xác nếu có transcript */}
          {transcript && (
            <View>
              <Text className="text-4xl text-gray-600 mb-4 text-center">
                {`Độ chính xác: ${accuracyPercentage} %`}
              </Text>
            </View>
          )}

          {/* Nút Reset */}
          <TouchableOpacity
            onPress={() => setTranscript("")}
            className="py-3 px-6 bg-red-500 rounded-lg self-center"
          >
            <Text
              style={{ fontSize: 16, color: "#FFFFFF", textAlign: "center" }}
            >
              Làm lại
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        renderOptions(currentQuestion?.options)
      )}
      <View>
        {!showVocabulary && (
          <TouchableOpacity
            style={{
              marginTop: 16,
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: "#4CAF50",
              borderRadius: 8,
              alignItems: "center",
            }}
            onPress={() => {
              setShowVocabulary(true);
              fetchRelatedVocabulary();
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "600" }}>
              Từ vựng liên quan
            </Text>
          </TouchableOpacity>
        )}

        {showVocabulary && (
          <>
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
                      borderBottomWidth:
                        index < relatedWords.length - 1 ? 1 : 0,
                      borderBottomColor: "#E0E0E0",
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        marginRight: 12,
                      }}
                    />
                    <Text style={{ color: "#555555", fontSize: 16 }}>
                      {word}
                    </Text>
                  </View>
                ))}
                <TouchableOpacity
                  style={{
                    marginTop: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: "#4CAF50",
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                  onPress={fetchRelatedVocabulary}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Tìm kiếm thêm
                  </Text>
                </TouchableOpacity>

                {/* Nút Đóng */}
                <TouchableOpacity
                  style={{
                    marginTop: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: "#FF5252",
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                  onPress={() => setShowVocabulary(false)}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Đóng
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ alignItems: "center", marginVertical: 16 }}>
                <Text
                  style={{
                    color: "#888888",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                >
                  Không có từ vựng liên quan.
                </Text>

                {/* Nút Đóng */}
                <TouchableOpacity
                  style={{
                    marginTop: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: "#FF5252",
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                  onPress={() => setShowVocabulary(false)}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Đóng
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

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
