import { forwardRef, useRef } from "react";
import { Animated, Pressable } from "react-native";

const PressableScale = forwardRef(
    ({ children, style, scaleTo = 0.97, ...props }, ref) => {
        const scale = useRef(new Animated.Value(1)).current;

        const animateTo = (value) =>
            Animated.spring(scale, {
                toValue: value,
                useNativeDriver: true,
                speed: 40,
                bounciness: 0,
            }).start();

        return (
            <Pressable
                ref={ref}
                onPressIn={() => animateTo(scaleTo)}
                onPressOut={() => animateTo(1)}
                style={style}
                {...props}
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    {children}
                </Animated.View>
            </Pressable>
        );
    }
);

PressableScale.displayName = "PressableScale";

export default PressableScale;