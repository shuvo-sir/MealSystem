/**
 * Validation utilities for authentication forms
 */

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.trim() === "") {
    return { valid: false, error: "Email is required" };
  }
  
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: "Please enter a valid email address" };
  }
  
  return { valid: true };
};

export const validatePassword = (password: string): { valid: boolean; error?: string; strength?: "weak" | "fair" | "good" | "strong" } => {
  if (!password || password === "") {
    return { valid: false, error: "Password is required" };
  }
  
  if (password.length < 8) {
    return { 
      valid: false, 
      error: "Password must be at least 8 characters long",
      strength: "weak"
    };
  }
  
  // Strength calculation
  let strength: "weak" | "fair" | "good" | "strong" = "weak";
  let strengthScore = 0;
  
  if (password.length >= 8) strengthScore++;
  if (password.length >= 12) strengthScore++;
  if (/[a-z]/.test(password)) strengthScore++;
  if (/[A-Z]/.test(password)) strengthScore++;
  if (/[0-9]/.test(password)) strengthScore++;
  if (/[^A-Za-z0-9]/.test(password)) strengthScore++;
  
  if (strengthScore <= 2) strength = "weak";
  else if (strengthScore <= 3) strength = "fair";
  else if (strengthScore <= 4) strength = "good";
  else strength = "strong";
  
  return { valid: true, strength };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): { valid: boolean; error?: string } => {
  if (!confirmPassword || confirmPassword === "") {
    return { valid: false, error: "Please confirm your password" };
  }
  
  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match" };
  }
  
  return { valid: true };
};

export const validateVerificationCode = (code: string): { valid: boolean; error?: string } => {
  if (!code || code.trim() === "") {
    return { valid: false, error: "Verification code is required" };
  }
  
  // Typically 6 digits, but allow flexibility
  if (!/^\d{4,8}$/.test(code.trim())) {
    return { valid: false, error: "Code should be numeric (4-8 characters)" };
  }
  
  return { valid: true };
};

/**
 * Get password strength indicator
 */
export const getPasswordStrength = (password: string): {
  strength: "weak" | "fair" | "good" | "strong";
  percentage: number;
  label: string;
  color: string;
} => {
  const result = validatePassword(password);
  
  if (!password || password === "") {
    return { strength: "weak", percentage: 0, label: "No password", color: "#999" };
  }
  
  const strengthMap = {
    weak: { percentage: 25, label: "Weak", color: "#EF5350" },
    fair: { percentage: 50, label: "Fair", color: "#FFA726" },
    good: { percentage: 75, label: "Good", color: "#66BB6A" },
    strong: { percentage: 100, label: "Strong", color: "#26A69A" },
  };
  
  return {
    strength: result.strength || "weak",
    ...strengthMap[result.strength || "weak"],
  };
};

/**
 * Clean and normalize email input
 */
export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

/**
 * Get user-friendly error message for Clerk errors
 */
export const getUserFriendlyError = (error: any): string => {
  if (!error) return "An error occurred. Please try again.";
  
  // Handle Clerk-specific errors
  if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors[0].message || error.errors[0].code || "An error occurred";
  }
  
  if (error.message) {
    // Map common error messages
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes("password")) {
      return "The password you entered is incorrect or does not meet requirements.";
    }
    if (errorMessage.includes("email") || errorMessage.includes("identifier")) {
      return "This email address is not recognized or is invalid.";
    }
    if (errorMessage.includes("already")) {
      return "This account already exists. Try signing in instead.";
    }
    if (errorMessage.includes("verification")) {
      return "The verification code is invalid or has expired.";
    }
    if (errorMessage.includes("rate")) {
      return "Too many attempts. Please try again later.";
    }
    
    return error.message;
  }
  
  return "An error occurred. Please try again.";
};
