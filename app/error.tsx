"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-5xl font-medium">Something went wrong.</h1>
        <p className="mt-5 leading-8">Try that again. If it keeps happening, call or email the bakery.</p>
        <button type="button" className="btn btn-primary mt-8" onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}
