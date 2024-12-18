import "./global.css";
import { AuthProvider } from "./src/contexts/AuthContext";
import Toast from 'react-native-toast-message';
import StackNavigator from "./src/navigation/StackNavigator";

export default function App() {
  return (
    <AuthProvider>
      <StackNavigator />
      <Toast />
    </AuthProvider>
  );
}
