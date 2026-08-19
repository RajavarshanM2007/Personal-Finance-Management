import { useState } from "react";

function BudgetModal({ budget, categories, onClose, onSave }) {
  const [form, setForm] = useState({ category: budget?.category ?? categories[0] ?? "Food", limit: budget?.limit?.toString() ?? "" });
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => { event.preventDefault(); onSave({ ...budget, ...form, limit: Number(form.limit) }); };
  const isEditing = Boolean(budget);
  return <div className="modal-backdrop" role="presentation"><section className="transaction-modal budget-modal" role="dialog" aria-modal="true" aria-labelledby="budget-modal-title"><div className="modal-header"><div><p className="modal-kicker">{isEditing ? "UPDATE BUDGET" : "NEW BUDGET"}</p><h2 id="budget-modal-title">{isEditing ? "Edit budget" : "Create a budget"}</h2></div><button className="modal-close" type="button" onClick={onClose} aria-label="Close modal">×</button></div><form onSubmit={submit}><div className="form-grid budget-form"><label className="form-field"><span>Category</span><select name="category" value={form.category} onChange={update} disabled={isEditing}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label className="form-field"><span>Monthly spending limit</span><div className="amount-input"><span>₹</span><input type="number" min="1" step="1" name="limit" value={form.limit} onChange={update} placeholder="0" required /></div></label></div><div className="modal-actions"><button type="button" className="button button--secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button--primary">{isEditing ? "Save changes" : "Save budget"}</button></div></form></section></div>;
}
export default BudgetModal;
