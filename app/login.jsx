import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { login, resendVerification } from "../services/auth";
import { showMessage, describeError } from "../utils/showMessage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState("");

  async function handleLogin() {
    if (!email.trim() || !password) {
      showMessage("Missing information", "Enter your email and password.");
      return;
    }

    setNeedsVerification(false);
    setResendStatus("");

    try {
      setLoading(true);
      await login(email.trim(), password);

    } catch (error) {
      if (error?.code === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true);
        return;
      }
      console.error("Login screen error:", error);
      showMessage(
        "Login failed",
        describeError(error)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gilhuys Family Recipe Book</Text>
      <Text style={styles.subtitle}>Log in to save recipes</Text>

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
        autoComplete="current-password"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Log In"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")} style={styles.link}>
        <Text style={styles.linkText}>
          Don&apos;t have an account? Sign Up
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/forgot-password")} style={styles.link}>
        <Text style={styles.linkText}>
          Forgot your password?
        </Text>
      </TouchableOpacity>

      {needsVerification && (
        <View style={styles.verifyBox}>
          <Text style={styles.verifyText}>
            Please verify your email to view recipes. Check your inbox (and spam)
            for the verification link, then log in again.
          </Text>

          <TouchableOpacity
            onPress={async () => {
              try {
                await resendVerification(email.trim());
                setResendStatus("Verification email sent.");
              } catch (e) {
                setResendStatus("Could not send: " + describeError(e));
              }
            }}
          >
            <Text style={styles.resendText}>Resend verification email</Text>
          </TouchableOpacity>

          {resendStatus ? (
            <Text style={styles.resendStatus}>{resendStatus}</Text>
          ) : null}
        </View>
      )}
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
  link: {
    marginTop: 14,
    alignItems: "center",
  },
  linkText: {
    color: "#276749",
    fontWeight: "600",
  },
});

