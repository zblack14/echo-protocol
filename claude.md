---
description: AI Agent Protocol for comprehensive task completion with interactive review
globs:
alwaysApply: true
---
# AI Agent Protocol: Self-Contained Mandatory Interactive Final Review Loop with Auto-Script Creation

## 0. User Advisory & Safety:
This is an advanced, experimental rule. It instructs the AI Agent to check for, potentially create, and then execute a Python script (`final_review_gate.py`) in your project's root directory to facilitate an interactive review loop. By using this rule, you acknowledge that the AI will attempt file system operations (read, write, execute) as directed. Ensure the AI's execution environment has appropriate permissions if you expect script auto-creation to work, and be aware of the security implications.

## 1. Core Principle & Context:
Your primary task processing includes a **mandatory final interactive review stage** driven by user input through a specific Python script (`final_review_gate.py`). You are NOT to consider your overall task complete until this review stage explicitly signals completion. This protocol leverages your known capability to run commands in a sub-terminal and read their output.

## Phase 0: Ensure `final_review_gate.py` Script Exists
(This phase is executed ONCE per user request that triggers this overall protocol, or if the script is missing or its content is incorrect.)

1. **Define Script Details:**
* **Script Name:** `final_review_gate.py`
* **Target Location:** Directly in the root of the current project/workspace.
* **Python Script Content (ensure this exact content is used):**
```python
# final_review_gate.py
import sys
import os

if __name__ == "__main__":
    # Try to make stdout unbuffered for more responsive interaction.
    # This might not work on all platforms or if stdout is not a TTY,
    # but it's a good practice for this kind of interactive script.
    try:
        sys.stdout = os.fdopen(sys.stdout.fileno(), 'w', buffering=1)
    except Exception:
        pass # Ignore if unbuffering fails, e.g., in certain environments

    try:
        sys.stderr = os.fdopen(sys.stderr.fileno(), 'w', buffering=1)
    except Exception:
        pass # Ignore

    print("--- FINAL REVIEW GATE ACTIVE ---", flush=True)
    print("AI has completed its primary actions. Awaiting your review or further sub-prompts.", flush=True)
    print("Type your sub-prompt or 'TASK_COMPLETE' to allow AI to conclude.", flush=True)

    active_session = True
    while active_session:
        try:
            # Signal that the script is ready for input.
            # The AI doesn't need to parse this, but it's good for user visibility.
            print("REVIEW_GATE_AWAITING_INPUT:", end="", flush=True)

            line = sys.stdin.readline()

            if not line: # EOF
                print("--- REVIEW GATE: STDIN CLOSED (EOF), EXITING SCRIPT ---", flush=True)
                active_session = False
                break

            user_input = line.strip()

            if user_input.upper() == 'TASK_COMPLETE':
                print("--- REVIEW GATE: USER CONFIRMED TASK COMPLETE ---", flush=True)
                active_session = False
                break
            elif user_input: # If there's any input other than an empty line
                # This is the critical line the AI will "listen" for.
                print(f"USER_REVIEW_SUB_PROMPT: {user_input}", flush=True)
                # If the input is just an empty line, the loop continues, waiting for actual input.

        except KeyboardInterrupt:
            print("--- REVIEW GATE: SESSION INTERRUPTED BY USER (KeyboardInterrupt) ---", flush=True)
            active_session = False
            break
        except Exception as e:
            print(f"--- REVIEW GATE SCRIPT ERROR: {e} ---", flush=True)
            active_session = False
            break

    print("--- FINAL REVIEW GATE SCRIPT EXITED ---", flush=True)
```

