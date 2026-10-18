import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { router } from "expo-router";
import pb from "../pocketbaseConfig";
import { showMessage, describeError } from "../utils/showMessage";

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleResetPassword() {
        if (!email.trim()) {
            showMessage("Missing information", "Enter your email.");
            return;
        }

        try {
            setLoading(true);
            await pb.collection("users").requestPasswordReset(email.trim());
            showMessage(
                "Reset link sent",
                "Check your email for a password reset link."
            );
            router.replace("/login");
        } catch (error) {
            console.error("Forgot password error:", error);
            showMessage(
                "Reset failed",
                describeError(error)
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gilhuys Family Recipe Book</Text>
            <Text style={styles.subtitle}>Reset Password</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Resetting password..." : "Reset Password"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("/signup")}>
                <Text>
                    "Don't have an account? Sign Up"
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
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 28,
        color: "#555",
    },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 14,
        marginBottom: 14,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#276749",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    verifyBox: {
        marginTop: 16,
        marginBottom: 16,
        padding: 14,
        borderRadius: 8,
        backgroundColor: "#fff8e1",
        borderWidth: 1,
        borderColor: "#f0d98c",
        alignItems: "center",
    },
    verifyText: {
        textAlign: "center",
        color: "#5c4a00",
        marginBottom: 10,
    },
    resendText: {
        textDecorationLine: "underline",
        color: "#276749",
        fontWeight: "600",
    },
    resendStatus: {
        marginTop: 8,
        color: "#555",
        textAlign: "center",
    },
});

