
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
   - **Connections**:
     - → User Message Receipt (when user sends a message)
     - → Admin Commands (for moderators/admins)

### 2. User Interaction Branch
   - **Description**: Handles messages from regular users.
   - **Key Texts/Messages**:
     - Start: 'Привет! Хочешь оставить послание?'
     - Name Question: 'Как тебя зовут?' with buttons 'Оставить имя' and 'Анонимно'
     - If leave name: 'Введи свое имя:'
     - Then: 'Введи свое послание:'
     - Confirmation: 'Сообщение отправлено на модерацию'
     - User sends: Short message
   - **Sub-nodes**:
     - 2.1 Name Branching
       - Flow: Ask name, store custom name or set anonymous.
     - 2.2 Receive User Message
       - Actions: Store in DB with display_name, forward to mod chat.
     - 2.3 User Feedback Loop
       - **Flow**: After moderation, notify user.
       - **Key Texts**:
         - Approved: "Your message has been approved and will be displayed!"
         - Rejected: "Your message was rejected due to censorship."

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