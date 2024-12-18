import { useRoute } from "@react-navigation/native";
import Question from "../containers/Study/Question/Question";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import UseFetch from "../hooks/useFetch";
import { Text } from "react-native";

const QuestionScreen = () => {
  const route = useRoute();
  const param = route.params;

  const { token } = useAuth();

  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchingData = async () => {
      const question = await UseFetch(`${param?.chapter_slug}/${param?.lesson_slug}?lesson_id=${param?.lesson_id}`, {
        headers: {
          Authorization: `Bearer ${token?.access_token}`,
        },
      });
      console.log("🚀 ~ fetchingData ~ question:", question)

      setQuestions(question?.data);
    };

    fetchingData();
  }, []);

  return <Question param={param} initData={[questions]} />;
};

export default QuestionScreen;
