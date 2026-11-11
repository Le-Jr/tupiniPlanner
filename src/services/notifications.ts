import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { Reminder } from "../domain/reminders";
import { colors } from "../theme/tokens";

/** Local notifications only: nothing leaves the device, no push server. */
export const notificationsSupported = Platform.OS !== "web";
const channelId = "missoes";

// PermissionResponse comes from expo-modules-core, which TS can't see here.
type Permission = { granted: boolean; canAskAgain: boolean };
const permission = async () =>
  (await Notifications.getPermissionsAsync()) as unknown as Permission;

let configured = false;
async function configure() {
  if (configured || !notificationsSupported) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync(channelId, {
      name: "Missões e lembretes",
      description: "Lembretes das missões, bom dia e placar da noite.",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 120, 80, 120],
      lightColor: colors.primary,
    });
}

/** Asks the OS when needed; resolves to whether reminders can be shown. */
export async function ensurePermission(): Promise<boolean> {
  if (!notificationsSupported) return false;
  await configure();
  const current = await permission();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return (asked as unknown as Permission).granted;
}

async function schedule(r: Reminder) {
  await Notifications.scheduleNotificationAsync({
    identifier: r.id,
    content: {
      title: r.title,
      body: r.body,
      data: { url: r.url },
      color: colors.primary,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: r.at,
      channelId,
    },
  });
}

let lastKey = "";
/** Replaces every scheduled reminder with `list` (skips when unchanged). */
export async function syncReminders(list: Reminder[]): Promise<void> {
  if (!notificationsSupported) return;
  const key = JSON.stringify(
    list.map((r) => [r.id, r.at.getTime(), r.title, r.body]),
  );
  if (key === lastKey) return;
  await configure();
  await Notifications.cancelAllScheduledNotificationsAsync();
  lastKey = key;
  if (!list.length) return;
  if (!(await permission()).granted) {
    lastKey = "";
    return;
  }
  for (const r of list) await schedule(r);
}

export async function sendSample(r: Reminder): Promise<boolean> {
  if (!(await ensurePermission())) return false;
  await schedule(r);
  return true;
}

/** Opens the route carried by a tapped notification (also on cold start). */
export function listenForTaps(open: (url: string) => void): () => void {
  if (!notificationsSupported) return () => {};
  const handle = (response: Notifications.NotificationResponse | null) => {
    const url = response?.notification.request.content.data?.url;
    if (typeof url === "string") open(url);
  };
  // Cold start: handle once, then clear so later launches don't reopen it.
  void Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      handle(response);
      if (response) return Notifications.clearLastNotificationResponseAsync();
    })
    .catch(() => {});
  const sub = Notifications.addNotificationResponseReceivedListener(handle);
  return () => sub.remove();
}
