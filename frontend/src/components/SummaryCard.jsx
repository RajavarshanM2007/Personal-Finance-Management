function SummaryCard({ label, amount, status, tone = "neutral" }) {
  return <article className="summary-card"><p>{label}</p><div className="summary-card__amount">{amount}</div><span className={`summary-card__status summary-card__status--${tone}`}>{status}</span></article>;
}
export default SummaryCard;
