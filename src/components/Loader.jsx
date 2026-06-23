export default function Loader({ message = 'Finding delicious recipes…' }) {
  return (
    <div className="loader-wrap">
      <div className="spinner" />
      <p className="loader-msg">{message}</p>
    </div>
  );
}
