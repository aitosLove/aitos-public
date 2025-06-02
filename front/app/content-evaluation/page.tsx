import  { ContentEvaluation }  from "@/components/minicard-aptos/content-evaluation";
// import EventPoolSection from "@/components/minicard-aptos/EventPool";
// import TaskPool from "@/components/minicard-aptos/TaskPool";

export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-6 pb-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="gap-6">
          
              <ContentEvaluation />
            </div>
          </div>
        </div>
      </div>
  );
}
