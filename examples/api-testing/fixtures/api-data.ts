/**
 * API Testing Fixtures - Endpoints and test data
 */

export const apiEndpoints = {
  users: '/users',
  posts: '/posts',
  comments: '/comments',
  auth: '/auth',
};

export const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test@123',
};

export const testPost = {
  title: 'Test Post',
  body: 'This is a test post content',
  userId: 1,
};

export const authToken = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'refresh_token_here',
};
