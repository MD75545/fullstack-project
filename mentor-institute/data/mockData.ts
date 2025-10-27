import React from 'react';
import type { Course, GalleryItem, User, Student, Teacher, Partner, TestCategory, PracticeTest, Contest, Question, PracticeTestResult, ContestResult, ContestWinner, DemoBooking, Task } from '../types';

// Fix: Replaced JSX with React.createElement to be compatible with a .ts file extension.
// SVGs as functions returning React elements
const WebDevIcon = () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10 text-brand-purple", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" }));
const DataScienceIcon = () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10 text-brand-purple", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }));
const AiMlIcon = () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10 text-brand-purple", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M5.636 5.636l1.414 1.414m10.05 10.05l1.414 1.414M18.364 5.636l-1.414 1.414M5.636 18.364l1.414-1.414" }));
const CyberSecurityIcon = () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10 text-brand-purple", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }));

export const courses: Course[] = [
  {
    id: 1,
    title: 'Full Stack Web Development',
    description: 'Master front-end and back-end technologies to build complete web applications. Covers React, Node.js, Express, and MongoDB.',
    icon: React.createElement(WebDevIcon),
    duration: '6 Months',
    level: 'Beginner to Advanced',
    image: 'https://picsum.photos/600/300?random=c1',
    price: 45000,
    syllabus: [
      {
        id: 101,
        name: 'Frontend Development',
        topics: [
          { id: 1001, name: 'HTML5 Fundamentals', completed: false },
          { id: 1002, name: 'CSS3 & Responsive Design', completed: false },
          { id: 1003, name: 'JavaScript ES6+', completed: false },
          { id: 1004, name: 'React & State Management', completed: false },
        ],
      },
      {
        id: 102,
        name: 'Backend Development',
        topics: [
          { id: 1005, name: 'Node.js & Express', completed: false },
          { id: 1006, name: 'RESTful API Design', completed: false },
          { id: 1007, name: 'MongoDB & Mongoose', completed: false },
          { id: 1008, name: 'Authentication & Security', completed: false },
        ],
      },
    ]
  },
  {
    id: 2,
    title: 'Data Science with Python',
    description: 'Learn to analyze data, create stunning visualizations, and build predictive models using Python, Pandas, and Scikit-learn.',
    icon: React.createElement(DataScienceIcon),
    duration: '5 Months',
    level: 'Intermediate',
    image: 'https://picsum.photos/600/300?random=c2',
    price: 40000,
  },
  {
    id: 3,
    title: 'AI & Machine Learning',
    description: 'Dive deep into the world of Artificial Intelligence. Explore neural networks, deep learning, and practical AI applications.',
    icon: React.createElement(AiMlIcon),
    duration: '8 Months',
    level: 'Advanced',
    image: 'https://picsum.photos/600/300?random=c3',
    price: 60000,
  },
  {
    id: 4,
    title: 'Cyber Security Expert',
    description: 'Become a security professional by learning ethical hacking, network security, and cryptography to protect digital assets.',
    icon: React.createElement(CyberSecurityIcon),
    duration: '7 Months',
    level: 'Beginner to Advanced',
    image: 'https://picsum.photos/600/300?random=c4',
    price: 55000,
  },
];

