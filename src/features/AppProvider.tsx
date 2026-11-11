import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AccessibilityInfo, AppState } from "react-native";
import { randomUUID } from "expo-crypto";
import * as Haptics from "expo-haptics";
import { initialize, persist } from "../db/repository";
import { emptyState, type State } from "../domain/model";
import { localDate, materialize, shiftDate } from "../domain/planner";
import { message } from "../utils/input";
export const uuid = () => randomUUID();
export type Mutation = (draft: State) => void;
interface Context {
  state: State;
  ready: boolean;
  busy: boolean;
  error: string;
  today: string;
  systemReduce: boolean;
  reward: string | null;
  mutate: (fn: Mutation) => Promise<void>;
  run: (fn: () => Promise<unknown> | void) => void;
  clearError: () => void;
  retryInitialization: () => void;
  celebrate: (badge: string) => void;
  closeReward: () => void;
  /** True when decorative motion is allowed (app setting + OS reduce motion). */
  animate: boolean;
  haptic: (kind?: "tap" | "success" | "select") => void;
  toast: Toast | null;
  notify: (text: string, tone?: Toast["tone"]) => void;
}
export interface Toast {
  id: number;
  text: string;
  tone: "success" | "info" | "reward";
}
const AppContext = createContext<Context | null>(null);
function syncAgenda(s: State, today: string) {
  if (!s.profiles[0]?.onboardingCompleted) return;
  const settings = s.settings[0]!;
  // Backfill a bounded window; older stored history is always preserved.
  let date = settings.lastAgendaDate ?? today;
  const floor = shiftDate(today, -366);
  if (date < floor) date = floor;
  // A clock moved backwards never rewrites existing occurrences.
  while (date <= today) {
    materialize(s, date, uuid);
    date = shiftDate(date, 1);
  }
  materialize(s, today, uuid);
  settings.lastAgendaDate = today;
}
export function AppProvider({ children }: { children: React.ReactNode }) {
  const current = useRef(emptyState());
  const queue = useRef<Promise<void>>(Promise.resolve());
  const [state, setState] = useState(current.current);
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [today, setToday] = useState(localDate());
  const [systemReduce, setSystemReduce] = useState(false);
  const [reward, setReward] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const pending = useRef(0);
  const mutate = useCallback((fn: Mutation) => {
    pending.current++;
    setBusy(true);
    const next = queue.current.then(async () => {
      const draft = JSON.parse(JSON.stringify(current.current)) as State;
      syncAgenda(draft, localDate());
      fn(draft);
      syncAgenda(draft, localDate());
      await persist(current.current, draft);
      current.current = draft;
      setState(draft);
    });
    queue.current = next.catch(() => {});
    return next.finally(() => {
      pending.current--;
      if (!pending.current) setBusy(false);
    });
  }, []);
  const run = useCallback((fn: () => Promise<unknown> | void) => {
    setError("");
    void Promise.resolve()
      .then(fn)
      .catch((e) => setError(message(e)));
  }, []);
  useEffect(() => {
    let active = true;
    const loading = queue.current.then(async () => {
      const s = await initialize();
      const before = JSON.parse(JSON.stringify(s)) as State;
      syncAgenda(s, localDate());
      await persist(before, s);
      if (active) {
        current.current = s;
        setState(s);
        setReady(true);
      }
    });
    queue.current = loading.catch((e) => {
      if (active) setError(message(e));
    });
    return () => {
      active = false;
    };
  }, [attempt]);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduce);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setSystemReduce,
    );
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (!ready) return;
    const tick = () => {
      const date = localDate();
      if (date !== today) {
        setToday(date);
        run(() => mutate((s) => syncAgenda(s, date)));
      }
    };
    const timer = setInterval(tick, 15000);
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") tick();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [ready, today, mutate, run]);
  const celebrate = useCallback((badge: string) => {
    const settings = current.current.settings[0]!;
    if (settings.animationsEnabled) setReward(badge);
    if (settings.hapticsEnabled)
      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
  }, []);
  const settings = state.settings[0];
  const animate =
    !!settings?.animationsEnabled && !settings?.reducedMotion && !systemReduce;
  const haptic = useCallback((kind: "tap" | "success" | "select" = "tap") => {
    if (!current.current.settings[0]?.hapticsEnabled) return;
    const done =
      kind === "success"
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : kind === "select"
          ? Haptics.selectionAsync()
          : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    void done.catch(() => {});
  }, []);
  const notify = useCallback(
    (text: string, tone: Toast["tone"] = "success") => {
      clearTimeout(toastTimer.current);
      setToast({ id: Date.now(), text, tone });
      toastTimer.current = setTimeout(() => setToast(null), 2600);
    },
    [],
  );
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  return (
    <AppContext.Provider
      value={{
        state,
        ready,
        busy,
        error,
        today,
        systemReduce,
        reward,
        mutate,
        run,
        clearError: () => setError(""),
        retryInitialization: () => {
          setError("");
          setAttempt((value) => value + 1);
        },
        celebrate,
        closeReward: () => setReward(null),
        animate,
        haptic,
        toast,
        notify,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
/** Same as useApp, but safe outside the provider (e.g. font-loading splash). */
export function useOptionalApp() {
  return useContext(AppContext);
}
export function useApp() {
  const c = useContext(AppContext);
  if (!c) throw new Error("AppProvider ausente");
  return c;
}
