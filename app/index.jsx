import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  StatusBar,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const image = {
  uri: "https://images.pexels.com/photos/1435895/pexels-photo-1435895.jpeg",
};

const Home = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <ImageBackground source={image} resizeMode="cover" style={styles.image}>
          <View>
            <Text style={styles.title}>Gilhuys Family Recipe Book</Text>

            <Link href="/recipe" style={styles.link}>
              Recipe Page
            </Link>
            <Link href="/addRecipe" style={styles.link}>
              Add Recipe
            </Link>
          </View>
        </ImageBackground>
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
