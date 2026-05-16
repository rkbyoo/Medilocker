import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/providers/auth_provider.dart';
import 'otp_screen.dart';
import '../../core/widgets/custom_notification.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _patientNumberController = TextEditingController();

  final _phoneFocus = FocusNode();
  final _patientFocus = FocusNode();
  Timer? _debounceTimer;
  bool _userHasStoppedTyping = false;

  @override
  void initState() {
    super.initState();
    _phoneFocus.addListener(_handleFocusChange);
    _patientFocus.addListener(_handleFocusChange);
  }

  void _handleFocusChange() {
    if (!_phoneFocus.hasFocus || !_patientFocus.hasFocus) {
      _debounceTimer?.cancel();
      // Instantly show warning on focus loss
      _userHasStoppedTyping = true;
    }
    setState(() {});
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _phoneFocus.dispose();
    _patientFocus.dispose();
    _phoneController.dispose();
    _patientNumberController.dispose();
    super.dispose();
  }

  void _onInputChanged(String _) {
    setState(() {
      _userHasStoppedTyping = false;
    });
    _debounceTimer?.cancel();

    final pLen = _phoneController.text.length;
    final iLen = _patientNumberController.text.length;

    if ((pLen > 0 && pLen < 10) || (iLen > 0 && iLen < 10)) {
      _debounceTimer = Timer(const Duration(milliseconds: 1500), () {
        if (mounted) {
          setState(() {
            _userHasStoppedTyping = true;
          });
        }
      });
    }
  }

  Future<void> _sendOtp() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.sendOtp(
      _phoneController.text,
      _patientNumberController.text,
    );

    if (!mounted) return;

    if (success) {
      CustomNotification.show(context, 'OTP sent! Check your SMS.');
      final result = await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => OtpScreen(
            phoneNumber: _phoneController.text,
            patientNumber: _patientNumberController.text,
          ),
        ),
      );

      if (result == 'wrong_number' && mounted) {
        setState(() {
          _phoneController.clear();
        });
      }
    } else {
      final msg = authProvider.errorMessage ?? 'Verification failed';
      CustomNotification.show(context, msg, isSuccess: false);
    }
  }

  bool get _isValid {
    return _phoneController.text.length == 10 &&
        _patientNumberController.text.length == 10;
  }

  bool get _showWarning {
    final pLen = _phoneController.text.length;
    final iLen = _patientNumberController.text.length;
    final pHasError =
        pLen > 0 &&
        pLen < 10 &&
        (!_phoneFocus.hasFocus || _userHasStoppedTyping);
    final iHasError =
        iLen > 0 &&
        iLen < 10 &&
        (!_patientFocus.hasFocus || _userHasStoppedTyping);
    return pHasError || iHasError;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        RepaintBoundary(
                          child: Column(
                            children: [
                              Image.asset(
                                'assets/icon/medilocker_icon.webp',
                                width: 58,
                                height: 58,
                                cacheWidth: 116, // 2x for retina display
                                cacheHeight: 116,
                                fit: BoxFit.contain,
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Patient Login',
                                style: Theme.of(context).textTheme.headlineSmall
                                    ?.copyWith(
                                      fontWeight: FontWeight.w900,
                                      color: AppColors.textPrimary,
                                      letterSpacing: -0.5,
                                    ),
                              ),
                              const SizedBox(height: 8),
                              const Text(
                                'Enter your credentials to access portal',
                                style: TextStyle(
                                  color: Color(0x9964748B),
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),

                        Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: const Color(0xFFE2E8F0),
                              width: 0.5,
                            ),
                          ),
                          padding: const EdgeInsets.all(24),
                          child: RepaintBoundary(
                            child: Column(
                              children: [
                                _buildHorizontalField(
                                  controller: _phoneController,
                                  label: 'PHONE NO.',
                                  hint: '9876543210',
                                  prefix: '+91 ',
                                  keyboardType: TextInputType.phone,
                                  focusNode: _phoneFocus,
                                  onChanged: _onInputChanged,
                                ),
                                const Padding(
                                  padding: EdgeInsets.symmetric(vertical: 16),
                                  child: Divider(
                                    height: 1,
                                    thickness: 0.5,
                                    color: Color(0xFFE2E8F0),
                                  ),
                                ),
                                _buildHorizontalField(
                                  controller: _patientNumberController,
                                  label: 'PATIENT ID',
                                  hint: '0123456789',
                                  keyboardType: TextInputType.number,
                                  focusNode: _patientFocus,
                                  onChanged: _onInputChanged,
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            Container(
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
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 4, 24, 8),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Minimalist warning
                    SizedBox(
                      height: 22,
                      child: _showWarning
                          ? const Text(
                              'Input must be 10 digits',
                              style: TextStyle(
                                color: Color(0xFFEF4444), // red.shade400
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                                letterSpacing: 0.3,
                              ),
                            )
                          : const SizedBox.shrink(),
                    ),
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: Selector<AuthProvider, bool>(
                        selector: (context, provider) => provider.isLoading,
                        builder: (context, isLoading, _) {
                          return ElevatedButton(
                            onPressed: (isLoading || !_isValid)
                                ? null
                                : _sendOtp,
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
                                    'Get Security Code',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 0),
                    TextButton(
                      onPressed: () {},
                      child: const Text(
                        "Don't have your Patient ID?",
                        style: TextStyle(
                          color: Color(0x8064748B), // AppColors.textSecondary with 0.5 alpha
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHorizontalField({
    required TextEditingController controller,
    required String label,
    required String hint,
    String? prefix,
    TextInputType? keyboardType,
    FocusNode? focusNode,
    void Function(String)? onChanged,
  }) {
    return Row(
      children: [
        SizedBox(
          width: 90,
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
              letterSpacing: 0.8,
            ),
          ),
        ),
        Container(
          height: 18,
          width: 1.5,
          margin: const EdgeInsets.symmetric(horizontal: 16),
          decoration: BoxDecoration(
            color: const Color(0xFFE2E8F0),
            borderRadius: BorderRadius.circular(1),
          ),
        ),
        if (prefix != null) ...[
          Text(
            prefix,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
        ],
        Expanded(
          child: TextFormField(
            controller: controller,
            keyboardType: keyboardType,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: TextStyle(
                color: AppColors.textSecondary.withValues(alpha: 0.2),
                fontSize: 14,
              ),
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              isDense: true,
              contentPadding: EdgeInsets.zero,
              counterText: '',
            ),
            focusNode: focusNode,
            onChanged: onChanged,
            maxLength: 10,
          ),
        ),
      ],
    );
  }
}
