import React, { useState, useEffect, createContext, useContext } from 'react';

// Contexts
const SCPThemeContext = createContext();
const NotificationContext = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [articles, setArticles] = useState(mockDB.articles);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Сохраняем тему при изменении
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Login handler
  const handleLogin = (username, password) => {
    const foundUser = mockDB.users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      setActiveTab('home');
      notify('Вы успешно вошли', 'success');
      return true;
    }
    notify('Неверное имя пользователя или пароль', 'error');
    return false;
  };

  // Register handler
  const handleRegister = (username, password) => {
    if (mockDB.users.some(u => u.username === username)) {
      notify('Пользователь с таким именем уже существует', 'error');
      return false;
    }
    const newUser = {
      id: mockDB.users.length + 1,
      username,
      password,
      role: 'user'
    };
    mockDB.users.push(newUser);
    setUser(newUser);
    setActiveTab('home');
    notify('Регистрация успешна', 'success');
    return true;
  };

  // Create article
  const createNewArticle = () => {
    const newArticle = {
      id: articles.length + 1,
      title: "Новый объект",
      content: "# Специальные меры содержания\n\n\n# Описание\n\n",
      tags: [],
      status: "draft",
      authorId: user?.id || 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setArticles([newArticle, ...articles]);
    setCurrentArticle(newArticle);
    setEditMode(true);
    setActiveTab('editor');
  };

  // Save article
  const saveArticle = (updatedArticle) => {
    const updated = {
      ...updatedArticle,
      updatedAt: new Date().toISOString()
    };

    const updatedList = articles.map(a => a.id === updated.id ? updated : a);
    setArticles(updatedList);
    setCurrentArticle(updated);
    setEditMode(false);
    notify('Объект сохранён', 'success');
  };

  // Delete article
  const deleteArticle = (id) => {
    if (window.confirm("Вы действительно хотите удалить этот объект?")) {
      setArticles(articles.filter(a => a.id !== id));
      if (currentArticle?.id === id) {
        setCurrentArticle(null);
        setActiveTab('home');
      }
      notify('Объект удалён', 'success');
    }
  };

  // Publish/unpublish article
  const togglePublishStatus = (article) => {
    const updated = {
      ...article,
      status: article.status === 'published' ? 'draft' : 'published',
      updatedAt: new Date().toISOString()
    };

    const updatedList = articles.map(a => a.id === article.id ? updated : a);
    setArticles(updatedList);
    setCurrentArticle(updated);
    notify(`Объект ${updated.status === 'published' ? 'опубликован' : 'переведён в черновик'}`, 'success');
  };

  // Filter articles by search query
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Notify function
  const notify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  return (
    <SCPThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <NotificationContext.Provider value={{ notify }}>
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-[#f4f4f4] text-[#000]'}`}>
          <Header user={user} onLogout={() => setUser(null)} setActiveTab={setActiveTab} />

          <main className="container mx-auto px-4 py-8 flex-grow">
            {!user ? (
              <>
                {activeTab === 'login' && <AuthPage isLogin={true} onLogin={handleLogin} onRegister={handleRegister} setActiveTab={setActiveTab} />}
                {activeTab === 'register' && <AuthPage isLogin={false} onLogin={handleLogin} onRegister={handleRegister} setActiveTab={setActiveTab} />}
                {(activeTab === 'home' || activeTab === '') && <LandingPage setActiveTab={setActiveTab} />}
              </>
            ) : (
              <>
                {activeTab === 'home' && (
                  <HomePage
                    articles={filteredArticles}
                    onSelectArticle={setCurrentArticle}
                    onCreateNew={createNewArticle}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />
                )}

                {activeTab === 'editor' && currentArticle && (
                  <EditorPage
                    article={currentArticle}
                    onSave={saveArticle}
                    onDelete={deleteArticle}
                    onTogglePublish={togglePublishStatus}
                    editMode={editMode}
                    setEditMode={setEditMode}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfilePage user={user} />
                )}
              </>
            )}
          </main>

          <Footer />
          <Toast notification={notification} />
        </div>
      </NotificationContext.Provider>
    </SCPThemeContext.Provider>
  );
}

// Landing Page Component — Главная о вселенной SCP
function LandingPage({ setActiveTab }) {
  const { darkMode } = useContext(SCPThemeContext);

  return (
    <div className={`max-w-4xl mx-auto p-6 rounded shadow-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
      <h1 className="text-4xl font-bold mb-6">Добро пожаловать в мир Foundation SCP</h1>
      
      <p className="mb-4">
        Фонд SCP (Secure, Contain, Protect) — это вымышленная организация, занимающаяся изучением, содержанием и контролем аномальных объектов, существ и феноменов, представляющих угрозу для человечества.
      </p>
      
      <p className="mb-6">
        В рамках этой вселенной каждый аномальный объект имеет свой уникальный номер — так называемый «Secure Containment Procedure» (SCP), по которому можно найти его описание, особенности и рекомендации по безопасному обращению.
      </p>
      
      <h2 className="text-2xl font-bold mb-4">Основные классы объектов:</h2>
      <ul className="list-disc pl-5 space-y-2 mb-6">
        <li><strong>Безопасные</strong> — легко содержимые, не представляют угрозы.</li>
        <li><strong>Евклидовские</strong> — требуют дополнительных мер предосторожности.</li>
        <li><strong>Кетер</strong> — крайне опасны и сложны в содержании.</li>
      </ul>
      
      <h2 className="text-2xl font-bold mb-4">Цели проекта</h2>
      <p className="mb-6">
        Наша цель — собрать, документировать и систематизировать информацию о различных объектах, чтобы помочь исследователям и новичкам лучше понимать эту уникальную вселенную.
      </p>
      
      <div className="flex gap-4">
        <button 
          onClick={() => setActiveTab('login')} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          Войти
        </button>
        <button 
          onClick={() => setActiveTab('register')} 
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
        >
          Зарегистрироваться
        </button>
      </div>
    </div>
  );
}

// Header Component
function Header({ user, onLogout, setActiveTab }) {
  const { darkMode, setDarkMode } = useContext(SCPThemeContext);

  return (
    <header className="bg-black text-white border-b border-gray-600 shadow-md z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setActiveTab('home')} 
            className="text-xl font-bold hover:text-gray-300 transition-colors"
          >
            ██ SCP Foundation Wiki
          </button>

          {user && (
            <nav className="hidden md:flex space-x-4">
              <button 
                onClick={() => setActiveTab('home')} 
                className="hover:text-gray-300 transition-colors"
              >
                База данных
              </button>
              <button 
                onClick={() => setActiveTab('profile')} 
                className="hover:text-gray-300 transition-colors"
              >
                Профиль
              </button>
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
          >
            Тема
          </button>

          {user ? (
            <>
              <span className="text-sm">Добро пожаловать, {user.username}</span>
              <button 
                onClick={onLogout} 
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Выйти
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setActiveTab('login')} 
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                Войти
              </button>
              <button 
                onClick={() => setActiveTab('register')} 
                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded transition-colors"
              >
                Регистрация
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// Auth Page Component
function AuthPage({ isLogin, onLogin, onRegister, setActiveTab }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { darkMode } = useContext(SCPThemeContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!onLogin(username, password)) {
        setError('Неверное имя пользователя или пароль');
      }
    } else {
      if (!onRegister(username, password)) {
        setError('Пользователь с таким именем уже существует');
      }
    }
  };

  return (
    <div className={`max-w-md mx-auto mt-12 p-6 rounded shadow-lg transition-colors duration-300 ${darkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-300 text-black'}`}>
      <h2 className="text-2xl font-bold mb-4 text-center">{isLogin ? 'Вход в систему' : 'Регистрация'}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Имя пользователя</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
              darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'
            }`}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black transition-colors ${
              darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-black border-gray-300'
            }`}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setActiveTab(isLogin ? 'register' : 'login')}
          className={`text-sm hover:underline transition-colors ${darkMode ? 'text-white' : 'text-black'}`}
        >
          {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
        </button>
      </div>
    </div>
  );
}

// Home Page Component
function HomePage({ articles, onSelectArticle, onCreateNew, searchQuery, onSearchChange }) {
  const published = articles.filter(a => a.status === 'published');
  const drafts = articles.filter(a => a.status === 'draft');

  const [filter, setFilter] = useState('all');

  let displayedArticles = articles;
  if (filter === 'published') displayedArticles = published;
  if (filter === 'drafts') displayedArticles = drafts;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">База данных объектов</h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-black w-full dark:bg-gray-700 dark:text-white"
          />

          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            Создать новый объект
          </button>
        </div>
      </div>

      <div className="mb-4 flex space-x-2">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Все</button>
        <button onClick={() => setFilter('published')} className={`px-3 py-1 rounded ${filter === 'published' ? 'bg-black text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Опубликованные</button>
        <button onClick={() => setFilter('drafts')} className={`px-3 py-1 rounded ${filter === 'drafts' ? 'bg-black text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>Черновики</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedArticles.map((article) => (
          <ArticleCard key={article.id} article={article} onClick={() => onSelectArticle(article)} />
        ))}
      </div>
    </div>
  );
}

