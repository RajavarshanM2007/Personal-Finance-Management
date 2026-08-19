import { useState } from "react";

function ContributionModal({ goal, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const submit = (event) => { event.preventDefault(); onSave(goal.id, Number(amount)); };
  return <div className="modal-backdrop" role="presentation"><section className="transaction-modal contribution-modal" role="dialog" aria-modal="true" aria-labelledby="contribution-modal-title"><div className="modal-header"><div><p className="modal-kicker">ADD CONTRIBUTION</p><h2 id="contribution-modal-title">{goal.name}</h2></div><button className="modal-close" type="button" onClick={onClose} aria-label="Close modal">×</button></div><form onSubmit={submit}><label className="form-field contribution-field"><span>Contribution amount</span><div className="amount-input"><span>₹</span><input type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" autoFocus required /></div></label><p className="contribution-note">Current savings: ₹{goal.current.toLocaleString("en-IN")}</p><div className="modal-actions"><button type="button" className="button button--secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button--primary">Add contribution</button></div></form></section></div>;
}
export default ContributionModal;
