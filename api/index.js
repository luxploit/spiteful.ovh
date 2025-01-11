const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// Middleware
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Sequelize setup
const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: './comments.db', // SQLite database file
	logging: false, // Disable logging for cleaner output
});

// Define the Comment model
const Comment = sequelize.define(
	'Comment',
	{
		content: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		timestamp: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		tableName: 'comments',
		timestamps: false,
	}
);

// Define the UserLastPosted model to track the last post date for each user
const UserLastPosted = sequelize.define(
	'UserLastPosted',
	{
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			primaryKey: true,
		},
		date: {
			type: DataTypes.STRING, // YYYY-MM-DD format
			allowNull: false,
		},
	},
	{
		tableName: 'users_last_posted',
		timestamps: false,
	}
);

// Define the ReservedUser model to store reserved usernames and their passwords
const ReservedUser = sequelize.define(
	'ReservedUser',
	{
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		passwordHash: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		tableName: 'reserved_users',
		timestamps: false,
	}
);

// Sync the models with the database
sequelize
	.sync()
	.then(() => {
		console.log('Database synced');
	})
	.catch((err) => {
		console.error('Error syncing database:', err);
	});

// Helper function to simulate page calculation
const calculateTotalPages = async (limit) => {
	const totalComments = await Comment.count();
	const totalPages = Math.ceil(totalComments / limit);
	return totalPages;
};

// GET /comments - Retrieve comments
app.get('/comments', async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 7;
		const page = parseInt(req.query.page) || 1;

		const offset = (page - 1) * limit;

		const comments = await Comment.findAll({
			limit: limit,
			offset: offset,
			order: [['timestamp', 'DESC']],
		});

		const totalPages = await calculateTotalPages();

		res.json({
			comments: comments.map((comment) => ({
				id: comment.id,
				content: comment.content,
				username: comment.username,
				timestamp: comment.timestamp,
			})),
			totalPages: totalPages,
			currentPage: page,
			limit: limit,
		});
	} catch (err) {
		console.error(err);
		res.status(400).send('Error fetching comments');
	}
});

// POST /comments - Add a new comment
app.post('/comments', async (req, res) => {
	const { username, content, password } = req.body;

	const reservedUser = await ReservedUser.findOne({
		where: { username },
	});

	if (reservedUser) {
		const passwordMatch = await bcrypt.compare(password, reservedUser.passwordHash);
		if (!passwordMatch) {
			return res.status(403).send();
		}
	}

	const now = new Date();
	const today = now.toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format

	try {
		const lastPosted = await UserLastPosted.findOne({
			where: { username },
		});

		if (lastPosted && lastPosted.date === today) {
			return res.status(429).send(); // user already posted today
		}

		const newComment = await Comment.create({
			content,
			username,
			timestamp: now.toISOString(),
		});

		await UserLastPosted.upsert({
			username,
			date: today,
		});

		res.status(201).json({
			id: newComment.id,
			content: newComment.content,
			username: newComment.username,
			timestamp: newComment.timestamp,
		});
	} catch (err) {
		console.error(err);
		res.status(400).send();
	}
});

// General error handling (catch-all)
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).send();
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
