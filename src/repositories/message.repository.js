
import Message from "../models/message.model.js";

const create = (data) => Message.create(data);

const findById = (messageId) =>
  Message.findById(messageId);

const findMany = (filter, options = {}) => {
  const { skip = 0, limit = 10 } = options;

  return Message.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", "name email")
    .populate("receiver", "name email");
};

const count = (filter) => Message.countDocuments(filter);

const deleteById = (messageId) =>
  Message.findByIdAndDelete(messageId);

export {
  create,
  findById,
  findMany,
  count,
  deleteById,
};
