// hooks/useWakeWordService.js
import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import { PorcupineManager } from "@picovoice/porcupine-react-native";
import { Asset } from "expo-asset";
import BackgroundService from "react-native-background-actions";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

const ACCESS_KEY = "ysHld/IapdCfN/sOB1QUByI4cEV6aYkVO17Ylm4EYVhipS6h2gUjfg==";

export default function useWakeWordService() {
  const managerRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // ✅ Send local push notification
    const sendEmergencyNotification = async () => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🚨 Emergency Code Detected!",
          body: "Tap to open SOS screen immediately.",
          data: { action: "open_emergency" },
        },
        trigger: null,
      });
    };

    // ✅ Handle SOS trigger
    const triggerSOS = async () => {
      if (appState.current === "active") {
        console.log("🚨 App in foreground — triggering SOS immediately!");
        router.push("/emergency");
      } else {
        console.log("📴 App in background — sending notification...");
        await sendEmergencyNotification();
      }
    };

    // 🟢 Listen for app state changes
    const subscription = AppState.addEventListener("change", (nextState) => {
      appState.current = nextState;
    });

    // 🟢 Configure notification tap handler
    const notificationSub =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const action = response.notification.request.content.data?.action;
        if (action === "open_emergency") {
          router.push("/emergency");
        }
      });

    const backgroundTask = async () => {
      try {
        console.log("🎙️ Initializing Porcupine always-on listener...");

        const keywordAsset = Asset.fromModule(
          require("../assets/keywords/resqall_android.ppn")
        );
        await keywordAsset.downloadAsync();

        const keywordPath =
          Platform.OS === "android"
            ? keywordAsset.localUri.replace("file://", "")
            : keywordAsset.localUri;

        managerRef.current = await PorcupineManager.fromKeywordPaths(
          ACCESS_KEY,
          [keywordPath],
          async () => {
            console.log("🚨 Wake word detected!");
            await triggerSOS();
          }
        );

        await managerRef.current.start();
        console.log("✅ Wake word listener started in foreground service");

        while (mounted) await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        console.error("❌ Wake word background task error:", err);
      }
    };

    const options = {
      taskName: "ResQallListener",
      taskTitle: "ResQall is listening",
      taskDesc: "Say your emergency code to trigger SOS.",
      taskIcon: { name: "ic_launcher", type: "mipmap" },
      color: "#ff0000",
      parameters: {},
    };

    BackgroundService.start(backgroundTask, options);

    return () => {
      mounted = false;
      if (managerRef.current) managerRef.current.stop();
      BackgroundService.stop();
      subscription.remove();
      notificationSub.remove();
    };
  }, []);
}
