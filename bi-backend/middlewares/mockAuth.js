// middleware/mockAuth.js
export function mockAuth(req, res, next) {
  // Simulate a logged-in admin user
  req.user = {
    id: 1,
    name: 'Test User',
    role: 'admin',
    email: 'test@example.com'
  };
  next();
}
