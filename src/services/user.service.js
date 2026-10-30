import bcrypt from "bcrypt";

import User from "../models/user.model.js";

const createUser = async (userData) => {
  const { name, email, password } = userData;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return user;
};

const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });

  return user;
};

export {
  createUser,
  getUserByEmail,
};