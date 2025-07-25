// railway-mcp-sync-final.ts – Simplified Railway Function to ensure Smithery API key is available

/* ------------------------------------------------------------------ */
/*  Environment                                                       */
/* ------------------------------------------------------------------ */
const BACKBOARD = "https://backboard.railway.app/graphql/v2";
const PROJECT = process.env.RAILWAY_PROJECT_ID!;
const ENV = process.env.RAILWAY_ENVIRONMENT_ID!;
const RW_TOKEN = process.env.RAILWAY_TOKEN!;
const SMITHERY_API_KEY = process.env.SMITHERY_API_KEY!;

/* ------------------------------------------------------------------ */
/*  Update Railway environment variable                               */
/* ------------------------------------------------------------------ */
async function setRailwayEnvVar(key: string, value: string) {
  const query = `
    mutation($input: VariableUpsertInput!) {
      variableUpsert(input: $input)
    }
  `;

  const variables = {
    input: {
      projectId: PROJECT,
      environmentId: ENV,
      name: key,
      value: value,
    },
  };

  const data = JSON.stringify({ query, variables });

  const response = await fetch(BACKBOARD, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RW_TOKEN}`,
      "Content-Type": "application/json",
      "Content-Length": data.length.toString(),
    },
    body: data,
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(`Failed to set environment variable: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

/* ------------------------------------------------------------------ */
/*  Main function                                                     */
/* ------------------------------------------------------------------ */
async function main() {
  console.log("🚀 Setting up Smithery API key for LibreChat MCP servers...\n");
  
  try {
    // Set the Smithery API key as a shared environment variable
    await setRailwayEnvVar("SMITHERY_API_KEY", SMITHERY_API_KEY);
    
    console.log("✅ Successfully set SMITHERY_API_KEY in Railway environment!");
    console.log("\n📋 Required service-specific environment variables:");
    console.log("  - N8N_URL (auto-generated from n8n service)");
    console.log("  - N8N_API_KEY (auto-generated by n8n setup script)");
    console.log("  - GHOST_API_URL");
    console.log("  - GHOST_STAFF_API_KEY");
    console.log("  - CALCOM_API_KEY");
    console.log("  - SUPABASE_ACCESS_TOKEN");
    console.log("\n🎉 MCP configuration complete!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    if (error instanceof Error && error.message.includes("Not Authorized")) {
      console.error("\n⚠️  Token appears to lack permissions. Please ensure:");
      console.error("1. You're using a Service Token (not a personal token)");
      console.error("2. The token was created with 'Manage Variables' permission");
      console.error("3. The token is for the correct project");
    }
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
}); 