import {
  Account,
  initThreadPool,
  ProgramManager,
  AleoKeyProvider,
  AleoKeyProviderParams,
} from "@provablehq/sdk";

await initThreadPool();

const programName = "birth_control_prescription.aleo";

const birth_control_prescription_program = `
    program ${programName};
    
    struct PersonalInfo:
      age as u8;
      has_contraindication as boolean;
  
  
  function verify_prescription:
      input r0 as PersonalInfo.private;
      gte r0.age 18u8 into r1;
      not r0.has_contraindication into r2;
      and r1 r2 into r3;
      output r3 as boolean.private;`;

async function localProgramExecution(
  program,
  programName,
  aleoFunction,
  inputs
) {
  const programManager = new ProgramManager();

  // Create a temporary account for the execution of the program
  const account = new Account();
  programManager.setAccount(account);

  // Create a key provider in order to re-use the same key for each execution
  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);
  programManager.setKeyProvider(keyProvider);

  // Pre-synthesize the program keys and then cache them in memory using key provider
  const keyPair = await programManager.synthesizeKeys(
    birth_control_prescription_program,
    aleoFunction,
    inputs
  );
  programManager.keyProvider.cacheKeys(
    `${programName}:${aleoFunction}`,
    keyPair
  );

  // Specify parameters for the key provider to use search for program keys. In particular specify the cache key
  // that was used to cache the keys in the previous step.
  const keyProviderParams = new AleoKeyProviderParams({
    cacheKey: `${programName}:${aleoFunction}`,
  });

  // Execute once using the key provider params defined above. This will use the cached proving keys and make
  // execution significantly faster.
  let executionResponse = await programManager.run(
    program,
    aleoFunction,
    inputs,
    true,
    undefined,
    keyProviderParams
  );
  console.log(
    "birth_control_prescription/verify_prescription executed - result:",
    executionResponse.getOutputs()
  );

  // Verify the execution using the verifying key that was generated earlier.
  if (programManager.verifyExecution(executionResponse)) {
    console.log(
      "birth_control_prescription/verify_prescription execution verified!"
    );
  } else {
    throw "Execution failed verification!";
  }
}

const start = Date.now();
console.log("Starting execute!");

// Create default HealthInfo data
const my_info = {
  age: 25,
  has_contraindication: false,
};

// Convert the default data to the format expected by the Aleo program
const userData = `{ age: ${my_info.age}u8, has_contraindication: ${my_info.has_contraindication}}`;

console.log("Loading my health data!");
console.log(userData);
console.log("Completed loading my health Data!");

await localProgramExecution(
  birth_control_prescription_program,
  programName,
  "verify_prescription",
  [userData]
);
console.log("Execute finished!", Date.now() - start);
