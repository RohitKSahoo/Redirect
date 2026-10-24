package com.redirect.settings

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.drawable.Icon
import android.os.Build
import android.service.quicksettings.TileService
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONObject

class RedirectBridgeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "RedirectBridgeModule"
    }

    @ReactMethod
    fun syncShortcuts(pinnedJsonStr: String, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("RedirectSettingsPrefs", Context.MODE_PRIVATE)
            prefs.edit().putString("pinned_shortcuts_json", pinnedJsonStr).apply()

            // Refresh home screen widgets
            RedirectBentoWidget.updateAllWidgets(reactContext)
            RedirectSingleWidget.updateAllWidgets(reactContext)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SYNC_ERROR", e.message)
        }
    }

    @ReactMethod
    fun setTileSlot(slotIndex: Int, itemJsonStr: String, promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("RedirectSettingsPrefs", Context.MODE_PRIVATE)
            if (itemJsonStr.isBlank()) {
                prefs.edit().remove("tile_slot_$slotIndex").commit()
            } else {
                prefs.edit().putString("tile_slot_$slotIndex", itemJsonStr).commit()
            }

            // Immediately notify Quick Settings to refresh listening state
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                val tileComponent = when (slotIndex) {
                    1 -> ComponentName(reactContext, QuickTileService1::class.java)
                    2 -> ComponentName(reactContext, QuickTileService2::class.java)
                    3 -> ComponentName(reactContext, QuickTileService3::class.java)
                    else -> null
                }
                if (tileComponent != null) {
                    TileService.requestListeningState(reactContext, tileComponent)
                }
            }

            RedirectSingleWidget.updateAllWidgets(reactContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("TILE_SLOT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getTileSlots(promise: Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("RedirectSettingsPrefs", Context.MODE_PRIVATE)
            val map = Arguments.createMap()
            map.putString("slot1", prefs.getString("tile_slot_1", null))
            map.putString("slot2", prefs.getString("tile_slot_2", null))
            map.putString("slot3", prefs.getString("tile_slot_3", null))
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("GET_TILES_ERROR", e.message)
        }
    }

    @ReactMethod
    fun isPinShortcutSupported(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val shortcutManager = reactContext.getSystemService(ShortcutManager::class.java)
            promise.resolve(shortcutManager?.isRequestPinShortcutSupported == true)
        } else {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun pinShortcutToHomeScreen(itemJsonStr: String, promise: Promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            promise.reject("UNSUPPORTED", "Home screen shortcut pinning requires Android 8.0+")
            return
        }

        try {
            val shortcutManager = reactContext.getSystemService(ShortcutManager::class.java)
            if (shortcutManager == null || !shortcutManager.isRequestPinShortcutSupported) {
                promise.reject("UNSUPPORTED", "Your device launcher does not support pinned shortcuts.")
                return
            }

            val json = JSONObject(itemJsonStr)
            val id = json.optString("id", "shortcut_${System.currentTimeMillis()}")
            val title = json.optString("title", "Quick Shortcut")
            val action = json.optString("action", "android.settings.SETTINGS")
            val pkg = json.optString("packageName").takeIf { it.isNotBlank() }
            val cls = json.optString("className").takeIf { it.isNotBlank() }
            val fallback = json.optString("fallbackAction", "android.settings.SETTINGS")
            val accentColorStr = json.optString("accentColor", "#3A86FF")

            val launchIntent = Intent(reactContext, RedirectLauncherActivity::class.java).apply {
                this.action = "com.redirect.settings.LAUNCH_SHORTCUT_$id"
                putExtra("action", action)
                putExtra("packageName", pkg)
                putExtra("className", cls)
                putExtra("fallbackAction", fallback)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }

            // Create sharp customized badge bitmap for launcher
            val badgeBitmap = createShortcutBitmap(title, accentColorStr)
            val icon = Icon.createWithBitmap(badgeBitmap)

            val pinShortcutInfo = ShortcutInfo.Builder(reactContext, id)
                .setIcon(icon)
                .setShortLabel(title)
                .setLongLabel(title)
                .setIntent(launchIntent)
                .build()

            val success = shortcutManager.requestPinShortcut(pinShortcutInfo, null)
            promise.resolve(success)
        } catch (e: Exception) {
            promise.reject("PIN_ERROR", e.message)
        }
    }

    private fun createShortcutBitmap(title: String, colorHex: String): Bitmap {
        val size = 128
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        val bgColor = try {
            Color.parseColor(colorHex)
        } catch (e: Exception) {
            Color.parseColor("#3A86FF")
        }

        // Draw rounded rectangle background
        val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = bgColor
            style = Paint.Style.FILL
        }
        val rect = RectF(8f, 8f, (size - 8).toFloat(), (size - 8).toFloat())
        canvas.drawRoundRect(rect, 20f, 20f, bgPaint)

        // Draw initial letter in center
        val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            textSize = 58f
            textAlign = Paint.Align.CENTER
            isFakeBoldText = true
        }

        val firstLetter = title.firstOrNull()?.uppercaseChar()?.toString() ?: "S"
        val yPos = (canvas.height / 2f) - ((textPaint.descent() + textPaint.ascent()) / 2f)
        canvas.drawText(firstLetter, canvas.width / 2f, yPos, textPaint)

        return bitmap
    }
}
