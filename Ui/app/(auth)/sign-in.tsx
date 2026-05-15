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
  Image,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useSignIn, useAuth } from "@clerk/expo";
import { authStyles } from "@/assets/styles/auth.styles";
import {
  validateEmail,
  validatePassword,
  validateVerificationCode,
  normalizeEmail,
  getUserFriendlyError,
} from "@/utils/validation";
import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";



type SignInStep = "signin" | "mfa";

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Form state
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Submit states
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<SignInStep>("signin");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [mfaEmail, setMfaEmail] = useState("");

  // Redirect if already signed in
  if (isSignedIn) {
    return null;
  }

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
    setCode(text.replace(/[^0-9]/g, ""));
    if (submitted) {
      const validation = validateVerificationCode(text);
      setCodeError(validation.error || null);
    }
  };

  // Validate sign-in fields
  const validateSignInFields = (): boolean => {
    let isValid = true;
    setGeneralError(null);

    const emailValidation = validateEmail(normalizeEmail(emailAddress));
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || null);
      isValid = false;
    } else {
      setEmailError(null);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setPasswordError(passwordValidation.error || null);
      isValid = false;
    } else {
      setPasswordError(null);
    }

    return isValid;
  };

  // Handle sign-in submission
  const handleSignInSubmit = async () => {
    setSubmitted(true);

    if (!validateSignInFields()) {
      return;
    }

    try {
      const { error } = await signIn.password({
        emailAddress: normalizeEmail(emailAddress),
        password,
      });

      if (error) {
        setGeneralError(getUserFriendlyError(error));
        return;
      }

      // Check sign-in status
      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            const url = decorateUrl("/(home)");
            router.replace(url as any);
          },
        });
      } else if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
        const emailCodeFactor = signIn.supportedSecondFactors.find(
          (factor) => factor.strategy === "email_code"
        );

        if (emailCodeFactor) {
          setMfaEmail(normalizeEmail(emailAddress));
          await signIn.mfa.sendEmailCode();
          setStep("mfa");
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
        } else {
          setGeneralError("MFA is required but email verification is not available.");
        }
      } else {
        setGeneralError("Sign-in failed. Please check your credentials and try again.");
      }
    } catch (error) {
      setGeneralError(getUserFriendlyError(error));
    }
  };

  // Handle MFA verification
  const handleMFAVerify = async () => {
    setSubmitted(true);

    const codeValidation = validateVerificationCode(code);
    if (!codeValidation.valid) {
      setCodeError(codeValidation.error || null);
      return;
    }

    try {
      await signIn.mfa.verifyEmailCode({ code });

      if (signIn.status === "complete") {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            const url = decorateUrl("/(home)");
            router.replace(url as any);
          },
        });
      } else {
        setGeneralError("Verification failed. Please try again.");
      }
    } catch (error) {
      setGeneralError(getUserFriendlyError(error));
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    try {
      await signIn.mfa.sendEmailCode();
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

  // Handle start over
  const handleStartOver = async () => {
    try {
      await signIn.reset();
      setStep("signin");
      setCode("");
      setCodeError(null);
      setResendCountdown(0);
    } catch (error) {
      setGeneralError(getUserFriendlyError(error));
    }
  };

  const isLoading = fetchStatus === "fetching";
  const isMFAStep = step === "mfa";


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >

        <View style={authStyles.container}>
            <View style={authStyles.topImage}>
                  <Image
                    source={require("../../assets/images/Ramen-pana.png")}
                    style={authStyles.image}
                  />
                </View>
          <View style={authStyles.innerContainer}>
            {isMFAStep ? (
              /* MFA UI */
              <>
                <View style={authStyles.header}>
                  <Text style={authStyles.title}>Verify Your Identity</Text>
                  <Text style={authStyles.subtitle}>
                    Enter the verification code we sent to{"\n"}
                    <Text style={{ fontWeight: "600" }}>{mfaEmail}</Text>
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
                  onPress={handleMFAVerify}
                  disabled={isLoading || !code.trim()}
                >
                  {isLoading ? (
                    <View style={authStyles.loadingContainer}>
                      <ActivityIndicator size="small" color={COLORS.white} />
                      <Text style={authStyles.buttonPrimaryText}>Verifying...</Text>
                    </View>
                  ) : (
                    <Text style={authStyles.buttonPrimaryText}>Verify Code</Text>
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

                <Pressable
                  style={[authStyles.button, authStyles.buttonSecondary]}
                  onPress={handleStartOver}
                  disabled={isLoading}
                >
                  <Text style={authStyles.buttonSecondaryText}>Start Over</Text>
                </Pressable>
              </>
            ) : (

              /* Sign-in UI */
              <>
              
                <View style={authStyles.header}>
                  <Text style={authStyles.title}>Welcome Back</Text>
                  <Text style={authStyles.subtitle}>
                    Sign in to your account to continue
                  </Text>
                </View>

                {generalError && (
                  <View style={authStyles.generalError}>
                    <Text style={authStyles.generalErrorText}>{generalError}</Text>
                  </View>
                )}

                <View style={authStyles.fieldContainer}>

                  {/* Email */}
                  <View style={authStyles.inputGroup}>
                    {/* <Text style={authStyles.label}>Email</Text> */}
                    <View style={[
                      authStyles.inputContainer,
                      focusedField === "email" && authStyles.inputFocused,
                      emailError && authStyles.inputError,
                    ]}
                    >
                  <Ionicons style={authStyles.inputIcon}
                  name='mail-outline'
                  size={20}
                  color={COLORS.textLight}/>
                  <TextInput
                    style={[
                      authStyles.input,
                      
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
                  </View>

                    {/* Password */}
                    <View style={authStyles.inputGroup}>
                      {/* <Text style={authStyles.label}>Password</Text> */}
                    <View style={[
                      authStyles.inputContainer,
                      focusedField === "password" && authStyles.inputFocused,
                      passwordError && authStyles.inputError,
                    ]}
                    >
                  <Ionicons style={authStyles.inputIcon}
                  name='lock-closed-outline'
                  size={20}
                  color={COLORS.textLight}/>                  
                  <TextInput
                    style={[
                      authStyles.input,
                    ]}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.textLight}
                    value={password}
                    onChangeText={handlePasswordChange}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry
                    editable={!isLoading}
                  />
                  {passwordError && <Text style={authStyles.errorText}>{passwordError}</Text>}
                  </View>
                  </View>
                <Pressable
                  style={[
                    authStyles.button,
                    authStyles.buttonPrimary,
                    isLoading && authStyles.buttonDisabled,
                  ]}
                  onPress={handleSignInSubmit}
                  disabled={isLoading || !emailAddress.trim() || !password.trim()}
                >
                  {isLoading ? (
                    <View style={authStyles.loadingContainer}>
                      <ActivityIndicator size="small" color={COLORS.white} />
                      <Text style={authStyles.buttonPrimaryText}>Signing In...</Text>
                    </View>
                  ) : (
                    <Text style={authStyles.buttonPrimaryText}>Sign In</Text>
                  )}
                </Pressable>

                <View style={authStyles.linkContainer}>
                  <Pressable>
                    <Text style={authStyles.linkAction}>Forgot password?</Text>
                  </Pressable>
                </View>

                <View style={authStyles.divider} />

                <View style={authStyles.linkContainer}>
                  <Text style={authStyles.linkText}>Don't have an account? </Text>
                  <Link href="/(auth)/sign-up">
                    <Text style={authStyles.linkAction}>Sign Up</Text>
                  </Link>
                </View>
                </View>
              </>
            )}
          </View>
        </View>
    </KeyboardAvoidingView>
  );
}