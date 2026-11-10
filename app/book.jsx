import { useCallback, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAppTheme } from "../components/ThemedViews";
import ScreenScroll from "../components/ScreenScroll";
import pb from "../pocketbaseConfig";
import { Colors } from "../constants/Colors";
import { CATEGORIES } from "../constants/categories";
import { getRecipesForBook } from "../services/recipes";
import { printRecipes } from "../utils/recipePrint";
import { showMessage, describeError } from "../utils/showMessage";

function Check({ checked, label, onPress, color }) {
    return (
        <Pressable onPress={onPress} style={styles.checkRow}>
            <Text style={[styles.box, { color }]}>{checked ? "☑" : "☐"}</Text>
            <Text style={[styles.checkLabel, { color }]}>{label}</Text>
        </Pressable>
    );
}

export default function BookBuilder() {
    const { theme, card } = useAppTheme();
    const [records, setRecords] = useState([]);
    const [selected, setSelected] = useState({});
    const [bookTitle, setBookTitle] = useState("Gilhuys Family Recipes");
    const [cover, setCover] = useState(true);
    const [toc, setToc] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            getRecipesForBook()
                .then((list) => active && setRecords(list))
                .catch((error) => {
                    console.error("Error loading recipes for book:", error);
                    showMessage("Could not load recipes", describeError(error));
                });

            return () => {
                active = false;
            };
        }, [])
    );

    const sections = CATEGORIES.map((category) => ({
        category,
        items: records.filter((r) => r.categories?.includes(category)),
    })).filter((section) => section.items.length > 0);

    const selectedCount = Object.values(selected).filter(Boolean).length;

    const toggle = (id) => setSelected((cur) => ({ ...cur, [id]: !cur[id] }));

    const toggleSection = (items) => {
        const allOn = items.every((r) => selected[r.id]);
        setSelected((cur) => {
            const next = { ...cur };
            items.forEach((r) => (next[r.id] = !allOn));
            return next;
        });
    };

    const handleCreate = () => {
        // Follow the category order, and include each recipe only once.
        const seen = new Set();
        const ordered = [];
        sections.forEach(({ items }) =>
            items.forEach((r) => {
                if (selected[r.id] && !seen.has(r.id)) {
                    seen.add(r.id);
                    ordered.push(r);
                }
            })
        );

        if (ordered.length === 0) {
            showMessage("No recipes chosen", "Tick at least one recipe first.");
            return;
        }

        try {
            printRecipes(
                ordered.map((r) => ({
                    title: r.title,
                    authorName: r.expand?.author?.name,
                    imageUrl: r.image ? pb.files.getURL(r, r.image) : null,
                    ingredients: r.ingredients,
                    steps: r.steps,
                    comments: r.comments,
                })),
                {
                    title: bookTitle.trim() || "Family Recipes",
                    cover,
                    toc,
                    subtitle: `${ordered.length} recipes · ${new Date().toLocaleDateString()}`,
                }
            );
        } catch (error) {
            showMessage("Could not create PDF", describeError(error));
        }
    };

    if (Platform.OS !== "web") {
        return (
            <ScreenScroll>
                <Text style={[styles.heading, { color: theme.text }]}>Make a Book</Text>
                <Text style={{ color: theme.text }}>
                    Saving a book as a PDF is only available in the web version.
                </Text>
            </ScreenScroll>
        );
    }

    return (
        <ScreenScroll>
            <Text style={[styles.heading, { color: theme.text }]}>Make a Book</Text>
            <Text style={[styles.helper, { color: theme.text }]}>
                Tick the recipes you want, then create a PDF you can save or print.
            </Text>

            <Text style={[styles.label, { color: theme.text }]}>Book title</Text>
            <TextInput
                value={bookTitle}
                onChangeText={setBookTitle}
                placeholderTextColor={theme.iconColor}
                style={[
                    styles.input,
                    { backgroundColor: card.background, borderColor: card.border, color: card.text },
                ]}
            />

            <Check checked={cover} label="Include a cover page" color={theme.text} onPress={() => setCover((v) => !v)} />
            <Check checked={toc} label="Include a table of contents" color={theme.text} onPress={() => setToc((v) => !v)} />

            {sections.map(({ category, items }) => (
                <View
                    key={category}
                    style={[styles.section, { backgroundColor: card.background, borderColor: card.border }]}
                >
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: card.text }]}>{category}</Text>
                        <Pressable onPress={() => toggleSection(items)}>
                            <Text style={{ color: Colors.primary, fontWeight: "600" }}>
                                {items.every((r) => selected[r.id]) ? "Clear all" : "Select all"}
                            </Text>
                        </Pressable>
                    </View>

                    {items.map((r) => (
                        <Check
                            key={r.id}
                            checked={!!selected[r.id]}
                            label={r.title}
                            color={card.text}
                            onPress={() => toggle(r.id)}
                        />
                    ))}
                </View>
            ))}

            {records.length === 0 && (
                <Text style={{ color: theme.text, marginTop: 16 }}>No recipes found yet.</Text>
            )}

            <Pressable
                onPress={handleCreate}
                style={({ pressed }) => [
                    styles.createButton,
                    { backgroundColor: Colors.primary, opacity: pressed ? 0.8 : 1 },
                ]}
            >
                <Text style={styles.createText}>
                    {selectedCount > 0 ? `Create PDF (${selectedCount} recipes)` : "Create PDF"}
                </Text>
            </Pressable>
        </ScreenScroll>
    );
}

const styles = StyleSheet.create({
    heading: { fontSize: 30, fontWeight: "bold", marginBottom: 8 },
    helper: { fontSize: 14, lineHeight: 21, marginBottom: 16 },
    label: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 12,
    },
    checkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
    box: { fontSize: 22, marginRight: 10 },
    checkLabel: { fontSize: 16, flex: 1 },
    section: { borderWidth: 1, borderRadius: 14, padding: 16, marginTop: 16 },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    sectionTitle: { fontSize: 18, fontWeight: "bold" },
    createButton: {
        minHeight: 50,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
        marginBottom: 20,
    },
    createText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});