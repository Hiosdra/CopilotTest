/**
 * API Testing Fixtures - Endpoints and test data
 */

export const apiEndpoints = {
  users: '/api/v1/users',
  posts: '/api/v1/posts',
  comments: '/api/v1/comments',
  auth: '/api/v1/auth',
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
