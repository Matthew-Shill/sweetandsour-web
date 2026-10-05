import Link from "next/link";

export default function NotFound() {
  return (
    <div className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-5xl font-medium">That page is not on the menu.</h1>
        <p className="mt-5 leading-8">The desserts are still here.</p>
        <Link href="/" className="btn btn-primary mt-8">
          Back home
        </Link>
      </div>
    </div>
  );
}
