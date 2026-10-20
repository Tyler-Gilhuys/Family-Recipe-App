import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { confirmVerification } from "../services/auth";
import { useTokenParam } from "../hooks/useTokenParam";
import { AuthScreen, AuthButton } from "../components/AuthUI";

const MESSAGES = {
    loading: { title: "Verifying...", subtitle: "" },
    success: { title: "Email verified", subtitle: "Your email has been verified!" },
    error: {
        title: "Verification failed",
        subtitle: "This link is invalid or has expired.",
    },
};

export default function Verify() {
    const token = useTokenParam();
    const router = useRouter();
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        confirmVerification(token)
            .then(() => setStatus("success"))
            .catch((err) => {
                console.error("Verification failed:", err.status, err.response);
                setStatus("error");
            });
    }, [token]);

    const { title, subtitle } = MESSAGES[status];

    return (
        <AuthScreen title={title} subtitle={subtitle}>
            {status === "loading" ? (
                <ActivityIndicator size="large" />
            ) : (
                <AuthButton label="Go to Log In" onPress={() => router.replace("/login")} />
            )}
        </AuthScreen>
    );
}