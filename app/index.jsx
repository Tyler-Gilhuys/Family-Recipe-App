import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  StatusBar,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebaseConfig";

const Home = () => {
  const [bgImage, setBgImage] = useState(null);

  useEffect(() => {
    const loadBackground = async () => {
      try {
        const imageRef = ref(storage, "Assets/homescreen.jpeg");
        const url = await getDownloadURL(imageRef);
        setBgImage({ uri: url });
      } catch (error) {
        console.error("Error loading background image:", error);
      }
    };

    loadBackground();
  }, []);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        {bgImage && (
          <ImageBackground
            source={bgImage}
            resizeMode="cover"
            style={styles.image}
          >
            <View>
              <Text style={styles.title}>Gilhuys Family Recipe Book</Text>

              <Link href="/recipe" style={styles.link}>
                Recipe Page
              </Link>
              <Link href="/addRecipe" style={styles.link}>
                Add Recipe
              </Link>
              <Link href="/TestFirebase" style={styles.link}>
                Test Firebase
              </Link>
            </View>
          </ImageBackground>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 30,
    textAlign: "center",
    color: "white",
    fontFamily: "Cochin",
  },
  link: {
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
    marginVertical: 10,
    color: "black",
  },
  image: {
    flex: 1,
    justifyContent: "center",
  },
});
