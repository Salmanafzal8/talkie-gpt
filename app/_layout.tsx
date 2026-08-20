import { SplashScreen, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      // Yahan fonts load karo, API call karo, etc.
      await new Promise((resolve) => setTimeout(resolve, 6000)); // 6 second delay
      setAppReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  if (!appReady) {
    return (
      <View style={styles.splash}>
        <Image
          source={require("../assets/images/talkie-gpt.png")}
          style={{ width: RFValue(200), height: RFValue(200) }}
          resizeMode="contain"
        />
      </View>
    );
  }

  return <Stack
    screenOptions={{
      headerStyle: { backgroundColor: "#0F2027" },
      headerShadowVisible: false,
      headerTintColor: "#ffffff",
      headerBackground: () => (
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={{ flex: 1 }}
        />
      ),
      headerTitleStyle: { fontWeight: "bold", fontSize: RFValue(20) },
    }}
  />
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});