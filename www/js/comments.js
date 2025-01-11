class CommentSystem {
	constructor() {
		this.currentPage = 1;
		this.commentsPerPage = 7;
		this.commentsCache = {};
		this.elements = {
			container: null,
			navigation: null,
			commentsList: null,
			form: null,
			usernameInput: null,
			passwordInput: null,
		};
		this.serverAPI = 'http://localhost:3000';
	}

	initialize() {
		this.createElements();
		this.attachEventListeners();
		this.checkServerAvailability();
	}

	createElements() {
		this.elements.container = document.createElement('div');
		this.elements.container.classList.add('comments-container');
		this.elements.container.style.opacity = '0';
		this.elements.container.style.transition = 'opacity 0.5s ease-in-out';

		const controlsSection = document.createElement('div');
		controlsSection.classList.add('controls-section');

		this.elements.form = document.createElement('form');
		this.elements.form.classList.add('comment-form');

		this.elements.form.innerHTML = `
            <input type="text" class="username-input" placeholder="Enter your username..." required />
            <input type="password" class="password-input" placeholder="Password (for reserved usernames)" />
            <textarea class="comment-input" placeholder="Enter your message..." required></textarea>
        `;

		this.elements.navigation = document.createElement('div');
		this.elements.navigation.classList.add('comments-navigation');
		this.elements.navigation.innerHTML = `
            <button type="button" class="nav-button prev-button">←</button>
            <button type="submit" class="submit-button">Send</button>
            <button type="button" class="nav-button next-button">→</button>
        `;

		this.elements.commentsList = document.createElement('div');
		this.elements.commentsList.classList.add('comments-list');

		const commentsListInner = document.createElement('div');
		commentsListInner.classList.add('comments-list-inner');
		this.elements.commentsList.appendChild(commentsListInner);

		controlsSection.appendChild(this.elements.form);
		controlsSection.appendChild(this.elements.navigation);

		this.elements.container.appendChild(controlsSection);
		this.elements.container.appendChild(this.elements.commentsList);

		document.body.appendChild(this.elements.container);

		// const usernameInput = this.elements.form.querySelector('.username-input');
		// const passwordInput = this.elements.form.querySelector('.password-input');

		// usernameInput.addEventListener('input', (e) => {
		// 	if (e.target.value.toLowerCase() === 'lain') {
		// 		passwordInput.style.display = 'block';
		// 		passwordInput.required = true;
		// 	} else {
		// 		passwordInput.style.display = 'none';
		// 		passwordInput.required = false;
		// 		passwordInput.value = '';
		// 	}
		// });
	}

	async postComment(username, content, password = '') {
		try {
			const response = await fetch(this.serverAPI + '/comments', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ content, username, password }),
			});

			if (!response.ok) {
				if (response.status === 400) {
					alert('Server was unable to process your request.');
					return false;
				} else if (response.status === 429) {
					alert('You can only post one comment per day.');
					return false;
				} else if (response.status === 403) {
					alert('Unauthorized use of reserved username.');
					return false;
				}
				throw new Error(`Error posting comment: ${response.statusText}`);
			}

			return true;
		} catch (error) {
			console.error('Error posting comment:', error);
			return false;
		}
	}

	attachEventListeners() {
		const prevButton = this.elements.navigation.querySelector('.prev-button');
		const nextButton = this.elements.navigation.querySelector('.next-button');

		prevButton.addEventListener('click', () => {
			if (this.currentPage > 1) {
				this.currentPage--;
				this.loadComments();
			}
		});

		nextButton.addEventListener('click', () => {
			this.currentPage++;
			this.loadComments();
		});

		this.elements.navigation.querySelector('.submit-button').addEventListener('click', async (e) => {
			e.preventDefault();
			const username = this.elements.form.querySelector('.username-input').value.trim();
			const content = this.elements.form.querySelector('.comment-input').value.trim();
			const password = this.elements.form.querySelector('.password-input').value;

			if (username && content) {
				const success = await this.postComment(username, content, password);
				if (success) {
					this.elements.form.querySelector('.username-input').value = '';
					this.elements.form.querySelector('.comment-input').value = '';
					this.elements.form.querySelector('.password-input').value = '';
					this.loadComments();
				}
			} else {
				alert('Both username and comment are required.');
			}
		});
	}

	async checkServerAvailability() {
		try {
			const response = await fetch(this.serverAPI + '/comments' + '?page=1&limit=1');
			if (response.ok) {
				this.loadComments();
			}
		} catch (error) {
			console.error('server is unreachable:', error);
		}
	}

	async fetchComments(page) {
		if (this.commentsCache[page]) {
			return this.commentsCache[page];
		}

		try {
			const response = await fetch(this.serverAPI + '/comments' + `?page=${page}&limit=${this.commentsPerPage}`);
			if (!response.ok) {
				throw new Error(`Error fetching comments: ${response.statusText}`);
			}
			const data = await response.json();

			this.commentsCache[page] = data;
			return data;
		} catch (error) {
			console.error('Error fetching comments:', error);
			return { comments: [], totalPages: 0 };
		}
	}

	renderComments(comments) {
		const commentsListInner = this.elements.commentsList.querySelector('.comments-list-inner');
		const sortedComments = comments.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

		commentsListInner.innerHTML = sortedComments
			.map(
				(comment) => `
            <div class="comment">
                <div class="comment-content">${comment.content}</div>
                <div class="comment-user">- ${comment.username}</div>
                <div class="comment-date">${new Date(comment.timestamp).toLocaleString()}</div>
            </div>
        `
			)
			.join('');
	}

	async loadComments() {
		const { comments, totalPages } = await this.fetchComments(this.currentPage);
		this.renderComments(comments);

		const prevButton = this.elements.navigation.querySelector('.prev-button');
		const nextButton = this.elements.navigation.querySelector('.next-button');

		prevButton.disabled = this.currentPage === 1;
		nextButton.disabled = this.currentPage === totalPages;
	}

	show() {
		this.elements.container.style.opacity = '1';
	}
}

window.commentSystem = new CommentSystem();
