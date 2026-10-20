
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { authReady } from "../pocketbaseConfig";
import { isVerifiedUser } from "../services/auth";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function redirect() {
      await authReady;

      if (!mounted) return;

      router.replace(
        isVerifiedUser() ? "/recipe" : "/login"
      );
    }

    redirect();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
