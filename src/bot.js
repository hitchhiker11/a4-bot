
const { Telegraf, session } = require('telegraf');
const config = require('../config/config');
const db = require('./db');

const bot = new Telegraf(config.botToken);
bot.use(session());

// Handle start command
bot.start((ctx) => {
  ctx.session = { state: 'ask_name' };
  ctx.reply('Привет! Здесь ты можешь оставить послание для Влада А4. Он увидит его на бегущей строке в своём Доме.', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Оставить имя', callback_data: 'leave_name' }],
        [{ text: 'Анонимно', callback_data: 'anonymous' }]
      ]
    }
  });
});

// Handle callback queries for buttons and name choice
bot.on('callback_query', (ctx) => {
  const data = ctx.callbackQuery.data;

  // Name choice handling
  if (data === 'leave_name') {
    ctx.session.state = 'wait_name';
    ctx.editMessageText('Введи свое имя:');
    ctx.answerCbQuery();
    return;
  } else if (data === 'anonymous') {
    ctx.session.state = 'wait_message';
    ctx.session.displayName = null;
    ctx.editMessageText('Окей! Тогда ты не указан. Напиши послание — только помни, что оно должно быть приемлемым и дружелюбным. Сам понимаешь!');
    ctx.answerCbQuery();
    return;
  }

  // Existing moderation handling
  let action, msgId, confirmAction;
  const parts = data.split('_');
  action = parts[0];
  if (action === 'confirm') {
    confirmAction = parts[1];
    msgId = parts[2];
  } else {
    msgId = parts[1];
  }
  const chatId = ctx.chat.id.toString();

  // Ensure it's from a mod chat
  if (chatId !== config.modChatId && chatId !== config.uncensoredChatId) return;

  db.getMessageById(msgId, (err, row) => {
    if (err || !row) {
      ctx.answerCbQuery('Сообщение не найдено.');
      return;
    }

    // Format user display
    const userDisplay = row.display_name ? row.display_name : (row.user_username ? `@${row.user_username}` : `[${row.user_first_name || ''} ${row.user_last_name || ''}](tg://user?id=${row.user_id})`) || 'Аноним';

    if (data.startsWith('accept_') || data.startsWith('reject_')) {
      // Edit to confirmation
      const confirmText = action === 'accept' ? 'Принять' : 'Отклонить';
      ctx.editMessageText(`**Сообщение от ${userDisplay}:**\n**${row.text}**\nID: ${msgId}\n**Вы уверены, что хотите ${confirmText.toLowerCase()}?**`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Да, уверен', callback_data: `confirm_${action}_${msgId}` }],
            [{ text: 'Назад', callback_data: `back_${msgId}` }]
          ]
        }
      });
    } else if (data.startsWith('confirm_')) {
      const status = confirmAction === 'accept' ? 'approved' : 'rejected';
      db.updateStatus(msgId, status, (err) => {
        if (err) {
          ctx.answerCbQuery('Ошибка обновления статуса.');
          return;
        }
        // Format user display from DB
        const userDisplay = row.display_name ? row.display_name : 'Анонимно';
        const userNotify = status === 'approved' ? 'Все четко! Смотри на бегущую строку!' : 'К сожалению, что-то в твоём послании не так. Попробуй написать что-то другое!';
        bot.telegram.sendMessage(row.user_id, userNotify, status === 'rejected' ? {
          reply_markup: {
            inline_keyboard: [[{ text: 'Попробовать ещё раз', callback_data: 'retry' }]]
          }
        } : {}).catch((notifyErr) => {
          console.error(`Ошибка уведомления пользователя ${row.user_id}: ${notifyErr.message}`);
          if (notifyErr.response && notifyErr.response.error_code === 403) {
            console.log(`Пользователь ${row.user_id} заблокировал бота.`);
          }
          bot.telegram.sendMessage(config.developerUserId, `Ошибка уведомления пользователя ${row.user_id}: ${notifyErr.message}`);
        });
        ctx.editMessageText(`**Сообщение от ${userDisplay}:**\n**${row.text}**\nID: ${msgId}\n**${status.toUpperCase()}**`, { parse_mode: 'Markdown' });
        console.log(`${status} сообщение ${msgId} для пользователя ${row.user_id}`);

        if (status === 'approved') {
          bot.telegram.sendMessage(config.finalChatId, `**Одобрено от ${userDisplay}:**\n**${row.text}**`, { parse_mode: 'Markdown' }).catch((err) => {
            console.error('Ошибка отправки в финальный чат', err);
            bot.telegram.sendMessage(config.developerUserId, `Ошибка отправки в финальный чат: ${err.message}`);
          });
        }
      });
    } else if (data.startsWith('back_')) {
      // Revert to original buttons
      ctx.editMessageText(`**Сообщение от ${userDisplay}:**\n**${row.text}**\nID: ${msgId}`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Принять', callback_data: `accept_${msgId}` },
              { text: 'Отклонить', callback_data: `reject_${msgId}` }
            ]
          ]
        }
      });
    }

    ctx.answerCbQuery();
  });
});

