import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Loader2, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { AuthBackground } from "@/components/AuthBackground";

const ResetPassword = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // User arrived via recovery link — stay on page
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }
    if (password.length < 6) {
      toast.error(t("auth.passwordTooShort"));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success(t("auth.passwordResetSuccess"));
      setTimeout(() => navigate("/auth", { replace: true }), 2500);
    } catch (error: any) {
      toast.error(error.message || t("error.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <AuthBackground />
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-md mx-auto mb-4">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold gradient-text font-display">RegBridge</h1>
          </div>

          <div className="glass-strong rounded-2xl p-8 space-y-6 border-gradient">
            {success ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-accent-cyan mx-auto" />
                <h2 className="text-xl font-bold text-foreground font-display">
                  {t("auth.passwordResetSuccess")}
                </h2>
                <p className="text-sm text-muted-foreground">{t("auth.redirecting")}</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground font-display">
                    {t("auth.newPassword")}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {t("auth.newPasswordDesc")}
                  </p>
                </div>
                <form onSubmit={handleReset} className="space-y-3.5">
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder={t("auth.newPasswordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 glass border-white/[0.08] focus:border-primary/40 transition-colors"
                      required
                      minLength={6}
                      autoFocus
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder={t("auth.confirmPassword")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-11 h-12 glass border-white/[0.08] focus:border-primary/40 transition-colors"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 gradient-primary text-primary-foreground glow-sm font-semibold text-sm group"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        {t("auth.resetPasswordBtn")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
