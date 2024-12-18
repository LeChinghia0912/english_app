import { useEffect, useState } from "react";
import { Rank } from "../containers/Rank";
import UseFetch from "../hooks/useFetch";

export default function RankScreen({ navigation }) {
  const [ranks, setRanks] = useState([]);

  useEffect(() => {
    const fetchingData = async () => {
      const rank = await UseFetch("ranks");

      setRanks(rank?.data);
    };

    fetchingData();
  }, []);

  return <Rank initData={[ranks]} />;
}
