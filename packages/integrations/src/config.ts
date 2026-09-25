export type IntegrationConfig = { appEnv: "development" | "test" | "staging" | "production" };

export const integrationConfig: IntegrationConfig = {
  appEnv: (process.env.APP_ENV ?? "development") as IntegrationConfig["appEnv"],
};