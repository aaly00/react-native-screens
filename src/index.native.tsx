import React from 'react';
import {
  Animated,
  Image,
  ImageProps,
  Platform,
  requireNativeComponent,
  StyleSheet,
  UIManager,
  View,
  ViewProps,
} from 'react-native';
// @ts-ignore Getting private component
// eslint-disable-next-line import/default
import processColor from 'react-native/Libraries/StyleSheet/processColor';

import {
  StackPresentationTypes,
  StackAnimationTypes,
  BlurEffectTypes,
  ScreenReplaceTypes,
  ScreenOrientationTypes,
  HeaderSubviewTypes,
  ScreenProps,
  ScreenContainerProps,
  ScreenStackProps,
  ScreenStackHeaderConfigProps,
  SearchBarProps,
} from './types';

// web implementation is taken from `index.tsx`
const isPlatformSupported = Platform.OS === 'ios' || Platform.OS === 'android';

let ENABLE_SCREENS = isPlatformSupported;

function enableScreens(shouldEnableScreens = true): void {
  ENABLE_SCREENS = isPlatformSupported && shouldEnableScreens;
  if (ENABLE_SCREENS && !UIManager.getViewManagerConfig('RNSScreen')) {
    console.error(
      `Screen native module hasn't been linked. Please check the react-native-screens README for more details`
    );
  }
}

// const that tells if the library should use new implementation, will be undefined for older versions
const shouldUseActivityState = true;

function screensEnabled(): boolean {
  return ENABLE_SCREENS;
}

// We initialize these lazily so that importing the module doesn't throw error when not linked
// This is necessary coz libraries such as React Navigation import the library where it may not be enabled
let NativeScreenValue: React.ComponentType<ScreenProps>;
let NativeScreenContainerValue: React.ComponentType<ScreenContainerProps>;
let NativeScreenStack: React.ComponentType<ScreenStackProps>;
let NativeScreenStackHeaderConfig: React.ComponentType<ScreenStackHeaderConfigProps>;
let NativeScreenStackHeaderSubview: React.ComponentType<React.PropsWithChildren<
  ViewProps & { type?: HeaderSubviewTypes }
>>;
let AnimatedNativeScreen: React.ComponentType<ScreenProps>;
let NativeSearchBar: React.ComponentType<SearchBarProps>;

const ScreensNativeModules = {
  get NativeScreen() {
    NativeScreenValue =
      NativeScreenValue || requireNativeComponent('RNSScreen');
    return NativeScreenValue;
  },

  get NativeScreenContainer() {
    NativeScreenContainerValue =
      NativeScreenContainerValue ||
      requireNativeComponent('RNSScreenContainer');
    return NativeScreenContainerValue;
  },

  get NativeScreenStack() {
    NativeScreenStack =
      NativeScreenStack || requireNativeComponent('RNSScreenStack');
    return NativeScreenStack;
  },

  get NativeScreenStackHeaderConfig() {
    NativeScreenStackHeaderConfig =
      NativeScreenStackHeaderConfig ||
      requireNativeComponent('RNSScreenStackHeaderConfig');
    return NativeScreenStackHeaderConfig;
  },

  get NativeScreenStackHeaderSubview() {
    NativeScreenStackHeaderSubview =
      NativeScreenStackHeaderSubview ||
      requireNativeComponent('RNSScreenStackHeaderSubview');
    return NativeScreenStackHeaderSubview;
  },

  get NativeSearchBar() {
    NativeSearchBar = NativeSearchBar || requireNativeComponent('RNSSearchBar');
    return NativeSearchBar;
  },
};

