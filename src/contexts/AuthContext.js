import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // Trạng thái lưu thông tin người dùng

  // Hàm đăng nhập: Gọi API, lưu token và thông tin người dùng
  const login = async (email, password) => {
    try {
      const response = await fetch("https://english-be.vercel.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("@auth_token", JSON.stringify(data.tokens)); // Lưu token
        await AsyncStorage.setItem("@user_info", JSON.stringify(data.user)); // Lưu thông tin người dùng
        setToken(data.tokens);
        setUser(data.user);
        setIsLoggedIn(true);
        return { success: true };
      } else {
        Toast.show({
          type: "error",
          text1: "Tài khoản hoặc mật khẩu không chính xác",
        })
        return { success: false, message: data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login Error:", error);
      return { success: false, message: "An error occurred" };
    }
  };

  // Hàm đăng xuất: Xóa token và thông tin người dùng
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("@auth_token");
      await AsyncStorage.removeItem("@user_info");
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Lấy token và thông tin người dùng từ AsyncStorage
  const loadAuthStateFromStorage = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("@auth_token");
      const storedUser = await AsyncStorage.getItem("@user_info");

      if (storedToken && storedUser) {
        setToken(JSON.parse(storedToken));
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
    }
  };

  useEffect(() => {
    loadAuthStateFromStorage();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
