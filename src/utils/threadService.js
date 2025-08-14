// Mock service for thread-related operations
// This simulates API interactions for tickets/threads

// Initial mock data
let mockThreads = [
  {
    id: 1,
    title: 'Question about course registration',
    issue_type: 'question',
    status: 'new',
    created_at: '2023-08-10T10:30:00Z',
    updated_at: '2023-08-10T10:30:00Z',
    description: 'I need help registering for the upcoming semester. The system shows an error when I try to add CS401 to my schedule.',
    student_id: 'STU001',
    student_name: 'John Smith',
    assigned_to: null,
    priority: 'medium',
    messages: [
      {
        id: 1,
        thread_id: 1,
        sender_type: 'user',
        sender_name: 'John Smith',
        content: 'I keep getting an error code 403 when trying to register.',
        created_at: '2023-08-10T10:30:00Z'
      }
    ]
  },
  {
    id: 2,
    title: 'Problem with tuition payment',
    issue_type: 'billing',
    status: 'in_progress',
    created_at: '2023-08-05T14:20:00Z',
    updated_at: '2023-08-06T09:15:00Z',
    description: 'My bank transfer was completed two days ago, but the system still shows my tuition as unpaid. The reference number is BT-20230803-45678.',
    student_id: 'STU002',
    student_name: 'Emily Johnson',
    assigned_to: 'Finance Office',
    priority: 'high',
    messages: [
      {
        id: 2,
        thread_id: 2,
        sender_type: 'user',
        sender_name: 'Emily Johnson',
        content: 'I have already sent the receipt to the finance office via email.',
        created_at: '2023-08-05T14:20:00Z'
      },
      {
        id: 3,
        thread_id: 2,
        sender_type: 'staff',
        sender_name: 'Finance Staff',
        content: 'We are checking with the bank and will update you shortly.',
        created_at: '2023-08-06T09:15:00Z'
      }
    ]
  },
  {
    id: 3,
    title: 'Cannot access online library resources',
    issue_type: 'technical',
    status: 'new',
    created_at: '2023-08-11T08:15:00Z',
    updated_at: '2023-08-11T08:15:00Z',
    description: 'I am unable to access the online library database from off-campus. I have tried using the VPN as instructed but keep getting an authentication error.',
    student_id: 'STU003',
    student_name: 'Michael Brown',
    assigned_to: null,
    priority: 'medium',
    messages: [
      {
        id: 4,
        thread_id: 3,
        sender_type: 'user',
        sender_name: 'Michael Brown',
        content: 'I have tried resetting my password and clearing my browser cache, but nothing works.',
        created_at: '2023-08-11T08:15:00Z'
      }
    ]
  },
  {
    id: 4,
    title: 'Request for leave of absence',
    issue_type: 'academic',
    status: 'assigned',
    created_at: '2023-08-07T11:45:00Z',
    updated_at: '2023-08-08T14:20:00Z',
    description: 'I need to request a leave of absence for the upcoming semester due to medical reasons. I have medical documentation that can be provided upon request.',
    student_id: 'STU004',
    student_name: 'Sarah Davis',
    assigned_to: 'Academic Affairs',
    priority: 'medium',
    messages: [
      {
        id: 5,
        thread_id: 4,
        sender_type: 'user',
        sender_name: 'Sarah Davis',
        content: 'I would like to know the process and what forms I need to submit for this request.',
        created_at: '2023-08-07T11:45:00Z'
      },
      {
        id: 6,
        thread_id: 4,
        sender_type: 'staff',
        sender_name: 'Academic Advisor',
        content: 'I will need to review your request with the academic committee. Please submit your medical documentation through the secure portal.',
        created_at: '2023-08-08T14:20:00Z'
      }
    ]
  },
  {
    id: 5,
    title: 'Dormitory maintenance issue',
    issue_type: 'facilities',
    status: 'new',
    created_at: '2023-08-12T09:10:00Z',
    updated_at: '2023-08-12T09:10:00Z',
    description: 'The heating in room 305, Building B isn\'t working properly. The temperature is very low despite setting the thermostat to maximum.',
    student_id: 'STU005',
    student_name: 'Daniel Wilson',
    assigned_to: null,
    priority: 'high',
    messages: [
      {
        id: 7,
        thread_id: 5,
        sender_type: 'user',
        sender_name: 'Daniel Wilson',
        content: 'This has been ongoing for three days now. It\'s very cold and difficult to study in the room.',
        created_at: '2023-08-12T09:10:00Z'
      }
    ]
  },
  {
    id: 6,
    title: 'Question about graduation requirements',
    issue_type: 'academic',
    status: 'resolved',
    created_at: '2023-08-01T13:25:00Z',
    updated_at: '2023-08-04T16:30:00Z',
    description: 'I want to confirm if I have met all the requirements for graduation this semester. I have completed 128 credits, but I\'m unsure about the core requirements.',
    student_id: 'STU006',
    student_name: 'Jennifer Martinez',
    assigned_to: 'Academic Affairs',
    priority: 'low',
    messages: [
      {
        id: 8,
        thread_id: 6,
        sender_type: 'user',
        sender_name: 'Jennifer Martinez',
        content: 'Can someone review my transcript and confirm if I\'m on track to graduate?',
        created_at: '2023-08-01T13:25:00Z'
      },
      {
        id: 9,
        thread_id: 6,
        sender_type: 'staff',
        sender_name: 'Graduation Counselor',
        content: 'I have reviewed your transcript and can confirm that you have met all requirements for graduation. Congratulations!',
        created_at: '2023-08-03T11:15:00Z'
      },
      {
        id: 10,
        thread_id: 6,
        sender_type: 'user',
        sender_name: 'Jennifer Martinez',
        content: 'Thank you for confirming! This is great news.',
        created_at: '2023-08-04T10:20:00Z'
      },
      {
        id: 11,
        thread_id: 6,
        sender_type: 'staff',
        sender_name: 'Graduation Counselor',
        content: 'You\'re welcome. You will receive further information about the graduation ceremony via email in the coming weeks.',
        created_at: '2023-08-04T16:30:00Z'
      }
    ]
  }
];

