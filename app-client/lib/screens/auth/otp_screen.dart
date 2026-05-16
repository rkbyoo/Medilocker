import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/patient_provider.dart';
import '../../main.dart';
import '../../core/widgets/custom_notification.dart';

class OtpScreen extends StatefulWidget {
  final String phoneNumber;
  final String patientNumber;

  const OtpScreen({
    super.key,
    required this.phoneNumber,
    required this.patientNumber,
  });

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _otpController = TextEditingController();
  final _focusNode = FocusNode();
  final ValueNotifier<int> _secondsRemainingNotifier = ValueNotifier<int>(300);
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
    _focusNode.addListener(() {
      if (mounted) setState(() {});
    });
  }

  void _startTimer() {
    _timer?.cancel();
    _secondsRemainingNotifier.value = 300;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        if (_secondsRemainingNotifier.value > 0) {
          _secondsRemainingNotifier.value--;
        } else {
          _timer?.cancel();
        }
      }
    });
  }

  @override
  void dispose() {
    _otpController.dispose();
    _focusNode.dispose();
    _timer?.cancel();
    _secondsRemainingNotifier.dispose();
    super.dispose();
  }

  String _formatTime(int totalSeconds) {
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  Future<void> _verifyOtp() async {
    if (_secondsRemainingNotifier.value == 0) {
      CustomNotification.show(
        context,
        'Code has expired. Please resend.',
        isSuccess: false,
      );
      return;
    }

    final otp = _otpController.text;
    if (otp.length != 6) {
      CustomNotification.show(
        context,
        'Please enter the 6-digit code',
        isSuccess: false,
      );
      return;
    }

    final authProvider = context.read<AuthProvider>();
    final patientProvider = context.read<PatientProvider>();
    final success = await authProvider.verifyOtp(
      widget.phoneNumber,
      widget.patientNumber,
      otp,
      patientProvider: patientProvider,
    );

    if (success && mounted) {
      CustomNotification.show(context, 'Verification successful');
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const AuthWrapper()),
        (route) => false,
      );
    } else if (mounted) {
      final msg = authProvider.errorMessage ?? 'Verification failed';
      CustomNotification.show(context, msg, isSuccess: false);
    }
  }

  Future<void> _resendOtp() async {
    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.sendOtp(
      widget.phoneNumber,
      widget.patientNumber,
    );

    if (mounted) {
      if (success) {
        _startTimer();
        CustomNotification.show(context, 'OTP resent successfully');
      } else {
        CustomNotification.show(
          context,
          'Failed to resend OTP',
          isSuccess: false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Stack(
          children: [
            // Back Button
            Positioned(
              top: 10,
              left: 20,
              child: IconButton(
                icon: const Icon(
                  Icons.arrow_back_ios_new_rounded,
                  color: AppColors.textPrimary,
                  size: 20,
                ),
                onPressed: () => Navigator.pop(context),
              ),
            ),
            Column(
              children: [
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        RepaintBoundary(
                          child: Column(
                            children: [
                              Image.asset(
                                'assets/icon/medilocker_icon.webp',
                                width: 48,
                                height: 48,
                                cacheWidth: 96,
                                cacheHeight: 96,
                              ),
                              const SizedBox(height: 16),
                              const Text(
                                'Verification Code',
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.textPrimary,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              const SizedBox(height: 8),
                              RichText(
                                textAlign: TextAlign.center,
                                text: TextSpan(
                                  style: const TextStyle(
                                    color: Color(0x9964748B), // AppColors.textSecondary with 0.6 alpha
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  children: [
                                    const TextSpan(text: 'Code sent to '),
                                    TextSpan(
                                      text: '+91 ${widget.phoneNumber}',
                                      style: const TextStyle(
                                        color: AppColors.textPrimary,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 2),
                        TextButton(
                          style: TextButton.styleFrom(
                            minimumSize: Size.zero,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          onPressed: () =>
                              Navigator.pop(context, 'wrong_number'),
                          child: const Text(
                            'Not your number?',
                            style: TextStyle(
                              color: AppColors.primary,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        // Optimized Timer Display
                        ValueListenableBuilder<int>(
                          valueListenable: _secondsRemainingNotifier,
                          builder: (context, seconds, _) {
                            return Text(
                              _formatTime(seconds),
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: seconds < 60
                                    ? const Color(0xFFEF4444) // red.shade400
                                    : AppColors.primary,
                              ),
                            );
                          },
                        ),
                        const SizedBox(height: 16),

                        RepaintBoundary(
                          child: GestureDetector(
                            onTap: () {
                              if (_secondsRemainingNotifier.value > 0) {
                                _focusNode.requestFocus();
                              }
                            },
                            child: AutofillGroup(
                              child: SizedBox(
                                width: double.infinity,
                                height: 52,
                                child: Stack(
                                  children: [
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: List.generate(6, (index) {
                                        final char =
                                            _otpController.text.length > index
                                            ? _otpController.text[index]
                                            : '';
                                        final isFocused =
                                            _otpController.text.length == index &&
                                            _focusNode.hasFocus;
                                        return Container(
                                          width: 42,
                                          height: 52,
                                          alignment: Alignment.center,
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFF8FAFC),
                                            borderRadius: BorderRadius.circular(
                                              10,
                                            ),
                                            border: Border.all(
                                              color: isFocused
                                                  ? AppColors.primary
                                                  : const Color(0xFFE2E8F0),
                                              width: isFocused ? 2 : 1,
                                            ),
                                          ),
                                          child: Text(
                                            char,
                                            style: const TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                              color: AppColors.textPrimary,
                                            ),
                                          ),
                                        );
                                      }),
                                    ),
                                    Positioned.fill(
                                      child: TextFormField(
                                        controller: _otpController,
                                        focusNode: _focusNode,
                                        enabled: true, // Keep enabled for better UX
                                        autofocus: true,
                                        keyboardType: TextInputType.number,
                                        maxLength: 6,
                                        autofillHints: const [
                                          AutofillHints.oneTimeCode,
                                        ],
                                        style: const TextStyle(
                                          color: Colors.transparent,
                                          fontSize: 24,
                                        ),
                                        cursorColor: Colors.transparent,
                                        decoration: const InputDecoration(
                                          counterText: "",
                                          filled: false,
                                          border: InputBorder.none,
                                          enabledBorder: InputBorder.none,
                                          focusedBorder: InputBorder.none,
                                          errorStyle: TextStyle(height: 0),
                                        ),
                                        onChanged: (val) {
                                          setState(() {});
                                          if (val.length == 6) _verifyOtp();
                                        },
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.fromLTRB(40, 6, 40, 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                        blurRadius: 10,
                        offset: const Offset(0, -5),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: Selector<AuthProvider, bool>(
                          selector: (context, provider) => provider.isLoading,
                          builder: (context, isLoading, _) {
                            return ValueListenableBuilder<int>(
                              valueListenable: _secondsRemainingNotifier,
                              builder: (context, seconds, _) {
                                return ElevatedButton(
                                  onPressed:
                                      (isLoading || seconds == 0)
                                      ? null
                                      : _verifyOtp,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                    foregroundColor: Colors.white,
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(16),
                                    ),
                                  ),
                                  child: isLoading
                                      ? const SizedBox(
                                          height: 24,
                                          width: 24,
                                          child: CircularProgressIndicator(
                                            color: Colors.white,
                                            strokeWidth: 2,
                                          ),
                                        )
                                      : const Text(
                                          'Verify Now',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                );
                              },
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            "Didn't receive code?",
                            style: TextStyle(
                              color: Color(0x9964748B), // AppColors.textSecondary with 0.6 alpha
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          ValueListenableBuilder<int>(
                            valueListenable: _secondsRemainingNotifier,
                            builder: (context, seconds, _) {
                              final canResend = seconds < 240;
                              return TextButton(
                                style: TextButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                  ),
                                  minimumSize: Size.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                onPressed: canResend ? _resendOtp : null,
                                child: Text(
                                  'Resend OTP',
                                  style: TextStyle(
                                    color: canResend
                                        ? AppColors.primary
                                        : const Color(0x4D64748B), // 0.3 alpha
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
