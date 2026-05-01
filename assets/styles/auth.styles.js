import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export const authStyles = StyleSheet.create({
  // Container & Layout
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    gap: 16,
  },

  // Header
  header: {
    marginBottom: 32,
    marginTop: 16,
    alignItems: "center",
  },
  image: {
    height: 310,
    width: 300,
    contentFit: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    textAlign: "center",
  },

  // Form Fields
  fieldContainer: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    fontFamily: "System",
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: COLORS.expense,
    borderWidth: 1.5,
  },

  // Error & Success Messages
  errorText: {
    fontSize: 12,
    color: COLORS.expense,
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: COLORS.income,
    marginTop: 4,
  },
  generalError: {
    backgroundColor: "#FFEBEE",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.expense,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  generalErrorText: {
    fontSize: 13,
    color: COLORS.expense,
    fontWeight: "500",
    lineHeight: 19,
  },

  // Buttons
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonPrimaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  buttonSecondaryText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  buttonFlex: {
    flex: 1,
  },

  // Loading States
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  // Links & Navigation
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 8,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  linkAction: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  // Verification Code
  codeContainer: {
    gap: 12,
    marginTop: 8,
  },
  codeInputContainer: {
    gap: 6,
    marginBottom: 12,
  },
  resendContainer: {
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  resendText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  timerText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },

  // Checkbox & Terms
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  checkboxLink: {
    color: COLORS.primary,
    fontWeight: "600",
  },

  // Password Strength
  strengthContainer: {
    gap: 6,
  },
  strengthBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthIndicator: {
    height: "100%",
    width: "0%",
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "500",
  },
  strengthWeak: {
    color: COLORS.expense,
  },
  strengthFair: {
    color: "#FFA726",
  },
  strengthGood: {
    color: "#66BB6A",
  },
  strengthStrong: {
    color: COLORS.income,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },

  // Centered Content
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  centeredSpinner: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },

  // Message Container
  messageContainer: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  messageText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
    lineHeight: 20,
  },
});
