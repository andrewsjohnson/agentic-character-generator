name: Claude - Plan

on:
  issues:
    types: [opened]
  issue_comment:
    types: [created]

permissions:
  contents: read
  issues: write

jobs:
  plan:
    runs-on: ubuntu-latest

    # Run when:
    # - issue opened, OR
    # - someone comments /plan or /revise-plan on an issue
    if: |
      github.event_name == 'issues' ||
      (
        github.event.issue.pull_request == null &&
        (
          contains(github.event.comment.body, '/plan') ||
          contains(github.event.comment.body, '/revise-plan')
        )
      )

    steps:
      - uses: actions/checkout@v4

      - name: Generate/update implementation plan (comment only)
        uses: anthropics/claude-code-action@v1
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          track_progress: true
          prompt: |
            You are a senior engineer planning changes in this repository.

            First:
            - Inspect the repository structure.
            - Identify the relevant modules/files.
            - Read only what you need (be efficient; don't scan the whole repo blindly).

            Then: write an implementation plan as a single GitHub issue comment.

            The plan MUST include:
            1) Summary of approach
            2) Concrete file paths likely to change (based on repo reality)
            3) Step-by-step checklist (phased, if large)
            4) Risks/edge cases
            5) Tests to add/update + commands to run

            Use these markers so later workflows can find the plan:
            <!-- CLAUDE_PLAN_START -->
            ...content...
            <!-- CLAUDE_PLAN_END -->

            End with:
            To approve, reply with: /approve-claude
