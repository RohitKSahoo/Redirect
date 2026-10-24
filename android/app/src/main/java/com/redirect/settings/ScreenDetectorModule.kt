package com.redirect.settings

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class ScreenDetectorModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    init {
        instance = this
    }

    override fun getName(): String {
        return "ScreenDetectorModule"
    }

    @ReactMethod
    fun isServiceEnabled(promise: Promise) {
        promise.resolve(ScreenDetectorService.isServiceRunning)
    }

    @ReactMethod
    fun getLastCapturedScreen(promise: Promise) {
        val map = Arguments.createMap()
        map.putString("packageName", lastPackageName ?: "")
        map.putString("className", lastClassName ?: "")
        promise.resolve(map)
    }

    @ReactMethod
    fun clearLastCaptured(promise: Promise) {
        lastPackageName = null
        lastClassName = null
        promise.resolve(true)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for React Native event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for React Native event emitter
    }

    companion object {
        private var instance: ScreenDetectorModule? = null
        private var lastPackageName: String? = null
        private var lastClassName: String? = null

        fun onScreenCaptured(pkg: String, cls: String) {
            lastPackageName = pkg
            lastClassName = cls

            instance?.let { module ->
                val params = Arguments.createMap().apply {
                    putString("packageName", pkg)
                    putString("className", cls)
                    putDouble("timestamp", System.currentTimeMillis().toDouble())
                }

                try {
                    module.reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("onScreenCaptured", params)
                } catch (e: Exception) {
                    // Context might not be ready
                }
            }
        }
    }
}
