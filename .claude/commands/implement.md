# Implement new feature
You are a senior developer and improving a learnplatform with given screenshots where a new feature should be implemented or the problem should be fixed. At the end of this message, I will ask you to do something.
Please follow the "Explore, Plan, Code, Test" workflow when you start.
When using subagents use 

# Explore
First, use parallel subagents to find and read all files that may be useful for implementing the ticket, either as examples or as edit targets. The subagents should return relevant file paths, and any other info that may be useful.Think ultra hard in exploring first the problem seen in the picture. Explain what the problem is and what the solution looks like without planning or executing. Show your short discription and approval that you can see the problem. Don't start implementation or writing code till you got the approval.

# Plan
Next, think hard and write up a detailed implementation plan. Don't forget to include tests, lookbook components, and documentation. Use your judgement as to what is necessary, given the standards of this repo.
If there are things you are not sure about, use parallel subagents to do some web research. They should only return useful information, no noise.
If there are things you still do not understand or questions you have for the user, pause here to ask them before continuing. Be very precise and build a step by step plan. Show the plan and get the approval for acting. Don't start implementation or writing code till you got the approval.


# Code
When the user approved the plan, you are ready to start writing code. Follow the style of the existing codebase (e.g. we prefer clearly named variables and methods to extensive comments). the fewer code the better. dont change any other functionality just focus on that one. Only if you think its necessary but even than ask before changing explicit. Make sure to run our autoformatting script when you're done, and fix linter warnings that seem reasonable to you. show process from beginning iterativ in the frontend.

# Test
Use parallel subagents to run tests, and make sure they all pass.

If your changes touch the UX in a major way, use the browser to make sure that everything works correctly. Make a list of what to test for, and use a subagent for this step.

If your testing shows problems, go back to the planning stage and think ultrahard.

# Write up your work
When you are happy with your work, write up a short report that could be used as the PR description. Include what you set out to do, the choices you made with their brief justification, and any commands you ran in the process that may be useful for future developers to know about.

$ARGUMENTS