# ProGuard rules for COMIKA WebView App

# Keep WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep webview_flutter plugin classes
-keep class io.flutter.plugins.webviewflutter.** { *; }

# Keep JavaScript engine
-keep class org.chromium.** { *; }
-dontwarn org.chromium.**
