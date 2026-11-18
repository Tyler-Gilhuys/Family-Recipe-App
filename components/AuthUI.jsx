import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "./ThemedViews";
import { Colors } from "../constants/Colors";
import Wordmark from "./Wordmark";

const SERIF = Platform.select({
    web: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
    ios: "Georgia",
    android: "serif",
    default: "serif",
});

export function AuthScreen({ title, subtitle, children }) {
    const { theme, card } = useAppTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.inner}>
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                    <Wordmark size="large" />
                </View>
                <Text style={[styles.title, { color: theme.text, fontFamily: SERIF }]}>
                    {title}
                </Text>
                <View style={[styles.rule, { backgroundColor: card.accent }]} />
                {subtitle ? (
                    <Text style={[styles.subtitle, { color: card.muted }]}>
                        {subtitle}
                    </Text>
                ) : null}
                {children}
            </View>
        </View>
    );
}

export function AuthInput(props) {
    const { theme, card } = useAppTheme();

    return (
        <TextInput
            placeholderTextColor={card.muted}
            style={[
                styles.input,
                { backgroundColor: theme.navBackground, borderColor: card.border, color: theme.text },
            ]}
            {...props}
        />
    );
}

export function AuthButton({ label, loadingLabel, loading, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors.primary }, loading && styles.buttonDisabled]}
            onPress={onPress}
            disabled={loading}
        >
            <Text style={styles.buttonText}>
                {loading && loadingLabel ? loadingLabel : label}
            </Text>
        </TouchableOpacity>
    );
}

export function AuthLink({ label, onPress }) {
    const { card } = useAppTheme();

    return (
        <TouchableOpacity onPress={onPress} style={styles.link}>
            <Text style={[styles.linkText, { color: card.accent }]}>{label}</Text>
        </TouchableOpacity>
    );
}

export function AuthError({ children }) {
    const { card } = useAppTheme();

    return (
        <Text style={[styles.error, { color: card.danger }]}>{children}</Text>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
    },
    inner: {
        width: "100%",
        maxWidth: 420,
        alignSelf: "center",
    },
    title: {
        fontSize: 30,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 14,
    },
    rule: {
        width: 48,
        height: 2,
        borderRadius: 1,
        alignSelf: "center",
        marginBottom: 18,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: "center",
        marginBottom: 28,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 14,
        marginBottom: 14,
        fontSize: 16,
    },
    button: {
        minHeight: 50,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
    },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    link: { marginTop: 16, alignItems: "center" },
    linkText: { fontWeight: "600", fontSize: 15 },
    error: { textAlign: "center", marginBottom: 12, fontSize: 14 },
});