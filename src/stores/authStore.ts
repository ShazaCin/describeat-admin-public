import { create } from "zustand";
import { signIn, signOut, getCurrentUser, signInWithRedirect } from "aws-amplify/auth";
import { Hub } from "@aws-amplify/core";

interface AuthState {
  user: Record<string, unknown> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    try {
      const user = await getCurrentUser();
      set({ user: user as unknown as Record<string, unknown>, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    const result = await signIn({ username: email, password });
    if (result.isSignedIn) {
      // Get the actual user object — result is SignInOutput, not a user
      const user = await getCurrentUser();
      set({ user: user as unknown as Record<string, unknown>, isAuthenticated: true, isLoading: false });
    } else if (result.nextStep.signInStep !== "DONE") {
      // Handle MFA, new password required, etc.
      throw new Error(`Additional step required: ${result.nextStep.signInStep}`);
    }
  },

  signInWithGoogle: async () => {
    await signInWithRedirect({ provider: "Google" });
  },

  signOut: async () => {
    await signOut();
    set({ user: null, isAuthenticated: false });
  },

  initAuth: () => {
    // Called from main.tsx *after* Amplify.configure()
    useAuthStore.getState().checkAuth();

    // Listen for OAuth callback completions (signedIn, autoSignIn)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Hub.listen("auth", (data: any) => {
      const event: string = data?.payload?.event;
      if (event === "signedIn" || event === "autoSignIn") {
        getCurrentUser()
          .then((user) =>
            set({ user: user as unknown as Record<string, unknown>, isAuthenticated: true, isLoading: false }),
          )
          .catch(() => set({ user: null, isAuthenticated: false, isLoading: false }));
      } else if (event === "signedOut") {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
  },
}));
