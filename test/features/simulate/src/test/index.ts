import { DynamicExecutor } from "@nestia/e2e";

import { Backend } from "../Backend";
import { Global } from "../Global";

async function main(): Promise<void> {
  const server: Backend = new Backend();
  await server.open();

  const report: DynamicExecutor.IReport = await DynamicExecutor.validate({
    extension: __filename.substring(__filename.length - 2),
    prefix: "test",
    parameters: () => [
      {
        host: "http://127.0.0.1:37000",
        simulate: true,
      },
    ],
    location: `${__dirname}/features`,
    onComplete: (exec) => {
      const elapsed: number =
        new Date(exec.completed_at).getTime() -
        new Date(exec.started_at).getTime();
      console.log(`  - ${exec.name}: ${elapsed.toLocaleString()} ms`);
    },
  });
  await server.close();

  const exceptions: Error[] = report.executions
    .filter((exec) => exec.error !== null)
    .map((exec) => exec.error!);
  if (exceptions.length === 0) {
    console.log("Success");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
  } else {
    for (const exp of exceptions) console.log(exp);
    console.log("Failed");
    console.log("Elapsed time", report.time.toLocaleString(), `ms`);
    process.exit(-1);
  }

  if (Global.used === true)
    throw new Error("Failed to activate SDK random data generator");
}
main().catch((exp) => {
  console.log(exp);
  process.exit(-1);
});
