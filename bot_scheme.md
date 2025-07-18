
// bot_scheme.md - Hierarchical Scheme of the Telegram Bot

# Telegram Bot Scheme: Message Relay and Moderation for Event

This document interprets the provided screenshot as a mindmap/flowchart for a Telegram bot used at an event. The bot allows users to send short messages to influencers, which are moderated before being displayed (e.g., on a running string). The scheme is structured hierarchically and directionally, capturing message flows, texts, connections, and interactions.

Based on the screenshot (a mindmap with yellow notes connected by arrows) and user description, I've interpreted it as follows:
- Central node: Bot Core Logic
- Branches: User Interaction, Moderation, Notification, Admin Functions
- Directed arrows indicate flow: User -> Bot -> Moderator -> Approval/Rejection -> User Notification

## Hierarchical Structure

### 1. Root: Bot Initialization
   - **Description**: Bot starts and listens for incoming messages.
   - **Key Texts**: /start → 'Привет! Здесь ты можешь оставить послание для Влада А4. Он увидит его на бегущей строке в своём Доме.' with buttons for name choice.

### 2. User Interaction Branch
   - Name Ask: 'Как тебя зовут?' with 'Оставить имя' or 'Анонимно'.
   - If name: 'Супер! Теперь Влад увидит, что от тебя есть послание. Напиши еще что-то стоящее! Только помни, что оно должно быть приемлемым и дружелюбным. Сам понимаешь!'
   - If anonymous: 'Окей! Тогда ты не указан. Напиши послание — только помни, что оно должно быть приемлемым и дружелюбным. Сам понимаешь!'
   - After message: 'Отлично! Мы отправили послание на модерацию. Подожди немного — если все ОК, примерно через 10 минут оно появится в Доме Влада А4.'
   - Approved: 'Все четко! Смотри на бегущую строку!'
   - Rejected: 'К сожалению, что-то в твоём послании не так. Попробуй написать что-то другое!' with 'Попробовать ещё раз' button.

### 3. Moderation Branch
   - **Description**: Moderator reviews and decides on user messages.
   - **Key Texts/Messages**:
     - Forwarded message: "[User ID] sent: {message} Reply with /approve {msg_id} or /reject {msg_id}"
   - **Sub-nodes**:
     - 3.1 Forward to Moderator Chat
       - **Flow**: Bot sends user message to a designated moderator chat/group.
       - **Connections**:
         - → Moderator Decision
     - 3.2 Moderator Decision
       - **Flow**: Moderator uses commands to approve or reject.
       - **Actions**: Update DB status to 'approved' or 'rejected', trigger notification.
       - **Connections**:
         - Approve → Output to Running String (future) + User Notification (approved)
         - Reject → User Notification (rejected)
     - 3.3 Censorship Filter (Future Extension)
       - **Flow**: Automatic filter before manual moderation.
       - **Connections**:
         - → Separate chats for censored/uncensored (as per user plan)

### 4. Notification and Feedback System
   - **Description**: System for sending updates to users and moderators.
   - **Key Texts/Messages**:
     - To User: Confirmation, Approval, Rejection.
     - To Moderator: New message alerts, status updates.
   - **Connections**:
     - From User Interaction → Notification
     - From Moderation → Notification

### 5. Admin Functional Branch
   - **Description**: Commands and features for admins/moderators.
   - **Sub-nodes**:
     - 5.1 Admin Commands
       - /start_moderation: Start bot in mod mode.
       - /approve {id}: Approve message.
       - /reject {id}: Reject message.
       - /list_pending: List all pending messages.
     - 5.2 Chat Management (Future)
       - Divide into censored and uncensored chats.
       - Apply auto-filter for censorship.

## Directed Flows (Message Connections)
- **User → Bot**: Send message → Store in DB → Forward to Mod Chat → Notify User (pending).
- **Mod → Bot**: /approve → Update DB → Notify User (approved) → (Future: Output to display).
- **Mod → Bot**: /reject → Update DB → Notify User (rejected).
- **Bot → User/Mod**: Asynchronous notifications for status changes.

## Future Extensions (as per user query)
- Divide into censored/uncensored chats.
- Implement auto-censorship filter.

This scheme will guide the development. Next, I'll create a tasks.md file to break down the implementation. 