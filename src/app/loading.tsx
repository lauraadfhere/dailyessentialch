export default function Loading() {
  return (
    <div className="site-loader-stage" role="status" aria-label="Loading">
      <svg className="site-loader-arc" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="41" />
      </svg>
    </div>
  );
}