export const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: 'AI Integration in Modern Web Apps',
    date: 'October 26, 2023',
    description: 'A hands-on workshop exploring how to integrate Gemini API and other AI models into modern web applications. We covered prompt engineering, API integration, and building AI-powered features in React. Participants built a small-scale AI chatbot.',
    technologies: ['React', 'TypeScript', 'Gemini API', 'Node.js', 'Tailwind CSS'],
    bannerImage: 'https://picsum.photos/1200/400?random=1',
    images: [
      'https://picsum.photos/600/600?random=11',
      'https://picsum.photos/600/600?random=12',
      'https://picsum.photos/600/600?random=13',
      'https://picsum.photos/600/600?random=14',
    ],
  },
  {
    id: 2,
    title: 'The Future of Data Visualization',
    date: 'November 15, 2023',
    description: 'This seminar focused on cutting-edge data visualization techniques using D3.js and React. We discussed interactive charts, real-time data streaming, and how to tell compelling stories with data. A live demo showcased building a dynamic dashboard.',
    technologies: ['D3.js', 'React', 'Big Data', 'WebSockets'],
    bannerImage: 'https://picsum.photos/1200/400?random=2',
    images: [
      'https://picsum.photos/600/600?random=21',
      'https://picsum.photos/600/600?random=22',
      'https://picsum.photos/600/600?random=23',
    ],
  },
  {
    id: 3,
    title: 'Cyber Security Capture The Flag Event',
    date: 'December 05, 2023',
    description: 'An exciting and competitive "Capture The Flag" (CTF) event where students tested their ethical hacking and problem-solving skills. Challenges included web vulnerabilities, cryptography puzzles, and network forensics. Prizes were awarded to the top teams.',
    technologies: ['Ethical Hacking', 'Kali Linux', 'Network Security', 'Cryptography'],
    bannerImage: 'https://picsum.photos/1200/400?random=3',
    images: [
      'https://picsum.photos/600/600?random=31',
      'https://picsum.photos/600/600?random=32',
      'https://picsum.photos/600/600?random=33',
      'https://picsum.photos/600/600?random=34',
      'https://picsum.photos/600/600?random=35',
    ],
  },
  {
    id: 4,
    title: 'Personality Development for Techies',
    date: 'January 10, 2024',
    description: 'This special seminar was focused on soft skills essential for a successful career in tech. Topics included effective communication, teamwork, presentation skills, and interview preparation. Industry experts shared their experiences and advice.',
    technologies: ['Communication', 'Teamwork', 'Public Speaking', 'Leadership'],
    bannerImage: 'https://picsum.photos/1200/400?random=4',
    images: [
      'https://picsum.photos/600/600?random=41',
      'https://picsum.photos/600/600?random=42',
    ],
  },
];

export let users: (User | Student | Teacher | Partner)[] = [
  // Superadmin
  { id: 101, name: 'Admin User', email: 'admin@mentor.tech', password: 'admin', role: 'superadmin' },
  // Teachers
  { id: 201, name: 'Marcus Chen', email: 'teacher@mentor.tech', password: 'password', role: 'teacher', specialization: 'Web Development', affiliateId: 'REF_TEACHER_CHEN', commissionPercentage: 8, earnings: { total: 7500, daily: 250 } },
  { id: 202, name: 'Aisha Khan', email: 'aisha@mentor.tech', password: 'password', role: 'teacher', specialization: 'Data Science' },
  // Students
  { id: 301, name: 'Student One', email: 'student@test.com', password: 'password', role: 'student', courseId: 1, teacherId: 201, photo: 'https://i.pravatar.cc/150?img=5', displayName: 'real_name', gender: 'female' },
  { id: 302, name: 'Student Two', email: 'student2@test.com', password: 'password', role: 'student', courseId: 2, teacherId: 202, displayName: 'anonymous', gender: 'male' },
  { id: 303, name: 'Student Three', email: 'student3@test.com', password: 'password', role: 'student', courseId: 1, teacherId: 201, displayName: 'real_name', gender: 'male' },
  { id: 304, name: 'Referred Student', email: 'ref@test.com', password: 'password', role: 'student', courseId: 2, teacherId: 202, referredBy: 'REF_PARTNER1', photo: 'https://i.pravatar.cc/150?img=8', displayName: 'real_name', gender: 'female' },
  { id: 305, name: 'Charlie Davis', email: 'charlie@test.com', password: 'password', role: 'student', courseId: 1, teacherId: 201, referredBy: 'REF_TEACHER_CHEN', displayName: 'real_name', gender: 'male' },
  // Partners
  { id: 401, name: 'Partner One', email: 'partner@test.com', password: 'password', role: 'partner', affiliateId: 'REF_PARTNER1', commissionPercentage: 10, earnings: { total: 15000, daily: 500 }, partnerType: 'Individual' },
];

export const testimonials = [
  {
    quote: "The Full Stack course was a game-changer for my career. The hands-on projects and expert instructors gave me the confidence to land my dream job.",
    name: "Priya Sharma",
    role: "Software Engineer, Tech Solutions Inc.",
    image: "https://i.pravatar.cc/100?img=5",
  },
  {
    quote: "I came from a non-tech background, and the Data Science program was perfectly paced. The mentors are incredibly supportive and knowledgeable.",
    name: "Rajesh Kumar",
    role: "Data Analyst, FinCorp",
    image: "https://i.pravatar.cc/100?img=6",
  },
  {
    quote: "The cybersecurity course provided deep insights and practical skills that are directly applicable in the industry. Highly recommended!",
    name: "Anjali Singh",
    role: "Security Consultant, SecureNet",
    image: "https://i.pravatar.cc/100?img=7",
  },
];


