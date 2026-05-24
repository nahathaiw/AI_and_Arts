export default function IdentityCard({ identity, isSelected, onClick }) {
  return (
    <button
      className={`identity-card ${isSelected ? "selected" : ""}`}
      onClick={() => onClick(identity)}
    >
      <h3>{identity.title}</h3>
    </button>
  );
}
