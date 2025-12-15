import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const NoteDetailScreen = ({ route }) => {
  const { note } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{note.title}</Text>
      <Text style={styles.date}>
        {new Date(note.date).toLocaleDateString()}
      </Text>
      {note.imageUri && (
        <Image source={{ uri: note.imageUri }} style={styles.image} />
      )}
      <Text style={styles.content}>{note.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default NoteDetailScreen;