// Article Card Component
function ArticleCard({ article, onClick }) {
  const statusColor = article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

  return (
    <div onClick={onClick} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow cursor-pointer hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusColor} mb-2`}>
          {article.status === 'published' ? 'Опубликовано' : 'Черновик'}
        </div>

        <h3 className="text-xl font-bold mb-2">{article.title}</h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{tag}</span>
          ))}
        </div>

        <div className="text-xs text-gray-500">
          Добавлено: {new Date(article.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// Editor Page Component
function EditorPage({ article, onSave, onDelete, onTogglePublish, editMode, setEditMode }) {
  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [tags, setTags] = useState(article.tags.join(','));
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.height = `${Math.max(editorRef.current.scrollHeight, 300)}px`;
    }
  }, [content]);

  const handleSave = () => {
    onSave({
      ...article,
      title,
      content,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  const markdownToHTML = (text) => {
    return text
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<ul><li>$1</li></ul>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{editMode ? 'Редактирование объекта' : article.title}</h1>

        <div className="flex gap-2">
          <button onClick={() => onTogglePublish(article)} className={`px-3 py-1 rounded text-white ${article.status === 'published' ? 'bg-yellow-600' : 'bg-green-600'}`}>
            {article.status === 'published' ? 'Снять с публикации' : 'Опубликовать'}
          </button>

          <button onClick={() => setEditMode(!editMode)} className="px-3 py-1 bg-blue-600 rounded text-white">
            {editMode ? 'Отменить' : 'Редактировать'}
          </button>

          <button onClick={onDelete} className="px-3 py-1 bg-red-600 rounded text-white">
            Удалить
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow overflow-hidden">
        {editMode ? (
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Название объекта</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white"
                disabled={!editMode}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Теги (через запятую)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:text-white"
                disabled={!editMode}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Контент</label>
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-black min-h-[300px] resize-none font-mono dark:bg-gray-700 dark:text-white"
                disabled={!editMode}
              />
              <p className="text-xs text-gray-500 mt-1">Ctrl+Enter для сохранения изменений</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 prose max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHTML(content) }} />
        )}
      </div>
    </div>
  );
}

// Profile Page Component
function ProfilePage({ user }) {
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Профиль пользователя</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Имя пользователя</label>
            <p className="text-lg">{user.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Роль</label>
            <p className="text-lg capitalize">{user.role}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">Дата регистрации</label>
            <p className="text-lg">{'2023-01-01'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-black text-white py-6 border-t border-gray-600 sticky bottom-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>© 2025 SCP Foundation. Все материалы являются собственностью авторов.</p>
        <p className="mt-2 text-gray-400">Не является официальной частью сайта SCP-Wiki.</p>
      </div>
    </footer>
  );
}

// Toast Component
function Toast({ notification }) {
  if (!notification.show) return null;

  const bgColor = notification.type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`${bgColor} fixed bottom-4 right-4 px-4 py-2 rounded text-white shadow-lg animate-fade-in-up z-50`}>
      {notification.message}
    </div>
  );
}

// Mock Database
const mockDB = {
  users: [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
    { id: 2, username: 'researcher', password: 'pass123', role: 'user' }
  ],
  articles: [
    {
      id: 1,
      title: "SCP-001 - The Seed",
      content: "# Special Containment Procedures\n\nSecure in standard humanoid containment chamber at Site-77.\n\n# Description\n\nSCP-001 is a humanoid male with no anomalous properties.",
      tags: ["humanoid", "safe"],
      status: "published",
      authorId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      title: "SCP-002 - The Vault",
      content: "# Special Containment Procedures\n\nMaintain pressure of 50psi within the chamber.\n\n# Description\n\nA spherical chamber made of unknown alloy.",
      tags: ["structure", "euclid"],
      status: "draft",
      authorId: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
};

export default App;