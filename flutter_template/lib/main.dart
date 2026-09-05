import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'theme.dart';
import 'screens/home_screen.dart';
import 'services/app_settings.dart';
import 'widgets/device_simulator_frame.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await AppSettings().init();
  runApp(const BuscapetApp());
}

class BuscapetApp extends StatelessWidget {
  const BuscapetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: AppSettings().themeModeNotifier,
      builder: (context, themeMode, _) {
        return ValueListenableBuilder<String>(
          valueListenable: AppSettings().languageNotifier,
          builder: (context, lang, _) {
            return MaterialApp(
              title: 'Buscapet',
              debugShowCheckedModeBanner: false,
              theme: BuscapetTheme.lightTheme,
              darkTheme: BuscapetTheme.theme,
              themeMode: themeMode,
              builder: (context, child) => DeviceSimulatorFrame(
                child: child ?? const SizedBox.shrink(),
              ),
              home: HomeScreen(key: ValueKey('$lang-${themeMode.name}')),
            );
          },
        );
      },
    );
  }
}
