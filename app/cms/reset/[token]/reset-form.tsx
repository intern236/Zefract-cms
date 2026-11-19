'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Field } from '@/components/forms/field'
import { PillButton } from '@/components/ui/pill'
import { resetPassword, type ResetState } from '@cms-logic/lib/actions/auth'

export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword, {})

  return (
    <form
      action={action}
      className="card-pop rounded-card border border-line bg-surface p-7 md:p-9"
    >
      <input type="hidden" name="token" value={token} />

      <h1 className="text-[24px] font-extrabold tracking-[-0.025em] text-head">
        Choose a new password
      </h1>
      <p className="mt-2 text-[15px] text-mut">
        Setting a new password for <span className="font-semibold text-head">{email}</span>.
      </p>

      <div className="mt-6 space-y-4">
        <Field
          label="New password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="At least 12 characters"
          autoFocus
          error={state.error}
        />

        <Field
          label="Confirm password"
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Type it again"
        />
      </div>

      <div className="mt-7 border-t border-line pt-6">
        <PillButton type="submit" variant="ink" className="w-full" disabled={pending}>
          {pending ? 'Saving new password…' : 'Save new password & sign in'}
        </PillButton>
      </div>
    </form>
  )
}
