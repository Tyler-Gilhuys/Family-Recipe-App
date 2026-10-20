
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";
import pb from "../../../pocketbaseConfig";
import { useAppTheme } from "../../../components/ThemedViews";
import { Colors } from "../../../constants/Colors";
import { deleteRecipe, getComments, addComment, deleteComment } from "../../../services/recipes";
import { showMessage, describeError } from "../../../utils/showMessage";

export default function RecipeDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const {
    theme,
    width: windowWidth,
  } = useAppTheme();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const recipeId = Array.isArray(id) ? id[0] : id;

  // Match the card contrast used on the category page.
  const cardBackground =
    theme === Colors.dark
      ? Colors.light.uiBackground
      : Colors.dark.uiBackground;

  const cardBorder =
    theme === Colors.dark
      ? Colors.light.navBackground
      : Colors.dark.navBackground;

  const cardText =
    theme === Colors.dark
      ? Colors.light.text
      : Colors.dark.text;

  const isAuthor = recipe?.author === pb.authStore.record?.id;

  const contentWidth = Math.min(windowWidth - 32, 760);
  const imageWidth = Math.min(contentWidth, 600);
  const imageHeight = Math.min(imageWidth * 0.62, 380);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      const fetchRecipe = async () => {
        setLoading(true);

        try {
          if (!recipeId || !pb.authStore.isValid) {
            if (active) setRecipe(null);
            return;
          }

          const record = await pb.collection("recipes").getOne(recipeId, {
            expand: "author",
          });

          if (active) setRecipe(record);
        } catch (error) {
          console.error("Error fetching PocketBase recipe:", error);
          if (active) setRecipe(null);
        } finally {
          if (active) setLoading(false);
        }
      };

      fetchRecipe();

      const loadComments = async () => {
        try {
          if (!recipeId || !pb.authStore.isValid) return;
          const list = await getComments(recipeId);
          if (active) setComments(list);
        } catch (error) {
          console.error("Error loading comments:", error);
        }
      };

      loadComments();

      return () => {
        active = false;
      };
    }, [recipeId])
  );

  const handleDelete = () => {
    const performDelete = async () => {
      if (deleting) return;

      setDeleting(true);

      try {
        await deleteRecipe(recipeId);
        router.replace("/recipe");
      } catch (error) {
        console.error("Error deleting recipe:", error);

        const message =
          error?.message || "Unable to delete this recipe.";

        if (typeof window !== "undefined" && window.alert) {
          window.alert(`Delete failed: ${message}`);
        } else {
          Alert.alert("Delete failed", message);
        }

        setDeleting(false);
      }
    };

    if (typeof window !== "undefined" && window.confirm) {
      if (
        window.confirm(
          "Are you sure you want to permanently delete this recipe?"
        )
      ) {
        performDelete();
      }

      return;
    }

    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to permanently delete this recipe?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: performDelete,
        },
      ]
    );
  };

  async function handleAddComment() {
    if (!newComment.trim()) return;

    try {
      setPosting(true);
      await addComment(recipeId, newComment);
      setNewComment("");
      setComments(await getComments(recipeId));
    } catch (error) {
      showMessage("Could not post comment", describeError(error));
    } finally {
      setPosting(false);
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      showMessage("Could not delete comment", describeError(error));
    }
  }

  if (loading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.title} />
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading recipe...
        </Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: theme.background },
        ]}
      >
        <Text style={[styles.notFound, { color: theme.title }]}>
          Recipe not found
        </Text>

        <Pressable
          onPress={() => router.replace("/recipe")}
          style={[styles.secondaryButton, { borderColor: cardBorder }]}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.title }]}>
            Back to Recipes
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme.background },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.content, { width: contentWidth }]}>
          {recipe.image ? (
            <Image
              source={{ uri: pb.files.getURL(recipe, recipe.image) }}
              style={[
                styles.image,
                {
                  width: imageWidth,
                  height: imageHeight,
                },
              ]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                {
                  width: imageWidth,
                  height: Math.min(imageWidth * 0.4, 260),
                },
              ]}
            >
              <Text style={styles.placeholderIcon}>🍽️</Text>
              <Text style={styles.placeholderText}>No photo available</Text>
            </View>
          )}

          <Text style={[styles.title, { color: theme.text }]}>
            {recipe.title}
          </Text>

          <Text style={{ color: theme.text, textAlign: "center", marginTop: -12, marginBottom: 20 }}>
            By {recipe.expand?.author?.name || "Unknown Author"}
          </Text>

          {recipe.comments ? (
            <View
              style={[
                styles.descriptionCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: cardBorder,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: theme.recipeTitle }]}>
                Author Comments
              </Text>

              <Text style={[styles.description, { color: cardText }]}>
                {recipe.comments}
              </Text>
            </View>
          ) : null}

          {recipe.ingredients?.length > 0 && (
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: cardBorder,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: theme.recipeTitle }]}>
                Ingredients
              </Text>

              {recipe.ingredients.map((item, index) => (
                <View key={index} style={styles.listRow}>
                  <Text style={[styles.bullet, { color: theme.recipeTitle }]}>
                    {"\u2022"}
                  </Text>
                  <Text style={[styles.bodyText, { color: cardText }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {recipe.steps?.length > 0 && (
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: cardBackground,
                  borderColor: cardBorder,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: theme.recipeTitle }]}>
                Instructions
              </Text>

              {recipe.steps.map((step, index) => (
                <View key={index} style={styles.stepRow}>
                  <View
                    style={[
                      styles.stepNumber,
                      { backgroundColor: theme.numericalBackground },
                    ]}
                  >
                    <Text style={[styles.stepNumberText, { color: theme.numericalText }]}>{index + 1}</Text>
                  </View>

                  <Text style={[styles.bodyText, { color: cardText }]}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View
            style={[
              styles.sectionCard,
              { backgroundColor: cardBackground, borderColor: cardBorder },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.recipeTitle }]}>
              Suggestions & Tweaks
            </Text>

            {comments.length === 0 && (
              <Text style={[styles.bodyText, { color: cardText, marginBottom: 12 }]}>
                No suggestions yet. Be the first to add one!
              </Text>
            )}

            {comments.map((c) => {
              const canDelete =
                c.author === pb.authStore.record?.id || isAuthor;

              return (
                <View key={c.id} style={{ marginBottom: 16 }}>
                  <Text style={{ color: cardText, fontWeight: "bold", marginBottom: 4 }}>
                    {c.expand?.author?.name || "Family member"}
                  </Text>
                  <Text style={[styles.bodyText, { color: cardText }]}>{c.text}</Text>

                  {canDelete && (
                    <Pressable onPress={() => handleDeleteComment(c.id)}>
                      <Text style={{ color: cardText, opacity: 0.7, marginTop: 4, fontSize: 13 }}>
                        Delete
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })}

            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Suggest a tweak or improvement..."
              placeholderTextColor="#888"
              multiline
              maxLength={1000}
              editable={!posting}
              style={{
                borderWidth: 1,
                borderColor: cardBorder,
                borderRadius: 10,
                padding: 12,
                minHeight: 70,
                color: cardText,
                marginBottom: 10,
              }}
            />

            <Pressable
              onPress={handleAddComment}
              disabled={posting}
              style={({ pressed }) => [
                styles.actionButton,
                { backgroundColor: theme.background, opacity: pressed || posting ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.actionButtonText, { color: theme.text }]}>
                {posting ? "Posting..." : "Post Suggestion"}
              </Text>
            </Pressable>
          </View>

          {isAuthor && (
            <View style={styles.actions}>
              <Pressable
                onPress={() => router.push(`/recipe/edit/${recipeId}`)}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: cardBackground },
                  { opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={[styles.actionButtonText, { color: cardText }]}>
                  Edit Recipe
                </Text>
              </Pressable>

              <Pressable
                onPress={handleDelete}
                disabled={deleting}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.deleteButton,
                  { opacity: pressed || deleting ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.actionButtonText}>
                  {deleting ? "Deleting..." : "Delete Recipe"}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  content: {
    maxWidth: 760,
    alignSelf: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  notFound: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  image: {
    alignSelf: "center",
    borderRadius: 16,
    marginBottom: 22,
    backgroundColor: "#d6d5e1",
  },
  imagePlaceholder: {
    alignSelf: "center",
    borderRadius: 16,
    marginBottom: 22,
    backgroundColor: "#d6d5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 42,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: "#625f72",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 20,
    marginBottom: 18,
  },
  descriptionCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },
  description: {
    fontSize: 16,
    lineHeight: 25,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 16,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bullet: {
    fontSize: 22,
    lineHeight: 25,
    marginRight: 10,
  },
  bodyText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 25,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
    gap: 12,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumberText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  deleteButton: {
    backgroundColor: "#6d0216",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
    color: "#d4d4d4",
  },
  secondaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
