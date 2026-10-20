import { useState } from "react";
import { router } from "expo-router";
import { requestPasswordReset } from "../services/auth";
import { showMessage, describeError } from "../utils/showMessage";
import { AuthScreen, AuthInput, AuthButton, AuthLink } from "../components/AuthUI";

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
            await requestPasswordReset(email.trim());
            showMessage(
                "Reset link sent",
                "Check your email for a password reset link."
            );
            router.replace("/login");
        } catch (error) {
            console.error("Forgot password error:", error);
            showMessage("Reset failed", describeError(error));
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthScreen title="Gilhuys Family Recipe Book" subtitle="Reset Password">
            <AuthInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
            />

            <AuthButton
                label="Reset Password"
                loadingLabel="Resetting password..."
                loading={loading}
                onPress={handleResetPassword}
            />

            <AuthLink
                label="Don't have an account? Sign Up"
                onPress={() => router.replace("/signup")}
            />
            <AuthLink label="Back to log in" onPress={() => router.replace("/login")} />
        </AuthScreen>
    );
}