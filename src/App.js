import React from "react";
import AppNavigator from "./navigation/AppNavigator";

console.log("App.js is running"); // Tambahkan ini

export default function App() {
  console.log("App component rendered"); // Tambahkan ini
  return <AppNavigator />;
}
