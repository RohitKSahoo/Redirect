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

class RedirectBentoWidget : AppWidgetProvider() {

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
            val views = RemoteViews(context.packageName, R.layout.widget_bento_grid)
            val prefs = context.getSharedPreferences("RedirectSettingsPrefs", Context.MODE_PRIVATE)
            val pinnedJsonStr = prefs.getString("pinned_shortcuts_json", null)

            val slotViews = listOf(
                Pair(R.id.widget_slot_0, R.id.widget_slot_0_title),
                Pair(R.id.widget_slot_1, R.id.widget_slot_1_title),
                Pair(R.id.widget_slot_2, R.id.widget_slot_2_title),
                Pair(R.id.widget_slot_3, R.id.widget_slot_3_title),
            )

            var itemsArray: JSONArray? = null
            if (!pinnedJsonStr.isNullOrBlank()) {
                try {
                    itemsArray = JSONArray(pinnedJsonStr)
                } catch (e: Exception) {
                    // Ignore parse error
                }
            }

            for (i in 0..3) {
                val (slotLayoutId, slotTitleId) = slotViews[i]
                val item = if (itemsArray != null && i < itemsArray.length()) {
                    itemsArray.optJSONObject(i)
                } else null

                if (item != null) {
                    val title = item.optString("title", "Shortcut ${i + 1}")
                    val action = item.optString("action", "android.settings.SETTINGS")
                    val pkg = item.optString("packageName").takeIf { it.isNotBlank() }
                    val cls = item.optString("className").takeIf { it.isNotBlank() }
                    val fallback = item.optString("fallbackAction", "android.settings.SETTINGS")

                    views.setTextViewText(slotTitleId, title)

                    val intent = Intent(context, RedirectLauncherActivity::class.java).apply {
                        putExtra("action", action)
                        putExtra("packageName", pkg)
                        putExtra("className", cls)
                        putExtra("fallbackAction", fallback)
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    }

                    val pendingIntent = PendingIntent.getActivity(
                        context,
                        100 + i,
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    views.setOnClickPendingIntent(slotLayoutId, pendingIntent)
                } else {
                    views.setTextViewText(slotTitleId, "+ Add Pin")
                    val appIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)?.apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    }
                    if (appIntent != null) {
                        val pendingIntent = PendingIntent.getActivity(
                            context,
                            200 + i,
                            appIntent,
                            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                        )
                        views.setOnClickPendingIntent(slotLayoutId, pendingIntent)
                    }
                }
            }

            // Header tap opens Redirect main dashboard
            val headerIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            if (headerIntent != null) {
                val headerPendingIntent = PendingIntent.getActivity(
                    context,
                    999,
                    headerIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(R.id.widget_app_title, headerPendingIntent)
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        fun updateAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisWidget = ComponentName(context, RedirectBentoWidget::class.java)
            val allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)
            for (id in allWidgetIds) {
                updateAppWidget(context, appWidgetManager, id)
            }
        }
    }
}
