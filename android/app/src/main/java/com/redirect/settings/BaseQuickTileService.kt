package com.redirect.settings

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.drawable.Icon
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import org.json.JSONObject

abstract class BaseQuickTileService : TileService() {

    abstract val slotIndex: Int

    override fun onStartListening() {
        super.onStartListening()
        updateTileState()
    }

    override fun onClick() {
        super.onClick()

        val prefs = getSharedPreferences("RedirectSettingsPrefs", Context.MODE_PRIVATE)
        val slotData = prefs.getString("tile_slot_$slotIndex", null)

        if (!slotData.isNullOrBlank()) {
            try {
                val json = JSONObject(slotData)
                val action = json.optString("action", "android.settings.SETTINGS")
                val pkg = json.optString("packageName").takeIf { it.isNotBlank() }
                val cls = json.optString("className").takeIf { it.isNotBlank() }
                val fallback = json.optString("fallbackAction", "android.settings.SETTINGS")

                val launchIntent = Intent(this, RedirectLauncherActivity::class.java).apply {
                    putExtra("action", action)
                    putExtra("packageName", pkg)
                    putExtra("className", cls)
                    putExtra("fallbackAction", fallback)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }

                val pendingIntent = PendingIntent.getActivity(
                    this,
                    slotIndex,
                    launchIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                    startActivityAndCollapse(pendingIntent)
                } else {
                    @Suppress("DEPRECATION")
                    startActivityAndCollapse(launchIntent)
                }
                return
            } catch (e: Exception) {
                // If parsing fails, fall through to opening main app
            }
        }

        // Default: Open the Redirect app if slot is unconfigured
        val appIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        if (appIntent != null) {
            val pendingIntent = PendingIntent.getActivity(
                this,
                slotIndex,
                appIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                startActivityAndCollapse(pendingIntent)
            } else {
                @Suppress("DEPRECATION")
                startActivityAndCollapse(appIntent)
            }
        }
    }

    private fun updateTileState() {
        val tile = qsTile ?: return
        val prefs = getSharedPreferences("RedirectSettingsPrefs", Context.MODE_PRIVATE)
        val slotData = prefs.getString("tile_slot_$slotIndex", null)

        if (!slotData.isNullOrBlank()) {
            try {
                val json = JSONObject(slotData)
                val title = json.optString("title", "Slot $slotIndex")
                tile.label = title
                tile.state = Tile.STATE_ACTIVE
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    tile.subtitle = "Tap to launch"
                }

                // Show the selected option icon in the notification panel tile
                val iconRes = getTileIconResource(json)
                tile.icon = Icon.createWithResource(this, iconRes)
            } catch (e: Exception) {
                tile.label = "Slot $slotIndex"
                tile.state = Tile.STATE_INACTIVE
                tile.icon = Icon.createWithResource(this, R.drawable.ic_quick_tile)
            }
        } else {
            tile.label = "Redirect Slot $slotIndex"
            tile.state = Tile.STATE_INACTIVE
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                tile.subtitle = "Tap to assign"
            }
            tile.icon = Icon.createWithResource(this, R.drawable.ic_quick_tile)
        }

        tile.updateTile()
    }

    private fun getTileIconResource(json: JSONObject): Int {
        val icon = json.optString("icon", "").lowercase()
        val id = json.optString("id", "").lowercase()
        val action = json.optString("action", "").lowercase()
        val title = json.optString("title", "").lowercase()

        return when {
            // Developer Options
            icon.contains("developer") || icon.contains("code") || id.contains("dev") || title.contains("developer") || action.contains("development") ->
                R.drawable.ic_tile_developer

            // Accessibility Services
            icon.contains("human") || icon.contains("accessibility") || id.contains("accessibility") || title.contains("accessibility") ->
                R.drawable.ic_tile_accessibility

            // Wifi / Wireless Debugging
            icon.contains("wifi") || id.contains("wireless") || title.contains("wireless") ->
                R.drawable.ic_tile_wifi

            // Display Over Other Apps (Overlay)
            icon.contains("layers") || id.contains("overlay") || title.contains("overlay") || action.contains("overlay") ->
                R.drawable.ic_tile_overlay

            // Install Unknown Apps (Sideload / Package)
            icon.contains("package") || id.contains("unknown") || title.contains("unknown") || action.contains("unknown") ->
                R.drawable.ic_tile_package

            // Notification Access
            icon.contains("bell") || id.contains("notification") || title.contains("notification") || action.contains("notification") ->
                R.drawable.ic_tile_notification

            // Security & Biometrics
            icon.contains("shield") || icon.contains("lock") || id.contains("security") || title.contains("security") || action.contains("security") ->
                R.drawable.ic_tile_security

            // Location Services
            icon.contains("gps") || icon.contains("location") || icon.contains("crosshairs") || id.contains("location") || title.contains("location") || action.contains("location") ->
                R.drawable.ic_tile_location

            // Battery Optimization
            icon.contains("battery") || id.contains("battery") || title.contains("battery") || action.contains("battery") ->
                R.drawable.ic_tile_battery

            // Manage All Applications
            icon.contains("apps") || id.contains("all_apps") || title.contains("all app") || action.contains("manage_all_applications") ->
                R.drawable.ic_tile_apps

            // Default Apps
            icon.contains("phone") || icon.contains("cellphone") || id.contains("default_apps") || title.contains("default") ->
                R.drawable.ic_tile_phone_cog

            // Default fallback settings gear icon
            else -> R.drawable.ic_quick_tile
        }
    }
}

