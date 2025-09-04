export const runtime = "nodejs";

//import { exit } from "process";

export async function register() {
  try {
    const [{ connectMongo }, { connectionMongo, MONGO_URL }] =
        await Promise.all([
          import("./package/mongo/init"),
          import("./package/mongo"),
        ]);
      //console.log("MONGO connect start");
      await Promise.all([connectMongo(connectionMongo, MONGO_URL)]);
    
  } catch (error) {
    console.log("registration error", error);
    //process.exit(1);
  }
}
