import React, { useState } from "react";
import { View, TouchableOpacity, Image, Text, Alert } from "react-native";
import * as ImagePicker from "react-native-image-picker";

const CameraPicker = ({ onImageSelected }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const openCamera = () => {
    ImagePicker.launchCamera(
      { mediaType: "photo", quality: 0.5 },
      (response) => {
        if (response.didCancel) {
          Alert.alert("Cancelled", "Pengambilan foto dibatalkan");
        } else if (response.errorCode) {
          Alert.alert("Error", response.errorMessage);
        } else {
          const uri = response.assets?.[0]?.uri;
          setSelectedImage(uri);
          onImageSelected(uri);
        }
      }
    );
  };

  const openGallery = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: "photo", quality: 0.5 },
      (response) => {
        if (response.didCancel) {
          Alert.alert("Cancelled", "Pemilihan gambar dibatalkan");
        } else if (response.errorCode) {
          Alert.alert("Error", response.errorMessage);
        } else {
          const uri = response.assets?.[0]?.uri;
          setSelectedImage(uri);
          onImageSelected(uri);
        }
      }
    );
  };

  return (
    <View>
      <TouchableOpacity onPress={openCamera}>
        <Text>Ambil Foto</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={openGallery}>
        <Text>Pilih dari Galeri</Text>
      </TouchableOpacity>
      {selectedImage && (
        <Image
          source={{ uri: selectedImage }}
          style={{ width: 100, height: 100 }}
        />
      )}
    </View>
  );
};

export default CameraPicker;
