import type React from 'react';
import { useState, useEffect } from 'react';
import { Lock, Loader2, ShieldCheck, TrendingUp } from 'lucide-react';
import { Button, Input } from '../components/common';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { ParsedApiError } from '../api/error';
import { isParsedApiError } from '../api/error';
import { useAuth } from '../hooks';
import { SettingsAlert } from '../components/settings';

const LoginPage: React.FC = () => {
  const { login, passwordSet, setupState } = useAuth();
  const navigate = useNavigate();

  // Set page title
  useEffect(() => {
    document.title = '登录 - DSA';
  }, []);
  const [searchParams] = useSearchParams();
  const rawRedirect = searchParams.get('redirect') ?? '';
  const redirect =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/';

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | ParsedApiError | null>(null);

  const isFirstTime = setupState === 'no_password' || !passwordSet;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isFirstTime && password !== passwordConfirm) {
      setError('两次输入的密码不一致');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await login(password, isFirstTime ? passwordConfirm : undefined);
      if (result.success) {
        navigate(redirect, { replace: true });
      } else {
        setError(result.error ?? '登录失败');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="v4-shell v4-login-page min-h-screen px-4 py-6 font-sans text-foreground selection:bg-[var(--login-accent-soft)] sm:px-6 lg:px-8">
      <main className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="hidden min-w-0 lg:block">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-[var(--v4-radius)] border border-[var(--v4-line)] bg-white shadow-soft-card">
              <TrendingUp className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <p className="label-uppercase">A Stock AI</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
              每日股票研究工作台
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-secondary-text">
              面向个股分析、历史报告复盘和问股 Agent 追问的本地工作台。
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {['多源行情', 'AI 研判', '报告追问'].map((item) => (
                <div key={item} className="rounded-[var(--v4-radius-sm)] border border-[var(--v4-line)] bg-white/72 px-4 py-3 text-sm font-medium text-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-label="登录表单" className="mx-auto w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <p className="label-uppercase">A Stock AI</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              每日股票研究工作台
            </h2>
          </div>

          <div className="v4-panel p-6 sm:p-8">
            <div className="mb-8">
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-[var(--login-text-primary)]">
                {isFirstTime ? (
                  <>
                    <ShieldCheck className="h-6 w-6 text-emerald-400" />
                    <span>设置初始密码</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 text-[var(--login-accent-text)]" />
                    <span>管理员登录</span>
                  </>
                )}
              </h1>
              <p className="mt-2 text-sm text-[var(--login-text-secondary)]">
                {isFirstTime
                  ? '首次启用认证，请为系统工作台设置管理员密码。'
                  : '访问 A Stock AI 工作台需要有效的身份凭证。'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  id="password"
                  type="password"
                  appearance="login"
                  allowTogglePassword
                  iconType="password"
                  label={isFirstTime ? '管理员密码' : '登录密码'}
                  placeholder={isFirstTime ? '请设置 6 位以上密码' : '请输入密码'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                  autoComplete={isFirstTime ? 'new-password' : 'current-password'}
                />

                {isFirstTime && (
                  <Input
                    id="passwordConfirm"
                    type="password"
                    appearance="login"
                    allowTogglePassword
                    iconType="password"
                    label="确认密码"
                    placeholder="再次确认管理员密码"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                )}
              </div>

              {error && (
                <div className="overflow-hidden">
                  <SettingsAlert
                    title={isFirstTime ? '配置失败' : '验证未通过'}
                    message={isParsedApiError(error) ? error.message : error}
                    variant="error"
                    className="!border-[var(--login-error-border)] !bg-[var(--login-error-bg)] !text-[var(--login-error-text)]"
                  />
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="relative h-12 w-full overflow-hidden rounded-xl border-0 bg-gradient-to-r from-[var(--login-brand-button-start)] to-[var(--login-brand-button-end)] font-medium text-[var(--login-button-text)] shadow-lg shadow-[0_18px_36px_hsl(214_100%_8%_/_0.24)] hover:from-[var(--login-brand-button-start-hover)] hover:to-[var(--login-brand-button-end-hover)]"
                disabled={isSubmitting}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isFirstTime ? '初始化中...' : '正在建立连接...'}</span>
                    </>
                  ) : (
                    <span>{isFirstTime ? '完成设置并登录' : '授权进入工作台'}</span>
                  )}
                </div>
              </Button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
