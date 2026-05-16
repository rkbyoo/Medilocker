# Flutter ProGuard Rules
# These rules are generally handled by the Flutter Gradle Plugin, 
# but you can add custom rules here if needed.

# Keep Flutter classes
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Keep GMS/Firebase if used
-keep class com.google.android.gms.** { *; }
-keep class com.google.firebase.** { *; }

# Fix R8 errors for missing Play Core classes (common in Flutter)
-dontwarn com.google.android.play.core.**
-dontwarn com.google.android.gms.tasks.**
-dontwarn com.google.android.gms.common.**

