/**
 * Script tạo Jira tickets cho Phase mở rộng project AA
 * 
 * Usage: node scripts/create-jira-tickets.js
 * 
 * Requires: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN environment variables
 * Or: Run through MCP Jira tools
 */

const fs = require('fs');
const path = require('path');

// Load ticket definitions
const ticketData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../documents/AA/phase-expansion-tickets.json'), 'utf8')
);

const PROJECT_KEY = 'AA';

// Jira API config (set via environment variables)
const JIRA_BASE_URL = process.env.JIRA_BASE_URL || 'https://your-domain.atlassian.net';
const JIRA_EMAIL = process.env.JIRA_EMAIL || '';
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || '';

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

async function createIssue(fields) {
  const response = await fetch(`${JIRA_BASE_URL}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ fields })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create issue: ${response.status} - ${error}`);
  }

  return response.json();
}

async function main() {
  console.log(`\n Creating Jira tickets for ${PROJECT_KEY} Phase Expansion\n`);
  console.log(`Total: ${ticketData.summary.totalEpics} Epics, ${ticketData.summary.totalTasks} Tasks/Stories`);
  console.log(`Story Points: ${ticketData.summary.totalStoryPoints}\n`);

  const createdTickets = [];

  for (const epic of ticketData.epics) {
    console.log(`\n Creating Epic: ${epic.summary}`);
    
    // Create Epic
    const epicResult = await createIssue({
      project: { key: PROJECT_KEY },
      issuetype: { name: 'Epic' },
      summary: epic.summary,
      description: {
        type: 'doc',
        version: 1,
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: epic.description }]
        }]
      },
      labels: epic.labels
    });

    console.log(`  Created: ${epicResult.key} - ${epic.summary}`);
    createdTickets.push({ key: epicResult.key, summary: epic.summary, type: 'Epic' });

    // Create child tasks/stories
    for (const task of epic.tasks) {
      const taskResult = await createIssue({
        project: { key: PROJECT_KEY },
        issuetype: { name: task.issueType },
        summary: task.summary,
        description: {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: task.description }]
          }]
        },
        labels: task.labels,
        parent: { key: epicResult.key }
      });

      console.log(`    ${taskResult.key} - ${task.summary} (${task.storyPoints} SP)`);
      createdTickets.push({ 
        key: taskResult.key, 
        summary: task.summary, 
        type: task.issueType,
        parent: epicResult.key,
        storyPoints: task.storyPoints
      });
    }
  }

  console.log(`\n\n Done! Created ${createdTickets.length} tickets total.\n`);
  
  // Save results
  const outputPath = path.join(__dirname, '../documents/AA/created-tickets.json');
  fs.writeFileSync(outputPath, JSON.stringify(createdTickets, null, 2));
  console.log(`Results saved to: ${outputPath}`);
}

// Dry run mode - just print what would be created
function dryRun() {
  console.log(`\n DRY RUN - Tickets to create for ${PROJECT_KEY}\n`);
  
  let ticketNum = 5; // Assuming AA-1 to AA-4 already exist
  
  for (const epic of ticketData.epics) {
    console.log(`\n [Epic] AA-${ticketNum}: ${epic.summary}`);
    console.log(`   Labels: ${epic.labels.join(', ')}`);
    const epicNum = ticketNum;
    ticketNum++;
    
    for (const task of epic.tasks) {
      console.log(`   [${task.issueType}] AA-${ticketNum}: ${task.summary} (${task.storyPoints} SP) -> parent: AA-${epicNum}`);
      ticketNum++;
    }
  }
  
  console.log(`\n\nTotal tickets to create: ${ticketNum - 5}`);
  console.log(`(AA-5 through AA-${ticketNum - 1})`);
}

// Check if we have credentials
if (!JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.log('No Jira credentials found. Running in DRY RUN mode.');
  console.log('Set JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN to create tickets.\n');
  dryRun();
} else {
  main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}
