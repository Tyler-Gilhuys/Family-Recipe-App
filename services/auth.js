import pb from "../pocketbaseConfig";

export async function login(email, password) {
  try {
    const authData = await pb.collection("users").authWithPassword(
      email,
      password
    );

    if (!authData.record.verified) {
      pb.authStore.clear();
      const err = new Error("Please verify your email before logging in.");
      err.code = "EMAIL_NOT_VERIFIED";
      throw err;
    }

    console.log("PocketBase login successful:", authData.record.id);
    return authData.record;
  } catch (error) {
    console.error("PocketBase login error:", error);
    throw error;
  }
}

export async function signUp(email, password, fullName) {
  try {
    const userData = {
      email: email,
      password: password,
      passwordConfirm: password,
      name: fullName,
    };

    const newUser = await pb.collection("users").create(userData);

    console.log("PocketBase sign-up successful:", newUser.id);

    await pb.collection("users").requestVerification(email);

    return newUser;
  } catch (error) {
    console.error("PocketBase sign-up error:", error);
    throw error;
  }
}

export function logout() {
  pb.authStore.clear();
}

export function isLoggedIn() {
  return pb.authStore.isValid;
}

export function getCurrentUser() {
  return pb.authStore.record;
}

export async function updatePassword(newPassword, oldPassword) {
  if (!pb.authStore.isValid) {
    throw new Error("User is not logged in.");
  }

  const userId = pb.authStore.record.id;
  const email = pb.authStore.record.email;

  try {
    const result = await pb.collection("users").update(userId, {
      oldPassword: oldPassword,
      password: newPassword,
      passwordConfirm: newPassword,
    });

    // The old token is now invalid. Log in again with the new password
    // to get a fresh one.
    await pb.collection("users").authWithPassword(email, newPassword);

    return result;
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
}


export async function updateEmail(newEmail) {
  if (!pb.authStore.isValid) {
    throw new Error("User is not logged in.");
  }

  try {
    // Sends a confirmation email to newEmail. The change is not applied yet.
    await pb.collection("users").requestEmailChange(newEmail);
    return { pending: true };
  } catch (error) {
    console.error("Error requesting email change:", error);
    throw error;
  }
}

export async function resetPassword(token, newPassword) {
  try {
    await pb.collection("users").confirmPasswordReset(
      token,
      newPassword,
      newPassword
    );
  } catch (error) {
    console.error("Error confirming password reset:", error);
    throw error;
  }
}