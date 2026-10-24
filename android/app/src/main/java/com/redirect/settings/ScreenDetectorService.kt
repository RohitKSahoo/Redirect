package com.redirect.settings

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

class ScreenDetectorService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            return
        }

        val pkgName = event.packageName?.toString() ?: return
        val clsName = event.className?.toString() ?: return

        // Ignore our own app package so we only record external screens
        if (pkgName == applicationContext.packageName) {
            return
        }

        // Notify our native module singleton
        ScreenDetectorModule.onScreenCaptured(pkgName, clsName)
    }

    override fun onInterrupt() {
        // Required callback
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        isServiceRunning = true
    }

    override fun onDestroy() {
        super.onDestroy()
        isServiceRunning = false
    }

    companion object {
        var isServiceRunning: Boolean = false
    }
}
