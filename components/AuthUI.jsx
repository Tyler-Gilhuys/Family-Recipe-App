import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export function AuthScreen({ title, subtitle, children }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {children}
        </View>
    );
}

export function AuthInput(props) {
    return <TextInput style={styles.input} {...props} />;
}

export function AuthButton({ label, loadingLabel, loading, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
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
    return (
        <TouchableOpacity onPress={onPress} style={styles.link}>
            <Text style={styles.linkText}>{label}</Text>
        </TouchableOpacity>
    );
}

export function AuthError({ children }) {
    return <Text style={styles.error}>{children}</Text>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 24,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 28,
        color: "#555",
    },
    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 14,
        marginBottom: 14,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#276749",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonDisabled: {
        opacity: 0.6
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },
    link: {
        marginTop: 14,
        alignItems: "center"
    },
    linkText: {
        color: "#276749",
        fontWeight: "600"
    },
    error: {
        color: "#b00020",
        textAlign: "center",
        marginBottom: 12
    },
});