import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { AuthBackground } from "@/components/AuthBackground";

const Auth = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session, navigate]);

  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success(t("auth.resetEmailSent"));
    } catch (error: any) {
      toast.error(error.message || t("error.generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("auth.loginSuccess"));
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success(t("auth.checkEmail"));
      }
    } catch (error: any) {
      toast.error(error.message || t("error.generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error(t("error.generic"));
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <AuthBackground />

      {/* Left branding panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative z-10">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-16"
          >
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center glow-md">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold gradient-text font-display">RegBridge</h2>
              <p className="text-[9px] gradient-text-gold tracking-[0.15em] uppercase font-semibold">
                {t("nav.subtitle")}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-md"
          >
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight text-foreground font-display mb-6">
              {t("auth.subtitle")}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Intelligence réglementaire augmentée par l'IA pour les professionnels de la compliance.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 space-y-4"
          >
            {[
              "Analyse FINMA en temps réel",
              "Conformité Bâle III / IV",
              "Documents internes sécurisés",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan shrink-0" />
                <span className="text-sm font-medium">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[10px] text-muted-foreground/30 font-mono"
        >
          RegBridge v1.0 · Powered by AI
        </motion.p>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-md mx-auto mb-4">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold gradient-text font-display">RegBridge</h1>
            <p className="text-[9px] gradient-text-gold tracking-[0.15em] uppercase font-semibold mt-1">
              {t("nav.subtitle")}
            </p>
          </div>

          {/* Auth card */}
          <div className="glass-strong rounded-2xl p-8 space-y-6 border-gradient">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground font-display">
                {forgotPassword ? t("auth.forgotPasswordTitle") : isLogin ? t("auth.login") : t("auth.signup")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                {forgotPassword ? t("auth.forgotPasswordDesc") : isLogin ? t("auth.loginSubtitle") : t("auth.signupSubtitle")}
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 glass border-white/[0.1] hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 text-sm font-medium"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t("auth.continueGoogle")}
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{t("common.or")}</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
            </div>

            {forgotPassword ? (
              resetSent ? (
                <div className="text-center space-y-4">
                  <Mail className="w-10 h-10 text-accent-cyan mx-auto" />
                  <p className="text-sm text-muted-foreground">{t("auth.resetEmailSentDesc")}</p>
                  <button
                    onClick={() => { setForgotPassword(false); setResetSent(false); }}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors text-sm"
                  >
                    {t("auth.backToLogin")}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3.5">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder={t("auth.email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 glass border-white/[0.08] focus:border-primary/40 transition-colors"
                      required
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full h-12 gradient-primary text-primary-foreground glow-sm font-semibold text-sm group"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        {t("auth.sendResetLink")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
                  </Button>
                  <p className="text-center">
                    <button
                      type="button"
                      onClick={() => setForgotPassword(false)}
                      className="text-primary hover:text-primary/80 font-semibold transition-colors text-sm"
                    >
                      {t("auth.backToLogin")}
                    </button>
                  </p>
                </form>
              )
            ) : (
              <>
                <form onSubmit={handleEmailAuth} className="space-y-3.5">
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="relative overflow-hidden"
                      >
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                        <Input
                          placeholder={t("auth.fullName")}
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="pl-11 h-12 glass border-white/[0.08] focus:border-primary/40 transition-colors"
                          required={!isLogin}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder={t("auth.email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 glass border-white/[0.08] focus:border-primary/40 transition-colors"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder={t("auth.password")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 glass border-white/[0.08] focus:border-primary/40 transition-colors"
                      required
                      minLength={6}
                    />
                  </div>
                  {isLogin && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setForgotPassword(true)}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {t("auth.forgotPassword")}
                      </button>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 gradient-primary text-primary-foreground glow-sm font-semibold text-sm group"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        {isLogin ? t("auth.loginBtn") : t("auth.signupBtn")}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    )}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground pt-1">
                  {isLogin ? t("auth.noAccount") : t("auth.alreadyRegistered")}{" "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                  >
                    {isLogin ? t("auth.signupBtn") : t("auth.loginBtn")}
                  </button>
                </p>
              </>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground/30 text-center mt-6 font-mono lg:hidden">
            RegBridge v1.0
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
