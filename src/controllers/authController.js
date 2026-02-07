import User from "../models/User.js";
import Teacher from "../models/Teacher.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// NEW TOKEN FUNCTION
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      teacherId: user.teacherId || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};


// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, teacherId } = req.body;

    // ❌ Prevent faculty from self-registering
    if (role === "faculty") {
      return res.status(403).json({
        message: "Faculty accounts can only be created by admin"
      });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      teacherId: teacherId || null,
    });

    res.json({ message: "User registered", user });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email }).populate("teacherId");
    if (!user) return res.status(404).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        teacherId: user.teacherId ? user.teacherId._id : null
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        teacherId: user.teacherId ? user.teacherId._id : null
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
