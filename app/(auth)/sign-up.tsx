import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { useSignUp, useAuth } from "@clerk/expo";
import { authStyles } from "@/assets/styles/auth.styles";
import {
  validateEmail,
  validatePassword,
  validateVerificationCode,
  normalizeEmail,
  getUserFriendlyError,
  getPasswordStrength,
} from "@/utils/validation";
import { COLORS } from "@/constants/colors";

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Submit states
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [resendCountdown, setResendCountdown] = useState(0);

  const passwordStrength = getPasswordStrength(password);

  // Redirect if already signed in
  if (isSignedIn) {
    return null;
  }

  // Handle full name input change
  const handleFullNameChange = (text: string) => {
    setFullName(text);
    if (submitted && text.trim()) {
      if (text.trim().length < 2) {
        setFullNameError("Full name must be at least 2 characters");
      } else {
        setFullNameError(null);
      }
    }
  };

  // Handle email input change
  const handleEmailChange = (text: string) => {
    setEmailAddress(text);
    if (submitted) {
      const validation = validateEmail(normalizeEmail(text));
      setEmailError(validation.error || null);
    }
  };

  // Handle password input change
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (submitted && text) {
      const validation = validatePassword(text);
      setPasswordError(validation.error || null);
    }
  };

  // Handle code input change
  const handleCodeChange = (text: string) => {
    setCode(text.replace(/[^0-9]/g, "")); // Only allow digits
    if (submitted) {
      const validation = validateVerificationCode(text);
      setCodeError(validation.error || null);
    }
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    let isValid = true;
    setGeneralError(null);

    // Full name validation
    if (!fullName.trim() || fullName.trim().length < 2) {
      setFullNameError("Full name must be at least 2 characters");
      isValid = false;
    } else {
      setFullNameError(null);
    }

    // Email validation
    const emailValidation = validateEmail(normalizeEmail(emailAddress));
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || null);
      isValid = false;
    } else {
      setEmailError(null);
    }

    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error || null);
      isValid = false;
    } else {
      setPasswordError(null);
    }

    // Terms validation
    if (!termsAccepted) {
      setGeneralError("Please accept the Terms & Conditions to continue");
      isValid = false;
    }

    return isValid;
  };

  // Handle sign-up submission
  const handleSignUpSubmit = async () => {
    setSubmitted(true);

    if (!validateAllFields()) {
      return;
    }

    try {
      // Split full name into first and last
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || "";

      const { error } = await signUp.password({
        emailAddress: normalizeEmail(emailAddress),
        password,
        firstName,
        lastName,
      });

      if (error) {
        setGeneralError(getUserFriendlyError(error));
        return;
      }

      // Send email verification code
      await signUp.verifications.sendEmailCode();
      setStep("verify");
      setResendCountdown(60);

      // Countdown timer for resend
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setGeneralError(getUserFriendlyError(error));
    }
  };

  // Handle verification code submission
  const handleVerifySubmit = async () => {
    setSubmitted(true);

    const codeValidation = validateVerificationCode(code);
    if (!codeValidation.valid) {
      setCodeError(codeValidation.error || null);
      return;
    }

    try {
      await signUp.verifications.verifyEmailCode({ code });

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            // Handle any session tasks if needed
            if (session?.currentTask) {
              console.log("Session task:", session.currentTask);
            }

            // Navigate to home
            const url = decorateUrl("/(home)");
            router.replace(url as any);
          },
        });
      } else {
        setGeneralError("Sign-up verification incomplete. Please try again.");
      }
    } catch (error) {
      setGeneralError(getUserFriendlyError(error));
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    try {
      await signUp.verifications.sendEmailCode();
      setResendCountdown(60);

      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setGeneralError(getUserFriendlyError(error));
    }
  };

  // Handle terms link press
  const handleTermsPress = async () => {
    await Linking.openURL("https://yourapp.com/terms");
  };

  const isLoading = fetchStatus === "fetching";
  const isVerificationStep = step === "verify";

  // Verification step UI
  if (isVerificationStep) {
    return (
      <SafeAreaView edges={["top"]} style={authStyles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={authStyles.scrollContent}>
            <View style={authStyles.innerContainer}>
            <View style={authStyles.header}>
              <Text style={authStyles.title}>Verify Your Email</Text>
              <Text style={authStyles.subtitle}>
                We've sent a verification code to{"\n"}
                <Text style={{ fontWeight: "600" }}>{emailAddress}</Text>
              </Text>
            </View>

            {generalError && (
              <View style={authStyles.generalError}>
                <Text style={authStyles.generalErrorText}>{generalError}</Text>
              </View>
            )}

            <View style={authStyles.fieldContainer}>
              <Text style={authStyles.label}>Verification Code</Text>
              <TextInput
                style={[
                  authStyles.input,
                  focusedField === "code" && authStyles.inputFocused,
                  codeError && authStyles.inputError,
                ]}
                placeholder="Enter 6-digit code"
                placeholderTextColor={COLORS.textLight}
                value={code}
                onChangeText={handleCodeChange}
                onFocus={() => setFocusedField("code")}
                onBlur={() => setFocusedField(null)}
                keyboardType="number-pad"
                maxLength={8}
                editable={!isLoading}
              />
              {codeError && <Text style={authStyles.errorText}>{codeError}</Text>}
            </View>

            <Pressable
              style={[
                authStyles.button,
                authStyles.buttonPrimary,
                isLoading && authStyles.buttonDisabled,
              ]}
              onPress={handleVerifySubmit}
              disabled={isLoading || !code.trim()}
            >
              {isLoading ? (
                <View style={authStyles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.white} />
                  <Text style={authStyles.buttonPrimaryText}>Verifying...</Text>
                </View>
              ) : (
                <Text style={authStyles.buttonPrimaryText}>Verify Email</Text>
              )}
            </Pressable>

            <View style={authStyles.resendContainer}>
              <Text style={authStyles.resendText}>Didn't receive the code?</Text>
              {resendCountdown > 0 ? (
                <Text style={authStyles.timerText}>
                  Resend code in {resendCountdown}s
                </Text>
              ) : (
                <Pressable onPress={handleResendCode} disabled={isLoading}>
                  <Text
                    style={[
                      authStyles.linkAction,
                      isLoading && { opacity: 0.5 },
                    ]}
                  >
                    Resend Code
                  </Text>
                </Pressable>
              )}
            </View>

            <View style={authStyles.divider} />

            <View style={authStyles.linkContainer}>
              <Text style={authStyles.linkText}>Changed your email? </Text>
              <Pressable onPress={() => setStep("signup")}>
                <Text style={authStyles.linkAction}>Go Back</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Sign-up step UI
  return (
    <SafeAreaView edges={["top"]} style={authStyles.container}>
      
        <ScrollView contentContainerStyle={authStyles.scrollContent}>
          <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={authStyles.innerContainer}>
          <View style={authStyles.header}>
            <Text style={authStyles.title}>Create Account</Text>
            <Text style={authStyles.subtitle}>
              Join us and start managing your meals
            </Text>
          </View>

          {generalError && (
            <View style={authStyles.generalError}>
              <Text style={authStyles.generalErrorText}>{generalError}</Text>
            </View>
          )}

          {/* Full Name Field */}
          <View style={authStyles.fieldContainer}>
            <Text style={authStyles.label}>Full Name</Text>
            <TextInput
              style={[
                authStyles.input,
                focusedField === "fullName" && authStyles.inputFocused,
                fullNameError && authStyles.inputError,
              ]}
              placeholder="John Doe"
              placeholderTextColor={COLORS.textLight}
              value={fullName}
              onChangeText={handleFullNameChange}
              onFocus={() => setFocusedField("fullName")}
              onBlur={() => setFocusedField(null)}
              editable={!isLoading}
            />
            {fullNameError && <Text style={authStyles.errorText}>{fullNameError}</Text>}
          </View>

          {/* Email Field */}
          <View style={authStyles.fieldContainer}>
            <Text style={authStyles.label}>Email Address</Text>
            <TextInput
              style={[
                authStyles.input,
                focusedField === "email" && authStyles.inputFocused,
                emailError && authStyles.inputError,
              ]}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.textLight}
              value={emailAddress}
              onChangeText={handleEmailChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {emailError && <Text style={authStyles.errorText}>{emailError}</Text>}
          </View>

          {/* Password Field */}
          <View style={authStyles.fieldContainer}>
            <Text style={authStyles.label}>Password</Text>
            <TextInput
              style={[
                authStyles.input,
                focusedField === "password" && authStyles.inputFocused,
                passwordError && authStyles.inputError,
              ]}
              placeholder="Create a strong password"
              placeholderTextColor={COLORS.textLight}
              value={password}
              onChangeText={handlePasswordChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              secureTextEntry
              editable={!isLoading}
            />
            {passwordError && <Text style={authStyles.errorText}>{passwordError}</Text>}

            {/* Password Strength Indicator */}
            {password && (
              <View style={authStyles.strengthContainer}>
                <View style={authStyles.strengthBar}>
                  <View
                    style={[
                      authStyles.strengthIndicator,
                      {
                        width: `${passwordStrength.percentage}%`,
                        backgroundColor: passwordStrength.color,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    authStyles.strengthText,
                    passwordStrength.strength === "weak" && authStyles.strengthWeak,
                    passwordStrength.strength === "fair" && authStyles.strengthFair,
                    passwordStrength.strength === "good" && authStyles.strengthGood,
                    passwordStrength.strength === "strong" && authStyles.strengthStrong,
                  ]}
                >
                  {passwordStrength.label}
                </Text>
              </View>
            )}
          </View>

          {/* Terms & Conditions Checkbox */}
          <Pressable
            style={authStyles.checkboxContainer}
            onPress={() => setTermsAccepted(!termsAccepted)}
            disabled={isLoading}
          >
            <View
              style={[
                authStyles.checkbox,
                termsAccepted && authStyles.checkboxChecked,
              ]}
            >
              {termsAccepted && (
                <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: "600" }}>
                  ✓
                </Text>
              )}
            </View>
            <Text style={authStyles.checkboxText}>
              I agree to the{" "}
              <Text
                style={authStyles.checkboxLink}
                onPress={handleTermsPress}
              >
                Terms & Conditions
              </Text>
            </Text>
          </Pressable>

          {/* Sign-up Button */}
          <Pressable
            style={[
              authStyles.button,
              authStyles.buttonPrimary,
              isLoading && authStyles.buttonDisabled,
            ]}
            onPress={handleSignUpSubmit}
            disabled={
              isLoading ||
              !fullName.trim() ||
              !emailAddress.trim() ||
              !password.trim() ||
              !termsAccepted
            }
          >
            {isLoading ? (
              <View style={authStyles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.white} />
                <Text style={authStyles.buttonPrimaryText}>Creating Account...</Text>
              </View>
            ) : (
              <Text style={authStyles.buttonPrimaryText}>Create Account</Text>
            )}
          </Pressable>

          {/* Sign-in Link */}
          <View style={authStyles.linkContainer}>
            <Text style={authStyles.linkText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in">
              <Text style={authStyles.linkAction}>Sign In</Text>
            </Link>
          </View>

          {/* Clerk Captcha - Required for bot protection */}
          <View nativeID="clerk-captcha" />
        </View>
      
      </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}
