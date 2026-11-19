'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { MailCheck, ArrowLeft } from 'lucide-react'
import { Field } from '@/components/forms/field'
import { PillButton } from '@/components/ui/pill'
import { forgotPassword, type ForgotState } from '@cms-logic/lib/actions/auth'

export function ForgotPasswordForm({ workspace }: { workspace?: string }) {
  const [state, action, pending] = useActionState<ForgotState, FormData>(forgotPassword, {})

  if (state.sent) {
    return (
      <div className="card-pop rounded-card border border-line bg-surface p-7 md:p-9">
        <span className="grid size-10 place-items-center rounded-full bg-brand/10 text-brand-strong">
          <MailCheck className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-[24px] font-extrabold tracking-[-0.025em] text-head">
          Check your email
        </h1>
        <p className="mt-2 text-[15px] text-mut">
          If an account exists for that email, we&apos;ve sent a link to choose a new password. Check your inbox and spam folder.
        </p>
        <div className="mt-7 border-t border-line pt-6">
          <Link href="/cms/login" className="block">
            <PillButton variant="ink" className="w-full">
              Back to sign in
            </PillButton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form
      action={action}
      className="card-pop rounded-card border border-line bg-surface p-7 md:p-9"
    >
      {workspace && <input type="hidden" name="workspace" value={workspace} />}

      <h1 className="text-[24px] font-extrabold tracking-[-0.025em] text-head">
        Forgot password?
      </h1>
      <p className="mt-2 text-[15px] text-mut">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      <div className="mt-6 space-y-4">
        <Field
          label="Email address"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          autoFocus
          error={state.error}
        />
      </div>

      <div className="mt-7 border-t border-line pt-6 space-y-4">
        <PillButton type="submit" variant="ink" className="w-full" disabled={pending}>
          {pending ? 'Sending reset link…' : 'Send reset link'}
        </PillButton>

        <div className="text-center">
          <Link
            href="/cms/login"
            className="inline-flex items-center gap-1.5 text-[13px] text-mut transition-colors hover:text-head hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </form>
  )
}
