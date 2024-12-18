import { useRoute } from "@react-navigation/native";
import Lesson from "../containers/Study/Lesson/Lesson";
import { useEffect, useState } from "react";
import UseFetch from "../hooks/useFetch";
import { useAuth } from "../contexts/AuthContext";

export default function LessonScreen({ navigation }) {
  const route = useRoute();
  const { slug } = route.params;

  const { token } = useAuth();

  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchingData = async () => {
      const lesson = await UseFetch(slug, {
        headers: {
          Authorization: `Bearer ${token?.access_token}`,
        },
      });

      setLessons(lesson?.data);
    };

    fetchingData();
  }, []);

  return <Lesson chapter_slug={slug} initData={[lessons]} />;
}
