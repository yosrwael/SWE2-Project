const bcrypt = require("bcrypt");
const User = require("../models/user");

const register = async (req, res) => {
    const { username, email, password, firstName, lastName, mobileNumber, gender, isAdmin } = req.body;

    if (!username || !email || !password || !firstName || !lastName || !mobileNumber || !gender) {
        return res.status(400).json({
            status: "failure",
            message: "Missing required fields",
        });
    }

    try {
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: "failure",
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            mobileNumber,
            gender,
            isAdmin: isAdmin || false, 
        });

        await newUser.save();
        req.session.user = newUser;
        res.redirect("/home"); 
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                status: "failure",
                message: "Invalid email or password",
            });
        }

        const correctPassword = await bcrypt.compare(password, user.password);
        if (!correctPassword) {
            return res.status(400).json({
                status: "failure",
                message: "Invalid email or password",
            });
        }

        req.session.user = user;
        res.redirect("/home"); 
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
};

const logout = async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                status: "error",
                message: "Failed to logout",
            });
        }
        res.redirect("/auth");
    });
};

module.exports = {
    register,
    login,
    logout,
};