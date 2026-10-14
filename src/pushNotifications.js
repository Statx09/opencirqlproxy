import { supabase } from "./lib/supabaseClient";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}


export async function createPushSubscription() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();

  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("VITE_VAPID_PUBLIC_KEY is missing.");
  }

  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  if (existing) {
    const oldKey = existing.options.applicationServerKey;

    const keysMatch =
      oldKey &&
      oldKey.byteLength === applicationServerKey.byteLength &&
      applicationServerKey.every((byte, index) => byte === new Uint8Array(oldKey)[index]);

    if (keysMatch) {
      return existing;
    }

    console.log("Renewing push subscription for the current VAPID key.");
    await existing.unsubscribe();
  }

  console.log("Push diagnostics:", {
    origin: location.origin,
    keyLength: publicKey.length,
    decodedKeyLength: applicationServerKey.length,
    userVisibleOnly: true,
    serviceWorkerState: registration.active?.state,
    existingSubscription: false,
  });

  try {
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  } catch (error) {
    console.error("Push subscribe diagnostic:", {
      name: error?.name,
      message: error?.message,
      constructor: error?.constructor?.name,
      keyLength: publicKey.length,
      decodedKeyLength: applicationServerKey.length,
      origin: location.origin,
      serviceWorkerState: registration.active?.state,
    });
    throw new Error(
      "Push subscribe failed [" + (error?.name || "UnknownError") +
      "]: " + (error?.message || String(error))
    );
  }
}



export async function savePushSubscription(userId, subscription) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ push_subscription: subscription.toJSON() })
    .eq("user_id", userId)
    .select("user_id")
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error("No profile row was updated. Check the signed-in user ID and profiles UPDATE policy.");
  }
}






