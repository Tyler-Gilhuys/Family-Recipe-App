import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useLocalSearchParams,
  useRouter,
  useFocusEffect,
} from "expo-router";
import pb from "../../../pocketbaseConfig";
import { useAppTheme } from "../../../components/ThemedViews";
import { Colors } from "../../../constants/Colors";
import {
  deleteRecipe,
  getComments,
  addComment,
  deleteComment,
} from "../../../services/recipes";
import {
  showMessage,
  describeError,
  confirmAction,
} from "../../../utils/showMessage";
import { printRecipes } from "../../../utils/recipePrint";

const SERIF = Platform.select({
  web: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

export default function RecipeDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, width: windowWidth, card } = useAppTheme();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const recipeId = Array.isArray(id) ? id[0] : id;
  const isAuthor = recipe?.author === pb.authStore.record?.id;

  const contentWidth = Math.min(windowWidth - 32, 700);
  const imageHeight = Math.min(contentWidth * 0.56, 360);

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

  const handleDelete = async () => {
    if (deleting) return;

    const confirmed = await confirmAction(
      "Delete Recipe",
      "Are you sure you want to permanently delete this recipe?"
    );
    if (!confirmed) return;

    setDeleting(true);

    try {
      await deleteRecipe(recipeId);
      router.replace("/recipe");
    } catch (error) {
      console.error("Error deleting recipe:", error);
      showMessage("Delete failed", describeError(error));
      setDeleting(false);
    }
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

  const handleSavePdf = () => {
    try {
      printRecipes(
        [
          {
            title: recipe.title,
            authorName: recipe.expand?.author?.name,
            imageUrl: recipe.image
              ? pb.files.getURL(recipe, recipe.image)
              : null,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            comments: recipe.comments,
          },
        ],
        { title: recipe.title }
      );
    } catch (error) {
      showMessage("Could not create PDF", describeError(error));
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Ionicons name="search-outline" size={32} color={card.muted} />
        <Text
          style={[styles.notFound, { color: theme.text, fontFamily: SERIF }]}
        >
          Recipe not found
        </Text>

        <Pressable
          onPress={() => router.replace("/recipe")}
          style={[styles.outlineButton, { borderColor: card.accent }]}
        >
          <Text style={[styles.outlineButtonText, { color: card.accent }]}>
            Back to Recipes
          </Text>
        </Pressable>
      </View>
    );
  }

  const authorName = recipe.expand?.author?.name;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
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
                { width: contentWidth, height: imageHeight },
              ]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                {
                  width: contentWidth,
                  height: Math.min(contentWidth * 0.4, 220),
                  borderColor: card.border,
                  backgroundColor: card.background,
                },
              ]}
            >
              <Ionicons name="restaurant-outline" size={30} color={card.muted} />
              <Text style={[styles.placeholderText, { color: card.muted }]}>
                No photo yet
              </Text>
            </View>
          )}

          <View style={[styles.header, { borderBottomColor: card.border }]}>
            <Text
              style={[styles.title, { color: theme.text, fontFamily: SERIF }]}
            >
              {recipe.title}
            </Text>

            {authorName ? (
              <Text
                style={[
                  styles.byline,
                  { color: card.muted, fontFamily: SERIF },
                ]}
              >
                From the kitchen of {authorName}
              </Text>
            ) : null}
          </View>

          {recipe.comments ? (
            <View style={[styles.note, { borderLeftColor: card.accent }]}>
              <Text style={[styles.noteLabel, { color: card.muted }]}>
                Author&apos;s note
              </Text>
              <Text
                style={[
                  styles.noteText,
                  { color: theme.text, fontFamily: SERIF },
                ]}
              >
                {recipe.comments}
              </Text>
            </View>
          ) : null}

          {recipe.ingredients?.length > 0 && (
            <View
              style={[
                styles.card,
                { backgroundColor: card.background, borderColor: card.border },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, fontFamily: SERIF },
                ]}
              >
                Ingredients
              </Text>

              {recipe.ingredients.map((item, index) => (
                <View key={index} style={styles.listRow}>
                  <View style={[styles.dot, { backgroundColor: card.accent }]} />
                  <Text style={[styles.bodyText, { color: theme.text }]}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {recipe.steps?.length > 0 && (
            <View
              style={[
                styles.card,
                { backgroundColor: card.background, borderColor: card.border },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.text, fontFamily: SERIF },
                ]}
              >
                Instructions
              </Text>

              {recipe.steps.map((stepText, index) => (
                <View key={index} style={styles.stepRow}>
                  <View
                    style={[styles.stepNumber, { borderColor: card.accent }]}
                  >
                    <Text
                      style={[
                        styles.stepNumberText,
                        { color: card.accent, fontFamily: SERIF },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>

                  <Text style={[styles.bodyText, { color: theme.text }]}>
                    {stepText}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actionsRow}>
            {Platform.OS === "web" && (
              <Pressable
                onPress={handleSavePdf}
                style={({ pressed }) => [
                  styles.ghostButton,
                  { borderColor: card.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color={card.muted}
                />
                <Text style={[styles.ghostButtonText, { color: card.muted }]}>
                  Save as PDF
                </Text>
              </Pressable>
            )}
          </View>

          <View style={[styles.suggestions, { borderTopColor: card.border }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, fontFamily: SERIF },
              ]}
            >
              Suggestions &amp; tweaks
            </Text>

            {comments.length === 0 && (
              <Text
                style={[styles.bodyText, { color: card.muted, marginBottom: 12 }]}
              >
                No suggestions yet. Be the first to add one.
              </Text>
            )}

            {comments.map((c) => {
              const canDelete =
                c.author === pb.authStore.record?.id || isAuthor;

              return (
                <View
                  key={c.id}
                  style={[styles.commentRow, { borderBottomColor: card.border }]}
                >
                  <Text
                    style={[
                      styles.commentAuthor,
                      { color: theme.text, fontFamily: SERIF },
                    ]}
                  >
                    {c.expand?.author?.name || "Family member"}
                  </Text>
                  <Text style={[styles.bodyText, { color: theme.text }]}>
                    {c.text}
                  </Text>

                  {canDelete && (
                    <Pressable
                      onPress={() => handleDeleteComment(c.id)}
                      style={styles.commentDelete}
                    >
                      <Ionicons name="trash-outline" size={14} color={card.muted} />
                      <Text
                        style={[styles.commentDeleteText, { color: card.muted }]}
                      >
                        Remove
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
              placeholderTextColor={card.muted}
              multiline
              maxLength={1000}
              editable={!posting}
              style={[styles.input, { borderColor: card.border, color: theme.text }]}
            />

            <Pressable
              onPress={handleAddComment}
              disabled={posting}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: Colors.primary,
                  opacity: pressed || posting ? 0.8 : 1,
                },
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {posting ? "Posting..." : "Post suggestion"}
              </Text>
            </Pressable>
          </View>

          {isAuthor && (
            <View style={styles.authorActions}>
              <Pressable
                onPress={() => router.push(`/recipe/edit/${recipeId}`)}
                style={({ pressed }) => [
                  styles.outlineButton,
                  { borderColor: card.accent, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Ionicons name="create-outline" size={16} color={card.accent} />
                <Text style={[styles.outlineButtonText, { color: card.accent }]}>
                  Edit recipe
                </Text>
              </Pressable>

              <Pressable
                onPress={handleDelete}
                disabled={deleting}
                style={({ pressed }) => [
                  styles.textButton,
                  { opacity: pressed || deleting ? 0.6 : 1 },
                ]}
              >
                <Ionicons name="trash-outline" size={16} color={card.danger} />
                <Text style={[styles.textButtonLabel, { color: card.danger }]}>
                  {deleting ? "Deleting..." : "Delete recipe"}
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
  screen: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 48,
    alignItems: "center",
  },
  content: { maxWidth: 700, alignSelf: "center" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  notFound: { fontSize: 20, marginTop: 4 },

  image: { alignSelf: "center", borderRadius: 10, marginBottom: 24 },
  imagePlaceholder: {
    alignSelf: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  placeholderText: { fontSize: 13 },

  header: { borderBottomWidth: 1, paddingBottom: 16, marginBottom: 18 },
  title: { fontSize: 32, fontWeight: "700", lineHeight: 38 },
  byline: { fontSize: 15, marginTop: 6, fontStyle: "italic" },

  note: { borderLeftWidth: 3, paddingLeft: 14, marginBottom: 22 },
  noteLabel: { fontSize: 12, marginBottom: 4 },
  noteText: { fontSize: 16, lineHeight: 24, fontStyle: "italic" },

  card: { borderWidth: 1, borderRadius: 12, padding: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginBottom: 14 },

  listRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 9 },

  stepRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 16, gap: 12 },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumberText: { fontSize: 13, fontWeight: "700" },

  bodyText: { flex: 1, fontSize: 16, lineHeight: 24 },

  actionsRow: { alignItems: "flex-end", marginBottom: 8 },

  suggestions: { borderTopWidth: 1, paddingTop: 20, marginBottom: 22 },
  commentRow: { borderBottomWidth: 1, paddingBottom: 14, marginBottom: 14 },
  commentAuthor: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  commentDelete: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  commentDeleteText: { fontSize: 12 },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 70,
    marginTop: 4,
    marginBottom: 10,
    fontSize: 15,
  },

  primaryButton: {
    minHeight: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primaryButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },

  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 46,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 18,
  },
  outlineButtonText: { fontSize: 15, fontWeight: "600" },

  ghostButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ghostButtonText: { fontSize: 13, fontWeight: "600" },

  textButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  textButtonLabel: { fontSize: 15, fontWeight: "600" },

  authorActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 20,
  },
});