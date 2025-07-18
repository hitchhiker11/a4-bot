
# A4 Bot - Telegram Message Moderation Bot

This bot allows users to send short messages which are moderated before approval.

## Setup
1. Copy `.env.example` to `.env` and fill in your BOT_TOKEN and MOD_CHAT_ID.
2. Run `npm install`.
3. Start the bot: `node src/bot.js`.

## Docker Setup
1. Ensure you have Docker and docker-compose installed.
2. Build and run: `docker-compose up -d`
3. The bot will run with auto-restart, persisting DB in ./data.
4. To stop: `docker-compose down`

## Local Launch
1. Clone the repo.
2. Run `npm install` to install dependencies.
3. Copy `.env.example` to `.env` and fill in values (BOT_TOKEN, MOD_CHAT_ID, etc.).
4. For development: `node src/bot.js`
5. For production-like with auto-restart: `npx pm2 start ecosystem.config.js`

## Docker Launch
1. Ensure Docker and docker-compose are installed.
2. Set up your `.env` file in the project root.
3. Build and run: `docker-compose up -d`
4. View logs: `docker logs a4-bot`
5. Stop: `docker-compose down`

The Docker setup uses pm2 for auto-restarts inside the container and persists the SQLite DB via volume.

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