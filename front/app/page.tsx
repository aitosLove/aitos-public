import Image from "next/image";

export default function SuikaiDocumentation() {
  return (
    <div className="p-12 space-y-6">
      <Image src="/suikai.png" alt="S" width={128} height={128} />
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        All in Suikai, All in Sui&AI
      </h1>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        <strong>Suikai</strong> is an easy-to-use, automated, and scalable AI
        assistant. Suikai allows users to easily perform functions such as
        investment, asset management, and project analysis on the SUI blockchain
        without needing any prior blockchain-related knowledge and without
        requiring excessive effort.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        Principle Introduction
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Smart contracts built on the blockchain serve single functions such as
        lending, trading, staking, etc., and meet the comprehensive needs of
        users through complex combinations of blockchain operations. However,
        for most users, learning to interact with the blockchain is a difficult
        task. At the same time, some needs require regular or even
        high-frequency blockchain operations, such as dynamically adjusting
        positions. This makes users feel tired and confused.
      </p>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Suikai does not aim to help users become blockchain experts. Instead,
        Suikai itself is a blockchain expert that helps users handle all complex
        operations.
      </p>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        All users need to do is choose the functions they need and leave it to
        Suikai. No operations, no knowledge required. Everything is within
        Suikai. <em>(Suikai is All you need)</em>
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
        How is Suikai Implemented?
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Suikai is powered by the asynchronous Agent framework Sekai, which gives
        Suikai the native ability to interact with the blockchain.
      </p>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Suikai introduces the concepts of <strong>modules</strong> and{" "}
        <strong>blueprints</strong>, thereby achieving a progression of chain
        abstraction, contract abstraction, and intent alignment.
      </p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>
          <strong>Modules</strong> encapsulate methods for interacting with the
          chain and contracts.
        </li>
        <li>
          <strong>Blueprints</strong> combine modules to accomplish complex
          functions.
        </li>
      </ul>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Simply by installing a blueprint, Suikai can automatically complete all
        tasks according to the blueprint’s plan.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
        Scalability
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Suikai’s scalability is endowed by its modular design. In addition to
        supporting “minimal operation” modules that directly interact with the
        SUI blockchain, Suikai also prepares advanced encapsulated modules for
        interacting with specific protocols.
      </p>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        With abstractions for raw chain interactions and contract interactions,
        blueprint creators can easily develop towards specific needs.
      </p>
      <p className="leading-7 [&:not(:first-child)]:mt-6">Users can:</p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>Install modules,</li>
        <li>Create their own blueprints, or</li>
        <li>Install blueprints created by others.</li>
      </ul>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Everything is free and open.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
        Sekai Framework
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        The Sekai framework is a transaction-driven asynchronous Agent
        framework. Simply put, the Sekai Agent can actively perceive external
        and internal events and initiate corresponding tasks to handle them. The
        framework’s asynchronous capability comes from the decoupling of events
        and tasks, which is also what distinguishes Sekai from most other Agent
        frameworks.
      </p>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        For example, Sekai can:
      </p>
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
        <li>Listen for new token launch events through specific modules,</li>
        <li>Assign them to different blueprints for processing.</li>
      </ul>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Even if it fails to buy in the first instance, the Agent can perform
        subsequent remedial operations.
      </p>

      <h2 className="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors">
        Trustworthiness
      </h2>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Nothing is more trustworthy than running locally.
      </p>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Suikai and the blueprints developed by the community are completely
        open-source. We recommend that users install Suikai and audited
        blueprints locally, running them in a trusted environment.
      </p>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        Of course, like most projects, we will also launch hosted Agents in the
        future. :) Centralized servers are hard to trust, but they are really
        convenient. Wish you like it.
      </p>
    </div>
  );
}
