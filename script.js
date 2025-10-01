// Global State
let currentUser = null;
let posts = [];
let users = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    loadUserSession();
    setupEventListeners();
    renderPosts();
});

// Initialize dummy data
function initializeData() {
    // Load users from localStorage or create default
    const storedUsers = localStorage.getItem('reviewfood_users');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    } else {
        users = [
            { id: 1, name: 'Admin User', email: 'admin@tni.ac.th', password: 'admin123', role: 'Admin' },
            { id: 2, name: 'นักศึกษา A', email: 'user@tni.ac.th', password: 'user123', role: 'User' }
        ];
        localStorage.setItem('reviewfood_users', JSON.stringify(users));
    }

    // Load posts from localStorage or create default
    const storedPosts = localStorage.getItem('reviewfood_posts');
    if (storedPosts) {
        posts = JSON.parse(storedPosts);
    } else {
        posts = [
            {
                id: 1,
                userId: 2,
                author: 'นักศึกษา A',
                title: 'ร้านข้าวมันไก่ หน้าโรงอาหาร',
                content: 'ข้าวมันไก่ที่นี่อร่อยมาก! เนื้อไก่นุ่ม ข้าวหอม น้ำจิ้มรสชาติกลมกล่อม ราคาไม่แพง แนะนำเลยครับ',
                category: 'อาหารไทย',
                hashtags: ['#อร่อย', '#ราคาดี', '#แนะนำ'],
                rating: 5,
                ratings: [{ userId: 2, score: 5 }],
                comments: [],
                createdAt: new Date('2024-09-15').toISOString()
            },
            {
                id: 2,
                userId: 2,
                author: 'นักศึกษา A',
                title: 'ร้านกาแฟ TNI Cafe',
                content: 'กาแฟอร่อย บรรยากาศดี เหมาะสำหรับนั่งทำงาน มี Wi-Fi ความเร็วดี แต่ราคาค่อนข้างสูงหน่อย',
                category: 'เครื่องดื่ม',
                hashtags: ['#กาแฟ', '#นั่งทำงาน', '#wifi'],
                rating: 4,
                ratings: [{ userId: 2, score: 4 }],
                comments: [],
                createdAt: new Date('2024-09-20').toISOString()
            },
            {
                id: 3,
                userId: 1,
                author: 'Admin User',
                title: 'ราเมงโชยุ ร้านญี่ปุ่นในมหาลัย',
                content: 'ราเมงรสชาติแบบญี่ปุ่นแท้ๆ น้ำซุปเข้มข้น หมูชาชูนุ่มมาก ไข่ออนเซนสุดยอด คุ้มค่าเงินเลยครับ',
                category: 'อาหารญี่ปุ่น',
                hashtags: ['#ราเมง', '#ญี่ปุ่น', '#คุ้มค่า'],
                rating: 5,
                ratings: [{ userId: 1, score: 5 }],
                comments: [
                    {
                        id: 1,
                        userId: 2,
                        author: 'นักศึกษา A',
                        content: 'ผมก็ชอบร้านนี้เหมือนกัน อร่อยจริงๆ',
                        createdAt: new Date('2024-09-21').toISOString()
                    }
                ],
                createdAt: new Date('2024-09-18').toISOString()
            }
        ];
        localStorage.setItem('reviewfood_posts', JSON.stringify(posts));
    }
}

// Load user session
function loadUserSession() {
    const session = localStorage.getItem('reviewfood_session');
    if (session) {
        currentUser = JSON.parse(session);
        updateUIForLoggedInUser();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('href').substring(1);
            showSection(target);
        });
    });

    // Login/Register modals
    document.getElementById('loginBtn').addEventListener('click', () => {
        document.getElementById('loginModal').style.display = 'block';
    });

    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('loginModal').style.display = 'none';
    });

    document.getElementById('closeRegisterModal').addEventListener('click', () => {
        document.getElementById('registerModal').style.display = 'none';
    });

    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('registerModal').style.display = 'block';
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerModal').style.display = 'none';
        document.getElementById('loginModal').style.display = 'block';
    });

    // Forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('createPostForm').addEventListener('submit', handleCreatePost);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Search and filter
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });

    // Rating stars
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', handleStarClick);
        star.addEventListener('mouseenter', handleStarHover);
    });

    document.querySelector('.stars').addEventListener('mouseleave', () => {
        updateStars(document.getElementById('postRating').value);
    });

    // Admin tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', handleAdminTab);
    });

    // Close post modal
    document.getElementById('closePostModal').addEventListener('click', () => {
        document.getElementById('postModal').style.display = 'none';
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Show section
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('active');
        }
    });

    if (sectionId === 'admin') {
        renderAdminPosts();
        renderAdminUsers();
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('reviewfood_session', JSON.stringify(user));
        document.getElementById('loginModal').style.display = 'none';
        updateUIForLoggedInUser();
        alert('เข้าสู่ระบบสำเร็จ!');
    } else {
        alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
}