export const testCategories: TestCategory[] = [
  { id: 1, name: 'Web Development' },
  { id: 2, name: 'Data Structures & Algorithms' },
  { id: 3, name: 'Aptitude' },
  { id: 4, name: 'Machine Learning' },
];

export const practiceTests: PracticeTest[] = [
  { id: 101, name: 'React Hooks Fundamentals', categoryId: 1, duration: 10 },
  { id: 102, name: 'CSS Flexbox Challenge', categoryId: 1, duration: 5 },
  { id: 103, name: 'Array Manipulation', categoryId: 2, duration: 15 },
  { id: 104, name: 'Linked List Basics', categoryId: 2, duration: 10 },
  { id: 105, name: 'Quantitative Aptitude Set 1', categoryId: 3, duration: 20 },
  { id: 106, name: 'Logical Reasoning Practice', categoryId: 3, duration: 20 },
  { id: 107, name: 'Node.js Event Loop', categoryId: 1, duration: 8 },
  { id: 108, name: 'Sorting Algorithms', categoryId: 2, duration: 15 },
  { id: 109, name: 'Introduction to Neural Networks', categoryId: 4, duration: 12 },
];

export const contests: Contest[] = [
  {
    id: 201,
    name: 'Algorithm Arena I',
    categoryId: 2,
    date: '2024-07-15', // Past date for completed contest
    time: '18:00',
    notesUrl: '/downloads/algo-notes.pdf',
    prizeMoney: 10000,
    minParticipants: 50,
    entryFee: 99,
    totalQuestions: 5,
    duration: 90,
  },
  {
    id: 202,
    name: 'React Rumble',
    categoryId: 1,
    date: '2024-09-22',
    time: '14:00',
    prizeMoney: 8000,
    minParticipants: 40,
    entryFee: 99,
    totalQuestions: 10,
    duration: 60,
  },
  {
    id: 203,
    name: 'Logic Legends',
    categoryId: 3,
    date: '2024-10-01',
    time: '20:00',
    prizeMoney: 7500,
    minParticipants: 60,
    entryFee: 99,
    totalQuestions: 20,
    duration: 45,
  },
   {
    id: 204,
    name: 'ML Mastery Challenge',
    categoryId: 4,
    date: '2024-10-05',
    time: '10:00',
    notesUrl: '/downloads/ml-notes.pdf',
    prizeMoney: 12000,
    minParticipants: 30,
    entryFee: 99,
    totalQuestions: 8,
    duration: 120,
  },
  {
    id: 205,
    name: 'Future Coders Challenge 2025',
    categoryId: 2,
    date: '2025-12-01',
    time: '18:00',
    prizeMoney: 15000,
    minParticipants: 50,
    entryFee: 99,
    totalQuestions: 10,
    duration: 60,
  },
  {
    id: 206,
    name: 'Code Titans Challenge 2025',
    categoryId: 2,
    date: '2025-10-20',
    time: '19:00',
    prizeMoney: 20000,
    minParticipants: 50,
    entryFee: 99,
    totalQuestions: 10,
    duration: 90,
  },
];

