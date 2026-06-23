export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-box">
      <div className="error-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>{message || 'An unexpected error occurred. Please try again.'}</p>
      {onRetry && (
        <button className="btn-retry" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
