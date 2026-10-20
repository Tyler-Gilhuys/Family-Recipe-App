import * as ImagePicker from "expo-image-picker";

export async function pickImage() {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.7,
  });

  if (!result.canceled) {
    return result.assets[0].uri;
  }
  return null;
}
