import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { Image, Text, View } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import Home from "./screens/home";

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: "#0F2027" },
          headerTintColor: "#ffffff",
          headerShadowVisible: false,
          headerBackground: () => (
            <LinearGradient
              colors={["#0F2027", "#203A43", "#2C5364"]}
              style={{ flex: 1 }}
            />
          ),
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../assets/images/talkie-gpt.png")}
                style={{
                  width: RFValue(32),
                  height: RFValue(32),
                  resizeMode: "contain",
                  marginRight: RFValue(8),
                }}
              />
              <Text
                style={{
                  color: "#ffffff",
                  fontWeight: "bold",
                  fontSize: RFValue(18),
                  letterSpacing: 0.5,
                }}
              >
                Talkie-GPT
              </Text>
            </View>
          ),
          headerTitleAlign: "left",
        }}
      />
      <Home />
    </View>
  );
}
