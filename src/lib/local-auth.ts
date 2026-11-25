export type UserRole = "admin" | "user";

export type LocalUser = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string | null;
};

type StoredAccount = LocalUser & {
  passwordSalt: string;
  passwordHash: string;
};

const ACCOUNTS_KEY = "sukoon_accounts";
const SESSION_KEY = "sukoon_session_user_id";

function readAccounts(): StoredAccount[] {
  const rawAccounts = window.localStorage.getItem(ACCOUNTS_KEY);
  if (!rawAccounts) return [];

  const parsed: unknown = JSON.parse(rawAccounts);
  if (!Array.isArray(parsed)) {
    throw new Error(
      "Saved account data is invalid. Clear this browser's Sukoon demo data and try again.",
    );
  }

  return parsed.map((account: unknown) => {
    if (
      typeof account !== "object" ||
      account === null ||
      !("id" in account) ||
      typeof account.id !== "string" ||
      !("email" in account) ||
      typeof account.email !== "string" ||
      !("role" in account) ||
      (account.role !== "admin" && account.role !== "user") ||
      !("createdAt" in account) ||
      typeof account.createdAt !== "string" ||
      !("lastLoginAt" in account) ||
      (account.lastLoginAt !== null && typeof account.lastLoginAt !== "string") ||
      !("passwordSalt" in account) ||
      typeof account.passwordSalt !== "string" ||
      !("passwordHash" in account) ||
      typeof account.passwordHash !== "string"
    ) {
      throw new Error(
        "Saved account data is invalid. Clear this browser's Sukoon demo data and try again.",
      );
    }

    return {
      id: account.id,
      email: account.email,
      role: account.role,
      createdAt: account.createdAt,
      lastLoginAt: account.lastLoginAt,
      passwordSalt: account.passwordSalt,
      passwordHash: account.passwordHash,
    };
  });
}

function writeAccounts(accounts: StoredAccount[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function toLocalUser({
  passwordSalt: _salt,
  passwordHash: _hash,
  ...user
}: StoredAccount): LocalUser {
  return user;
}

async function hashPassword(password: string, salt: string): Promise<ArrayBuffer> {
  const key = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: new TextEncoder().encode(salt),
      iterations: 120_000,
    },
    key,
    256,
  );
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function registerLocalUser(
  email: string,
  password: string,
  role: UserRole,
): Promise<LocalUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = readAccounts();

  if (accounts.some((account) => account.email === normalizedEmail)) {
    throw new Error("An account with this email already exists.");
  }

  if (password.length < 8) {
    throw new Error("Use a password with at least 8 characters.");
  }

  const saltBytes = window.crypto.getRandomValues(new Uint8Array(16));
  const passwordSalt = toHex(saltBytes);
  const passwordHash = toHex(new Uint8Array(await hashPassword(password, passwordSalt)));
  const user: StoredAccount = {
    id: toHex(window.crypto.getRandomValues(new Uint8Array(16))),
    email: normalizedEmail,
    role,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    passwordSalt,
    passwordHash,
  };

  writeAccounts([...accounts, user]);
  window.localStorage.setItem(SESSION_KEY, user.id);
  return toLocalUser(user);
}

export async function loginLocalUser(
  email: string,
  password: string,
  role: UserRole,
): Promise<LocalUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = readAccounts();
  const account = accounts.find(
    (savedAccount) => savedAccount.email === normalizedEmail && savedAccount.role === role,
  );

  if (!account) {
    throw new Error(
      `No ${role} account exists for this email. Check the selected account type or sign up.`,
    );
  }

  const submittedHash = toHex(new Uint8Array(await hashPassword(password, account.passwordSalt)));
  if (submittedHash !== account.passwordHash) {
    throw new Error("The password is incorrect.");
  }

  account.lastLoginAt = new Date().toISOString();
  writeAccounts(accounts);
  window.localStorage.setItem(SESSION_KEY, account.id);
  return toLocalUser(account);
}

export function getCurrentLocalUser(): LocalUser | null {
  const userId = window.localStorage.getItem(SESSION_KEY);
  if (!userId) return null;

  const account = readAccounts().find((savedAccount) => savedAccount.id === userId);
  return account ? toLocalUser(account) : null;
}

export function listLocalUsers(): LocalUser[] {
  return readAccounts().map(toLocalUser);
}

export function removeLocalUser(userId: string): void {
  const accounts = readAccounts();
  const currentUserId = window.localStorage.getItem(SESSION_KEY);
  const currentUser = accounts.find((account) => account.id === currentUserId);
  const target = accounts.find((account) => account.id === userId);

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("An admin account is required to remove users.");
  }
  if (!target) throw new Error("This account no longer exists.");
  if (userId === currentUserId)
    throw new Error("You cannot remove the account you are currently using.");
  if (
    target.role === "admin" &&
    accounts.filter((account) => account.role === "admin").length === 1
  ) {
    throw new Error("The last administrator account cannot be removed.");
  }

  writeAccounts(accounts.filter((account) => account.id !== userId));
}

export function logoutLocalUser(): void {
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem("sukoon_logged_in");
  window.localStorage.removeItem("sukoon_user_email");
}