// Handle text messages based on state
bot.on('text', (ctx) => {
  const state = ctx.session?.state;
  if (state === 'wait_name') {
    ctx.session.displayName = ctx.message.text.trim();
    ctx.session.state = 'wait_message';
    ctx.reply('Супер! Теперь Влад увидит, что от тебя есть послание. Напиши еще что-то стоящее! Только помни, что оно должно быть приемлемым и дружелюбным. Сам понимаешь!');
  } else if (state === 'wait_message') {
    const userId = ctx.from.id.toString();
    const firstName = ctx.from.first_name || '';
    const lastName = ctx.from.last_name || '';
    const username = ctx.from.username || '';
    const displayName = ctx.session.displayName;
    const text = ctx.message.text;
    console.log(`Получено сообщение от пользователя ${userId}: ${text}`);

    db.insertMessage(userId, firstName, lastName, username, displayName, text, (err, msgId) => {
      if (err) {
        console.error('Ошибка вставки сообщения', err);
        ctx.reply('Ошибка отправки сообщения. Попробуйте снова.');
        return;
      }

      // Check for profanity
      const regex = new RegExp(config.profanityRegex, 'i');
      const isProfane = regex.test(text);
      const targetChat = isProfane ? config.uncensoredChatId : config.modChatId;

      // Format user display
      const userDisplay = displayName ? displayName : 'Анонимно';

      // Send to appropriate mod chat with inline buttons
      bot.telegram.sendMessage(targetChat, `**Сообщение от ${userDisplay}:**\n**${text}**\nID: ${msgId}`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Принять', callback_data: `accept_${msgId}` },
              { text: 'Отклонить', callback_data: `reject_${msgId}` }
            ]
          ]
        }
      }).catch((err) => {
        console.error('Ошибка пересылки в мод-чат', err);
        bot.telegram.sendMessage(config.developerUserId, `Ошибка пересылки в мод-чат: ${err.message}`);
      });

      // Confirm to user
      ctx.reply('Отлично! Мы отправили послание на модерацию. Подожди немного — если все ОК, примерно через 10 минут оно появится в Доме Влада А4.');
      ctx.session.state = 'wait_moderation';
    });
  } else {
    ctx.reply('Пожалуйста, начните с /start.');
  }
});

// Add retry handling in callback_query
bot.on('callback_query', (ctx) => {
  const data = ctx.callbackQuery.data;
  if (data === 'retry') {
    ctx.session.state = 'ask_name';
    ctx.editMessageText('Как тебя зовут?', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Оставить имя', callback_data: 'leave_name' }],
          [{ text: 'Анонимно', callback_data: 'anonymous' }]
        ]
      }
    });
    ctx.answerCbQuery();
  }
});

// Launch the bot
bot.launch();
console.log('Bot is running...');

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 