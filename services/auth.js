import pb from "../pocketbaseConfig";

const users = () => pb.collection("users");

export function isVerifiedUser() {
  return pb.authStore.isValid && pb.authStore.record?.verified === true;
}

export function isLoggedIn() {
  return pb.authStore.isValid;
}

export function getCurrentUser() {
  return pb.authStore.record;
}

export function logout() {
  pb.authStore.clear();
}

export async function refreshSession() {
  await users().authRefresh();
}

export async function login(email, password) {
  const authData = await users().authWithPassword(email, password);

  if (!authData.record.verified) {
    pb.authStore.clear();
    const err = new Error("Please verify your email before logging in.");
    err.code = "EMAIL_NOT_VERIFIED";
    throw err;
  }

  return authData.record;
}

export async function signUp(email, password, fullName, inviteCode) {
  const newUser = await users().create({
    email,
    password,
    passwordConfirm: password,
    name: fullName,
    inviteCode,
  });

  await users().requestVerification(email);
  return newUser;
}

export async function resendVerification(email) {
  await users().requestVerification(email);
}

export async function confirmVerification(token) {
  await users().confirmVerification(token);
}

export async function requestPasswordReset(email) {
  await users().requestPasswordReset(email);
}

export async function resetPassword(token, newPassword) {
  await users().confirmPasswordReset(token, newPassword, newPassword);
}

export async function updatePassword(newPassword, oldPassword) {
  if (!pb.authStore.isValid) {
    throw new Error("User is not logged in.");
  }

  const { id, email } = pb.authStore.record;

  const result = await users().update(id, {
    oldPassword,
    password: newPassword,
    passwordConfirm: newPassword,
  });

  // The old token is now invalid. Log in again to get a fresh one.
  await users().authWithPassword(email, newPassword);

  return result;
}

export async function updateEmail(newEmail) {
  if (!pb.authStore.isValid) {
    throw new Error("User is not logged in.");
  }

  // Sends a confirmation email to newEmail. The change isn't applied yet.
  await users().requestEmailChange(newEmail);
  return { pending: true };
}

export async function confirmEmailChange(token, password) {
  await users().confirmEmailChange(token, password);
  // PocketBase invalidates the session after an email change.
  pb.authStore.clear();
}
