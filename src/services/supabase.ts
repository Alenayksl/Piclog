import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth metodları
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export type SignUpOptions = {
  full_name?: string;
  username?: string;
};

export async function signUp(
  email: string,
  password: string,
  options?: SignUpOptions,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: options?.full_name?.trim() || undefined,
        username: options?.username?.trim() || undefined,
      },
    },
  });
  return { data, error };
}

export async function signOut() {
  return supabase.auth.signOut();
}

const isMissingOrNotFound = (
  error: { code?: string; message?: string } | null,
) =>
  !!error &&
  (error.code === "42P01" ||
    error.code === "PGRST116" ||
    error.message?.toLowerCase().includes("does not exist") ||
    error.message?.toLowerCase().includes("not found") ||
    error.message?.toLowerCase().includes("relation"));

async function listUserPhotoPaths(prefix: string): Promise<string[]> {
  const allPaths: string[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data, error } = await supabase.storage.from("photos").list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) {
      // Missing bucket/folder should not block account deletion.
      if (isMissingOrNotFound(error)) {
        return allPaths;
      }
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const entry of data) {
      if (entry.id) {
        allPaths.push(`${prefix}/${entry.name}`);
      } else {
        const nested = await listUserPhotoPaths(`${prefix}/${entry.name}`);
        allPaths.push(...nested);
      }
    }

    if (data.length < limit) {
      break;
    }
    offset += limit;
  }

  return allPaths;
}

function extractPhotoPathFromStorageUrl(url: string): string | null {
  const marker = "/photos/";
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) {
    return null;
  }

  const rawPath = url.slice(markerIndex + marker.length).split("?")[0] ?? "";
  const normalizedPath = rawPath.trim();

  if (!normalizedPath) {
    return null;
  }

  try {
    return decodeURIComponent(normalizedPath);
  } catch {
    return normalizedPath;
  }
}

async function deleteUserPhotos(userId: string) {
  const pathSet = new Set<string>();

  // Older records may only be discoverable via saved image URLs.
  const { data: logRows, error: logsReadError } = await supabase
    .from("logs")
    .select("image_url")
    .eq("user_id", userId);

  if (!logsReadError && logRows?.length) {
    for (const row of logRows) {
      const imageUrl = row.image_url;
      if (typeof imageUrl !== "string" || !imageUrl) {
        continue;
      }

      const parsedPath = extractPhotoPathFromStorageUrl(imageUrl);
      if (parsedPath) {
        pathSet.add(parsedPath);
      }
    }
  }

  const listedPaths = await listUserPhotoPaths(userId);
  for (const path of listedPaths) {
    pathSet.add(path);
  }

  const paths = Array.from(pathSet);
  if (!paths.length) {
    return;
  }

  const chunkSize = 100;
  for (let i = 0; i < paths.length; i += chunkSize) {
    const chunk = paths.slice(i, i + chunkSize);
    const { error } = await supabase.storage.from("photos").remove(chunk);
    if (error && !isMissingOrNotFound(error)) {
      throw error;
    }
  }

  // Verify the user folder is actually empty; if not, it is usually a Storage policy issue.
  const remaining = await listUserPhotoPaths(userId);
  if (remaining.length > 0) {
    throw new Error(
      "Fotograflar silinemedi. Supabase Storage policy ayarlarini kontrol et (photos bucket icin SELECT/DELETE izni gerekli).",
    );
  }
}

export async function deleteAccount() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: userError ?? new Error("User not found") };
  }

  try {
    await deleteUserPhotos(user.id);
  } catch (storageError) {
    const message =
      storageError instanceof Error
        ? storageError.message
        : "Fotograflar silinirken hata olustu.";
    return { error: new Error(message) };
  }

  const tryDeleteAuthUser = async () => {
    const { error } = await supabase.rpc("delete_my_account");
    return error;
  };

  let authDeleteError = await tryDeleteAuthUser();

  if (!authDeleteError) {
    const { error: signOutError } = await supabase.auth.signOut();
    return { error: signOutError };
  }

  // If the RPC function is missing, return a clear error so UI can guide setup.
  const rpcMissing =
    authDeleteError.code === "42883" ||
    authDeleteError.message?.toLowerCase().includes("delete_my_account") ||
    authDeleteError.message?.toLowerCase().includes("function");

  if (rpcMissing) {
    return {
      error: new Error(
        "Hesap silme fonksiyonu bulunamadi. Supabase SQL Editor'de delete_my_account fonksiyonunu olusturman gerekiyor.",
      ),
    };
  }

  // Best-effort cleanup, then retry RPC in case auth deletion is blocked by related rows.
  const { error: logsError } = await supabase
    .from("logs")
    .delete()
    .eq("user_id", user.id);

  const { error: profileError } = await supabase
    .from("profiles")
    .delete()
    .eq("id", user.id);

  const cleanupError =
    logsError && !isMissingOrNotFound(logsError)
      ? logsError
      : profileError && !isMissingOrNotFound(profileError)
        ? profileError
        : null;

  authDeleteError = await tryDeleteAuthUser();

  if (authDeleteError) {
    return {
      error: new Error(
        authDeleteError.message ?? cleanupError?.message ?? "Hesap silinemedi.",
      ),
    };
  }

  const { error: signOutError } = await supabase.auth.signOut();
  return { error: signOutError };
}

export function getSession() {
  return supabase.auth.getSession();
}

/** Şifre sıfırlama linki e-postaya gönderilir (Supabase Dashboard'da "Confirm email" ve e-posta ayarları gerekir). */
export async function sendPasswordResetEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email.trim(),
    {
      redirectTo: undefined, // İstersen: 'piclog://reset-password' gibi deep link
    },
  );
  return { data, error };
}

/** Kayıt onay e-postasını tekrar gönderir (Confirm email açıksa). */
export async function resendConfirmationEmail(email: string) {
  const { data, error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim(),
  });
  return { data, error };
}