// Handle register
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    if (users.find(u => u.email === email)) {
        alert('อีเมลนี้ถูกใช้งานแล้ว');
        return;
    }

    const newUser = {
        id: users.length + 1,
        name,
        email,
        password,
        role: 'User'
    };

    users.push(newUser);
    localStorage.setItem('reviewfood_users', JSON.stringify(users));
    
    document.getElementById('registerModal').style.display = 'none';
    alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
    document.getElementById('registerForm').reset();
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('reviewfood_session');
    updateUIForLoggedOutUser();
    showSection('home');
    alert('ออกจากระบบสำเร็จ');
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('userMenu').style.display = 'flex';
    document.getElementById('userName').textContent = currentUser.name;
    
    if (currentUser.role === 'Admin') {
        document.getElementById('adminLink').style.display = 'block';
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('userMenu').style.display = 'none';
    document.getElementById('adminLink').style.display = 'none';
}

// Handle create post
function handleCreatePost(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('กรุณาเข้าสู่ระบบก่อน');
        return;
    }

    const title = document.getElementById('postTitle').value;
    const category = document.getElementById('postCategory').value;
    const content = document.getElementById('postContent').value;
    const hashtagsInput = document.getElementById('postHashtags').value;
    const rating = parseInt(document.getElementById('postRating').value);

    const hashtags = hashtagsInput.split(' ').filter(h => h.startsWith('#'));

    const newPost = {
        id: posts.length + 1,
        userId: currentUser.id,
        author: currentUser.name,
        title,
        content,
        category,
        hashtags,
        rating,
        ratings: [{ userId: currentUser.id, score: rating }],
        comments: [],
        createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    localStorage.setItem('reviewfood_posts', JSON.stringify(posts));
    
    document.getElementById('createPostForm').reset();
    document.getElementById('postRating').value = '5';
    updateStars(5);
    
    showSection('home');
    renderPosts();
    alert('โพสต์รีวิวสำเร็จ!');
}

