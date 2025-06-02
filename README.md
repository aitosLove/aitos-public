# AITOS V2

Welcome to AITOS V2! This project is a multi-agent system designed with a focus on modularity, extensible blueprints, and a runtime-centric approach to agent instantiation.

## Key Features

*   **Multi-Agent Architecture:** AITOS V2 is built around the concept of multiple agents that can communicate and collaborate.
*   **Group Sensing:** The system incorporates an upgraded multi-agent communication mechanism called "group sensing."
*   **Modular Design:** The project emphasizes a modular structure, allowing for the clear separation and organization of different functionalities into "modules."
*   **Blueprints:** AITOS V2 utilizes "blueprints" to define and configure agent behaviors and capabilities.
*   **Runtime Instantiation:** Agents are instantiated at runtime, providing flexibility and dynamic control over the system.

## Project Structure

The project is organized into the following main directories:

*   `back/`: Contains the backend logic, including agent core, modules, blueprints, and database interactions.
*   `front/`: Houses the frontend application, likely for user interaction and visualization.
*   `aitos-docs/`: Contains documentation related to Aitos, which appears to be a key component or concept within AITOS.

## Getting Started

This section will guide you through setting up and running the AITOS V2 project, including both the backend and frontend components.

### Prerequisites

*   Node.js (version X.X.X or higher recommended)
*   pnpm (or your preferred package manager like npm or yarn)
*   A database system (e.g., PostgreSQL - specify if a particular one is required by `DrizzleDatabase`)

### Backend Setup (`back/`)

1.  **Navigate to the backend directory:**
    ```bash
    cd back
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Set up environment variables:**
    *   Copy the example environment file: `cp example.env .env` (or `env.example` if the correct name).
    *   Edit the `.env` file with your specific configurations, such as:
        *   `APTS_SECRET_KEY`: Your Aptos secret key.
        *   Database connection details (e.g., `DATABASE_URL`).
        *   Any other API keys or secrets required by the modules.
4.  **Database Initialization/Migration:**
    *   Ensure your database server is running.
    *   For initial setup or schema changes, Drizzle ORM is used. It's common to use a "push" command to synchronize your schema with the database during development. Check your `package.json` for a script like `db:push`.
        ```bash
        # Example: Check your package.json for a script like db:push
        pnpm run db:push
        ```
    *   For production or more controlled migrations, you would typically generate migration files and then apply them. If you have a migration script (e.g., `db:migrate`), use that:
        ```bash
        # pnpm run db:generate # If you need to generate new migration files
        # pnpm run db:migrate  # To apply generated migrations
        ```
    *   You might also need to seed the database (check for a `db:seed` script if initial data is required).
5.  **Start the backend server:**
    *   The backend can typically be started in development mode using:
    ```bash
    pnpm run dev
    ```
    *   This command should handle tasks like TypeScript compilation (if needed via `ts-node` or similar) and starting the server, often with hot-reloading.

### Frontend Setup (`front/`)

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../front 
    # (or from the root: cd front)
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Set up environment variables (if any):**
    *   Similar to the backend, check for an `example.env` or `.env.local.example`.
    *   Copy and configure it: `cp example.env .env.local` (Next.js typically uses `.env.local`).
    *   This might include the URL for the backend API.
4.  **Start the frontend development server:**
    *   Look for a start script in `front/package.json` (e.g., `dev`, `start`). Next.js projects usually use `dev`.
    ```bash
    pnpm run dev
    ```
    The application should now be accessible in your browser, typically at `http://localhost:3000`.

### Running Your Own Aitos Agent/Blueprint

To quickly start your own project or agent instance within AITOS V2:

