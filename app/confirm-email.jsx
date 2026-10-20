import { useState } from "react";
import { useRouter } from "expo-router";
import { confirmEmailChange } from "../services/auth";
import { useTokenParam } from "../hooks/useTokenParam";
import { describeError } from "../utils/showMessage";
import { AuthScreen, AuthInput, AuthButton, AuthError } from "../components/AuthUI";

export default function ConfirmEmail() {
    const token = useTokenParam();
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
            await confirmEmailChange(token, password);
            setStatus("success");
        } catch (e) {
            console.error("Email change confirm failed:", e.status, e.response);
            setDetail(describeError(e));
            setStatus("error");
        }
    }

    if (status === "success") {
        return (
            <AuthScreen
                title="Email updated"
                subtitle="Your email has been changed. Please log in with your new address."
            >
                <AuthButton label="Go to Log In" onPress={() => router.replace("/login")} />
            </AuthScreen>
        );
    }

    return (
        <AuthScreen
            title="Confirm email change"
            subtitle="Enter your current password to finish changing your email."
        >
            <AuthInput
                placeholder="Current password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="current-password"
            />

            {status === "error" && <AuthError>{detail}</AuthError>}

            <AuthButton
                label="Confirm"
                loadingLabel="Confirming..."
                loading={status === "loading"}
                onPress={handleConfirm}
            />
        </AuthScreen>
    );
}