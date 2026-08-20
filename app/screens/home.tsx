import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RFValue } from "react-native-responsive-fontsize";
import { useVoiceChat } from "../../hooks/useVoiceChat";

type Message = {
    id: string;
    text: string;
    sender: "bot" | "user";
};

const WELCOME_MESSAGE =
    "Hello! I'm Talkie-GPT. Just hold the mic and talk to me — I'll help you with anything you need.";

const TYPING_SPEED_MS = 45;
const READ_PAUSE_MS = 2800;

export default function Home() {
    const { status, sendMessage } = useVoiceChat();
    const [inputText, setInputText] = useState("");
    const headerHeight = useHeaderHeight();
    const insets = useSafeAreaInsets();

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const welcomeOpacity = useRef(new Animated.Value(1)).current;
    const boxOpacity = useRef(new Animated.Value(0)).current;
    const boxScale = useRef(new Animated.Value(0.96)).current;
    const chatOpacity = useRef(new Animated.Value(0)).current;
    const chatY = useRef(new Animated.Value(24)).current;
    const cursorOpacity = useRef(new Animated.Value(1)).current;

    const [isRecording, setIsRecording] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [typedText, setTypedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const showChatRef = useRef(false);

    const goToChat = useCallback(() => {
        showChatRef.current = true;
        setShowChat(true);
        setMessages((prev) =>
            prev.length > 0
                ? prev
                : [{ id: "1", text: WELCOME_MESSAGE, sender: "bot" }]
        );

        Animated.parallel([
            Animated.timing(welcomeOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(chatOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(chatY, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();
    }, [chatOpacity, chatY, welcomeOpacity]);

    useEffect(() => {
        const cursorBlink = Animated.loop(
            Animated.sequence([
                Animated.timing(cursorOpacity, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(cursorOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        );
        cursorBlink.start();
        return () => cursorBlink.stop();
    }, [cursorOpacity]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        let readTimeout: ReturnType<typeof setTimeout> | null = null;

        Animated.parallel([
            Animated.timing(boxOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(boxScale, {
                toValue: 1,
                friction: 8,
                tension: 60,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (!finished) return;

            setIsTyping(true);
            let index = 0;
            interval = setInterval(() => {
                index += 1;
                setTypedText(WELCOME_MESSAGE.slice(0, index));

                if (index >= WELCOME_MESSAGE.length) {
                    if (interval) clearInterval(interval);
                    setIsTyping(false);
                    readTimeout = setTimeout(() => goToChat(), READ_PAUSE_MS);
                }
            }, TYPING_SPEED_MS);
        });

        return () => {
            if (interval) clearInterval(interval);
            if (readTimeout) clearTimeout(readTimeout);
        };
    }, [boxOpacity, boxScale, goToChat]);

    const startRecording = () => {
        setIsRecording(true);
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.4,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const stopRecording = () => {
        setIsRecording(false);
        scaleAnim.stopAnimation();
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();

        Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const handleSend = async () => {
        const text = inputText.trim();
        if (!text || status === "thinking") return;

        if (!showChatRef.current) {
            goToChat();
        }

        setMessages((prev) => [
            ...prev,
            { id: `user-${Date.now()}`, text, sender: "user" },
        ]);
        setInputText("");

        const reply = await sendMessage(text);
        if (reply) {
            setMessages((prev) => [
                ...prev,
                { id: `bot-${Date.now()}`, text: reply, sender: "bot" },
            ]);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isBot = item.sender === "bot";
        return (
            <View
                style={[
                    styles.messageBubble,
                    isBot ? styles.botBubble : styles.userBubble,
                ]}
            >
                {isBot && (
                    <View style={styles.botAvatar}>
                        <Ionicons
                            name="chatbubble-ellipses"
                            size={RFValue(16)}
                            color="#1A3A4A"
                        />
                    </View>
                )}
                <View
                    style={[
                        styles.bubbleContent,
                        isBot ? styles.botBubbleContent : styles.userBubbleContent,
                    ]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            isBot ? styles.botText : styles.userText,
                        ]}
                    >
                        {item.text}
                    </Text>
                </View>
            </View>
        );
    };

    const canSend = inputText.trim().length > 0 && status !== "thinking";

    return (
        <LinearGradient
            colors={["#0F2027", "#203A43", "#2C5364"]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={headerHeight}
            >
                <View style={styles.chatArea}>
                    <Animated.View
                        pointerEvents={showChat ? "none" : "auto"}
                        style={[
                            styles.welcomeOverlay,
                            { opacity: welcomeOpacity },
                        ]}
                    >
                        <Animated.View
                            style={[
                                styles.welcomeContainer,
                                {
                                    opacity: boxOpacity,
                                    transform: [{ scale: boxScale }],
                                },
                            ]}
                        >
                            <View style={styles.welcomeIconWrap}>
                                <Ionicons
                                    name="chatbubble-ellipses"
                                    size={RFValue(28)}
                                    color="#2C5364"
                                />
                            </View>
                            <Text style={styles.welcomeTyped}>
                                {typedText}
                                {isTyping && (
                                    <Animated.Text
                                        style={[
                                            styles.cursor,
                                            { opacity: cursorOpacity },
                                        ]}
                                    >
                                        |
                                    </Animated.Text>
                                )}
                            </Text>
                        </Animated.View>
                    </Animated.View>

                    {showChat && (
                        <Animated.View
                            style={[
                                styles.chatListWrap,
                                {
                                    opacity: chatOpacity,
                                    transform: [{ translateY: chatY }],
                                },
                            ]}
                        >
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                renderItem={renderMessage}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.messagesList}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                onContentSizeChange={() =>
                                    flatListRef.current?.scrollToEnd({
                                        animated: true,
                                    })
                                }
                            />
                        </Animated.View>
                    )}
                </View>

                {isRecording && (
                    <View style={styles.recordingStatus}>
                        <View style={styles.recordingDot} />
                        <Text style={styles.recordingText}>Listening...</Text>
                    </View>
                )}

                {status === "thinking" && (
                    <Text style={styles.thinkingText}>Thinking...</Text>
                )}

                <View
                    style={[
                        styles.bottomBar,
                        { paddingBottom: Math.max(insets.bottom, RFValue(12)) },
                    ]}
                >
                    <View style={styles.inputRow}>
                        <TextInput
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Type a message..."
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            style={styles.input}
                            editable={status !== "thinking"}
                            onSubmitEditing={handleSend}
                            returnKeyType="send"
                        />

                        {canSend ? (
                            <Pressable
                                onPress={handleSend}
                                style={({ pressed }) => [
                                    styles.actionButton,
                                    pressed && styles.actionButtonPressed,
                                ]}
                            >
                                <Ionicons
                                    name="send"
                                    size={RFValue(16)}
                                    color="#0F2027"
                                />
                            </Pressable>
                        ) : (
                            <View style={styles.micWrap}>
                                <Animated.View
                                    style={[
                                        styles.pulseRing,
                                        {
                                            opacity: opacityAnim,
                                            transform: [{ scale: scaleAnim }],
                                        },
                                    ]}
                                />
                                <Animated.View
                                    style={[
                                        styles.pulseRingOuter,
                                        {
                                            opacity: Animated.multiply(
                                                opacityAnim,
                                                0.5
                                            ),
                                            transform: [
                                                {
                                                    scale: Animated.multiply(
                                                        scaleAnim,
                                                        1.3
                                                    ),
                                                },
                                            ],
                                        },
                                    ]}
                                />
                                <Pressable
                                    onPressIn={startRecording}
                                    onPressOut={stopRecording}
                                    disabled={status === "thinking"}
                                    style={({ pressed }) => [
                                        styles.actionButton,
                                        pressed && styles.actionButtonPressed,
                                        status === "thinking" &&
                                            styles.actionButtonDisabled,
                                    ]}
                                >
                                    <MaterialIcons
                                        name="mic"
                                        size={RFValue(22)}
                                        color="#0F2027"
                                    />
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },

    chatArea: {
        flex: 1,
        paddingTop: RFValue(10),
        paddingHorizontal: RFValue(16),
    },

    welcomeOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        paddingHorizontal: RFValue(16),
    },

    welcomeContainer: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: RFValue(20),
        paddingVertical: RFValue(24),
        backgroundColor: "#ffffff",
        borderRadius: RFValue(20),
        marginVertical: RFValue(20),
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: RFValue(2) },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    welcomeIconWrap: {
        width: RFValue(56),
        height: RFValue(56),
        borderRadius: RFValue(28),
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: RFValue(20),
    },
    welcomeTyped: {
        fontSize: RFValue(15),
        color: "#1a1a1a",
        textAlign: "center",
        lineHeight: RFValue(22),
    },
    cursor: {
        color: "#2C5364",
        fontWeight: "300",
    },

    chatListWrap: {
        flex: 1,
    },

    messagesList: {
        paddingBottom: RFValue(10),
        paddingTop: RFValue(8),
    },
    messageBubble: {
        flexDirection: "row",
        marginBottom: RFValue(12),
        alignItems: "flex-end",
    },
    botBubble: {
        alignSelf: "flex-start",
    },
    userBubble: {
        alignSelf: "flex-end",
        flexDirection: "row-reverse",
    },
    botAvatar: {
        width: RFValue(32),
        height: RFValue(32),
        borderRadius: RFValue(16),
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: RFValue(8),
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: RFValue(1) },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "rgba(255,255,255,0.9)",
    },
    bubbleContent: {
        maxWidth: "78%",
        paddingHorizontal: RFValue(14),
        paddingVertical: RFValue(10),
        borderRadius: RFValue(18),
    },
    botBubbleContent: {
        backgroundColor: "rgba(255,255,255,0.12)",
        borderBottomLeftRadius: RFValue(4),
    },
    userBubbleContent: {
        backgroundColor: "#ffffff",
        borderBottomRightRadius: RFValue(4),
    },
    messageText: {
        fontSize: RFValue(14),
        lineHeight: RFValue(20),
    },
    botText: {
        color: "#ffffff",
    },
    userText: {
        color: "#0F2027",
    },

    recordingStatus: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: RFValue(8),
    },
    recordingDot: {
        width: RFValue(8),
        height: RFValue(8),
        borderRadius: RFValue(4),
        backgroundColor: "#FF4444",
        marginRight: RFValue(6),
    },
    recordingText: {
        color: "rgba(255,255,255,0.7)",
        fontSize: RFValue(13),
    },
    thinkingText: {
        textAlign: "center",
        color: "rgba(255,255,255,0.65)",
        fontSize: RFValue(12),
        marginBottom: RFValue(4),
    },

    bottomBar: {
        paddingTop: RFValue(10),
        paddingHorizontal: RFValue(16),
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        gap: RFValue(8),
    },
    input: {
        flex: 1,
        minHeight: RFValue(42),
        borderRadius: RFValue(22),
        paddingHorizontal: RFValue(16),
        paddingVertical: RFValue(10),
        backgroundColor: "rgba(255,255,255,0.12)",
        color: "#ffffff",
        fontSize: RFValue(14),
    },
    micWrap: {
        width: RFValue(42),
        height: RFValue(42),
        justifyContent: "center",
        alignItems: "center",
    },
    pulseRing: {
        position: "absolute",
        width: RFValue(42),
        height: RFValue(42),
        borderRadius: RFValue(21),
        backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
    pulseRingOuter: {
        position: "absolute",
        width: RFValue(42),
        height: RFValue(42),
        borderRadius: RFValue(21),
        backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    actionButton: {
        width: RFValue(42),
        height: RFValue(42),
        borderRadius: RFValue(21),
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
    },
    actionButtonPressed: {
        opacity: 0.85,
    },
    actionButtonDisabled: {
        backgroundColor: "rgba(255,255,255,0.35)",
    },
});
