import * as messageService from "../services/message.service.js";

const createMessage = async (req, res, next) => {
  try {
    const { receiver, content } = req.body;

    const message = await messageService.createMessage(
      req.user.userId,
      receiver,
      content
    );

    return res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const result = await messageService.getMessages(
      req.user.userId,
      {
        page: req.query.page,
        limit: req.query.limit,
        sender: req.query.sender,
        search: req.query.search,
      }
    );

    return res.status(200).json({
      message: "Messages retrieved successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getMessageById = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await messageService.getMessageById(
      messageId,
      req.user.userId
    );

    return res.status(200).json({
      message: "Message retrieved successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const message = await messageService.deleteMessage(
      messageId,
      req.user.userId
    );

    return res.status(200).json({
      message: "Message deleted successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
export {
  createMessage,
  getMessages,
  getMessageById,
  deleteMessage,
};