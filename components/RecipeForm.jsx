import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useAppTheme } from "./ThemedViews";
import { Colors } from "../constants/Colors";
import { CATEGORIES } from "../constants/categories";
import { pickImage } from "../utils/ImagePicker";
import { showMessage, describeError } from "../utils/showMessage";

// Ingredients may be separated by newlines, commas, or semicolons.
// Steps are separated by newlines only (steps can contain commas).
const splitList = (text, pattern) =>
    (text || "")
        .split(pattern)
        .map((item) => item.trim())
        .filter(Boolean);

function Field({ label, required, multiline, ...inputProps }) {
    const { theme, card } = useAppTheme();

    return (
        <>
            <Text style={[styles.label, { color: theme.text }]}>
                {label}
                {required ? " *" : ""}
            </Text>
            <TextInput
                placeholderTextColor={theme.iconColor}
                multiline={multiline}
                style={[
                    styles.input,
                    multiline && styles.multiline,
                    {
                        backgroundColor: card.background,
                        borderColor: card.border,
                        color: card.text,
                    },
                ]}
                {...inputProps}
            />
        </>
    );
}

/**
 * Shared form for adding and editing a recipe.
 *
 * onSubmit({ recipe, imageUri }) should throw on failure; the form shows the
 * error. initialValues: { title, ingredients[], steps[], comments,
 * categories[], imageUrl }.
 */
