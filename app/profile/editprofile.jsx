import { useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import pb from "../../pocketbaseConfig";
import { updateEmail, updatePassword } from "../../services/auth";
import { useAppTheme } from "../../components/ThemedViews";
import { Colors } from "../../constants/Colors";
import { showMessage, describeError } from "../../utils/showMessage";

export default function ProfileSettingsScreen() {
    const router = useRouter();
    const {
        theme,
        colorScheme,
        width: windowWidth,
    } = useAppTheme();

    const user = pb.authStore.record;

    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");

    const [emailLoading, setEmailLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);

    const contentWidth = Math.min(windowWidth - 32, 760);

    const cardBackground =
        colorScheme === "dark"
            ? Colors.light.uiBackground
            : Colors.dark.uiBackground;

    const cardBorder =
        colorScheme === "dark"
            ? Colors.light.navBackground
            : Colors.dark.navBackground;

    const cardText =
        colorScheme === "dark"
            ? Colors.light.text
            : Colors.dark.text;

    const mutedText =
        colorScheme === "dark"
            ? Colors.light.iconColor
            : Colors.dark.iconColor;

    const inputStyle = {
        backgroundColor: cardBackground,
        borderColor: cardBorder,
        color: theme.title,
    };


    async function handleUpdateEmail() {
        const email = newEmail.trim().toLowerCase();

        if (!email) {
            showMessage("Email required", "Please enter your new email address.");
            return;
        }

        if (email === user?.email?.toLowerCase()) {
            showMessage(
                "No changes",
                "Your new email is the same as your current email."
            );
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage("Invalid email", "Please enter a valid email address.");
            return;
        }

        try {
            setEmailLoading(true);

            await updateEmail(email);

            setNewEmail("");

            showMessage(
                "Check your new email",
                `We sent a confirmation link to ${email}. Your email won't change until you click it, and you'll be asked for your current password. After that, you'll need to log in again with the new address.`
            );
        } catch (error) {
            console.error("Error updating email:", error);

            showMessage(
                "Email update failed",
                describeError(error),
            );
        } finally {
            setEmailLoading(false);
        }
    }

    async function handleUpdatePassword() {
        if (!newPassword || !confirmNewPassword) {
            showMessage(
                "Missing information",
                "Enter and confirm your new password."
            );
            return;
        }

        if (newPassword.length < 8) {
            showMessage(
                "Password too short",
                "Please use a password with at least 8 characters."
            );
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showMessage(
                "Password mismatch",
                "Your new passwords do not match."
            );
            return;
        }

        try {
            setPasswordLoading(true);

            await updatePassword(newPassword, oldPassword);

            setNewPassword("");
            setConfirmNewPassword("");
            setOldPassword("");
            setShowNewPassword(false);
            setShowConfirmPassword(false);
            setShowOldPassword(false);

            showMessage(
                "Password update successful",
                "Your password was updated successfully."
            );

            router.back();
        } catch (error) {
            console.error("Error updating password:", error);

            showMessage(
                "Password update failed",
                describeError(error)
            );
        } finally {
            setPasswordLoading(false);
        }
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
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.content, { width: contentWidth }]}>
                    <Text style={[styles.heading, { color: theme.text }]}>
                        Account Settings
                    </Text>

                    <Text style={[styles.subtitle, { color: mutedText }]}>
                        Manage your email address and keep your account secure.
                    </Text>

                    {/* Current account */}
                    <View
                        style={[
                            styles.accountCard,
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

                        <View style={styles.accountDetails}>
                            <Text
                                style={[
                                    styles.accountName,
                                    { color: cardText },
                                ]}
                            >
                                {user?.name || "Name not provided"}
                            </Text>

                            <Text
                                style={[
                                    styles.accountEmail,
                                    { color: mutedText },
                                ]}
                            >
                                {user?.email || "No email available"}
                            </Text>
                        </View>
                    </View>

                    {/* Email section */}
                    <View style={styles.sectionHeader}>
                        <View
                            style={[
                                styles.sectionIcon,
                                { backgroundColor: Colors.primary },
                            ]}
                        >
                            <Text style={styles.sectionIconText}>@</Text>
                        </View>

                        <View style={styles.sectionHeaderText}>
                            <Text
                                style={[
                                    styles.sectionTitle,
                                    { color: theme.text },
                                ]}
                            >
                                Update Email
                            </Text>

                            <Text
                                style={[
                                    styles.sectionSubtitle,
                                    { color: mutedText },
                                ]}
                            >
                                We'll send a confirmation link to the new address. Your email changes after you click it.
                            </Text>
                        </View>
                    </View>

                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: cardBackground,
                                borderColor: cardBorder,
                            },
                        ]}
                    >
                        <Text style={[styles.label, { color: cardText }]}>
                            Current Email
                        </Text>

                        <Text
                            style={[
                                styles.currentValue,
                                { color: mutedText },
                            ]}
                        >
                            {user?.email || "No email available"}
                        </Text>

                        <Text style={[styles.label, { color: cardText }]}>
                            New Email Address
                        </Text>

                        <TextInput
                            style={[styles.input, inputStyle]}
                            placeholder="Enter your new email"
                            placeholderTextColor={mutedText}
                            value={newEmail}
                            onChangeText={setNewEmail}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            textContentType="emailAddress"
                            autoComplete="email"
                            editable={!emailLoading}
                        />

                        <Pressable
                            onPress={handleUpdateEmail}
                            disabled={emailLoading}
                            style={({ pressed }) => [
                                styles.primaryButton,
                                {
                                    backgroundColor: Colors.primary,
                                    opacity:
                                        pressed || emailLoading ? 0.7 : 1,
                                },
                            ]}
                        >
                            {emailLoading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>
                                    Update Email
                                </Text>
                            )}
                        </Pressable>
                    </View>

                    {/* Password section */}
                    <View style={styles.sectionHeader}>
                        <View
                            style={[
                                styles.sectionIcon,
                                { backgroundColor: Colors.primary },
                            ]}
                        >
                            <Text style={styles.sectionIconText}>🔒</Text>
                        </View>

                        <View style={styles.sectionHeaderText}>
                            <Text
                                style={[
                                    styles.sectionTitle,
                                    { color: theme.text },
                                ]}
                            >
                                Change Password
                            </Text>

                            <Text
                                style={[
                                    styles.sectionSubtitle,
                                    { color: mutedText },
                                ]}
                            >
                                Choose a strong password for your account.
                            </Text>
                        </View>
                    </View>

                    <View
                        style={[
                            styles.card,
                            {
                                backgroundColor: cardBackground,
                                borderColor: cardBorder,
                            },
                        ]}
                    >
                        <Text style={[styles.label, { color: cardText }]}>
                            Old Password
                        </Text>

                        <View style={styles.passwordRow}>
                            <TextInput
                                style={[
                                    styles.passwordInput,
                                    inputStyle,
                                ]}
                                placeholder="Enter your current password"
                                placeholderTextColor={mutedText}
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                secureTextEntry={!showOldPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="newPassword"
                                autoComplete="new-password"
                                editable={!passwordLoading}
                            />

                            <Pressable
                                style={styles.showButton}
                                onPress={() =>
                                    setShowOldPassword((value) => !value)
                                }
                                accessibilityRole="button"
                                accessibilityLabel={
                                    showOldPassword
                                        ? "Hide old password"
                                        : "Show old password"
                                }
                            >
                                <Text
                                    style={[
                                        styles.showButtonText,
                                        { color: Colors.primary },
                                    ]}
                                >
                                    {showOldPassword ? "Hide" : "Show"}
                                </Text>
                            </Pressable>
                        </View>

                        <Text style={[styles.label, { color: cardText }]}>
                            New Password
                        </Text>

                        <View style={styles.passwordRow}>
                            <TextInput
                                style={[
                                    styles.passwordInput,
                                    inputStyle,
                                ]}
                                placeholder="Enter a new password"
                                placeholderTextColor={mutedText}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="newPassword"
                                autoComplete="new-password"
                                editable={!passwordLoading}
                            />

                            <Pressable
                                style={styles.showButton}
                                onPress={() =>
                                    setShowNewPassword((value) => !value)
                                }
                                accessibilityRole="button"
                                accessibilityLabel={
                                    showNewPassword
                                        ? "Hide new password"
                                        : "Show new password"
                                }
                            >
                                <Text
                                    style={[
                                        styles.showButtonText,
                                        { color: Colors.primary },
                                    ]}
                                >
                                    {showNewPassword ? "Hide" : "Show"}
                                </Text>
                            </Pressable>
                        </View>

                        <Text style={[styles.helperText, { color: mutedText }]}>
                            Use at least 8 characters, or meet any stricter
                            requirements configured in PocketBase.
                        </Text>

                        <Text style={[styles.label, { color: cardText }]}>
                            Confirm New Password
                        </Text>

                        <View style={styles.passwordRow}>
                            <TextInput
                                style={[
                                    styles.passwordInput,
                                    inputStyle,
                                ]}
                                placeholder="Enter the password again"
                                placeholderTextColor={mutedText}
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                textContentType="newPassword"
                                autoComplete="new-password"
                                editable={!passwordLoading}
                            />

                            <Pressable
                                style={styles.showButton}
                                onPress={() =>
                                    setShowConfirmPassword((value) => !value)
                                }
                                accessibilityRole="button"
                                accessibilityLabel={
                                    showConfirmPassword
                                        ? "Hide confirmation password"
                                        : "Show confirmation password"
                                }
                            >
                                <Text
                                    style={[
                                        styles.showButtonText,
                                        { color: Colors.primary },
                                    ]}
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </Text>
                            </Pressable>
                        </View>

                        <Pressable
                            onPress={handleUpdatePassword}
                            disabled={passwordLoading}
                            style={({ pressed }) => [
                                styles.primaryButton,
                                {
                                    backgroundColor: Colors.primary,
                                    opacity:
                                        pressed || passwordLoading ? 0.7 : 1,
                                },
                            ]}
                        >
                            {passwordLoading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>
                                    Update Password
                                </Text>
                            )}
                        </Pressable>
                    </View>

                    {/* Footer actions */}
                    <Pressable
                        onPress={() => router.back()}
                        style={({ pressed }) => [
                            styles.cancelButton,
                            {
                                borderColor: cardBorder,
                                backgroundColor: Colors.warning,
                                opacity: pressed ? 0.75 : 1,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.cancelButtonText,
                                { color: theme.text },
                            ]}
                        >
                            Cancel
                        </Text>
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
        marginBottom: 24,
    },
    accountCard: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 16,
        padding: 18,
        marginBottom: 28,
    },
    avatar: {
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    avatarText: {
        color: "#ffffff",
        fontSize: 25,
        fontWeight: "bold",
    },
    accountDetails: {
        flex: 1,
    },
    accountName: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    accountEmail: {
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        marginTop: 4,
    },
    sectionIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    sectionIconText: {
        color: "#ffffff",
        fontSize: 20,
        fontWeight: "bold",
    },
    sectionHeaderText: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 3,
    },
    sectionSubtitle: {
        fontSize: 13,
        lineHeight: 18,
    },
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        marginTop: 4,
    },
    currentValue: {
        fontSize: 15,
        marginBottom: 18,
    },
    input: {
        width: "100%",
        minHeight: 48,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
        marginBottom: 12,
    },
    passwordRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 8,
    },
    passwordInput: {
        flex: 1,
        minWidth: 0,
        minHeight: 48,
        borderWidth: 0,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 15,
    },
    showButton: {
        paddingHorizontal: 12,
        paddingVertical: 14,
        backgroundColor: "transparent",
    },
    showButtonText: {
        fontSize: 13,
        fontWeight: "700",
    },
    helperText: {
        fontSize: 12,
        lineHeight: 17,
        marginBottom: 16,
    },
    primaryButton: {
        minHeight: 50,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginTop: 8,
    },
    primaryButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "700",
    },
    cancelButton: {
        minHeight: 48,
        borderWidth: 1,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
        marginTop: 2,
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: "600",
    },
});
