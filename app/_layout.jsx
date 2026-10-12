import { useEffect, useState } from "react";
import { useColorScheme, View, ActivityIndicator, Pressable, Text, TextInput, useWindowDimensions, } from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../constants/Colors";
import pb, { authReady } from "../pocketbaseConfig";
import ThemedViews from "../components/ThemedViews";
import { RecipeSearchProvider, useRecipeSearch } from "../contexts/RecipeSearchContext";

const RecipeSearchHeader = ({ theme }) => {
  const { searchQuery, setSearchQuery } = useRecipeSearch();
  const { width } = useWindowDimensions();

  // Reserve room on both sides for the title (left) and the nav links (right).
  const sideReserve = 280;
  const searchWidth = Math.max(160, Math.min(420, width - sideReserve * 2));

  return (
    <View
      style={{
        width: searchWidth,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search recipes..."
        placeholderTextColor={theme.iconColor}
        returnKeyType="search"
        accessibilityLabel="Search recipes"
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: theme.background,
          color: theme.text,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          fontSize: 15,
          borderWidth: 1,
          borderColor: theme.iconColor,
        }}
      />

      {searchQuery.length > 0 && (
        <Pressable
          onPress={() => setSearchQuery("")}
          accessibilityRole="button"
          accessibilityLabel="Clear recipe search"
          style={{ padding: 8 }}
        >
          <Text style={{ color: theme.title }}>✕</Text>
        </Pressable>
      )}
    </View>

  );
};


const RootLayout = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const { width } = useWindowDimensions();
  const isNarrow = width < 700;

  // Load the saved session and listen for login/logout changes.
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      await authReady;

      if (mounted) {
        setAuthenticated(pb.authStore.isValid);
        setReady(true);
      }
    }

    initializeAuth();

    const unsubscribe = pb.authStore.onChange(() => {
      setAuthenticated(pb.authStore.isValid);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Redirect users who try to access protected screens.

  useEffect(() => {
    if (!ready) return;

    const isPublicRoute =
      pathname === "/login" ||
      pathname === "/signup";

    if (!authenticated && !isPublicRoute) {
      if (pathname !== "/login") {
        router.replace("/login");
      }
      return;
    }

    if (authenticated && isPublicRoute) {
      if (pathname !== "/recipe") {
        router.replace("/recipe");
      }
    }
  }, [ready, authenticated, pathname, router]);


  // Don't show app screens until the saved session is checked.
  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <RecipeSearchProvider>
      <ThemedViews>
        <StatusBar style="auto" />

        <Stack
          screenOptions={{
            contentStyle: {
              backgroundColor: theme.background,
            },
            headerStyle: {
              backgroundColor: theme.navBackground,
            },
            headerTintColor: theme.title,
            headerTitleStyle: {
              fontSize: 18,
            },
            headerRightContainerStyle: {
              paddingRight: 12,
            },
            headerLeft: () => null,
            headerRight: () => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: isNarrow ? 10 : 16,
                  marginRight: 8,
                }}
              >
                <Pressable onPress={() => router.push("recipe")}>
                  <Text style={{ color: theme.title, fontWeight: "600" }}>
                    Home
                  </Text>
                </Pressable>

                <Pressable onPress={() => router.push("/addRecipe")}>
                  <Text style={{ color: theme.title, fontWeight: "600" }}>
                    Add Recipe
                  </Text>
                </Pressable>

                <Pressable onPress={() => router.push("/profile")}>
                  <Text style={{ color: theme.title, fontWeight: "600" }}>
                    Profile
                  </Text>
                </Pressable>
              </View>
            ),
          }}
        >
          <Stack.Screen
            name="index"
            options={{ title: "Home", headerShown: false }}
          />

          <Stack.Screen
            name="login"
            options={{ title: "Login", headerShown: false }}
          />

          <Stack.Screen
            name="signUp"
            options={{ title: "Sign Up", headerShown: false }}
          />

          <Stack.Screen
            name="recipe/index"
            options={{
              title: "Family Recipes",
              headerBackVisible: true,

              // Title back in the top left
              headerLeft: () => (
                <Text
                  style={{
                    color: theme.title,
                    fontSize: 18,
                    fontWeight: "600",
                    marginLeft: 16,
                  }}
                >
                  Family Recipes
                </Text>
              ),

              headerTitle: isNarrow
                ? () => null
                : () => <RecipeSearchHeader theme={theme} />,

              headerTitleContainerStyle: {
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "box-none", // lets taps pass through to Home/Add/Profile
              },
            }}
          />

          <Stack.Screen
            name="profile"
            options={{ title: "Profile", headerBackVisible: true }}
          />
          <Stack.Screen
            name="recipe/details/[id]"
            options={{ title: "Recipe Details", headerBackVisible: true }}
          />

          <Stack.Screen
            name="recipe/[category]"
            options={{ title: "Category", headerBackVisible: true }}
          />

          <Stack.Screen
            name="addRecipe"
            options={{ title: "Add Recipe", headerBackVisible: true }}
          />

          <Stack.Screen
            name="recipe/edit/[id]"
            options={{ title: "Edit Recipe", headerBackVisible: true }}
          />

          <Stack.Screen
            name="profile/editprofile"
            options={{ title: "Edit Profile", headerBackVisible: true }}
          />
        </Stack>
      </ThemedViews>
    </RecipeSearchProvider>
  );
};

export default RootLayout;
