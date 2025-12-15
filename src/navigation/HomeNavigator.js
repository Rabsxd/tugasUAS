import React, { useEffect } from "react";
import { BackHandler } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Application } from "expo-application";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/Home/HomeScreen";
import AddNoteScreen from "../screens/AddNote/AddNoteScreen";
import AboutScreen from "../screens/About/AboutScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack untuk AddNoteScreen
const AddNoteStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AddNote" component={AddNoteScreen} />
  </Stack.Navigator>
);

const HomeNavigator = () => {
  useEffect(() => {
    const backAction = () => {
      // Exit app langsung
      Application.exitApp();
      return true; // Mencegah default behavior (back ke screen sebelumnya)
    };

    // Tambahkan listener
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Cleanup listener saat komponen unmount
    return () => subscription?.remove();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007BFF",
        tabBarInactiveTintColor: "#888",
        // Atur icon di sini
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "document-text" : "document-text-outline";
          } else if (route.name === "AddNoteStack") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "About") {
            iconName = focused
              ? "information-circle"
              : "information-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Catatan" }}
      />
      <Tab.Screen
        name="AddNoteStack"
        component={AddNoteStack}
        options={{ title: "Tambah" }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{ title: "Tentang" }}
      />
    </Tab.Navigator>
  );
};

export default HomeNavigator;
