package com.redirect.settings

import android.app.Activity
import android.content.ComponentName
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast

class RedirectLauncherActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val targetAction = intent.getStringExtra("action") ?: Settings.ACTION_SETTINGS
        val targetPackage = intent.getStringExtra("packageName")
        val targetClass = intent.getStringExtra("className")
        val fallbackAction = intent.getStringExtra("fallbackAction") ?: Settings.ACTION_SETTINGS

        launchDeepSetting(targetAction, targetPackage, targetClass, fallbackAction)
        finish()
    }

    private fun launchDeepSetting(
        action: String,
        pkg: String?,
        cls: String?,
        fallback: String
    ) {
        // Attempt 1: Explicit component (Package + Class) if specified
        if (!pkg.isNullOrBlank() && !cls.isNullOrBlank()) {
            try {
                val explicitIntent = Intent().apply {
                    component = ComponentName(pkg, cls)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                startActivity(explicitIntent)
                return
            } catch (e: Exception) {
                // Fallback to standard action
            }
        }

        // Attempt 2: Standard Action
        try {
            val actionIntent = Intent(action).apply {
                if (!pkg.isNullOrBlank()) {
                    setPackage(pkg)
                }
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            startActivity(actionIntent)
            return
        } catch (e: Exception) {
            // Action not found on this device skin
        }

        // Attempt 3: General Fallback Action (e.g. android.settings.SETTINGS)
        try {
            val fallbackIntent = Intent(fallback).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            startActivity(fallbackIntent)
            Toast.makeText(this, "Target screen unavailable; opened Settings.", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Toast.makeText(this, "Unable to launch settings screen.", Toast.LENGTH_SHORT).show()
        }
    }
}
