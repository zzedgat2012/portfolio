'use client';

import { ArrowLeft } from 'lucide-react';

type GoBackButtonProps = { className?: string };

/** Returns to the previous page, or home when the visitor landed here directly. */
export function GoBackButton({ className }: GoBackButtonProps) {
  function handleClick() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.assign('/');
    }
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      Go Back
      <ArrowLeft aria-hidden="true" size={16} />
    </button>
  );
}
