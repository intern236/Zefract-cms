'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { MailCheck, CheckCircle2 } from 'lucide-react'
import { Field, FIELD_BASE } from '@/components/forms/field'
import { Label } from '@/components/ui/label'
import { PillButton } from '@/components/ui/pill'
import { cn } from '@/lib/utils'
import { login, verifyCode, acceptInvite, logout, type LoginState, type InviteState } from '@cms-logic/lib/actions/auth'

export type InviteData = {
  token: string
  email: string
  roleLabel: string
  where: string
  mode: 'new' | 'join' | 'signin' | 'wrong' | 'expired'
  currentEmail?: string
}

export function LoginForm({
  next,
  invite,
}: {
  next?: string
  invite?: InviteData
}) {
  // ---- Invite Mode State ----
  const [inviteState, inviteAction, invitePending] = useActionState<InviteState, FormData>(acceptInvite, {})

  // ---- Standard Login State ----
  const [loginState, loginAction, loginPending] = useActionState(
    async (prev: LoginState, form: FormData): Promise<LoginState> => {
      const step = form.get('step')
      if (step === 'restart') return { step: 'password' }
      return step === 'code' ? verifyCode(prev, form) : login(prev, form)
    },
    { step: 'password' }
  )

  // ---------------------------------------------------------------------------
  // 1. INVITE FLOW (when arriving via /cms/login?invite=<token>)
  // ---------------------------------------------------------------------------
  if (invite) {
    if (invite.mode === 'expired') {
      return (
        <div className="card-pop rounded-card border border-line bg-surface p-7 md:p-9">
          <h1 className="text-[24px] font-extrabold tracking-[-0.025em] text-head">
            This invite has expired
          </h1>
          <p className="mt-2 text-[15px] text-mut">
            Invites work once, for 7 days. Ask whoever invited you to send a new one.
          </p>
          <div className="mt-7 border-t border-line pt-6">
            <Link href="/cms/login" className="block">
              <PillButton variant="ink" className="w-full">
                Go to sign in
              </PillButton>
            </Link>
          </div>
        </div>
      )
    }

    if (invite.mode === 'wrong') {
      return (
        <div className="card-pop rounded-card border border-line bg-surface p-7 md:p-9">
          <h1 className="text-[24px] font-extrabold tracking-[-0.025em] text-head">
            Join {invite.where}
          </h1>
          <p className="mt-2 text-[15px] text-mut">
            This invite is for <span className="font-semibold text-head">{invite.email}</span>.
          </p>
          <div className="mt-5 rounded-[12px] border border-amber-200 bg-amber-50 p-4 text-[13.5px] leading-relaxed text-amber-900">
            You are currently signed in as <span className="font-bold">{invite.currentEmail}</span>.
            Please sign out first to accept this invitation.
          </div>
          <div className="mt-7 border-t border-line pt-6">
            <form action={logout}>
              <input type="hidden" name="invite" value={invite.token} />
              <PillButton type="submit" variant="ink" className="w-full">
                Sign out to accept
              </PillButton>
            </form>
            <div className="mt-4 text-center">
              <Link href="/cms/login" className="text-[13px] text-mut transition-colors hover:text-head hover:underline">
                Or return to login
              </Link>
            </div>
          </div>
        </div>
      )
    }

    if (invite.mode === 'signin') {
      return (
        <div className="card-pop rounded-card border border-line bg-surface p-7 md:p-9">
          <h1 className="text-[24px] font-extrabold tracking-[-0.025em] text-head">
            Join {invite.where}
          </h1>
          <p className="mt-2 text-[15px] text-mut">
            You already have an account for <span className="font-semibold text-head">{invite.email}</span>.
            Sign in with your password to accept this workspace invite.
          </p>
          <div className="mt-7 border-t border-line pt-6">
            <Link href={`/cms/login?next=${encodeURIComponent(`/cms/login?invite=${invite.token}`)}`} className="block">
              <PillButton variant="ink" className="w-full">
                Sign in to accept
              </PillButton>
            </Link>
          </div>
        </div>
      )
    }

    if (invite.mode === 'join') {
      return (
        <form action={inviteAction} className="card-pop rounded-card border border-line bg-surface p-7 md:p-9">
          <input type="hidden" name="token" value={invite.token} />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 font-mono text-[11px] font-semibold text-brand-strong">
            <CheckCircle2 className="size-3.5" />
            Invite for {invite.roleLabel}
          </span>
          <h1 className="mt-3 text-[24px] font-extrabold tracking-[-0.025em] text-head">
            Join {invite.where}
          </h1>
          <p className="mt-2 text-[15px] text-mut">
            You are signed in as <span className="font-semibold text-head">{invite.email}</span>. Click below to join this workspace.
          </p>
          {inviteState.error ? (
            <p role="alert" className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
              {inviteState.error}
            </p>
          ) : null}
          <div className="mt-7 border-t border-line pt-6">
            <PillButton type="submit" variant="ink" className="w-full" disabled={invitePending}>
              {invitePending ? 'Joining workspace…' : `Join ${invite.where}`}
            </PillButton>
          </div>
        </form>
      )
    }

    // Default: invite.mode === 'new'
    return (
      <form action={inviteAction} className="card-pop rounded-card border border-line bg-surface p-7 md:p-9">
        <input type="hidden" name="token" value={invite.token} />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 font-mono text-[11px] font-semibold text-brand-strong">
          <CheckCircle2 className="size-3.5" />
          Invite for {invite.roleLabel}
        </span>
        <h1 className="mt-3 text-[24px] font-extrabold tracking-[-0.025em] text-head">
          Join {invite.where}
        </h1>
        <p className="mt-2 text-[15px] text-mut">
          This invite is for <span className="font-semibold text-head">{invite.email}</span>.
        </p>

        <div className="mt-6 space-y-4">
          <Field
            label="Name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            autoFocus
            error={inviteState.fieldErrors?.name}
          />

          <Field
            label="Password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Choose a password"
            error={inviteState.fieldErrors?.password}
          />
        </div>

        {inviteState.error ? (
          <p role="alert" className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
            {inviteState.error}
          </p>
        ) : null}

        <div className="mt-7 border-t border-line pt-6">
          <PillButton type="submit" variant="ink" className="w-full" disabled={invitePending}>
            {invitePending ? 'Creating account…' : 'Create account & join'}
          </PillButton>
        </div>
      </form>
    )
  }

  // ---------------------------------------------------------------------------
  // 2. STANDARD LOGIN FLOW
  // ---------------------------------------------------------------------------
  const onCodeStep = loginState.step === 'code'

  return (
    <form
      action={loginAction}
      className="card-pop rounded-card border border-line bg-surface p-7 md:p-9"
    >
      <input type="hidden" name="step" value={onCodeStep ? 'code' : 'password'} />
      {next && <input type="hidden" name="next" value={next} />}

      {onCodeStep ? (
        <>
          <span className="grid size-10 place-items-center rounded-full bg-brand/10 text-brand-strong">
            <MailCheck className="size-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-[24px] font-extrabold tracking-[-0.025em] text-head">
            Check your email
          </h1>
          <p className="mt-2 text-[15px] text-mut">
            {loginState.maskedEmail ? (
              <>
                We sent a six-digit code to{' '}
                <span className="font-semibold text-head">{loginState.maskedEmail}</span>. It expires in
                ten minutes.
              </>
            ) : (
              'We sent a six-digit code. It expires in ten minutes.'
            )}
          </p>

          <div className="mt-6">
            <Label htmlFor="code" className="text-[13.5px] font-semibold text-head">
              Sign-in code
            </Label>
            <input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              placeholder="000000"
              aria-invalid={loginState.error ? true : undefined}
              aria-describedby={loginState.error ? 'login-error' : undefined}
              className={cn(
                FIELD_BASE,
                'mt-1.5 h-14 px-4 text-center font-mono text-[24px] tracking-[0.35em] text-head'
              )}
            />
          </div>
        </>
      ) : (
        <>
          <h1 className="text-[24px] font-extrabold tracking-[-0.025em] text-head">Sign in</h1>
          <p className="mt-2 text-[15px] text-mut">
            Sign in to access your Zefract account and workspace.
          </p>

          <div className="mt-6 space-y-4">
            <Field
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="you@company.com"
              defaultValue={loginState.step === 'password' ? loginState.email : ''}
              autoFocus
            />

            <Field
              label="Password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
            />
          </div>

          <div className="mt-3 flex items-center justify-end">
            <Link
              href="/cms/forgot"
              className="text-[13px] font-medium text-mut transition-colors hover:text-head hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </>
      )}

      {loginState.error ? (
        <p
          id="login-error"
          role="alert"
          className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
        >
          {loginState.error}
        </p>
      ) : null}

      <div className="mt-7 border-t border-line pt-6">
        <PillButton type="submit" variant="ink" className="w-full" disabled={loginPending}>
          {loginPending ? 'Signing in…' : onCodeStep ? 'Verify and sign in' : 'Sign in'}
        </PillButton>

        {onCodeStep ? (
          <div className="mt-4 flex items-center justify-between gap-4 text-[13px]">
            <button
              type="submit"
              name="step"
              value="restart"
              formNoValidate
              disabled={loginPending}
              className="font-semibold text-mut transition-colors hover:text-head disabled:opacity-50"
            >
              Start again
            </button>
          </div>
        ) : null}
      </div>
    </form>
  )
}
