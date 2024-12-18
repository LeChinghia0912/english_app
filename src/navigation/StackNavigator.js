import { twMerge } from "tailwind-merge";
import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../contexts/AuthContext";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import { ProfileScreen, HomeScreen, LoginScreen } from "../screens";
import RankScreen from "../screens/RankScreen";
import ChapterScreen from "../screens/ChapterScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import SplashScreen from "../screens/SplashScreen";
import { Feedback } from "../containers/Feedback";
import LessonScreen from "../screens/LessonScreen";
import QuestionScreen from "../screens/QuestionScreen";
import CongratulationScreen from "../screens/Congratulation";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab Navigator: chứa các màn hình chính
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: "#ffffff",
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
      },
    }}
  >
    <Tab.Screen
      name="Trang Chủ"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View className="items-center justify-center">
            <Text
              className={twMerge(
                "text-sm",
                focused ? "text-blue-500" : "text-gray-500"
              )}
            >
              🏠
            </Text>
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Học Tập"
      component={ChapterScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View className="items-center justify-center">
            <Text
              className={twMerge(
                "text-sm",
                focused ? "text-blue-500" : "text-gray-500"
              )}
            >
              📖
            </Text>
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Feedback"
      component={Feedback}
      options={{
        tabBarIcon: ({ focused }) => (
          <View className="items-center justify-center">
            <Text
              className={twMerge(
                "text-sm",
                focused ? "text-blue-500" : "text-gray-500"
              )}
            >
              💬
            </Text>
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Xếp Hạng"
      component={RankScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View className="items-center justify-center">
            <Text
              className={twMerge(
                "text-sm",
                focused ? "text-blue-500" : "text-gray-500"
              )}
            >
              🏆
            </Text>
          </View>
        ),
      }}
    />
    <Tab.Screen
      name="Cá Nhân"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ focused }) => (
          <View className="items-center justify-center">
            <Text
              className={twMerge(
                "text-sm",
                focused ? "text-blue-500" : "text-gray-500"
              )}
            >
              👤
            </Text>
          </View>
        ),
      }}
    />
  </Tab.Navigator>
);

// Stack Navigator: quyết định flow chính
export default function StackNavigator() {
  const { isLoggedIn } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Splash Screen */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        {/* Nếu chưa đăng nhập */}
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen}  />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Nếu đã đăng nhập
          <>
            <Stack.Screen name="Lesson" component={LessonScreen} />
            <Stack.Screen name="Question" component={QuestionScreen} />
            <Stack.Screen name="Congratulation" component={CongratulationScreen} />
            <Stack.Screen name="MainTabs" component={MainTabs} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