export const questions: Question[] = [
  // React Hooks Fundamentals (testId: 101)
  {
    id: 10101, testId: 101, text: "Which hook is used to perform side effects in a function component?",
    options: [{ id: 1, text: "useState" }, { id: 2, text: "useEffect" }, { id: 3, text: "useContext" }, { id: 4, text: "useReducer" }],
    correctOptionId: 2,
  },
  {
    id: 10102, testId: 101, text: "What is the correct way to initialize a state variable named 'count' to 0?",
    options: [{ id: 1, text: "const count = useState(0);" }, { id: 2, text: "const [count, setCount] = useState(0);" }, { id: 3, text: "const {count, setCount} = useState(0);" }, { id: 4, text: "useState(count, 0);" }],
    correctOptionId: 2,
  },
  {
    id: 10103, testId: 101, text: "When does the function passed to useEffect run by default?",
    options: [{ id: 1, text: "Only once after the initial render" }, { id: 2, text: "After every render" }, { id: 3, text: "Only when a state variable changes" }, { id: 4, text: "Only on component unmount" }],
    correctOptionId: 2,
  },
   {
    id: 10104, testId: 101, text: "To prevent a useEffect from running on every re-render, what should you pass as the second argument?",
    options: [{ id: 1, text: "An empty object {}" }, { id: 2, text: "The state variable to watch" }, { id: 3, text: "An empty array []" }, { id: 4, text: "The boolean `false`" }],
    correctOptionId: 3,
  },
  {
    id: 10105, testId: 101, text: "Which hook would you use to get access to a context?",
    options: [{ id: 1, text: "useContext" }, { id: 2, text: "useEffect" }, { id: 3, text: "useProvider" }, { id: 4, text: "useRef" }],
    correctOptionId: 1,
  },

  // Algorithm Arena I (contestId: 201)
  {
    id: 20101, testId: 201, text: "What is the time complexity of a binary search algorithm?",
    options: [{ id: 1, text: "O(n)" }, { id: 2, text: "O(n^2)" }, { id: 3, text: "O(log n)" }, { id: 4, text: "O(1)" }],
    correctOptionId: 3,
  },
  {
    id: 20102, testId: 201, text: "Which data structure operates on a Last-In, First-Out (LIFO) basis?",
    options: [{ id: 1, text: "Queue" }, { id: 2, text: "Stack" }, { id: 3, text: "Linked List" }, { id: 4, text: "Tree" }],
    correctOptionId: 2,
  },
  {
    id: 20103, testId: 201, text: "Which of the following is not a stable sorting algorithm?",
    options: [{ id: 1, text: "Merge Sort" }, { id: 2, text: "Bubble Sort" }, { id: 3, text: "Insertion Sort" }, { id: 4, text: "Quick Sort" }],
    correctOptionId: 4,
  },
   {
    id: 20104, testId: 201, text: "Dijkstra's algorithm is used to solve which problem?",
    options: [{ id: 1, text: "All pairs shortest path" }, { id: 2, text: "Single source shortest path" }, { id: 3, text: "Minimum spanning tree" }, { id: 4, text: "Maximum flow" }],
    correctOptionId: 2,
  },
  {
    id: 20105, testId: 201, text: "A graph with no cycles is called a...",
    options: [{ id: 1, text: "Complete graph" }, { id: 2, text: "Bipartite graph" }, { id: 3, text: "Tree" }, { id: 4, text: "Directed Acyclic Graph (DAG)" }],
    correctOptionId: 4,
  },
];


export const practiceTestResults: PracticeTestResult[] = [
  // Student 301, Test 101 (React Hooks Fundamentals) - 3 attempts
  {
    id: 1, userId: 301, testId: 101, date: '2024-07-28 10:00:00', scoreObtained: 3, totalScore: 5,
    answers: { 10101: 2, 10102: 2, 10103: 1, 10104: 3, 10105: 2 },
  },
  {
    id: 2, userId: 301, testId: 101, date: '2024-07-29 11:30:00', scoreObtained: 4, totalScore: 5,
    answers: { 10101: 2, 10102: 2, 10103: 2, 10104: 3, 10105: 4 },
  },
  {
    id: 3, userId: 301, testId: 101, date: '2024-07-30 09:00:00', scoreObtained: 5, totalScore: 5,
    answers: { 10101: 2, 10102: 2, 10103: 2, 10104: 3, 10105: 1 },
  },
  // Student 301, Test 103 (Array Manipulation)
  {
    id: 4, userId: 301, testId: 103, date: '2024-07-25 15:00:00', scoreObtained: 0, totalScore: 0, // No questions for this yet, so score is 0
    answers: {},
  },
   // Student 302, Test 101
  {
    id: 5, userId: 302, testId: 101, date: '2024-07-28 12:00:00', scoreObtained: 2, totalScore: 5,
    answers: { 10101: 1, 10102: 2, 10103: 1, 10104: 4, 10105: 1 },
  }
];

