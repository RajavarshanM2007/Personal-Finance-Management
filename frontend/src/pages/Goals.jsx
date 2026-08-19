import { useState } from "react";
import GoalCard from "../components/GoalCard";
import GoalModal from "../components/GoalModal";
import ContributionModal from "../components/ContributionModal";

function Goals({ goals, onSave, onDelete, onContribute }) {
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributionGoal, setContributionGoal] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const closeGoalModal = () => { setEditingGoal(null); setIsCreating(false); };
  return <section className="goals-page" id="goals"><div className="page-heading"><div><h2>Savings goals</h2><p>Build toward the things that matter most to you.</p></div><button className="button button--primary" type="button" onClick={() => setIsCreating(true)}>Create goal</button></div>{goals.length ? <div className="goals-grid">{goals.map((goal) => <GoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} onDelete={onDelete} onContribute={setContributionGoal} />)}</div> : <section className="dashboard-panel empty-budgets"><strong>No savings goals yet</strong><p>Create a goal to start tracking your progress.</p><button className="button button--primary" type="button" onClick={() => setIsCreating(true)}>Create goal</button></section>}{(isCreating || editingGoal) && <GoalModal goal={editingGoal} onClose={closeGoalModal} onSave={(goal) => { onSave(goal); closeGoalModal(); }} />}{contributionGoal && <ContributionModal goal={contributionGoal} onClose={() => setContributionGoal(null)} onSave={(id, amount) => { onContribute(id, amount); setContributionGoal(null); }} />}</section>;
}
export default Goals;
