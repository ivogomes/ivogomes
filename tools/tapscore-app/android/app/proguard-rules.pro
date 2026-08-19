# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# MainActivity.installNativeBridge() exposes an anonymous object as "TapScoreNative" to the WebView;
# index.html calls its methods by name via reflection, so R8 must not rename/strip them. The default
# proguard-android-optimize.txt already keeps @JavascriptInterface methods, but keep it explicit here
# since this is the one native/JS bridge in the app that would fail silently if that ever changed.
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile
