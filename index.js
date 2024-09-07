const https = require("https");

// Get the GitHub username from command line arguments
const username = process.argv[2];

if (!username) {
  console.error("Please provide a GitHub username.");
  process.exit(1);
}
const url = `https://api.github.com/users/${username}/events`;

// Options for the HTTPS request
const options = {
  headers: {
    "User-Agent": "node.js",
  },
};

// Function to fetch and display user activity
function fetchGitHubActivity(username) {
  https
    .get(url, options, (res) => {
      let data = "";

      // Collect data chunks
      res.on("data", (chunk) => {
        data += chunk;
      });

      // Handle end of response
      res.on("end", () => {
        if (res.statusCode === 200) {
          try {
            const events = JSON.parse(data);
            displayActivity(events);
          } catch (error) {
            console.error("Error parsing JSON:", error.message);
          }
        } else {
          console.error(
            `Failed to fetch data: ${res.statusCode} ${res.statusMessage}`
          );
        }
      });
    })
    .on("error", (error) => {
      console.error("Error fetching data:", error.message);
    });
}

// Function to display user activity
function displayActivity(events) {
  if (events.length === 0) {
    console.log("No recent activity found.");
    return;
  }

  events.forEach((event) => {
    switch (event.type) {
      case "PushEvent":
        console.log(
          `Pushed ${event.payload.commits.length} commits to ${event.repo.name}`
        );
        break;
      case "IssuesEvent":
        console.log(`Opened a new issue in ${event.repo.name}`);
        break;
      case "WatchEvent":
        console.log(`Starred ${event.repo.name}`);
        break;
      default:
        console.log(`Performed ${event.type} on ${event.repo.name}`);
    }
  });
}

// Fetch and display the GitHub activity
fetchGitHubActivity(username);
