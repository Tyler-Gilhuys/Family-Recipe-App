import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { confirmEmailChange } from "../services/auth";
import { describeError } from "../utils/showMessage";

export default function ConfirmEmail() {
    const { token } = useLocalSearchParams();
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("form"); // form | loading | success | error
    const [detail, setDetail] = useState("");

    async function handleConfirm() {
        if (!token) {
            setDetail("No token found in the URL.");
            setStatus("error");
            return;
        }
        if (!password) {
            setDetail("Enter your current password.");
            setStatus("error");
            return;
        }

        try {
            setStatus("loading");
            await confirmEmailChange(String(token), password);
            setStatus("success");
        } catch (e) {
            console.error("Email change confirm failed:", e.status, e.response);
            setDetail(describeError(e));
            setStatus("error");
        }
    }

    if (status === "success") {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Email updated</Text>
                <Text style={styles.text}>
                    Your email has been changed. Please log in with your new address.
                </Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.replace("/login")}
                >
                    <Text style={styles.buttonText}>Go to Log In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Confirm email change</Text>
            <Text style={styles.text}>
                Enter your current password to finish changing your email.
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Current password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="current-password"
            />

            {status === "error" && <Text style={styles.error}>{detail}</Text>}

            <TouchableOpacity
                style={[styles.button, status === "loading" && { opacity: 0.6 }]}
                onPress={handleConfirm}
                disabled={status === "loading"}
            >
                <Text style={styles.buttonText}>
                    {status === "loading" ? "Confirming..." : "Confirm"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#f5f5f5"
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8
    },
    text: {
        textAlign: "center",
        color: "#555",
        marginBottom: 20
    },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 14,
        marginBottom: 14,
        fontSize: 16
    },
    error: {
        color: "#b00020",
        textAlign: "center",
        marginBottom: 12
    },
    button: {
        backgroundColor: "#276749",
        padding: 15,
        borderRadius: 8,
        alignItems: "center"
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },
});