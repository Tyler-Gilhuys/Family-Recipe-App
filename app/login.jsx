import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { login, resendVerification } from "../services/auth";
import { showMessage, describeError } from "../utils/showMessage";
import { AuthScreen, AuthInput, AuthButton, AuthLink } from "../components/AuthUI";

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
      showMessage("Login failed", describeError(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    try {
      await resendVerification(email.trim());
      setResendStatus("Verification email sent.");
    } catch (e) {
      setResendStatus("Could not send: " + describeError(e));
    }
  }

  return (
    <AuthScreen
      title="Gilhuys Family Recipe Book"
      subtitle="Log in to save recipes"
    >
      <AuthInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />

      <AuthInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
      />

      <AuthButton
        label="Log In"
        loadingLabel="Logging in..."
        loading={loading}
        onPress={handleLogin}
      />

      <AuthLink
        label="Don't have an account? Sign Up"
        onPress={() => router.push("/signup")}
      />
      <AuthLink
        label="Forgot your password?"
        onPress={() => router.push("/forgot-password")}
      />

      {needsVerification && (
        <View style={styles.verifyBox}>
          <Text style={styles.verifyText}>
            Please verify your email to view recipes. Check your inbox (and
            spam) for the verification link, then log in again.
          </Text>

          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendText}>Resend verification email</Text>
          </TouchableOpacity>

          {resendStatus ? (
            <Text style={styles.resendStatus}>{resendStatus}</Text>
          ) : null}
        </View>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
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
  verifyText: { textAlign: "center", color: "#5c4a00", marginBottom: 10 },
  resendText: {
    textDecorationLine: "underline",
    color: "#276749",
    fontWeight: "600",
  },
  resendStatus: { marginTop: 8, color: "#555", textAlign: "center" },
});