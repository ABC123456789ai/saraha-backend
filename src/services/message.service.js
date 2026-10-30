
import * as messageRepository from "../repositories/message.repository.js";
import * as redisService from "./redis.service.js";

// Create a message
const createMessage = async (sender, receiver, content) => {
  const message = await messageRepository.create({
    sender,
    receiver,
    content,
  });

  await redisService.incr(`messages:version:${receiver}`);

  return message;
};

// Get messages with pagination, filtering, search, and caching
const getMessages = async (userId, options = {}) => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(options.limit) || 10)
  );

  const skip = (page - 1) * limit;
  const sender = options.sender || "";
  const search = options.search?.trim() || "";

  const versionKey = `messages:version:${userId}`;
  const version = (await redisService.get(versionKey)) || "0";

  const cacheKey = [
    "messages",
    userId,
    `v${version}`,
    `p${page}`,
    `l${limit}`,
    `s${encodeURIComponent(sender)}`,
    `q${encodeURIComponent(search)}`,
  ].join(":");

  const cachedMessages = await redisService.get(cacheKey);

  if (cachedMessages) {
    console.log("Messages loaded from Redis ⚡");
    return JSON.parse(cachedMessages);
  }

  const filter = { receiver: userId };

  if (sender) {
    filter.sender = sender;
  }

  if (search) {
    const escapedSearch = search.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    filter.content = {
      $regex: escapedSearch,
      $options: "i",
    };
  }

  const [messages, totalMessages] = await Promise.all([
    messageRepository.findMany(filter, { skip, limit }),
    messageRepository.count(filter),
  ]);

  const result = {
    data: messages,
    pagination: {
      currentPage: page,
      limit,
      totalMessages,
      totalPages: Math.ceil(totalMessages / limit),
      hasNextPage: page * limit < totalMessages,
      hasPreviousPage: page > 1 && totalMessages > 0,
    },
  };

  await redisService.set(cacheKey, JSON.stringify(result), {
    EX: 60,
  });

  console.log("Messages loaded from MongoDB and cached 💾");

  return result;
};

// Get a message by ID
const getMessageById = async (messageId, userId) => {
  const message = await messageRepository.findById(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  if (
    message.sender.toString() !== userId &&
    message.receiver.toString() !== userId
  ) {
    const error = new Error(
      "You are not authorized to access this message"
    );
    error.cause = { status: 403 };
    throw error;
  }

  await message.populate("sender", "name email");
  await message.populate("receiver", "name email");

  return message;
};

// Delete a message
const deleteMessage = async (messageId, userId) => {
  const message = await messageRepository.findById(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  if (
    message.sender.toString() !== userId &&
    message.receiver.toString() !== userId
  ) {
    const error = new Error(
      "You are not authorized to delete this message"
    );
    error.cause = { status: 403 };
    throw error;
  }

  await messageRepository.deleteById(messageId);

  await redisService.incr(
    `messages:version:${message.receiver.toString()}`
  );

  return message;
};

export {
  createMessage,
  getMessages,
  getMessageById,
  deleteMessage,
};
