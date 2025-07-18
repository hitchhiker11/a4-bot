
# A4 Bot - Telegram Message Moderation Bot

This bot allows users to send short messages which are moderated before approval.

## Setup
1. Copy `.env.example` to `.env` and fill in your BOT_TOKEN and MOD_CHAT_ID.
2. Run `npm install`.
3. Start the bot: `node src/bot.js`.

## Features
- Бот полностью на русском языке.
- Уведомления об ошибках отправляются разработчику (DEVELOPER_USER_ID).
- Обработка ошибок, таких как блокировка бота пользователем.
- Users send messages.
- Messages filtered for profanity and sent to appropriate mod chat (regular or uncensored).
- Moderators use inline buttons to accept/reject with confirmation.
- Approved messages forwarded to final chat.
- Notifications sent to users on status change.
- Admin commands: /approve, /reject, /list_pending.

## Database
SQLite DB in `data/bot.db` stores messages.

## Future
- Censorship filters and chat division. 