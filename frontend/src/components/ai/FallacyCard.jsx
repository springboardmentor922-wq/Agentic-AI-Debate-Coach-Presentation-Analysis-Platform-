import "./FallacyCard.css";

function FallacyCard({ fallacy }) {
  return (
    <div className="fallacy-card">

      <div className="fallacy-header">
        ⚠ {fallacy.fallacy}
      </div>

      <div className="fallacy-body">

        <h5>Description</h5>
        <p>{fallacy.description}</p>

        <h5>How to Fix</h5>
        <p>{fallacy.how_to_fix}</p>

      </div>

    </div>
  );
}

export default FallacyCard;