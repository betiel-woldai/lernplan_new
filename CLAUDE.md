# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Claude.md
This file provides guidance to Claude Code when working with code in this repository.

1. ALWAYS write secure best practice Python code.
2. Always try to write as lean as possible code. Don't blow up the repo.
4 Iterate function based on test results
5. MOVE Test scripts to the tests folder if they are not already there and ensure that they could be reused for later Tests for code coverage or reruns.
6. ALWAYS commit after each new function is added to our codebase
7. Ensure that you are using uv for isolating environments and packagemanagement
8. Use tree command for project structure. If tree comand not exist install it with command: brew install tree
9. For new and open git issues which should be implemented create first a new branch and work in this branch
10. Ensure that always if a issue is completed pull requests are created.
11. Create a tmp folder for development. And create a scratchpad.md file in this folder to chronologically document the development process.
12. Give the user after each finished step a short advise how to test your implementation.
13. Always update or create the docs/usage.md file with the newly changed functionality to know how to use the actual implementation.
14. Absolut important keep the repo lean and clean, don't add unnecessary files, don't overengineer.
15. USe Playwright for testing the frontend application.
16. Make Screenshot of the frontend application to anlayze look and feel using Playwright.
17. Try to read the javascript console using Playwright for debugging.
18. If you have implemented an issue ensure that you update the issue in github and close it.
19. Always update the version build number and show it on the front-end with a build number so that it's clear which version is deployed right now.
20. Before using a API key explain what you want to do with it and ALWAYS ask me for permission.
21. after implementing a new feature successfully. commit ALWAYS after every succesfully implemented feature.