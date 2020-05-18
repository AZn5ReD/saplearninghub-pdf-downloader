import main from "./main";
import processSend from "./process";

main().catch((error) => {
  console.error(error);
  processSend({ error });
  process.exit();
});
