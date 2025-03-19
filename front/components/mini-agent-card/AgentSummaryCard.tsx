import AgentProfile from "./AgentProfile"
import AgentMetrics from "./AgentMetrics"

export default function AgentSummary() {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-8 w-full mb-8">
      <AgentProfile />
      <AgentMetrics />
    </div>
  )
}