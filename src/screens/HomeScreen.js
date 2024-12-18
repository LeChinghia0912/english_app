import { useEffect, useState } from "react";
import { Home } from "../containers/Home";
import UseFetch from "../hooks/useFetch";
import { useAuth } from "../contexts/AuthContext";

export default function HomeScreen({ navigation }) {
  const { token } = useAuth();

  const [chapters, setChapters] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchingData = async () => {
      const chapter = await UseFetch("chapters?limit=5", {
        headers: {
          Authorization: `Bearer ${token?.access_token}`,
        },
      });

      const feedback = await UseFetch("feedbacks")

      setChapters(chapter?.data);
      setFeedbacks(feedback?.data);
    };

    fetchingData();
  }, []);

  return <Home initData={[chapters, feedbacks]} />;
}
