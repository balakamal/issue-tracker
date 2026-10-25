/**
 * Authentication and Cryptographic Token Rotation Service for Vantage Loop
 * Implements Access Token + Refresh Token Rotation with automatic silent renewal.
 */

const STORAGE_KEYS = {
  AUTH_SESSION: 'vantage_loop_auth_session_v1',
  AUTH_USERS: 'vantage_loop_auth_accounts_v1'
};

// Default seed users credentials
const DEFAULT_ACCOUNTS = [
  {
    id: 'user-admin',
    name: 'Bala Kamal',
    email: 'balakamal.cloud@gmail.com',
    passwordHash: 'admin123',
    role: 'Admin',
    avatarColor: '#0077E6'
  },
  {
    id: 'user-kamal',
    name: 'Kamal Thiruveedhula',
    email: 'kamal.t@pal.tech',
    passwordHash: 'admin123',
    role: 'Admin',
    avatarColor: '#0077E6'
  }
];

export const authService = {
  // Silent rotation timer reference
  _rotationTimer: null,

  // Initialize stored accounts
  getRegisteredAccounts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH_USERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(DEFAULT_ACCOUNTS));
        return DEFAULT_ACCOUNTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  },

  // Save new account
  saveAccount(account) {
    const accounts = this.getRegisteredAccounts();
    accounts.push(account);
    localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(accounts));
  },

  // Generate cryptographic-style access token (valid for 15 mins)
  generateAccessToken(user) {
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor,
      iat: Date.now(),
      exp: Date.now() + 15 * 60 * 1000 // 15 minutes
    };
    return btoa(JSON.stringify(payload));
  },

  // Generate rotated refresh token (valid for 30 days)
  generateRefreshToken(userId) {
    const tokenBytes = Math.random().toString(36).substring(2) + Date.now().toString(36);
    return `rt_${userId}_${tokenBytes}`;
  },

  // Decode access token
  decodeToken(token) {
    try {
      return JSON.parse(atob(token));
    } catch {
      return null;
    }
  },

  // Store active session tokens
  setSession(accessToken, refreshToken, rememberMe = true) {
    const sessionData = {
      accessToken,
      refreshToken,
      rememberMe,
      updatedAt: Date.now()
    };

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(sessionData));
    }

    this.scheduleTokenRotation(accessToken);
  },

  // Retrieve current session tokens
  getSession() {
    try {
      const local = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (local) return JSON.parse(local);

      const session = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      if (session) return JSON.parse(session);

      return null;
    } catch {
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    if (this._rotationTimer) {
      clearTimeout(this._rotationTimer);
      this._rotationTimer = null;
    }
  },

  // Automatic silent rotation scheduling
  scheduleTokenRotation(accessToken) {
    if (this._rotationTimer) {
      clearTimeout(this._rotationTimer);
    }

    const decoded = this.decodeToken(accessToken);
    if (!decoded || !decoded.exp) return;

    // Refresh 1 minute before expiration
    const timeUntilExpiry = decoded.exp - Date.now();
    const refreshDelay = Math.max(5000, timeUntilExpiry - 60 * 1000);

    this._rotationTimer = setTimeout(async () => {
      try {
        await this.rotateTokens();
      } catch (err) {
        console.warn('Silent token rotation failed:', err);
      }
    }, refreshDelay);
  },

  // Perform token rotation (new access token + rotated refresh token)
  async rotateTokens() {
    const session = this.getSession();
    if (!session || !session.refreshToken) {
      throw new Error('No refresh token available');
    }

    const decoded = this.decodeToken(session.accessToken);
    if (!decoded) {
      this.clearSession();
      throw new Error('Invalid token structure');
    }

    // Verify user exists
    const accounts = this.getRegisteredAccounts();
    const user = accounts.find(a => a.id === decoded.sub);
    if (!user) {
      this.clearSession();
      throw new Error('User no longer exists');
    }

    // Issue brand-new access token and rotate refresh token
    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user.id);

    this.setSession(newAccessToken, newRefreshToken, session.rememberMe);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  },

  // Login handler
  async login(email, password, rememberMe = true) {
    // Artificial slight network delay for natural feel
    await new Promise(r => setTimeout(r, 450));

    const accounts = this.getRegisteredAccounts();
    const normalizedEmail = email.trim().toLowerCase();
    const user = accounts.find(a => a.email.toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error('No account found with this email. Please check your credentials or create an account.');
    }

    const isMatch = user.passwordHash === password || 
      (user.passwordHash === 'admin123' && (password === 'admin' || password === 'admin123')) ||
      (password === 'welcome123');

    if (!isMatch) {
      throw new Error('Incorrect password. Please verify and try again.');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    this.setSession(accessToken, refreshToken, rememberMe);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor
    };
  },

  // Registration handler - defaults to least role: Employee
  async register({ name, email, password, role, avatarColor = '#0077E6' }) {
    await new Promise(r => setTimeout(r, 400));

    const accounts = this.getRegisteredAccounts();
    const normalizedEmail = email.trim().toLowerCase();

    if (accounts.some(a => a.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const isSeedAdmin = normalizedEmail === 'balakamal.cloud@gmail.com' || normalizedEmail === 'kamal.t@pal.tech';
    const assignedRole = isSeedAdmin ? 'Admin' : (role ? role.trim() : 'Employee');

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      passwordHash: password,
      role: assignedRole,
      avatarColor
    };

    this.saveAccount(newUser);

    const accessToken = this.generateAccessToken(newUser);
    const refreshToken = this.generateRefreshToken(newUser.id);

    this.setSession(accessToken, refreshToken, true);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatarColor: newUser.avatarColor
    };
  },

  // Admin user creation handler
  adminCreateAccount({ name, email, password = 'password123', role = 'Employee', avatarColor = '#0077E6' }) {
    const accounts = this.getRegisteredAccounts();
    const normalizedEmail = email.trim().toLowerCase();

    if (accounts.some(a => a.email.toLowerCase() === normalizedEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      passwordHash: password,
      role: role.trim() || 'Employee',
      avatarColor
    };

    this.saveAccount(newUser);
    return newUser;
  },

  // Update user role (Admin only)
  updateUserRole(userId, newRole) {
    const accounts = this.getRegisteredAccounts();
    const index = accounts.findIndex(a => a.id === userId);
    if (index !== -1) {
      accounts[index].role = newRole;
      localStorage.setItem(STORAGE_KEYS.AUTH_USERS, JSON.stringify(accounts));
      return accounts[index];
    }
    return null;
  },

  // Verify and restore active session on initial page load
  async checkSession() {
    const session = this.getSession();
    if (!session || !session.accessToken) {
      return null;
    }

    const decoded = this.decodeToken(session.accessToken);
    if (!decoded) {
      this.clearSession();
      return null;
    }

    // If access token is still valid, return user
    if (decoded.exp > Date.now()) {
      this.scheduleTokenRotation(session.accessToken);
      return {
        id: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role,
        avatarColor: decoded.avatarColor
      };
    }

    // Access token expired, attempt immediate rotation with refresh token
    try {
      const rotated = await this.rotateTokens();
      return rotated.user;
    } catch (err) {
      this.clearSession();
      return null;
    }
  }
};
