import pb from "../pocketbaseConfig";

export async function login(email, password) {
  try {
    const authData = await pb.collection("users").authWithPassword(
      email,
      password
    );

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

  console.log("Updating password for user:", pb.authStore.record.id);

  if (!pb.authStore.isValid) {
    throw new Error("User is not logged in.");
  }

  try {
    const result = await pb.collection("users").update(pb.authStore.record.id, {
      oldPassword: oldPassword,
      password: newPassword,
      passwordConfirm: newPassword,
    });
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
    const result = await pb.collection("users").update(pb.authStore.record.id, {
      email: newEmail,
    });
    return result;
  } catch (error) {
    console.error("Error updating email:", error);
    throw error;
  }
}