// Counter for new IDs
let nextThreadId = 3;
let nextMessageId = 4;

// Get threads for a student
export const getStudentThreads = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    threads: [...mockThreads]
  };
};

// Get a specific thread by ID
export const getThreadById = async (threadId) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const thread = mockThreads.find(t => t.id === Number(threadId));
  
  if (!thread) {
    return {
      success: false,
      error: 'Thread not found'
    };
  }
  
  return {
    success: true,
    ...thread
  };
};

// Get messages for a thread
export const getThreadMessages = async (threadId) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const thread = mockThreads.find(t => t.id === Number(threadId));
  
  if (!thread) {
    return {
      success: false,
      error: 'Thread not found',
      messages: []
    };
  }
  
  return {
    success: true,
    messages: thread.messages || []
  };
};

// Create a new thread
export const createThread = async (threadData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newThread = {
    id: nextThreadId++,
    title: threadData.title,
    issue_type: threadData.issue_type,
    description: threadData.description,
    status: 'new',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    messages: [
      {
        id: nextMessageId++,
        thread_id: nextThreadId - 1,
        sender_type: 'user',
        sender_name: 'Student',
        content: 'I need assistance with this issue.',
        created_at: new Date().toISOString()
      }
    ]
  };
  
  mockThreads.push(newThread);
  
  return {
    success: true,
    thread: newThread
  };
};

// Add message to a thread
export const addThreadMessage = async (threadId, messageData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const threadIndex = mockThreads.findIndex(t => t.id === Number(threadId));
  
  if (threadIndex === -1) {
    return {
      success: false,
      error: 'Thread not found'
    };
  }
  
  const newMessage = {
    id: nextMessageId++,
    thread_id: Number(threadId),
    sender_type: messageData.sender_type || 'user',
    sender_name: messageData.sender_name || 'Student',
    content: messageData.content,
    created_at: new Date().toISOString()
  };
  
  if (!mockThreads[threadIndex].messages) {
    mockThreads[threadIndex].messages = [];
  }
  
  mockThreads[threadIndex].messages.push(newMessage);
  mockThreads[threadIndex].updated_at = new Date().toISOString();
  
  return {
    success: true,
    message: newMessage
  };
};

// Get all threads for manager
export const getManagerThreads = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    success: true,
    threads: [...mockThreads]
  };
};

// Assign thread to department
export const assignThread = async (threadId, department) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const threadIndex = mockThreads.findIndex(t => t.id === Number(threadId));
  
  if (threadIndex === -1) {
    return {
      success: false,
      error: 'Thread not found'
    };
  }
  
  // Update thread
  mockThreads[threadIndex].assigned_to = department;
  mockThreads[threadIndex].status = 'assigned';
  mockThreads[threadIndex].updated_at = new Date().toISOString();
  
  return {
    success: true,
    thread: mockThreads[threadIndex]
  };
};

