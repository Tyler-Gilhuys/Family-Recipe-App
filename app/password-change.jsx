import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { resetPassword } from "../services/auth";
import { showMessage, describeError } from "../utils/showMessage";

export default function PasswordChangeScreen() {
    const { token } = useLocalSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    async function handleChangePassword() {
        if (!token) {
            showMessage(
                "Invalid link",
                "No reset token found. Request a new reset email."
            );
            return;
        }

        if (!password || !confirmPassword) {
            showMessage("Missing information", "Enter and confirm your new password.");
            return;
        }

        if (password.length < 8) {
            showMessage("Password too short", "Use at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match", "Please enter the same password twice.");
            return;
        }

        try {
            setLoading(true);
            await resetPassword(String(token), password);
            setDone(true);
        } catch (error) {
            console.error("Reset password screen error:", error);
            showMessage("Reset failed", describeError(error));
        } finally {
            setLoading(false);
        }
    }

    if (done) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Password updated</Text>
                <Text style={styles.subtitle}>
                    Your password has been changed. Log in with your new password.
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
            <Text style={styles.title}>Gilhuys Family Recipe Book</Text>
            <Text style={styles.subtitle}>Choose a new password</Text>

            <TextInput
                style={styles.input}
                placeholder="New password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
            />

            <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleChangePassword}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Changing password..." : "Change Password"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text style={styles.link}>Back to log in</Text>
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
    link: {
        textAlign: "center",
        marginTop: 16,
        color: "#276749",
        fontWeight: "600",
    },
});