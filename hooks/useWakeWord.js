// hooks/useWakeWordAlwaysOn.js
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { PorcupineManager } from "@picovoice/porcupine-react-native";
import { Asset } from "expo-asset";
import BackgroundService from "react-native-background-actions";
import * as IntentLauncher from "expo-intent-launcher";

const ACCESS_KEY = "ysHld/IapdCfN/sOB1QUByI4cEV6aYkVO17Ylm4EYVhipS6h2gUjfg==";

export default function useWakeWordAlwaysOn() {
  const managerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const openEmergencyScreen = async () => {
      if (Platform.OS === "android") {
        try {
          await IntentLauncher.startActivityAsync(
            "android.intent.action.VIEW",
            {
              data: "resqall://emergency",
              flags: 0x10000000, // FLAG_ACTIVITY_NEW_TASK
            }
          );
        } catch (err) {
          console.warn("⚠️ Could not open emergency screen:", err);
        }
      }
    };

    const backgroundTask = async () => {
      try {
        console.log("🎙️ Initializing Porcupine always-on listener...");

        // Load keyword file
        const keywordAsset = Asset.fromModule(
          require("../assets/keywords/resqall_android.ppn")
        );
        await keywordAsset.downloadAsync();

        const keywordPath =
          Platform.OS === "android"
            ? keywordAsset.localUri.replace("file://", "")
            : keywordAsset.localUri;

        // Initialize Porcupine
        managerRef.current = await PorcupineManager.fromKeywordPaths(
          ACCESS_KEY,
          [keywordPath],
          async () => {
            console.log("🚨 Wake word detected!");
            openEmergencyScreen(); // Use Expo Intent Launcher here
          }
        );

        await managerRef.current.start();
        console.log("✅ Wake word listener started in foreground service");

        // Keep CPU awake while service runs
        while (mounted) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (err) {
        console.error("❌ Wake word background task error:", err);
      }
    };

    const options = {
      taskName: "ResQallWakeWord",
      taskTitle: "ResQall is listening",
      taskDesc: "Your secret phrase will trigger SOS.",
      taskIcon: { name: "ic_launcher", type: "mipmap" },
      color: "#ff0000",
      linkingURI: "resqall://emergency",
      parameters: {},
      // For Android 12+ microphone permission
      foregroundServiceType: "microphone",
    };

    BackgroundService.start(backgroundTask, options);

    return () => {
      mounted = false;
      if (managerRef.current) managerRef.current.stop();
      BackgroundService.stop();
    };
  }, []);
}
