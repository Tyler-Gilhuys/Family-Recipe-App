import { useState } from "react";
import { router } from "expo-router";
import { resetPassword } from "../services/auth";
import { useTokenParam } from "../hooks/useTokenParam";
import { showMessage, describeError } from "../utils/showMessage";
import { AuthScreen, AuthInput, AuthButton, AuthLink } from "../components/AuthUI";

export default function PasswordChangeScreen() {
    const token = useTokenParam();
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
            await resetPassword(token, password);
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
            <AuthScreen
                title="Password updated"
                subtitle="Your password has been changed. Log in with your new password."
            >
                <AuthButton label="Go to Log In" onPress={() => router.replace("/login")} />
            </AuthScreen>
        );
    }

    return (
        <AuthScreen title="Gilhuys Family Recipe Book" subtitle="Choose a new password">
            <AuthInput
                placeholder="New password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
            />
            <AuthInput
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
            />

            <AuthButton
                label="Change Password"
                loadingLabel="Changing password..."
                loading={loading}
                onPress={handleChangePassword}
            />
            <AuthLink label="Back to log in" onPress={() => router.replace("/login")} />
        </AuthScreen>
    );
}