'use client'

import { useActionState } from 'react'
import { MailCheck } from 'lucide-react'
import { Field, FIELD_BASE } from '@/components/forms/field'
import { Label } from '@/components/ui/label'
import { PillButton } from '@/components/ui/pill'
import { cn } from '@/lib/utils'
import { login, type LoginState } from './actions'

/**
 * Sign in: the password, then the code that was emailed.
 *
 * WHICH STEP IS SHOWING COMES FROM THE SERVER, never from local state. The
 * client cannot know whether the password stage has been cleared — only the
 * server holds the pending cookie — so `state.step` is the single source of it
 * and this component just renders what it is told. That also means a reload
 * lands on the right step instead of quietly restarting.
 *
 * Both steps post the same action through one useActionState, because they are
 * one attempt at one thing.
 */
export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {
    step: 'password',
  })

  const onCodeStep = state.step === 'code'

  return (
    <form
      action={formAction}
      className="card-pop rounded-card border border-line bg-surface p-7 md:p-9"
    >
      {onCodeStep ? (
        <>
          <span className="grid size-10 place-items-center rounded-full bg-brand/10 text-brand-strong">
            <MailCheck className="size-5" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-[24px] font-extrabold tracking-[-0.025em] text-head">
            Check your email
          </h1>
          <p className="mt-2 text-[15px] text-mut">
            {state.sentTo ? (
              <>
                We sent a six-digit code to{' '}
                <span className="font-semibold text-head">{state.sentTo}</span>. It expires in
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
              /* Not type="number": a spinner on a credential is absurd, and it
                 would strip a leading zero from a code like 004821. */
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              placeholder="000000"
              aria-invalid={state.error ? true : undefined}
              aria-describedby={state.error ? 'login-error' : undefined}
              className={cn(
                FIELD_BASE,
                'mt-1.5 h-14 px-4 text-center font-mono text-[24px] tracking-[0.35em] text-head'
              )}
            />
          </div>
        </>
      ) : (
        <>
          {/* NO SUBTITLE, deliberately, where the step above has one.
              It used to read "One password, set in the deployment environment. Five
              wrong tries locks this form for fifteen minutes." — which told anyone
              who reached this screen where the credential lives and exactly how many
              attempts they get before the lockout, and how long to wait it out. That
              is the rate limit's own configuration, printed above the field it
              protects, for an audience that is by definition not yet authenticated.

              The lockout still fires; a person who trips it is told then, which is
              the only moment the information helps them. The "check your email" step
              keeps its subtitle because that one tells the actual admin something
              they need mid-flow — where the code went and how long it lasts. */}
          <h1 className="text-[24px] font-extrabold tracking-[-0.025em] text-head">Admin</h1>

          <div className="mt-6">
            <Field
              label="Password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="The admin password"
              error={undefined}
            />
          </div>
        </>
      )}

      {state.error ? (
        <p
          id="login-error"
          role="alert"
          className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
        >
          {state.error}
        </p>
      ) : null}
      {state.notice && !state.error ? (
        <p
          role="status"
          className="mt-4 rounded-[10px] border border-emerald-600/25 bg-emerald-600/8 px-3 py-2 text-[13px] text-emerald-800"
        >
          {state.notice}
        </p>
      ) : null}

      <div className="mt-7 border-t border-line pt-6">
        <PillButton type="submit" variant="ink" className="w-full" disabled={pending}>
          {pending ? 'Checking…' : onCodeStep ? 'Verify and sign in' : 'Continue'}
        </PillButton>

        {onCodeStep ? (
          /* Both are submit buttons carrying an `intent`, so they work without
             JavaScript and need no state of their own — the server reads the
             value and branches. formNoValidate stops the six-digit `code` field
             blocking a resend or a restart when it is empty. */
          <div className="mt-4 flex items-center justify-between gap-4 text-[13px]">
            <button
              type="submit"
              name="intent"
              value="resend"
              formNoValidate
              disabled={pending}
              className="font-semibold text-brand-strong transition-colors hover:text-brand disabled:opacity-50"
            >
              Send a new code
            </button>
            <button
              type="submit"
              name="intent"
              value="restart"
              formNoValidate
              disabled={pending}
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
