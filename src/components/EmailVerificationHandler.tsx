import { useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Handles email verification and auto sign-in from any route
const EmailVerificationHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = searchParams.get("token_hash") || searchParams.get("token");
    const type = searchParams.get("type");

    const handle = async () => {
      // Process verification on all routes, with a duplicate guard via sessionStorage

      // Case 1: Supabase verification link with token/type
      if (token && type) {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as any,
          });

          if (error) {
            console.error("Email verification error:", error);
            toast.error("Email verification failed. Please try again.");
          } else if (data.user) {
            const alreadyShown = sessionStorage.getItem("welcome_after_signup_shown");
            if (!alreadyShown) {
              toast.success("🎉 Welcome to MyFuze! Your account has been verified and you are now signed in.");
              sessionStorage.setItem("welcome_after_signup_shown", "1");
            }
            navigate("/profile", { replace: true });
          }
        } catch (err) {
          console.error("Email verification exception:", err);
          toast.error("Email verification failed. Please try again.");
        }
        return;
      }

      // Case 2: Hash-based redirect (e.g. #access_token=...&type=signup)
      if (location.hash && location.hash.includes("type=signup")) {
        const alreadyShown = sessionStorage.getItem("welcome_after_signup_shown");
        if (!alreadyShown) {
          // Wait a tick for Supabase to finalize session from hash
          setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              toast.success("🎉 Welcome to MyFuze! Your account has been verified and you are now signed in.");
              sessionStorage.setItem("welcome_after_signup_shown", "1");
              navigate("/profile", { replace: true });
            }
          }, 0);
        }
      }
    };

    handle();
  }, [location, navigate, searchParams]);

  return null;
};

export default EmailVerificationHandler;
