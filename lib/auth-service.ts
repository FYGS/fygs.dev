"use client";

import { changePassword, requestPasswordReset, resetPassword, sendVerificationEmail, signIn, signOut, signUp } from "./auth-client";
import { solveHumanProof } from "./anti-automation/client";
import { HONEYPOT_FIELD } from "./anti-automation/honeypot";
import type { HumanProofAction } from "./anti-automation/types";
import { safeInternalPath } from "./safe-redirect";

/** The hidden trap field of the form on screen, when something filled it: sent as a header (the body is JSON). */
function honeypotHeaders(): Record<string, string> {
    if (typeof document === "undefined") return {};
    const trap = document.querySelector<HTMLInputElement>(`input[name="${HONEYPOT_FIELD}"]`);
    const value = trap?.value.trim();
    return value ? { "x-fx-trap": value.slice(0, 64) } : {};
}

/**
 * Headers proving the request comes from a browser that did a little work (see lib/anti-automation), and carrying the
 * honeypot when it was filled. Never blocks the form: when no proof can be made the server decides.
 */
async function humanProofFetchOptions(action: HumanProofAction): Promise<{ headers: Record<string, string> }> {
    let proof: Record<string, string> = {};
    try {
        proof = await solveHumanProof(action);
    } catch {
        proof = {};
    }
    return { headers: { ...proof, ...honeypotHeaders() } };
}

export interface AuthCredentials {
    email: string;
    password: string;
    name?: string;
    rememberMe?: boolean;
    /** Where to go once signed in: a path of this site (anything else becomes /dashboard). */
    callbackURL?: string;
}

export interface AuthResult {
    success: boolean;
    error?: string;
    requiresVerification?: boolean;
    /** The password was right and a second factor is due: go to /auth/two-factor. */
    requiresTwoFactor?: boolean;
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
                callbackURL: safeInternalPath(credentials.callbackURL),
                fetchOptions: await humanProofFetchOptions("sign-in"),
            });

            if (result.error) {
                const status = (result.error as any)?.status;
                return {
                    success: false,
                    error: result.error.message || "Email ou mot de passe incorrect",
                    requiresVerification: status === 403,
                };
            }

            if ((result.data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
                return { success: true, requiresTwoFactor: true };
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
                callbackURL: safeInternalPath(credentials.callbackURL),
                fetchOptions: await humanProofFetchOptions("sign-up"),
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
            callbackURL: safeInternalPath(callbackURL),
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

    async sendVerificationEmail(email: string, callbackPath?: string | null): Promise<AuthResult> {
        try {
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const result = await sendVerificationEmail({
                email,
                callbackURL: `${origin}${safeInternalPath(callbackPath)}`,
                fetchOptions: await humanProofFetchOptions("sign-up"),
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
                fetchOptions: await humanProofFetchOptions("password-reset"),
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