export const contestResults: ContestResult[] = [
  {
    id: 1, userId: 301, contestId: 201, date: '2024-07-15', scoreObtained: 4, totalScore: 5, rank: 12,
    answers: { 20101: 3, 20102: 2, 20103: 1, 20104: 2, 20105: 4 },
  },
  {
    id: 2, userId: 301, contestId: 202, date: '2024-09-22', scoreObtained: 0, totalScore: 0, rank: 35,
    answers: {}, // No questions for this one yet in mock data
  },
  {
    id: 3, userId: 303, contestId: 201, date: '2024-07-15', scoreObtained: 5, totalScore: 5, rank: 2,
    answers: { 20101: 3, 20102: 2, 20103: 4, 20104: 2, 20105: 4 },
  },
  {
    id: 4, userId: 304, contestId: 201, date: '2024-07-15', scoreObtained: 5, totalScore: 5, rank: 1,
    answers: { 20101: 3, 20102: 2, 20103: 4, 20104: 2, 20105: 4 },
  },
  {
    id: 5, userId: 305, contestId: 201, date: '2024-07-15', scoreObtained: 4, totalScore: 5, rank: 3,
    answers: { 20101: 3, 20102: 2, 20103: 4, 20104: 2, 20105: 3 },
  },
];

export const contestWinners: ContestWinner[] = [
    // Winners for Algorithm Arena I (contestId: 201)
    { userId: 304, contestId: 201, rank: 1, scoreObtained: 5, totalScore: 5 },
    { userId: 303, contestId: 201, rank: 2, scoreObtained: 5, totalScore: 5 },
    { userId: 305, contestId: 201, rank: 3, scoreObtained: 4, totalScore: 5 },
    { userId: 301, contestId: 201, rank: 12, scoreObtained: 4, totalScore: 5 },
];

export let demoBookings: DemoBooking[] = [
    {
        id: 1,
        studentName: "Alice Johnson",
        studentEmail: "alice@example.com",
        studentMobile: "9876543210",
        courseId: 1,
        referredByAffiliateId: "REF_PARTNER1",
        bookingDate: "2024-08-01",
        bookingTime: "11:00",
        status: 'Student Admitted',
        commissionAmount: 4500, // 10% of 45000
        commissionPaid: false,
    },
    {
        id: 2,
        studentName: "Bob Williams",
        studentEmail: "bob@example.com",
        studentMobile: "9876543211",
        courseId: 3,
        referredByAffiliateId: "REF_TEACHER_CHEN",
        bookingDate: "2024-08-02",
        bookingTime: "14:00",
        status: 'Conducted',
        commissionPaid: false,
    },
    {
        id: 3,
        studentName: "Carol White",
        studentEmail: "carol@example.com",
        studentMobile: "9876543212",
        courseId: 2,
        referredByAffiliateId: "REF_PARTNER1",
        bookingDate: "2024-08-05",
        bookingTime: "16:00",
        status: 'Pending',
        commissionPaid: false,
    },
     {
        id: 4,
        studentName: "David Green",
        studentEmail: "david@example.com",
        studentMobile: "9876543213",
        courseId: 4,
        referredByAffiliateId: "REF_PARTNER1",
        bookingDate: "2024-07-20",
        bookingTime: "10:00",
        status: 'Student Admitted',
        commissionAmount: 5500, // 10% of 55000
        commissionPaid: true,
        paymentDetails: {
            mode: 'Bank Transfer',
            description: 'Q2 Commission Payout',
            paidOn: '2024-07-25',
            paidAmount: 5500
        }
    },
    {
        id: 5,
        studentName: "Student One",
        studentEmail: "student@test.com",
        studentMobile: "9998887776",
        courseId: 1,
        bookingDate: "2024-09-10",
        bookingTime: "15:00",
        status: 'Pending',
        commissionPaid: false,
        studentNotified: false,
    }
];

export let tasks: Task[] = [
    {
        id: 1,
        title: "Prepare Web Dev Quiz",
        description: "Create a 10-question quiz on React hooks.",
        assignedTo: 201, // Marcus Chen
        dueDate: "2024-08-10",
        status: 'Completed',
        priority: 'High',
    },
    {
        id: 2,
        title: "Review Student Projects",
        description: "Provide feedback on the final projects for the Data Science batch.",
        assignedTo: 202, // Aisha Khan
        dueDate: "2024-08-15",
        status: 'In Progress',
        priority: 'Medium',
    },
    {
        id: 3,
        title: "Update Course Syllabus",
        description: "Incorporate new topics into the Full Stack Web Development syllabus.",
        assignedTo: 201,
        dueDate: "2024-08-20",
        status: 'Pending',
        priority: 'Low',
    },
];
