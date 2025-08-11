'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Sanitize error message - never display raw error content
  const safeErrorMessage = 'An unexpected error occurred. Please try again.';
  
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-cloud-white mb-4">Something went wrong!</h2>
        <p className="text-fog-gray mb-4">{safeErrorMessage}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}