// Render posts
function renderPosts(filteredPosts = null) {
    const postsGrid = document.getElementById('postsGrid');
    const postsToRender = filteredPosts || posts;

    if (postsToRender.length === 0) {
        postsGrid.innerHTML = '<p style="text-align: center; color: white; grid-column: 1/-1;">ไม่พบรีวิว</p>';
        return;
    }

    postsGrid.innerHTML = postsToRender.map(post => `
        <div class="post-card" onclick="showPostDetail(${post.id})">
            <div class="post-image"></div>
            <div class="post-body">
                <div class="post-header">
                    <div>
                        <div class="post-title">${post.title}</div>
                        <span class="post-category">${post.category}</span>
                    </div>
                    <div class="post-rating">${'★'.repeat(post.rating)}</div>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-hashtags">
                    ${post.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
                </div>
                <div class="post-footer">
                    <div class="post-author">โดย ${post.author}</div>
                    <div class="post-date">${formatDate(post.createdAt)}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Show post detail
function showPostDetail(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const avgRating = calculateAverageRating(post.ratings);
    
    const postDetail = document.getElementById('postDetail');
    postDetail.innerHTML = `
        <div class="post-detail-header">
            <h2 class="post-detail-title">${post.title}</h2>
            <div class="post-detail-meta">
                <span class="post-category">${post.category}</span>
                <span>โดย ${post.author}</span>
                <span>${formatDate(post.createdAt)}</span>
                <span class="post-rating">${'★'.repeat(Math.round(avgRating))} (${avgRating.toFixed(1)})</span>
            </div>
        </div>
        <div class="post-detail-content">
            ${post.content}
        </div>
        <div class="post-hashtags">
            ${post.hashtags.map(tag => `<span class="hashtag">${tag}</span>`).join('')}
        </div>
        
        ${currentUser && !post.ratings.find(r => r.userId === currentUser.id) ? `
        <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 10px;">
            <label style="display: block; margin-bottom: 10px; font-weight: 600;">ให้คะแนนรีวิวนี้:</label>
            <div class="stars" id="detailStars">
                ${[1,2,3,4,5].map(i => `<span class="star" data-rating="${i}" onclick="ratePost(${post.id}, ${i})">★</span>`).join('')}
            </div>
        </div>
        ` : ''}

        <div class="comments-section">
            <h3>ความคิดเห็น (${post.comments.length})</h3>
            <div id="commentsList">
                ${post.comments.map(comment => `
                    <div class="comment">
                        <div class="comment-header">
                            <span class="comment-author">${comment.author}</span>
                            <span class="comment-date">${formatDate(comment.createdAt)}</span>
                        </div>
                        <div class="comment-content">${comment.content}</div>
                    </div>
                `).join('')}
            </div>
            
            ${currentUser ? `
            <div class="comment-form">
                <textarea id="commentInput" placeholder="แสดงความคิดเห็น..." rows="3"></textarea>
                <button class="btn btn-primary" onclick="addComment(${post.id})">ส่งความคิดเห็น</button>
            </div>
            ` : '<p style="text-align: center; color: #999; margin-top: 20px;">เข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>'}
        </div>
    `;
    
    document.getElementById('postModal').style.display = 'block';
}

// Rate post
function ratePost(postId, score) {
    if (!currentUser) {
        alert('กรุณาเข้าสู่ระบบก่อน');
        return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.ratings.find(r => r.userId === currentUser.id)) {
        alert('คุณให้คะแนนรีวิวนี้แล้ว');
        return;
    }

    post.ratings.push({ userId: currentUser.id, score });
    localStorage.setItem('reviewfood_posts', JSON.stringify(posts));
    
    alert('ให้คะแนนสำเร็จ!');
    showPostDetail(postId);
    renderPosts();
}

// Add comment
function addComment(postId) {
    const commentInput = document.getElementById('commentInput');
    const content = commentInput.value.trim();
    
    if (!content) {
        alert('กรุณาเขียนความคิดเห็น');
        return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newComment = {
        id: post.comments.length + 1,
        userId: currentUser.id,
        author: currentUser.name,
        content,
        createdAt: new Date().toISOString()
    };

    post.comments.push(newComment);
    localStorage.setItem('reviewfood_posts', JSON.stringify(posts));
    
    showPostDetail(postId);
}

// Calculate average rating
function calculateAverageRating(ratings) {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.score, 0);
    return sum / ratings.length;
}

// Handle search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = posts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    renderPosts(filtered);
}

// Handle filter
function handleFilter(e) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    const category = e.target.getAttribute('data-category');
    
    if (category === 'all') {
        renderPosts();
    } else {
        const filtered = posts.filter(post => post.category === category);
        renderPosts(filtered);
    }
}

// Handle star click
function handleStarClick(e) {
    const rating = e.target.getAttribute('data-rating');
    document.getElementById('postRating').value = rating;
    updateStars(rating);
}

// Handle star hover
function handleStarHover(e) {
    const rating = e.target.getAttribute('data-rating');
    updateStars(rating);
}

// Update stars display
function updateStars(rating) {
    document.querySelectorAll('.star').forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Handle admin tab
function handleAdminTab(e) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    const tab = e.target.getAttribute('data-tab');
    
    if (tab === 'posts') {
        document.getElementById('adminPosts').style.display = 'block';
        document.getElementById('adminUsers').style.display = 'none';
    } else {
        document.getElementById('adminPosts').style.display = 'none';
        document.getElementById('adminUsers').style.display = 'block';
    }
}

// Render admin posts
function renderAdminPosts() {
    const adminPostsList = document.getElementById('adminPostsList');
    
    adminPostsList.innerHTML = posts.map(post => `
        <div class="admin-item">
            <div class="admin-item-content">
                <h4>${post.title}</h4>
                <p>โดย ${post.author} | ${post.category} | ${formatDate(post.createdAt)}</p>
            </div>
            <div class="admin-actions">
                <button class="btn btn-danger" onclick="deletePost(${post.id})">ลบ</button>
            </div>
        </div>
    `).join('');
}

// Render admin users
function renderAdminUsers() {
    const adminUsersList = document.getElementById('adminUsersList');
    
    adminUsersList.innerHTML = users.map(user => `
        <div class="admin-item">
            <div class="admin-item-content">
                <h4>${user.name}</h4>
                <p>${user.email}</p>
            </div>
            <div class="admin-actions">
                <select class="role-select" onchange="changeUserRole(${user.id}, this.value)">
                    <option value="User" ${user.role === 'User' ? 'selected' : ''}>User</option>
                    <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
                </select>
            </div>
        </div>
    `).join('');
}

// Delete post
function deletePost(postId) {
    if (!confirm('คุณต้องการลบโพสต์นี้หรือไม่?')) return;
    
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem('reviewfood_posts', JSON.stringify(posts));
    
    renderAdminPosts();
    renderPosts();
    alert('ลบโพสต์สำเร็จ');
}

// Change user role
function changeUserRole(userId, newRole) {
    const user = users.find(u => u.id === userId);
    if (user) {
        user.role = newRole;
        localStorage.setItem('reviewfood_users', JSON.stringify(users));
        alert(`เปลี่ยน role ของ ${user.name} เป็น ${newRole} สำเร็จ`);
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543;
    return `${day}/${month}/${year}`;
}