export default function RecipeForm({
    heading,
    helperText,
    submitLabel,
    savingLabel,
    initialValues = {},
    onSubmit,
    onCancel,
}) {
    const { theme, card } = useAppTheme();

    const [title, setTitle] = useState(initialValues.title || "");
    const [ingredients, setIngredients] = useState(
        (initialValues.ingredients || []).join("\n")
    );
    const [steps, setSteps] = useState((initialValues.steps || []).join("\n"));
    const [comments, setComments] = useState(initialValues.comments || "");
    const [selectedCategories, setSelectedCategories] = useState(
        initialValues.categories || []
    );
    const [imageUri, setImageUri] = useState(null);
    const [saving, setSaving] = useState(false);

    const existingImage = initialValues.imageUrl || null;
    const previewUri = imageUri || existingImage;

    const toggleCategory = (category) => {
        setSelectedCategories((current) =>
            current.includes(category)
                ? current.filter((item) => item !== category)
                : [...current, category]
        );
    };

    const handlePickImage = async () => {
        if (saving) return;

        try {
            const uri = await pickImage();
            if (uri) setImageUri(uri);
        } catch (error) {
            console.error("Image picker error:", error);
            showMessage("Image error", "Unable to select an image.");
        }
    };

    const handleSubmit = async () => {
        if (saving) return;

        if (
            !title.trim() ||
            !ingredients.trim() ||
            !steps.trim() ||
            selectedCategories.length === 0
        ) {
            showMessage(
                "Missing information",
                "Please fill in all required fields and select at least one category."
            );
            return;
        }

        try {
            setSaving(true);

            await onSubmit({
                recipe: {
                    title: title.trim(),
                    ingredients: splitList(ingredients, /\n|,|;/),
                    steps: splitList(steps, "\n"),
                    comments: comments.trim(),
                    categories: selectedCategories,
                },
                imageUri,
            });
        } catch (error) {
            console.error("Recipe save error:", error);
            showMessage("Unable to save recipe", describeError(error));
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView
            style={{ backgroundColor: theme.background }}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
        >
            {saving && (
                <View style={styles.savingContainer}>
                    <ActivityIndicator size="large" color={theme.title} />
                    <Text style={[styles.savingText, { color: theme.text }]}>
                        {savingLabel}
                    </Text>
                </View>
            )}

            <Text style={[styles.heading, { color: theme.text }]}>{heading}</Text>
            <Text style={[styles.helperText, { color: theme.text }]}>
                {helperText}
            </Text>

            <Field
                label="Recipe Name"
                required
                placeholder="e.g. Grandma's Chicken and Rice"
                value={title}
                onChangeText={setTitle}
                editable={!saving}
                returnKeyType="next"
            />

            <Field
                label="Ingredients"
                required
                multiline
                placeholder="Enter one ingredient per line, or separate with commas or semicolons"
                value={ingredients}
                onChangeText={setIngredients}
                editable={!saving}
            />

            <Field
                label="Preparation Steps"
                required
                multiline
                placeholder="Enter each preparation step on a new line"
                value={steps}
                onChangeText={setSteps}
                editable={!saving}
            />

            <Field
                label="Special Comments"
                multiline
                placeholder="Optional notes, tips, or substitutions"
                value={comments}
                onChangeText={setComments}
                editable={!saving}
            />

            <Text style={[styles.label, { color: theme.text }]}>Categories *</Text>
            <Text style={[styles.helperText, { color: theme.text }]}>
                Select all categories that apply to this recipe.
            </Text>

            <View style={styles.categories}>
                {CATEGORIES.map((category) => {
                    const selected = selectedCategories.includes(category);

                    return (
                        <Pressable
                            key={category}
                            onPress={() => toggleCategory(category)}
                            disabled={saving}
                            style={({ pressed }) => [
                                styles.categoryChip,
                                {
                                    backgroundColor: selected
                                        ? Colors.primary
                                        : theme.uiBackground,
                                    borderColor: selected ? Colors.primary : theme.navBackground,
                                    opacity: pressed || saving ? 0.75 : 1,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    { color: selected ? "#ffffff" : theme.text },
                                ]}
                            >
                                {selected ? "✓ " : ""}
                                {category}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <Text style={[styles.label, { color: theme.text }]}>Recipe Image</Text>

            {previewUri ? (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: previewUri }}
                        style={styles.image}
                        resizeMode="cover"
                    />

                    {imageUri && (
                        <Pressable
                            onPress={() => setImageUri(null)}
                            disabled={saving}
                            style={styles.removeImageButton}
                        >
                            <Text style={styles.removeImageText}>Discard New Image</Text>
                        </Pressable>
                    )}
                </View>
            ) : (
                <View
                    style={[
                        styles.imagePlaceholder,
                        { backgroundColor: card.background, borderColor: card.border },
                    ]}
                >
                    <Text style={styles.placeholderIcon}>🍽️</Text>
                    <Text style={[styles.placeholderText, { color: card.text }]}>
                        No photo yet
                    </Text>
                </View>
            )}

            <Pressable
                onPress={handlePickImage}
                disabled={saving}
                style={({ pressed }) => [
                    styles.secondaryButton,
                    {
                        backgroundColor: card.background,
                        borderColor: card.border,
                        opacity: pressed || saving ? 0.75 : 1,
                    },
                ]}
            >
                <Text style={[styles.secondaryButtonText, { color: card.text }]}>
                    {previewUri ? "Choose a Different Image" : "Choose an Image"}
                </Text>
            </Pressable>

            <Pressable
                onPress={handleSubmit}
                disabled={saving}
                style={({ pressed }) => [
                    styles.saveButton,
                    {
                        backgroundColor: card.background,
                        opacity: pressed || saving ? 0.75 : 1,
                    },
                ]}
            >
                {saving ? (
                    <ActivityIndicator color={card.text} />
                ) : (
                    <Text style={[styles.saveButtonText, { color: card.text }]}>
                        {submitLabel}
                    </Text>
                )}
            </Pressable>

            <Pressable
                onPress={onCancel}
                disabled={saving}
                style={({ pressed }) => [
                    styles.cancelButton,
                    {
                        backgroundColor: Colors.warning,
                        borderColor: card.border,
                        opacity: pressed || saving ? 0.75 : 1,
                    },
                ]}
            >
                <Text style={[styles.cancelButtonText, { color: card.text }]}>
                    Cancel
                </Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: 40,
        maxWidth: 760,
        width: "100%",
        alignSelf: "center",
    },
    heading: { fontSize: 28, fontWeight: "bold", marginBottom: 8 },
    helperText: { fontSize: 14, lineHeight: 21, marginBottom: 14 },
    savingContainer: { alignItems: "center", marginBottom: 16 },
    savingText: { marginTop: 10, fontSize: 15 },
    label: { fontSize: 16, fontWeight: "600", marginTop: 14, marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
    },
    multiline: { minHeight: 110, textAlignVertical: "top" },
    categories: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 4,
        marginBottom: 12,
    },
    categoryChip: {
        borderWidth: 1,
        borderRadius: 22,
        paddingVertical: 9,
        paddingHorizontal: 14,
        marginRight: 8,
        marginBottom: 8,
    },
    categoryText: { fontSize: 14, fontWeight: "500" },
    imageContainer: { alignItems: "center", marginVertical: 12 },
    image: {
        width: "100%",
        maxWidth: 420,
        height: 240,
        borderRadius: 16,
        backgroundColor: "#d6d5e1",
    },
    imagePlaceholder: {
        minHeight: 160,
        borderWidth: 1,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 12,
    },
    placeholderIcon: { fontSize: 42, marginBottom: 8 },
    placeholderText: { fontSize: 14 },
    removeImageButton: { marginTop: 8, padding: 8 },
    removeImageText: { color: Colors.warning, fontWeight: "600" },
    secondaryButton: {
        borderWidth: 1,
        borderRadius: 10,
        minHeight: 46,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 8,
    },
    secondaryButtonText: { fontSize: 15, fontWeight: "600" },
    saveButton: {
        minHeight: 50,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        marginTop: 16,
    },
    saveButtonText: { fontSize: 16, fontWeight: "bold" },
    cancelButton: {
        minHeight: 46,
        borderWidth: 1,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        marginTop: 10,
    },
    cancelButtonText: { fontSize: 15, fontWeight: "600" },
});