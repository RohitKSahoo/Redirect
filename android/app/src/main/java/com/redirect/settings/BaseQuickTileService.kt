package com.redirect.settings

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
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

                // Dynamically update tile icon to reflect the selected option
                val tileBitmap = createTileIconBitmap(title)
                tile.icon = Icon.createWithBitmap(tileBitmap)
            } catch (e: Exception) {
                tile.label = "Slot $slotIndex"
                tile.state = Tile.STATE_INACTIVE
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

    private fun createTileIconBitmap(title: String): Bitmap {
        val size = 96
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Draw crisp icon frame
        val framePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            style = Paint.Style.STROKE
            strokeWidth = 6f
        }
        val rect = RectF(6f, 6f, size - 6f, size - 6f)
        canvas.drawRoundRect(rect, 20f, 20f, framePaint)

        // Draw option first letter boldly in center
        val textPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            textSize = 48f
            textAlign = Paint.Align.CENTER
            isFakeBoldText = true
        }

        val firstLetter = title.firstOrNull()?.uppercaseChar()?.toString() ?: "S"
        val yPos = (canvas.height / 2f) - ((textPaint.descent() + textPaint.ascent()) / 2f)
        canvas.drawText(firstLetter, canvas.width / 2f, yPos, textPaint)

        return bitmap
    }
}

