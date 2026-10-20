import React from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import pb from "../pocketbaseConfig";
import { logout } from "../services/auth";
import { useAppTheme } from "../components/ThemedViews";
import { Colors } from "../constants/Colors";

export default function ProfileScreen() {
    const router = useRouter();
    const { theme, card, width: windowWidth } = useAppTheme();
    const user = pb.authStore.record;

    const contentWidth = Math.min(windowWidth - 32, 760);

    const { background: cardBackground, border: cardBorder, text: cardText } = card;


    function handleLogout() {
        logout();
        router.replace("/login");
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
                    <Text style={[styles.heading, { color: theme.text }]}>
                        My Profile
                    </Text>

                    <Text style={[styles.subtitle, { color: theme.text }]}>
                        View your account information and manage your settings.
                    </Text>

                    <View
                        style={[
                            styles.profileCard,
                            {
                                backgroundColor: cardBackground,
                                borderColor: cardBorder,
                            },
                        ]}
                    >
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {(user?.name || user?.email || "?")
                                    .trim()
                                    .charAt(0)
                                    .toUpperCase()}
                            </Text>
                        </View>

                        <Text style={[styles.displayName, { color: cardText }]}>
                            {user?.name || "Name not provided"}
                        </Text>

                        <Text style={[styles.email, { color: cardText }]}>
                            {user?.email || "No email available"}
                        </Text>
                    </View>

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Account Information
                    </Text>

                    <View
                        style={[
                            styles.infoCard,
                            {
                                backgroundColor: cardBackground,
                                borderColor: cardBorder,
                            },
                        ]}
                    >
                        <Text style={[styles.label, { color: cardText }]}>
                            Full Name
                        </Text>
                        <Text style={[styles.value, { color: cardText }]}>
                            {user?.name || "Not provided"}
                        </Text>

                        <View
                            style={[
                                styles.separator,
                                { backgroundColor: cardBorder },
                            ]}
                        />

                        <Text style={[styles.label, { color: cardText }]}>
                            Email Address
                        </Text>
                        <Text style={[styles.value, { color: cardText }]}>
                            {user?.email || "No email available"}
                        </Text>
                    </View>

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                        Account Settings
                    </Text>

                    <Pressable
                        onPress={() => router.push("/profile/editprofile")}
                        style={({ pressed }) => [
                            styles.actionButton,
                            {
                                backgroundColor: cardBackground,
                                borderColor: cardBorder,
                                opacity: pressed ? 0.8 : 1,
                            },
                        ]}
                    >
                        <View style={styles.actionContent}>
                            <View style={styles.actionIcon}>
                                <Text style={styles.iconText}>✎</Text>
                            </View>
                            <View style={styles.actionDescription}>
                                <Text style={[styles.actionTitle, { color: cardText }]}>
                                    Edit Profile
                                </Text>
                                <Text style={[styles.actionSubtitle, { color: cardText }]}>
                                    Update your name and account details
                                </Text>
                            </View>
                            <Text style={[styles.chevron, { color: cardText }]}>
                                ›
                            </Text>
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={handleLogout}
                        style={({ pressed }) => [
                            styles.logoutButton,
                            { opacity: pressed ? 0.8 : 1 },
                        ]}
                    >
                        <Text style={styles.logoutButtonText}>Sign Out</Text>
                    </Pressable>
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
        paddingTop: 24,
        paddingBottom: 40,
        alignItems: "center",
    },
    content: {
        maxWidth: 760,
        alignSelf: "center",
    },
    heading: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 21,
        marginBottom: 22,
    },
    profileCard: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 26,
    },
    avatar: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14,
    },
    avatarText: {
        color: "#ffffff",
        fontSize: 32,
        fontWeight: "bold",
    },
    displayName: {
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 5,
    },
    email: {
        fontSize: 15,
        textAlign: "center",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 12,
    },
    infoCard: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 18,
        marginBottom: 26,
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
    },
    value: {
        fontSize: 17,
        fontWeight: "500",
    },
    separator: {
        height: 1,
        marginVertical: 16,
    },
    actionButton: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    actionContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    iconText: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "bold",
    },
    actionDescription: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
    chevron: {
        fontSize: 28,
        marginLeft: 8,
    },
    logoutButton: {
        minHeight: 50,
        borderRadius: 12,
        backgroundColor: Colors.warning,
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        marginTop: 14,
    },
    logoutButtonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
