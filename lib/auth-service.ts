"use client";

import { changePassword, requestPasswordReset, resetPassword, sendVerificationEmail, signIn, signOut, signUp } from "./auth-client";

export interface AuthCredentials {
    email: string;
    password: string;
    name?: string;
    rememberMe?: boolean;
}

export interface AuthResult {
    success: boolean;
    error?: string;
    requiresVerification?: boolean;
}

export class AuthService {
    private static instance: AuthService;

    static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async signInWithEmail(credentials: AuthCredentials & { callbackURL?: string }): Promise<AuthResult> {
        try {
            const result = await signIn.email({
                email: credentials.email,
                password: credentials.password,
                rememberMe: credentials.rememberMe ?? true,
                callbackURL: credentials.callbackURL || "/dashboard",
            });

            if (result.error) {
                const status = (result.error as any)?.status;
                return {
                    success: false,
                    error: result.error.message || "Email ou mot de passe incorrect",
                    requiresVerification: status === 403,
                };
            }

            return { success: true };
        } catch (signInError) {
            console.error('Sign in error:', signInError);
            return {
                success: false,
                error: "Une erreur s'est produite lors de la connexion",
            };
        }
    }

    async signUpWithEmail(credentials: AuthCredentials): Promise<AuthResult> {
        try {
            if (!credentials.name) {
                return {
                    success: false,
                    error: "Le nom est requis pour l'inscription",
                };
            }

            const result = await signUp.email({
                email: credentials.email,
                password: credentials.password,
                name: credentials.name,
                callbackURL: "/dashboard",
            });

            if (result.error) {
                return {
                    success: false,
                    error: result.error.message || "Une erreur s'est produite lors de l'inscription",
                };
            }

            return { success: true, requiresVerification: true };
        } catch (signUpError) {
            console.error('Sign up error:', signUpError);
            return {
                success: false,
                error: "Une erreur s'est produite lors de l'inscription",
            };
        }
    }

    async signInWithProvider(provider: "github" | "google", callbackURL?: string): Promise<void> {
        await signIn.social({
            provider,
            callbackURL: callbackURL || "/dashboard",
            // errorCallbackURL: "/auth/login",
        });
    }

    async signOut(): Promise<void> {
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        window.location.href = new URL("/formations", window.location.origin).href;
                    },
                },
            });
        } catch (signOutError) {
            console.error('Sign out error:', signOutError);
            // Force redirect even if signOut fails
            window.location.href = new URL("/formations", window.location.origin).href;
        }
    }

    async sendVerificationEmail(email: string): Promise<AuthResult> {
        try {
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const result = await sendVerificationEmail({
                email,
                callbackURL: `${origin}/dashboard`,
            });

            if (result.error) {
                return {
                    success: false,
                    error: result.error.message || "Impossible d'envoyer l'email de vérification",
                };
            }

            return { success: true };
        } catch (verificationError) {
            console.error('Email verification error:', verificationError);
            return {
                success: false,
                error: "Une erreur s'est produite lors de l'envoi de l'email",
            };
        }
    }

    async requestPasswordReset(email: string): Promise<AuthResult> {
        try {
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const result = await requestPasswordReset({
                email,
                redirectTo: `${origin}/auth/reset-password`,
            });

            if (result.error) {
                return {
                    success: false,
                    error: result.error.message || "Impossible d'envoyer l'email de réinitialisation",
                };
            }

            return { success: true };
        } catch (resetError) {
            console.error('Password reset error:', resetError);
            return {
                success: false,
                error: "Une erreur s'est produite",
            };
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
        try {
            const result = await resetPassword({
                token,
                newPassword,
            });

            if (result.error) {
                return {
                    success: false,
                    error: result.error.message || "Impossible de réinitialiser le mot de passe",
                };
            }

            return { success: true };
        } catch (resetPasswordError) {
            console.error('Reset password error:', resetPasswordError);
            return {
                success: false,
                error: "Une erreur s'est produite",
            };
        }
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
        try {
            const result = await changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: true,
            });

            if (result.error) {
                return {
                    success: false,
                    error: result.error.message || "Impossible de changer le mot de passe",
                };
            }

            return { success: true };
        } catch (changePasswordError) {
            console.error('Change password error:', changePasswordError);
            return {
                success: false,
                error: "Une erreur s'est produite",
            };
        }
    }
}

export const authService = AuthService.getInstance();
