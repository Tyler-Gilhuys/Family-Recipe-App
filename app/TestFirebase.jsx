import React, { useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig";

const TestFirebase = () => {
  const testFirestore = async () => {
    try {
      const docRef = await addDoc(collection(db, "recipes"), {
        title: "Test Recipe",
        createdAt: new Date(),
      });
      console.log("Firestore write successful, ID:", docRef.id);
      Alert.alert("Firestore Test", `Document ID: ${docRef.id}`);
    } catch (error) {
      console.error("Firestore write failed:", error);
      Alert.alert("Firestore Test Failed", error.message);
    }
  };

  const testStorage = async () => {
    try {
      const blob = new Blob(["Hello world"], { type: "text/plain" });
      const fileRef = ref(storage, "test.txt");

      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);
      console.log("Storage upload successful:", url);
      Alert.alert("Storage Test", `File URL: ${url}`);
    } catch (error) {
      console.error("Storage upload failed:", error);
      Alert.alert("Storage Test Failed", error.message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ marginBottom: 20, fontSize: 18 }}>
        Firebase Test Screen
      </Text>
      <Button title="Test Firestore" onPress={testFirestore} />
      <View style={{ height: 20 }} />
      <Button title="Test Storage" onPress={testStorage} />
    </View>
  );
};

export default TestFirebase;
