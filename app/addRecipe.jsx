import { StyleSheet, Text, View, TextInput, Button, Image } from "react-native";
import React, { useState } from "react";
import ThemedViews from "../components/ThemedViews";
import * as ImagePicker from "expo-image-picker";

const [imageUri, setImageUri] = useState(null);

const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled) {
    setImageUri(result.assets[0].uri);
  }
};

const addRecipe = () => {
  return (
    <ThemedViews>
      <Button title="Pick a photo of the recipe" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      <TextInput placeholder="Recipe Name" style={styles.input} />
    </ThemedViews>
  );
};

export default addRecipe;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    margin: 12,
    paddingLeft: 8,
    borderRadius: 5,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
    alignSelf: "center",
  },
});
