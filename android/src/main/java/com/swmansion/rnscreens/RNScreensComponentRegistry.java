/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.swmansion.rnscreens;

import com.facebook.jni.HybridData;
import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.fabric.ComponentFactory;
import com.facebook.soloader.SoLoader;

@DoNotStrip
public class RNScreensComponentRegistry {
  static {
    SoLoader.loadLibrary("fabricjni");
    SoLoader.loadLibrary("rnscreens_modules");
  }

  @DoNotStrip private final HybridData mHybridData;

  @DoNotStrip
  private native HybridData initHybrid(ComponentFactory componentFactory);

  @DoNotStrip
  private RNScreensComponentRegistry(ComponentFactory componentFactory) {
    mHybridData = initHybrid(componentFactory);
  }

  @DoNotStrip
  public static RNScreensComponentRegistry register(ComponentFactory componentFactory) {
    return new RNScreensComponentRegistry(componentFactory);
  }
}