const Screen = React.forwardRef<React.ComponentType<ScreenProps>, ScreenProps>(
  (props, ref) => {
    // let _ref: React.ElementRef<typeof View> | null = null;
    // let smg = null;
    // private ref: React.ElementRef<typeof View> | null = null;
    // private tag: number | null = null;
    // // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // private eventHandler: any;

    // const _ref = React.useRef<typeof Screen>();

    // const setNativeProps = (props: ScreenProps): void => {
    //   _ref?.current?.setNativeProps(props);
    // }

    // const setRef = (ref: React.ElementRef<typeof View> | null): void => {
    // _ref = ref;
    // props.onComponentRef?.(ref);
    // };

    // componentWillUnmount() {
    //   if (this.eventHandler) {
    //     this.eventHandler.unregisterFromEvents();
    //     this.eventHandler = null;
    //   }
    // }
    const { enabled = ENABLE_SCREENS } = props;

    if (enabled && isPlatformSupported) {
      // @ts-ignore some types incompability
      AnimatedNativeScreen =
        AnimatedNativeScreen ||
        Animated.createAnimatedComponent(
          ScreensNativeModules.NativeScreen as any
        );

      // Filter out active prop in this case because it is unused and
      // can cause problems depending on react-native version:
      // https://github.com/react-navigation/react-navigation/issues/4886
      // same for enabled prop
      let {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        enabled,
        active,
        activityState,
        // onTransitionProgress,
        statusBarColor,
        ...rest
      } = props;
      if (active !== undefined && activityState === undefined) {
        console.warn(
          'It appears that you are using old version of react-navigation library. Please update @react-navigation/bottom-tabs, @react-navigation/stack and @react-navigation/drawer to version 5.10.0 or above to take full advantage of new functionality added to react-native-screens'
        );
        activityState = active !== 0 ? 2 : 0; // in the new version, we need one of the screens to have value of 2 after the transition
      }

      // if (
      //   isRea2Available &&
      //   smg == null &&
      //   // @ts-ignore no type for worklet
      //   onTransitionProgress?.__worklet
      // ) {
      //   smg = useEvent(onTransitionProgress, [
      //     Platform.OS === 'android'
      //       ? 'onTransitionProgress'
      //       : 'topTransitionProgress',
      //   ]);
      //   console.warn(smg);
      //   // this.eventHandler.registerForEvents(tag);
      // }

      // // @ts-ignore no type for worklet
      // if (onTransitionProgress?.__worklet) {
      //   // eslint-disable-next-line @typescript-eslint/no-empty-function
      //   onTransitionProgress = () => {};
      // }

      const processedColor = processColor(statusBarColor);

      return (
        <AnimatedNativeScreen
          {...rest}
          statusBarColor={processedColor}
          activityState={activityState}
          // onTransitionProgress={onTransitionProgress}
          // @ts-ignore some ref inconsistencies
          ref={ref}
        />
      );
    } else {
      // same reason as above
      let {
        active,
        activityState,
        style,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        enabled,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onComponentRef,
        ...rest
      } = props;

      if (active !== undefined && activityState === undefined) {
        activityState = active !== 0 ? 2 : 0;
      }
      return (
        <Animated.View
          style={[style, { display: activityState !== 0 ? 'flex' : 'none' }]}
          ref={ref}
          {...rest}
        />
      );
    }
  }
);

function ScreenContainer(props: ScreenContainerProps) {
  const { enabled, ...rest } = props;

  if (enabled && isPlatformSupported) {
    return <ScreensNativeModules.NativeScreenContainer {...rest} />;
  }
  return <View {...rest} />;
}

const styles = StyleSheet.create({
  headerSubview: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const ScreenStackHeaderBackButtonImage = (props: ImageProps): JSX.Element => (
  <ScreensNativeModules.NativeScreenStackHeaderSubview
    type="back"
    style={styles.headerSubview}>
    <Image resizeMode="center" fadeDuration={0} {...props} />
  </ScreensNativeModules.NativeScreenStackHeaderSubview>
);

const ScreenStackHeaderRightView = (
  props: React.PropsWithChildren<ViewProps>
): JSX.Element => (
  <ScreensNativeModules.NativeScreenStackHeaderSubview
    {...props}
    type="right"
    style={styles.headerSubview}
  />
);

const ScreenStackHeaderLeftView = (
  props: React.PropsWithChildren<ViewProps>
): JSX.Element => (
  <ScreensNativeModules.NativeScreenStackHeaderSubview
    {...props}
    type="left"
    style={styles.headerSubview}
  />
);

const ScreenStackHeaderCenterView = (
  props: React.PropsWithChildren<ViewProps>
): JSX.Element => (
  <ScreensNativeModules.NativeScreenStackHeaderSubview
    {...props}
    type="center"
    style={styles.headerSubview}
  />
);

const ScreenStackHeaderSearchBarView = (
  props: React.PropsWithChildren<SearchBarProps>
): JSX.Element => (
  <ScreensNativeModules.NativeScreenStackHeaderSubview
    {...props}
    type="searchBar"
    style={styles.headerSubview}
  />
);

export type {
  StackPresentationTypes,
  StackAnimationTypes,
  BlurEffectTypes,
  ScreenReplaceTypes,
  ScreenOrientationTypes,
  HeaderSubviewTypes,
  ScreenProps,
  ScreenContainerProps,
  ScreenStackProps,
  ScreenStackHeaderConfigProps,
  SearchBarProps,
};

module.exports = {
  // these are classes so they are not evaluated until used
  // so no need to use getters for them
  Screen,
  ScreenContainer,

  get NativeScreen() {
    return ScreensNativeModules.NativeScreen;
  },

  get NativeScreenContainer() {
    return ScreensNativeModules.NativeScreenContainer;
  },

  get ScreenStack() {
    return ScreensNativeModules.NativeScreenStack;
  },
  get ScreenStackHeaderConfig() {
    return ScreensNativeModules.NativeScreenStackHeaderConfig;
  },
  get ScreenStackHeaderSubview() {
    return ScreensNativeModules.NativeScreenStackHeaderSubview;
  },
  get SearchBar() {
    if (Platform.OS !== 'ios') {
      console.warn('Importing SearchBar is only valid on iOS devices.');
      return View;
    }

    return ScreensNativeModules.NativeSearchBar;
  },
  // these are functions and will not be evaluated until used
  // so no need to use getters for them
  ScreenStackHeaderBackButtonImage,
  ScreenStackHeaderRightView,
  ScreenStackHeaderLeftView,
  ScreenStackHeaderCenterView,
  ScreenStackHeaderSearchBarView,

  enableScreens,
  screensEnabled,
  shouldUseActivityState,
};
