import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { router } from "expo-router";
import { signUp } from "../services/auth";
import { showMessage, describeError } from "../utils/showMessage";

export default function SignUpScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [signedUp, setSignedUp] = useState(false);

    async function handleSignUp() {
        if (!email.trim() || !password || !confirmPassword || !fullName.trim()) {
            showMessage("Missing information", "Fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Password mismatch", "Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            await signUp(email.trim(), password, fullName.trim());
            setSignedUp(true);
        } catch (error) {
            console.error("Sign up error:", error);
            showMessage(
                "Sign up failed",
                describeError(error)
            );
        } finally {
            setLoading(false);
        }
    }

    if (signedUp) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Check your email</Text>
                <Text style={styles.subtitle}>
                    We sent a verification link to {email.trim()}. Click it to verify
                    your account (check your spam folder too), then log in.
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
            <Text style={styles.title}>Family Recipe Book</Text>
            <Text style={styles.subtitle}>Sign up to save recipes</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
            />

            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
            />

            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
            />

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
            >
                <Text style={styles.buttonText}>
                    {loading ? "Signing up..." : "Sign Up"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={{ textAlign: "center", marginTop: 16 }}>
                    Already have an account? Log In
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
});

