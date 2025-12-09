import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  BackHandler,
  Modal,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useTheme } from '../theme/ThemeProvider';
import type { ColorTokens } from '../theme/tokens';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Snap noktaları (ekran yüksekliğinin yüzdesi olarak)
const SNAP_POINTS = {
  CLOSED: SCREEN_HEIGHT,
  HALF: SCREEN_HEIGHT * 0.4,
  FULL: SCREEN_HEIGHT * 0.08,
};

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function DraggableBottomSheet({
  visible,
  onClose,
  children,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const translateY = useSharedValue(SNAP_POINTS.CLOSED);
  const context = useSharedValue({ y: 0 });

  const scrollTo = useCallback(
    (destination: number) => {
      'worklet';
      translateY.value = withSpring(destination, {
        damping: 25,
        stiffness: 300,
      });
    },
    [translateY]
  );

  const closeSheet = useCallback(() => {
    scrollTo(SNAP_POINTS.CLOSED);
    setTimeout(onClose, 200);
  }, [scrollTo, onClose]);

  // Açılış/Kapanış animasyonu
  useEffect(() => {
    if (visible) {
      scrollTo(SNAP_POINTS.HALF);
    } else {
      scrollTo(SNAP_POINTS.CLOSED);
    }
  }, [visible, scrollTo]);

  // Android geri tuşu
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        closeSheet();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [visible, closeSheet]);

  const gesture = Gesture.Pan()
    // Sadece dikey hareket için aktive ol
    // Yatay hareket 30px'i geçerse gesture'ı iptal et (tab swipe'a izin ver)
    .activeOffsetY([-10, 10])
    .failOffsetX([-30, 30])
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      // Sadece dikey hareketi işle
      const newY = context.value.y + event.translationY;
      // Üst sınırı aşmasını engelle
      translateY.value = Math.max(SNAP_POINTS.FULL, newY);
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      const currentY = translateY.value;

      // Hızlı hareket kontrolü
      if (velocity > 500) {
        // Aşağı hızlı çekme - kapat
        runOnJS(closeSheet)();
        return;
      }

      if (velocity < -500) {
        // Yukarı hızlı çekme - tam ekran
        scrollTo(SNAP_POINTS.FULL);
        return;
      }

      // Snap noktalarına göre en yakın pozisyona git
      const distToHalf = Math.abs(currentY - SNAP_POINTS.HALF);
      const distToFull = Math.abs(currentY - SNAP_POINTS.FULL);
      const distToClosed = Math.abs(currentY - SNAP_POINTS.CLOSED);

      if (distToClosed < distToHalf && distToClosed < distToFull) {
        runOnJS(closeSheet)();
      } else if (distToFull < distToHalf) {
        scrollTo(SNAP_POINTS.FULL);
      } else {
        scrollTo(SNAP_POINTS.HALF);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const progress = 1 - translateY.value / SCREEN_HEIGHT;
    return {
      opacity: Math.min(progress * 0.8, 0.8),
    };
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      <GestureHandlerRootView style={styles.overlay}>
        {/* Backdrop - tüm dokunmaları yakalar */}
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <Pressable style={styles.backdropPressable} onPress={closeSheet} />
        </Animated.View>

        {/* Bottom Sheet */}
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.sheet, animatedStyle]}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Content */}
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}

const createStyles = (colors: ColorTokens) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1000,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.overlay,
    },
    backdropPressable: {
      flex: 1,
    },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: SCREEN_HEIGHT,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 1,
      borderColor: colors.border,
    },
    handleContainer: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.iconMuted,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
  });
