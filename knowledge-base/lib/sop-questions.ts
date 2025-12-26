// Interview questions for the SOP creation wizard
// Separated from claude-sop.ts to avoid importing Anthropic SDK in client components

export const interviewQuestions = [
  {
    id: 'responsible_party',
    question: "Who is responsible for performing this task?",
    placeholder: "e.g., Marketing Coordinator, Office Manager, All staff members..."
  },
  {
    id: 'trigger_event',
    question: "What triggers this process? When does it start?",
    placeholder: "e.g., When a new client request comes in, Every Monday morning, When inventory is low..."
  },
  {
    id: 'steps',
    question: "Walk me through the steps from start to finish. Be as detailed as you'd like.",
    placeholder: "Describe each step of the process..."
  },
  {
    id: 'exceptions',
    question: "Are there any exceptions? When does this process NOT apply?",
    placeholder: "e.g., This doesn't apply to rush orders, Skip step 3 if the client is existing..."
  },
  {
    id: 'related_policies',
    question: "Are there any related procedures or policies I should know about?",
    placeholder: "e.g., See also: Client Onboarding SOP, Related to: Privacy Policy..."
  }
];

