
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import pb, { authReady } from "../pocketbaseConfig";

export default function Index() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function redirect() {
      await authReady;

      if (!mounted) return;

      router.replace(
        pb.authStore.isValid ? "/recipe" : "/login"
      );

      setReady(true);
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
