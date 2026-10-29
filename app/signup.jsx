import { useState } from "react";
import { router } from "expo-router";
import { signUp } from "../services/auth";
import { showMessage, describeError } from "../utils/showMessage";
import { AuthScreen, AuthInput, AuthButton, AuthLink } from "../components/AuthUI";

export default function SignUpScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [signedUp, setSignedUp] = useState(false);
    const [inviteCode, setInviteCode] = useState("");

    async function handleSignUp() {
        if (!email.trim() || !password || !confirmPassword || !fullName.trim() || !inviteCode.trim()) {
            showMessage("Missing information", "Fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Password mismatch", "Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            await signUp(email.trim(), password, fullName.trim(), inviteCode.trim()); setSignedUp(true);
        } catch (error) {
            console.error("Sign up error:", error);
            showMessage("Sign up failed", describeError(error));
        } finally {
            setLoading(false);
        }
    }

    if (signedUp) {
        return (
            <AuthScreen
                title="Check your email"
                subtitle={`We sent a verification link to ${email.trim()}. Click it to verify your account (check your spam folder too), then log in.`}
            >
                <AuthButton label="Go to Log In" onPress={() => router.replace("/login")} />
            </AuthScreen>
        );
    }

    return (
        <AuthScreen title="Family Recipe Book" subtitle="Sign up to save recipes">
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
                autoComplete="new-password"
            />
            <AuthInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoComplete="new-password"
            />
            <AuthInput
                placeholder="Full Name"
                value={fullName}
                onChangeText={setFullName}
            />

            <AuthInput
                placeholder="Family invite code"
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="none"
            />

            <AuthButton
                label="Sign Up"
                loadingLabel="Signing up..."
                loading={loading}
                onPress={handleSignUp}
            />

            <AuthLink
                label="Already have an account? Log In"
                onPress={() => router.push("/login")}
            />
        </AuthScreen>
    );
}