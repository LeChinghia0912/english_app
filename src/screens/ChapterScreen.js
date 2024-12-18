import { useEffect, useState } from "react";
import { Chapter } from "../containers/Study/Chapter";
import { useAuth } from "../contexts/AuthContext";
import UseFetch from "../hooks/useFetch";

export default function ChapterScreen({ navigation }) {
  const { token } = useAuth();

  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    const fetchingData = async () => {
      const chapter = await UseFetch("chapters", {
        headers: {
          Authorization: `Bearer ${token?.access_token}`,
        },
      });

      setChapters(chapter?.data);
    };

    fetchingData();
  }, []);

  return <Chapter initData={[chapters]} />;
}
