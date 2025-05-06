const Users = require('../models/user')

const getUsers = async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json(error);
    }
}

const getUserById = async (req, res) => {
    try {
        var id = req.params.id
        const user = await Users.findById(id)
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
}

const createUser = async (req, res) => {
    try {
        // Destructure data from the request body
        const { username, email, password, firstName, lastName, mobileNumber, gender, isAdmin } = req.body;

        // Check if all required fields are provided
        if (!username || !email || !password || !firstName || !lastName || !mobileNumber || !gender || isAdmin === undefined) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Create a new user
        const newUser = new Users({
            username,
            email,
            password,
            firstName,
            lastName,
            mobileNumber,
            gender,
            isAdmin: isAdmin === 'true', // Convert to boolean
        });

        // Save the user to the database
        await newUser.save();

        res.status(200).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
};


const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateFields = {};

        // Not to overwrite the contents of the fields in the database
        if (req.body.username) updateFields.username = req.body.username;
        if (req.body.email) updateFields.email = req.body.email;
        if (req.body.password) updateFields.password = req.body.password;
        if (typeof req.body.isAdmin === "boolean") updateFields.isAdmin = req.body.isAdmin;
        const user = await Users.updateOne({ _id: userId }, { $set: updateFields });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error)
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id
        const user = await Users.deleteOne({ _id: userId })
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error)
    }
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};