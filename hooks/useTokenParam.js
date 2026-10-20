import { useLocalSearchParams } from "expo-router";

// Reads ?token=... from the URL as a plain string (or undefined).
export function useTokenParam() {
    const { token } = useLocalSearchParams();
    return Array.isArray(token) ? token[0] : token;
}