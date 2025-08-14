// Mock service for authentication operations

// Mock user data
const mockUsers = [
  {
    id: 1,
    username: 'student1',
    password: '123456',
    name: 'John Smith',
    role: 'student',
    student_id: 'STU001',
    email: 'john.smith@university.edu'
  },
  {
    id: 2,
    username: 'manager',
    password: '123456',
    name: 'David Johnson',
    role: 'manager',
    email: 'david.johnson@university.edu'
  },
  {
    id: 3,
    username: 'cntt',
    password: '123456',
    name: 'IT Support Team',
    role: 'department',
    department: 'IT Department',
    email: 'it.support@university.edu'
  },
  {
    id: 4,
    username: 'finance',
    password: '123456',
    name: 'Finance Office',
    role: 'department',
    department: 'Finance Office',
    email: 'finance@university.edu'
  },
  {
    id: 5,
    username: 'academic',
    password: '123456',
    name: 'Academic Affairs',
    role: 'department',
    department: 'Academic Affairs',
    email: 'academic@university.edu'
  },
  {
    id: 6,
    username: 'leadership',
    password: '123456',
    name: 'University Leadership',
    role: 'leadership',
    email: 'leadership@university.edu'
  }
];

// Login function
export const login = async (username, password) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Find user
  const user = mockUsers.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return {
      success: false,
      error: 'Invalid username or password'
    };
  }
  
  // Create a copy of user without password
  const { password: _, ...userWithoutPassword } = user;
  
  // Create mock token
  const token = 'mock_token_' + Math.random().toString(36).substr(2, 9);
  
  return {
    success: true,
    access_token: token,
    user: userWithoutPassword
  };
};

export default {
  login
};
