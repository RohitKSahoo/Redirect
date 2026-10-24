package com.redirect.settings

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONObject

class RedirectSingleWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_single)
            val prefs = context.getSharedPreferences("RedirectSettingsPrefs", Context.MODE_PRIVATE)

            // Try Slot 1 or first pinned item
            val slot1Data = prefs.getString("tile_slot_1", null)
            val pinnedJsonStr = prefs.getString("pinned_shortcuts_json", null)

            var targetItem: JSONObject? = null
            if (!slot1Data.isNullOrBlank()) {
                try {
                    targetItem = JSONObject(slot1Data)
                } catch (e: Exception) {}
            }

            if (targetItem == null && !pinnedJsonStr.isNullOrBlank()) {
                try {
                    val arr = JSONArray(pinnedJsonStr)
                    if (arr.length() > 0) {
                        targetItem = arr.optJSONObject(0)
                    }
                } catch (e: Exception) {}
            }

            if (targetItem != null) {
                val title = targetItem.optString("title", "Quick Shortcut")
                val action = targetItem.optString("action", "android.settings.SETTINGS")
                val pkg = targetItem.optString("packageName").takeIf { it.isNotBlank() }
                val cls = targetItem.optString("className").takeIf { it.isNotBlank() }
                val fallback = targetItem.optString("fallbackAction", "android.settings.SETTINGS")

                views.setTextViewText(R.id.widget_single_title, title)

                val intent = Intent(context, RedirectLauncherActivity::class.java).apply {
                    putExtra("action", action)
                    putExtra("packageName", pkg)
                    putExtra("className", cls)
                    putExtra("fallbackAction", fallback)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }

                val pendingIntent = PendingIntent.getActivity(
                    context,
                    501,
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_single_container, pendingIntent)
            } else {
                views.setTextViewText(R.id.widget_single_title, "Redirect")
                val appIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                if (appIntent != null) {
                    val pendingIntent = PendingIntent.getActivity(
                        context,
                        502,
                        appIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    views.setOnClickPendingIntent(R.id.widget_single_container, pendingIntent)
                }
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisWidget = ComponentName(context, RedirectSingleWidget::class.java)
            val allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)
            for (id in allWidgetIds) {
                updateAppWidget(context, appWidgetManager, id)
            }
        }
    }
}