1.  **Understand Blueprints:** Familiarize yourself with the concept of `Blueprints` in the `back/src/blueprints/` directory. Blueprints define the core logic and module composition for an agent.
The `aitosBlueprint.ts` is a good example.
2.  **Configure `back/runtime/aitos.ts` (or create a new runtime file):**
    *   This file appears to be the main entry point for running a specific agent configuration (the `mainAgent`).
    *   You can modify `aitos.ts` or duplicate it to create a new runtime configuration for your project.
    *   **Key areas to customize:**
        *   `agentId`: Provide a unique ID for your agent.
        *   `enableAitosBlueprint` options:
            *   `cmcAnalysisOptions`: Configure the `analysisPortfolio` with the asset pairs you want to analyze.
            *   `aptosPortfolioOptions`: Set your `privateKey` (preferably via environment variables) and `selectedTokens` for the Aptos portfolio.
3.  **Define Configuration in `back/runtime/aitos-config.ts`:**
    *   The `analysis_portfolio_apt` variable is imported from this file. You'll need to define your specific asset pairs and their relationships here if you're following the existing pattern.
4.  **Set Environment Variables:** Ensure all necessary environment variables (like `APTS_SECRET_KEY` and any other keys required by your chosen modules) are correctly set in the `.env` file in the `back/` directory.
5.  **Run the Agent:**
    *   Execute the runtime file. If `back/runtime/aitos.ts` is intended to be run directly with Node.js (e.g., using `ts-node` or after compilation), the command would be something like:
        ```bash
        # If using ts-node (ensure it's installed: pnpm add -D ts-node)
        cd back
        npx ts-node runtime/aitos.ts 
        ```
        Or, if there's a script in `back/package.json` to run this specific runtime:
        ```bash
        # Example: pnpm run start:aitos (if such a script exists)
        pnpm run start:aitos
        ```

This provides a basic template. You'll need to verify the exact script names from `package.json` in both `front/` and `back/` directories, and any specific environment variables or database setup steps unique to your project.

## Future Development (V3 Roadmap)

The V3 roadmap aims to further enhance the AITOS V2 platform with the following key improvements:

*   **Typed Events and Tasks:**
    *   **Goal:** Introduce strong typing for all events and tasks within the agent system.
    *   **Benefit:** Improve developer experience by enabling better autocompletion, compile-time error checking, and clearer definitions of data structures flowing through the system. This will reduce runtime errors and make the system more robust and maintainable.
    *   **Implementation:** This will likely involve defining TypeScript interfaces or types for all event payloads and task parameters/return values, and ensuring these types are consistently used across modules and blueprints.

*   **Enhanced Agent Communication Protocol:**
    *   **Goal:** Refine the "group sensing" mechanism for more complex inter-agent communication patterns.
    *   **Benefit:** Allow for more sophisticated collaborative behaviors, such as multi-agent consensus, distributed task execution, and more nuanced information sharing.
    *   **Potential Features:** Standardized message formats, topic-based subscriptions, direct agent-to-agent messaging capabilities.

*   **Advanced Blueprint Library:**
    *   **Goal:** Develop a richer library of pre-built blueprints for common use cases (e.g., advanced DeFi strategies, cross-chain arbitrage, AI-driven content generation).
    *   **Benefit:** Accelerate development for users by providing ready-to-use templates that can be easily customized.
    *   **Approach:** Identify common patterns and needs in the agent space and encapsulate them into well-documented, configurable blueprints.

*   **Improved Observability and Monitoring:**
    *   **Goal:** Integrate more comprehensive logging, tracing, and metrics collection.
    *   **Benefit:** Provide better insights into agent behavior, system performance, and easier debugging of issues in a distributed multi-agent environment.
    *   **Potential Tools:** Integration with tools like OpenTelemetry, Prometheus, Grafana, or custom dashboarding solutions.

*   **Dynamic Module Loading/Unloading:**
    *   **Goal:** Allow agents to load or unload modules dynamically at runtime without requiring a full restart.
    *   **Benefit:** Increase system flexibility and enable agents to adapt their capabilities based on changing conditions or user commands.

*   **User Interface Enhancements (Front/):**
    *   **Goal:** Develop a more intuitive and powerful user interface for managing agents, configuring blueprints, and visualizing agent activity and data.
    *   **Benefit:** Make the system more accessible to a wider range of users, including those who may not be developers.

