import { ScrollView, StyleSheet, View } from "react-native";
import { useAppTheme } from "./ThemedViews";

// Themed page background + scroll area + centered column (max 760px).
export default function ScreenScroll({ children }) {
    const { theme, width } = useAppTheme();
    const contentWidth = Math.min(width - 32, 760);

    return (
        <View style={[styles.screen, { backgroundColor: theme.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
            >
                <View style={[styles.content, { width: contentWidth }]}>
                    {children}
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
        paddingBottom: 40,
        alignItems: "center",
    },
    content: { maxWidth: 760, alignSelf: "center" },
});