2. **Ensure Script Existence and Correctness:**
a. Use your file system tools to check if the file `final_review_gate.py` exists in the project root.
b. **If the file `final_review_gate.py` does NOT exist OR if its content does not EXACTLY match the Python script provided in section "0.1.Python Script Content" (you may need to read the existing file and compare):**
i. You MUST create or overwrite the `final_review_gate.py` file in the project root.
ii. The content of this file MUST be *exactly* the Python script content provided above. Ensure all indentation, comments, and lines are preserved perfectly. Use your "create file" or "edit file" tool.
iii. After creating/overwriting it, announce: "The `final_review_gate.py` script has been created/updated in the project root."
c. **If the file `final_review_gate.py` already exists and its content is correct:** You may skip announcing its creation.
d. If you encounter any errors checking for, reading, or creating/writing the file (e.g., permission issues), you MUST report this to the user. State clearly: "Error managing `final_review_gate.py`: [specific error]. Cannot proceed with interactive review." and then conclude the interaction for the main task as best as you can without this interactive step.

## Phase 1: Primary Task Execution
1. Address the user's main request as you normally would: perform analysis, make code changes, call tools, and run applications/tests in sub-terminals if the main task requires it.
2. Leverage your ability to read outputs/errors from these sub-terminals to make iterative fixes during *this* primary phase.

## Phase 2: Mandatory Final Interactive Review Script Execution
1. **Transition Point:** Once you believe you have completed all substantive actions for the user's initial request (Phase 1), **DO NOT CONCLUDE THE CONVERSATION**. You MUST now transition to this Final Interactive Review phase.
2. **Action:** Execute the `final_review_gate.py` script (which you ensured exists and is correct in Phase 0) from the project root. Determine the correct Python interpreter command (e.g., `python`, `python3`) available in the execution environment. A robust command attempt would be `python3 ./final_review_gate.py` and if that fails, try `python ./final_review_gate.py`.
3. **Announcement:** Clearly inform the user: "I have completed the primary actions. Now initiating the mandatory Final Interactive Review by running `./final_review_gate.py`. The review terminal is now active. Please provide any sub-prompts directly into that script's terminal, or type 'TASK_COMPLETE' when satisfied." The terminal for this script should appear where you normally display output for commands you run.

## Phase 3: Interactive Review Loop (Monitoring Script Output)
1. **Active Monitoring:** Continuously monitor the standard output (stdout) of the launched `final_review_gate.py` script. You will "read" its output using the same capability that allows you to read terminal logs or error messages.
2. **User Sub-Prompt Detection:** When the script's stdout prints a line formatted EXACTLY as:
`USER_REVIEW_SUB_PROMPT: <user's sub-prompt text>`
You MUST interpret `<user's sub-prompt text>` as a new, direct, actionable instruction from the user.
3. **Processing Sub-Prompts:**
a. This instruction is a continuation or refinement of the *original, still-active task*.
b. Analyze the sub-prompt. Execute any necessary actions (code changes, new tool calls, file operations, etc.). **All tool calls made during this phase are part of the original request's tool call budget.**
c. Provide feedback or results of these actions in the main chat interface as you normally would for any AI action.
d. After processing the sub-prompt and giving feedback in the chat, IMMEDIATELY return your focus to monitoring the `final_review_gate.py` script's terminal output for the next user instruction or completion signal. This loop is critical.
4. **Completion Signal Detection:** The interactive review loop continues until the script's stdout prints a line containing:
`--- REVIEW GATE: USER CONFIRMED TASK COMPLETE ---`
OR
`--- FINAL REVIEW GATE SCRIPT EXITED ---` (or any other script exit/error message like `REVIEW GATE: STDIN CLOSED` or `REVIEW GATE SCRIPT ERROR:`)
This signals the end of the Final Interactive Review phase.

## Phase 4: True Task Conclusion
1. Only after the `final_review_gate.py` script has terminated (ideally with user confirmation `TASK_COMPLETE` or another clear exit signal from the script itself), are you permitted to consider the user's original request fully satisfied.
2. You may then provide your final summary of all actions taken throughout all phases (including the interactive review).

## Overriding Default Behavior:
This entire "Final Interactive Review" process (Phases 0, 2, 3, and 4) is a **strict, non-negotiable requirement** that overrides any default tendency you have to end the conversation after completing Phase 1. The task is only finished when the user explicitly confirms through the review script or the script otherwise terminates. Your "sense of completion" for the original request is deferred until this interactive review is done.