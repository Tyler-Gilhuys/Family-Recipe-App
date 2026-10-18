import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import pb from "../pocketbaseConfig";

export default function Verify() {
    const { token } = useLocalSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState("loading");
    const [detail, setDetail] = useState("");

    useEffect(() => {
        console.log("Verify token from URL:", token);

        if (!token) {
            setDetail("No token found in the URL.");
            setStatus("error");
            return;
        }

        pb.collection("users")
            .confirmVerification(String(token))
            .then(() => setStatus("success"))
            .catch((err) => {
                console.error("Verification failed:", err.status, err.response, err);
                setDetail(`Status ${err.status}: ${err.response?.message ?? err.message}`);
                setStatus("error");
            });
    }, [token]);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
            {status === "loading" && <ActivityIndicator size="large" />}
            {status === "success" && <Text>Your email has been verified!</Text>}
            {status === "error" && <Text>This link is invalid or has expired.</Text>}
            {status === "error" && <Text>{detail}</Text>}

            {status !== "loading" && (
                <Pressable onPress={() => router.replace("/login")} style={{ marginTop: 16 }}>
                    <Text>Go to login</Text>
                </Pressable>
            )}
        </View>
    );
}