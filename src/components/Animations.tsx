import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Easing } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';

// Micro-interaction: Button press scale
export function PressableScale({
  children,
  onPress,
  scale = 0.95,
  duration = 100,
  ...props
}: {
  children: React.ReactNode;
  onPress?: () => void;
  scale?: number;
  duration?: number;
  [key: string]: any;
}) {
  const scaleAnim = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const handlePressIn = () => {
    scaleAnim.value = withTiming(scale, { duration, easing: Easing.out(Easing.quad) });
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 150 });
    if (onPress) runOnJS(onPress)();
  };

  return (
    <TouchableOpacity
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// Staggered list item animation
export function StaggeredItem({
  children,
  index,
  delay = 50,
  ...props
}: {
  children: React.ReactNode;
  index: number;
  delay?: number;
  [key: string]: any;
}) {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withDelay(
      index * delay,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    opacity.value = withDelay(
      index * delay,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) })
    );
  }, [index, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, props.style]}>
      {children}
    </Animated.View>
  );
}

// Floating action button animation
export function FloatingActionButton({
  children,
  onPress,
  expanded = false,
  ...props
}: {
  children: React.ReactNode;
  onPress?: () => void;
  expanded?: boolean;
  [key: string]: any;
}) {
  const scale = useSharedValue(expanded ? 1 : 0);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(expanded ? 1 : 0, { damping: 20, stiffness: 200 });
    rotate.value = withTiming(expanded ? 45 : 0, { duration: 200 });
  }, [expanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: scale.value,
  }));

  return (
    <PressableScale onPress={onPress} style={props.style}>
      <Animated.View style={[styles.fab, animatedStyle]}>
        {children}
      </Animated.View>
    </PressableScale>
  );
}

// Card entrance animation
export function AnimatedCard({
  children,
  delay = 0,
  ...props
}: {
  children: React.ReactNode;
  delay?: number;
  [key: string]: any;
}) {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  React.useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) })
    );
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 20, stiffness: 200 })
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle, props.style]}>
      {children}
    </Animated.View>
  );
}

// Progress ring animation
export function ProgressRing({
  progress = 0,
  size = 60,
  strokeWidth = 6,
  color = '#2563EB',
  backgroundColor = '#DBEAFE',
  ...props
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  [key: string]: any;
}) {
  const progressAnim = useSharedValue(0);

  React.useEffect(() => {
    progressAnim.value = withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  return (
    <View style={[styles.progressContainer, { width: size, height: size }, props.style]}>
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, animatedStyle]} />
      </View>
      <View style={styles.progressCenter}>
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </View>
  );
}

// Slide in/out panel
export function SlidePanel({
  children,
  visible,
  direction = 'bottom',
  ...props
}: {
  children: React.ReactNode;
  visible: boolean;
  direction?: 'bottom' | 'top' | 'left' | 'right';
  [key: string]: any;
}) {
  const translate = useSharedValue(
    direction === 'bottom' ? (visible ? 0 : 300) :
    direction === 'top' ? (visible ? 0 : -300) :
    direction === 'left' ? (visible ? 0 : -300) :
    (visible ? 0 : 300)
  );
  const opacity = useSharedValue(visible ? 1 : 0);

  React.useEffect(() => {
    const translateTarget = direction === 'bottom' ? (visible ? 0 : 300) :
      direction === 'top' ? (visible ? 0 : -300) :
      direction === 'left' ? (visible ? 0 : -300) :
      (visible ? 0 : 300);
    
    translate.value = withTiming(translateTarget, { 
      duration: 300, 
      easing: Easing.out(Easing.cubic) 
    });
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible, direction]);

  const animatedStyle = useAnimatedStyle(() => {
    const transform = direction === 'bottom' || direction === 'top' 
      ? [{ translateY: translate.value }]
      : [{ translateX: translate.value }];
    
    return {
      transform,
      opacity: opacity.value,
    };
  });

  if (!visible && translate.value === (direction === 'bottom' || direction === 'right' ? 300 : -300)) {
    return null;
  }

  return (
    <Animated.View style={[styles.panel, animatedStyle, props.style]}>
      {children}
    </Animated.View>
  );
}

// Toast/notification animation
export function Toast({
  message,
  visible,
  type = 'info',
  onClose,
  ...props
}: {
  message: string;
  visible: boolean;
  type?: 'info' | 'success' | 'error' | 'warning';
  onClose?: () => void;
  [key: string]: any;
}) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
      
      // Auto dismiss
      setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 200 });
        if (onClose) setTimeout(() => runOnJS(onClose)(), 300);
      }, 4000);
    } else {
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const colors = {
    info: '#2563EB',
    success: '#059669',
    error: '#DC2626',
    warning: '#92400E',
  };

  const bgColors = {
    info: '#DBEAFE',
    success: '#D1FAE5',
    error: '#FEF2F2',
    warning: '#FFFBEB',
  };

  return (
    <Animated.View style={[styles.toast, { backgroundColor: bgColors[type] }, animatedStyle, props.style]}>
      <Text style={[styles.toastText, { color: colors[type] }]}>{message}</Text>
    </Animated.View>
  );
}

// Tab bar item animation
export function AnimatedTabItem({
  children,
  active,
  onPress,
  ...props
}: {
  children: React.ReactNode;
  active: boolean;
  onPress?: () => void;
  [key: string]: any;
}) {
  const scale = useSharedValue(active ? 1.1 : 1);
  const colorAnim = useSharedValue(active ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(active ? 1.1 : 1, { damping: 15, stiffness: 150 });
    colorAnim.value = withTiming(active ? 1 : 0, { duration: 200 });
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <PressableScale onPress={onPress} style={props.style}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </PressableScale>
  );
}

// Skeleton loader shimmer
export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  ...props
}: {
  width?: string | number;
  height?: number;
  borderRadius?: number;
  [key: string]: any;
}) {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    shimmer.value = withTiming(1, { duration: 1500, easing: Easing.linear }, () => {
      shimmer.value = 0;
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(226, 232, 240, ${shimmer.value})`,
  }));

  return (
    <View style={[styles.skeleton, { width, height, borderRadius }, props.style]}>
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
}

// Empty state animation
export function EmptyStateAnimation({
  icon = '📭',
  message = 'Nothing here yet',
  action,
  actionLabel,
  ...props
}: {
  icon?: string;
  message?: string;
  action?: () => void;
  actionLabel?: string;
  [key: string]: any;
}) {
  const iconScale = useSharedValue(0);
  const iconRotate = useSharedValue(-180);
  const textOpacity = useSharedValue(0);

  React.useEffect(() => {
    iconScale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 100 }));
    iconRotate.value = withDelay(300, withSpring(0, { damping: 15, stiffness: 150 }));
    textOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={[styles.emptyContainer, props.style]}>
      <Animated.View style={iconStyle}>
        <Text style={styles.emptyIcon}>{icon}</Text>
      </Animated.View>
      <Animated.Text style={[styles.emptyMessage, textStyle]}>{message}</Animated.Text>
      {action && actionLabel && (
        <PressableScale onPress={action} delay={500}>
          <View style={styles.actionButton}>
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </View>
        </PressableScale>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DBEAFE',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  toastText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  skeleton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});