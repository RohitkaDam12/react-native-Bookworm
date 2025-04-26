import cron from "cron";
import https from "https";

// Create a cron job that runs every 14 minutes
const job = new cron.CronJob("*/14 * * * *", function () {
  https
    .get(process.env.API_URL, (res) => {
      if (res.statusCode === 200) {
        console.log("✅ GET request sent successfully");
      } else {
        console.log("❌ GET request failed", res.statusCode);
      }
    })
    .on("error", (e) => console.error("⚠️ Error while sending request:", e));
});

export default job;


  // CRON JOB EXPLANATION:
  // ----------------------
  // Cron jobs are scheduled tasks that run at fixed intervals.
  // This job sends a GET request every 14 minutes.

  // CRON FORMAT:
  // ┌───────────── minute (0 - 59)
  // │ ┌───────────── hour (0 - 23)
  // │ │ ┌───────────── day of month (1 - 31)
  // │ │ │ ┌───────────── month (1 - 12)
  // │ │ │ │ ┌───────────── day of week (0 - 7) (0 or 7 is Sunday)
  // │ │ │ │ │
  // * * * * *
  
  // EXAMPLES:
  // // - "*/14 * * * *"    => Every 14 minutes
  // // - "0 0 * * 0"       => At midnight on Sundays
  // // - "30 3 15 * *"     => 3:30 AM on the 15th of every month

