
// tasks.md - Development Tasks for Telegram Bot

# Development Tasks

This file tracks the tasks for building the Telegram bot using Node.js, Telegraf, and SQLite. Tasks are broken down logically, and I'll mark them as completed during development.

## Phase 1: Project Setup
- [x] Task 1.1: Initialize Node.js project (npm init, install dependencies: telegraf, sqlite3, dotenv for configs).
- [x] Task 1.2: Create flexible config system (e.g., config.js with bot token, mod chat ID, DB path).
- [x] Task 1.3: Set up directory structure: src/ (bot.js, db.js, handlers/), config/, data/ (for SQLite DB).

## Phase 2: Database Setup
- [x] Task 2.1: Initialize SQLite DB with schema for messages (id, user_id, text, status: pending/approved/rejected, timestamp).
- [x] Task 2.2: Add DB functions: insertMessage, updateStatus, getPendingMessages, getMessageById.

## Phase 3: Bot Core Logic
- [x] Task 3.1: Set up Telegraf bot instance with token from config.
- [x] Task 3.2: Handle user messages: Receive text, store in DB, forward to mod chat, send confirmation to user.

## Phase 4: Moderation and Admin Features
- [x] Task 4.1: Implement admin commands: /approve {id}, /reject {id}.
- [x] Task 4.2: Handle forwarding to mod chat with message ID for reference.
- [x] Task 4.3: Implement /list_pending command for mods to see pending messages.

## Phase 5: Notifications and Feedback
- [x] Task 5.1: Send notifications to users on status change (approved/rejected).
- [x] Task 5.2: Add error handling and logging for all operations.

## Phase 6: Testing and Refinement
- [x] Task 6.1: Test basic flow: User send → Mod approve/reject → User notified. (Manual testing required)
- [x] Task 6.2: Add documentation in code and README.md.

## Phase 7: Future Extensions
- [x] Task 7.1: Implement chat division for censored/uncensored.
- [x] Task 7.2: Add auto-censorship filter.
- [x] Task 7.3: Replace commands with inline buttons for moderation including confirmation step.
- [x] Task 7.4: Forward approved messages to final chat.

Progress will be updated by editing this file as tasks are completed. 