// Update thread priority
export const updateThreadPriority = async (threadId, priority) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const threadIndex = mockThreads.findIndex(t => t.id === Number(threadId));
  
  if (threadIndex === -1) {
    return {
      success: false,
      error: 'Thread not found'
    };
  }
  
  // Update thread
  mockThreads[threadIndex].priority = priority;
  mockThreads[threadIndex].updated_at = new Date().toISOString();
  
  return {
    success: true,
    thread: mockThreads[threadIndex]
  };
};

// Get threads assigned to department
export const getAssignedThreads = async (department = null) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Get user department from localStorage if not provided
  if (!department) {
    try {
      const userStr = localStorage.getItem('auth_user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        department = userData.department;
      }
    } catch (err) {
      console.error('Error getting department from user data:', err);
    }
  }
  
  // Filter threads based on department
  const assignedThreads = department 
    ? mockThreads.filter(t => t.assigned_to === department)
    : mockThreads.filter(t => t.assigned_to !== null);
  
  return {
    success: true,
    threads: [...assignedThreads]
  };
};

// Update thread status
export const updateThreadStatus = async (threadId, status) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const threadIndex = mockThreads.findIndex(t => t.id === Number(threadId));
  
  if (threadIndex === -1) {
    return {
      success: false,
      error: 'Thread not found'
    };
  }
  
  // Update thread
  // Ensure we use consistent status terminology
  let normalizedStatus = status;
  
  // Map 'solved' to 'resolved' for consistency across interfaces
  if (status === 'solved') {
    normalizedStatus = 'resolved';
  } else if (status === 'resolved') {
    normalizedStatus = 'resolved';
  }
  
  mockThreads[threadIndex].status = normalizedStatus;
  mockThreads[threadIndex].updated_at = new Date().toISOString();
  
  return {
    success: true,
    thread: mockThreads[threadIndex]
  };
};

// Get analytics data for manager
export const getAnalyticsData = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 900));
  
  // Count statuses
  const statusCounts = {
    new: mockThreads.filter(t => t.status === 'new').length,
    assigned: mockThreads.filter(t => t.status === 'assigned').length,
    in_progress: mockThreads.filter(t => t.status === 'in_progress').length,
    resolved: mockThreads.filter(t => t.status === 'resolved').length
  };
  
  // Count issue types
  const issueTypeCounts = {};
  mockThreads.forEach(thread => {
    issueTypeCounts[thread.issue_type] = (issueTypeCounts[thread.issue_type] || 0) + 1;
  });
  
  // Count assignments
  const assignmentCounts = {};
  mockThreads.forEach(thread => {
    const dept = thread.assigned_to || 'Unassigned';
    assignmentCounts[dept] = (assignmentCounts[dept] || 0) + 1;
  });
  
  // Get response time data (avg minutes from creation to first response)
  const responseTimeData = mockThreads
    .filter(thread => thread.messages && thread.messages.length > 1)
    .map(thread => {
      const creationTime = new Date(thread.created_at).getTime();
      
      // Find first staff response
      const firstStaffResponse = thread.messages.find(m => m.sender_type === 'staff');
      
      if (!firstStaffResponse) return null;
      
      const responseTime = new Date(firstStaffResponse.created_at).getTime();
      return {
        threadId: thread.id,
        responseMinutes: Math.round((responseTime - creationTime) / (1000 * 60))
      };
    })
    .filter(Boolean);
  
  // Calculate avg response time
  const avgResponseTime = responseTimeData.length > 0
    ? responseTimeData.reduce((sum, item) => sum + item.responseMinutes, 0) / responseTimeData.length
    : 0;
  
  return {
    success: true,
    data: {
      totalTickets: mockThreads.length,
      statusCounts,
      issueTypeCounts,
      assignmentCounts,
      responseTimeData,
      avgResponseTime
    }
  };
};

export default {
  getStudentThreads,
  getThreadById,
  getThreadMessages,
  createThread,
  addThreadMessage,
  getManagerThreads,
  assignThread,
  updateThreadPriority,
  getAnalyticsData,
  getAssignedThreads,
  updateThreadStatus
};
