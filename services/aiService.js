import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Robust fallback bank with 4 options, correct answer, and explanation for standard roles
const FALLBACK_QUESTION_BANK = {
  "Frontend Developer": [
    {
      question: "What is the primary difference between the Virtual DOM and the real DOM in React?",
      options: [
        "A) Virtual DOM is directly rendered by the browser GPU",
        "B) Virtual DOM is an in-memory lightweight representation of the real DOM used for reconciliation",
        "C) Virtual DOM replaces JavaScript completely in modern web apps",
        "D) Virtual DOM can only be updated once per user session"
      ],
      correctOption: "B",
      explanation: "The Virtual DOM is an in-memory representation of real DOM elements. React computes the diff between states and efficiently batches minimal updates to the real DOM."
    },
    {
      question: "Which CSS layout mode is best suited for two-dimensional grid layouts with rows and columns?",
      options: [
        "A) Flexbox Layout",
        "B) Float-based Layout",
        "C) CSS Grid Layout",
        "D) Inline-Block Layout"
      ],
      correctOption: "C",
      explanation: "CSS Grid is inherently designed for two-dimensional layouts (both rows and columns simultaneously), whereas Flexbox is primarily one-dimensional (row OR column)."
    },
    {
      question: "In JavaScript, what will `typeof null` return?",
      options: [
        "A) 'null'",
        "B) 'undefined'",
        "C) 'object'",
        "D) 'number'"
      ],
      correctOption: "C",
      explanation: "`typeof null` returns 'object'. This is a historical bug in JavaScript from its first implementation that has been preserved for backward compatibility."
    },
    {
      question: "What does the `useEffect` cleanup function do in React?",
      options: [
        "A) Clears the browser's cookies and local storage",
        "B) Runs before the component unmounts or before re-running the effect to prevent memory leaks",
        "C) Resets the component's state to initial values",
        "D) Automatically deletes unused CSS classes"
      ],
      correctOption: "B",
      explanation: "The cleanup function returned by `useEffect` runs before the component is unmounted and prior to re-executing the effect, cleaning up subscriptions, timers, or event listeners."
    },
    {
      question: "What is the key advantage of using `useMemo` in React?",
      options: [
        "A) It prevents a component from ever re-rendering",
        "B) It memoizes the result of expensive calculations to avoid recomputing on every render",
        "C) It replaces Redux for global state management",
        "D) It converts synchronous functions into asynchronous Web Workers"
      ],
      correctOption: "B",
      explanation: "`useMemo` caches the calculated result of an expensive function and only recalculates when its specified dependencies change."
    },
    {
      question: "Which of the following is true about JavaScript Closures?",
      options: [
        "A) A closure only has access to its own local variables",
        "B) A closure gives an inner function access to an outer function's scope even after the outer function has returned",
        "C) Closures can only be declared inside classes",
        "D) Closures automatically encrypt variables stored in memory"
      ],
      correctOption: "B",
      explanation: "A closure is the combination of a function bundled together with references to its lexical environment, allowing access to outer scope variables even after execution finishes."
    },
    {
      question: "What is the purpose of the `defer` attribute in a `<script>` tag?",
      options: [
        "A) It stops the script from ever executing until clicked",
        "B) It downloads the script asynchronously and executes it after the HTML document is fully parsed",
        "C) It executes the script immediately, blocking HTML parsing",
        "D) It converts the script into TypeScript"
      ],
      correctOption: "B",
      explanation: "`defer` tells the browser to download the script in parallel with HTML parsing, but delays execution until the HTML parsing is complete in sequential order."
    },
    {
      question: "How does React detect that state has changed when calling a state updater function?",
      options: [
        "A) Deep recursive comparison of all object properties",
        "B) Shallow equality check (Object.is) comparing new and old state references",
        "C) Polling every 16 milliseconds",
        "D) Checking file hash on the server"
      ],
      correctOption: "B",
      explanation: "React relies on referential equality (shallow comparison using `Object.is`). If the state reference has not changed, React will skip re-rendering."
    },
    {
      question: "Which HTTP header is essential to prevent Cross-Site Scripting (XSS) attacks?",
      options: [
        "A) Content-Security-Policy (CSP)",
        "B) Access-Control-Allow-Origin",
        "C) Cache-Control",
        "D) Accept-Encoding"
      ],
      correctOption: "A",
      explanation: "Content-Security-Policy (CSP) restricts the resources (such as scripts, images) that the browser is allowed to load for a given page, mitigating XSS."
    },
    {
      question: "What is event bubbling in the browser DOM?",
      options: [
        "A) Events firing simultaneously across all tabs",
        "B) The event propagating from the target element upwards through its ancestor elements in the DOM tree",
        "C) Events being captured from the window down to the target element",
        "D) Events converting into background worker events"
      ],
      correctOption: "B",
      explanation: "During event bubbling, after an event triggers on the deepest target element, it bubbles up through its parent and ancestor elements toward the root."
    }
  ],
  "Backend Developer": [
    {
      question: "What is the primary role of the Event Loop in Node.js?",
      options: [
        "A) Compiling C++ code into JavaScript",
        "B) Enabling non-blocking I/O operations by offloading tasks to the system kernel or thread pool",
        "C) Managing CSS styling across server templates",
        "D) Restarting the operating system upon errors"
      ],
      correctOption: "B",
      explanation: "Node.js runs single-threaded JavaScript code and uses the Event Loop alongside libuv to manage asynchronous, non-blocking I/O efficiently."
    },
    {
      question: "Which HTTP status code signifies that a resource was successfully created on the server?",
      options: [
        "A) 200 OK",
        "B) 201 Created",
        "C) 204 No Content",
        "D) 301 Moved Permanently"
      ],
      correctOption: "B",
      explanation: "HTTP 201 Created indicates that the request succeeded and resulted in the creation of a new resource (commonly returned after a successful POST request)."
    },
    {
      question: "What is the difference between SQL and NoSQL databases?",
      options: [
        "A) SQL is only for numbers while NoSQL is only for strings",
        "B) SQL databases are structured and relational with predefined schemas; NoSQL databases are non-relational with flexible document, key-value, or graph models",
        "C) NoSQL cannot run on Linux servers",
        "D) SQL does not support indexes"
      ],
      correctOption: "B",
      explanation: "SQL uses structured tabular schemas with ACID properties, while NoSQL offers schema flexibility (documents, key-value, graph) and horizontal scaling."
    },
    {
      question: "What is the purpose of database indexing?",
      options: [
        "A) To encrypt all columns in the database",
        "B) To dramatically speed up data retrieval (SELECT queries) at the cost of additional storage and slower writes",
        "C) To automatically backup the database every hour",
        "D) To convert relational data into XML format"
      ],
      correctOption: "B",
      explanation: "Indexes create efficient search trees (like B-trees) that allow the database engine to find matching records rapidly without scanning every row in the table."
    },
    {
      question: "Why should passwords never be stored as plain MD5 or SHA-256 hashes?",
      options: [
        "A) They take up too much disk space",
        "B) They are fast algorithms vulnerable to brute-force and rainbow table attacks; slow salted algorithms like bcrypt or argon2 must be used",
        "C) MD5 only works on 32-bit machines",
        "D) SHA-256 cannot hash strings containing numbers"
      ],
      correctOption: "B",
      explanation: "MD5 and SHA-256 are designed to be fast, making them easy to crack with modern GPUs and rainbow tables. Adaptive work-factor algorithms with salt (like bcrypt, Argon2) protect passwords."
    },
    {
      question: "What does JWT stand for and what are its three component parts?",
      options: [
        "A) Java Web Template: Model, View, Controller",
        "B) JSON Web Token: Header, Payload, Signature",
        "C) JavaScript Working Thread: ThreadId, Priority, Callback",
        "D) Joined WebSocket Transport: Source, Destination, Checksum"
      ],
      correctOption: "B",
      explanation: "A JSON Web Token consists of three parts separated by dots: Header (algorithm & token type), Payload (claims/data), and Signature (cryptographic verification)."
    },
    {
      question: "What is connection pooling in backend databases?",
      options: [
        "A) Merging multiple databases into a single hard drive",
        "B) Maintaining a cache of reusable active database connections to avoid the high overhead of establishing a new connection per request",
        "C) Sharing database passwords across multiple users",
        "D) A backup mechanism using cloud buckets"
      ],
      correctOption: "B",
      explanation: "Creating and tearing down TCP connections is expensive. Connection pooling keeps established connections open and reuses them for incoming database queries."
    },
    {
      question: "What is an idempotent HTTP method?",
      options: [
        "A) A method that cannot be accessed by mobile devices",
        "B) A method where making multiple identical requests has the same effect on the server state as a single request (e.g., GET, PUT, DELETE)",
        "C) A method that always creates a new resource each time",
        "D) A method that does not require an internet connection"
      ],
      correctOption: "B",
      explanation: "An HTTP method is idempotent if the intended effect on the server of multiple identical requests is the same as for a single request (GET, HEAD, PUT, DELETE)."
    },
    {
      question: "In microservices architecture, what is the role of an API Gateway?",
      options: [
        "A) Storing all database records directly in memory",
        "B) Acting as a single entry point that routes requests, handles authentication, rate limiting, and SSL termination",
        "C) Replacing the frontend browser entirely",
        "D) Monitoring hardware fan speeds on server racks"
      ],
      correctOption: "B",
      explanation: "An API Gateway sits between client apps and microservices, managing routing, composition, authentication, SSL termination, and rate limiting in one place."
    },
    {
      question: "What is Redis primarily used for in modern web architectures?",
      options: [
        "A) In-memory key-value caching, session storage, and message queuing for sub-millisecond latency",
        "B) Designing graphical user interfaces",
        "C) Long-term cold data archiving",
        "D) Transpiling modern TypeScript into JavaScript"
      ],
      correctOption: "A",
      explanation: "Redis is an open-source, in-memory data store frequently utilized as a cache, message broker, and fast session store because of its ultra-fast performance."
    }
  ],
  "Full Stack Developer": [
    {
      question: "What problem does Cross-Origin Resource Sharing (CORS) address?",
      options: [
        "A) Accelerating DNS resolution on mobile devices",
        "B) Allowing or restricting web browsers from making requests to a different domain than the one that served the web page",
        "C) Automatically translating web pages into different languages",
        "D) Enabling multiple servers to share a single CPU"
      ],
      correctOption: "B",
      explanation: "CORS is an HTTP-header based security mechanism that allows a server to indicate which origins (domain, scheme, or port) are permitted to load resources via the browser."
    },
    {
      question: "What is Server-Side Rendering (SSR) compared to Client-Side Rendering (CSR)?",
      options: [
        "A) SSR renders the initial HTML on the server before sending to the client, improving SEO and First Contentful Paint",
        "B) SSR runs JavaScript entirely on the user's local smartphone",
        "C) CSR does not require any HTML file",
        "D) SSR can only be done using PHP"
      ],
      correctOption: "A",
      explanation: "In SSR (used by frameworks like Next.js), HTML is generated on the server with data already populated, providing fast initial load times and superior SEO indexing."
    },
    {
      question: "What protocol allows bidirectional, real-time communication between client and server over a persistent connection?",
      options: [
        "A) FTP",
        "B) WebSocket",
        "C) SMTP",
        "D) DNS"
      ],
      correctOption: "B",
      explanation: "WebSockets provide full-duplex, bidirectional communication channels over a single persistent TCP connection, perfect for live chat and notifications."
    },
    {
      question: "What is the primary benefit of containerizing a full-stack application using Docker?",
      options: [
        "A) It guarantees consistency across development, staging, and production environments by packaging code and dependencies together",
        "B) It automatically writes backend unit tests",
        "C) It converts JavaScript code into native machine code",
        "D) It eliminates the need for any database"
      ],
      correctOption: "A",
      explanation: "Docker containers encapsulate the app and its exact runtime dependencies, ensuring 'it works on my machine' behavior translates reliably into production."
    },
    {
      question: "In RESTful API design, which status code should be returned when authentication fails or is missing?",
      options: [
        "A) 400 Bad Request",
        "B) 401 Unauthorized",
        "C) 403 Forbidden",
        "D) 404 Not Found"
      ],
      correctOption: "B",
      explanation: "401 Unauthorized indicates that the client request lacks valid authentication credentials, whereas 403 Forbidden means the server understands who the user is but denies permission."
    }
  ],
  "HR Interview": [
    {
      question: "What is the STAR method recommended for answering behavioral interview questions?",
      options: [
        "A) Strategy, Tactics, Action, Review",
        "B) Situation, Task, Action, Result",
        "C) Speak, Test, Analyze, Report",
        "D) Start, Track, Accelerate, Reward"
      ],
      correctOption: "B",
      explanation: "The STAR method stands for Situation (context), Task (objective/challenge), Action (specific steps you took), and Result (outcomes and business impact)."
    },
    {
      question: "How should you answer: 'What is your greatest weakness?'",
      options: [
        "A) 'I have no weaknesses; I work 24/7.'",
        "B) Share a genuine, non-critical weakness along with the proactive steps you are actively taking to improve upon it",
        "C) Blame your former company's management for your past mistakes",
        "D) State that you are bad at the core job responsibilities"
      ],
      correctOption: "B",
      explanation: "Employers look for self-awareness and a growth mindset. Acknowledging a real area of development and highlighting how you are improving shows maturity and coachability."
    },
    {
      question: "When faced with an unexpected deadline crunch and a team disagreement, what is the best professional approach?",
      options: [
        "A) Stop working until management resolves the dispute",
        "B) Prioritize critical path deliverables through objective data, open dialogue, and consensus to meet team milestones",
        "C) Publicly criticize team members in the group chat",
        "D) Silently submit incomplete work"
      ],
      correctOption: "B",
      explanation: "Effective professionals focus on collaboration, de-escalating friction with objective criteria, aligning on priorities, and delivering team success."
    },
    {
      question: "Why do interviewers ask: 'Why do you want to join our company?'",
      options: [
        "A) Just to check if you can pronounce the company name",
        "B) To evaluate if you have researched the company's mission, culture, and products, and if your career aspirations align",
        "C) To find out how fast you will request a promotion",
        "D) To verify if you have memorized their stock ticker symbol"
      ],
      correctOption: "B",
      explanation: "Interviewers want to see genuine enthusiasm, alignment with company values, and proof that you understand their mission and product ecosystem."
    },
    {
      question: "At the end of an interview, what is the best response when asked: 'Do you have any questions for us?'",
      options: [
        "A) 'No, I have nothing to ask.'",
        "B) Ask thoughtful questions about team culture, upcoming technical challenges, and what success looks like in the first 90 days",
        "C) Ask immediately how many sick days you get before learning about the role",
        "D) Ask the interviewer personal questions unrelated to work"
      ],
      correctOption: "B",
      explanation: "Asking engaged questions demonstrates genuine interest in the role, long-term commitment, and allows you to assess if the company is the right fit for you."
    }
  ],
  "DSA": [
    {
      question: "What is the average time complexity of searching for an element in a Hash Table?",
      options: [
        "A) O(log n)",
        "B) O(1)",
        "C) O(n)",
        "D) O(n log n)"
      ],
      correctOption: "B",
      explanation: "Hash tables offer average O(1) constant time lookup, insertion, and deletion assuming a good hash function that minimizes collisions."
    },
    {
      question: "Which data structure operates on a Last In, First Out (LIFO) principle?",
      options: [
        "A) Queue",
        "B) Stack",
        "C) Binary Search Tree",
        "D) Linked List"
      ],
      correctOption: "B",
      explanation: "A Stack follows the Last-In-First-Out (LIFO) model, where elements are pushed and popped from the same top end."
    },
    {
      question: "What is the worst-case time complexity of QuickSort?",
      options: [
        "A) O(n)",
        "B) O(n log n)",
        "C) O(n²)",
        "D) O(2ⁿ)"
      ],
      correctOption: "C",
      explanation: "QuickSort exhibits O(n²) worst-case complexity when the selected pivot is repeatedly the smallest or largest element (e.g. on already sorted arrays without random pivot)."
    },
    {
      question: "Which traversal of a Binary Search Tree (BST) visits nodes in ascending sorted order?",
      options: [
        "A) Pre-order Traversal (Root, Left, Right)",
        "B) In-order Traversal (Left, Root, Right)",
        "C) Post-order Traversal (Left, Right, Root)",
        "D) Level-order Traversal (Breadth-First)"
      ],
      correctOption: "B",
      explanation: "An In-order traversal visits the left subtree, the current node, and then the right subtree, producing strictly non-decreasing sorted order for any valid BST."
    },
    {
      question: "What algorithmic paradigm does the Merge Sort algorithm use?",
      options: [
        "A) Greedy Algorithm",
        "B) Dynamic Programming",
        "C) Divide and Conquer",
        "D) Backtracking"
      ],
      correctOption: "C",
      explanation: "Merge Sort recursively divides the array into two halves until single elements remain, sorts each half, and conquers by merging them back together."
    }
  ]
};

// Fallback bank for Realistic Open-Ended Conversational Interviews (No MCQ options)
const FALLBACK_OPEN_ENDED_BANK = {
  "Frontend Developer": [
    {
      question: "How does React's Virtual DOM diffing algorithm work under the hood, and how do you use useMemo, useCallback, or React.memo to prevent unnecessary re-renders in performance-critical components?",
      options: [],
      correctOption: "",
      explanation: "A strong candidate should explain: 1) The Virtual DOM is an in-memory tree representation of the UI; React compares trees using a reconciliation algorithm (heuristic O(n) diffing based on element types and keys). 2) useMemo memoizes computed values, useCallback memoizes function references, and React.memo prevents component re-renders if props have not changed by shallow reference comparison."
    },
    {
      question: "Can you explain the architectural difference between managing state with React Context API versus a global state library like Redux Toolkit or Zustand? How do you prevent broad re-renders when using Context?",
      options: [],
      correctOption: "",
      explanation: "A strong candidate should discuss: Context API is best for low-velocity state (themes, auth state) because any change re-renders all consumers subscribed to that context provider. Dedicated state libraries (Redux Toolkit, Zustand) support selective atomic subscriptions, middleware, DevTools, and high-frequency updates without triggering full component tree re-renders."
    },
    {
      question: "What strategies and metrics do you use to optimize client-side web application performance and Core Web Vitals (LCP, FID/INP, CLS)?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: Code splitting and route-based lazy loading with dynamic imports; optimizing images with modern formats (WebP/AVIF) and explicit dimensions to eliminate CLS; asset caching and CDN distribution; minimizing blocking JavaScript to improve INP/FID; and measuring via Lighthouse and Web Vitals analytics."
    },
    {
      question: "How do you handle asynchronous data fetching, caching, loading skeletons, and error boundaries in a modern React application?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: Using React Query / TanStack Query, RTK Query, or custom hooks to handle stale-while-revalidate caching, pagination, and retry logic. Utilizing React Error Boundaries to gracefully catch render lifecycle errors without crashing the entire app, paired with skeleton loaders for smooth UX."
    },
    {
      question: "What web security vulnerabilities are most relevant to frontend developers (such as XSS, CSRF, and Clickjacking), and what concrete measures do you implement to prevent them?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: Mitigating XSS through React's automatic escaping, sanitizing raw HTML with DOMPurify, and enforcing strict Content Security Policy (CSP) headers. Mitigating CSRF with SameSite cookie attributes (SameSite=Strict/Lax) and anti-CSRF tokens. Mitigating Clickjacking via X-Frame-Options: DENY/SAMEORIGIN."
    },
    {
      question: "Walk me through how the browser event propagation lifecycle works (capturing, target, bubbling), and explain how event delegation works with an example.",
      options: [],
      correctOption: "",
      explanation: "Key concepts: Event flow travels down the DOM tree from Window to target (capture phase), triggers on the target element, and then propagates back up (bubble phase). Event delegation attaches a single event listener to a common ancestor element to handle events for current and future child elements dynamically using event.target, minimizing memory overhead."
    },
    {
      question: "What is the difference between Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG) in frameworks like Next.js? When would you choose each?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: CSR renders everything in the browser (fast navigation once loaded, but slower initial page load and poor SEO). SSR renders HTML on every request on the server (ideal for dynamic, personalized, SEO-critical content). SSG compiles HTML ahead of time at build time (maximum CDN cacheability, best for blogs/marketing sites)."
    },
    {
      question: "Describe a challenging UI/UX or performance bug you encountered in a recent project. What was your systematic process to diagnose, debug, and fix it?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: STAR method response (Situation, Task, Action, Result). Using browser DevTools (Performance profiler, Network tab, React DevTools Profiler), isolating the issue, implementing an architectural or memoization fix, validating with benchmarks, and adding regression tests."
    }
  ],
  "Backend Developer": [
    {
      question: "How does the Node.js Event Loop work, and how does it handle non-blocking asynchronous I/O while executing on a single main thread?",
      options: [],
      correctOption: "",
      explanation: "A strong candidate should explain: 1) Node.js runs JavaScript on a single thread using the V8 engine, but offloads asynchronous I/O operations (file system, DNS, crypto, network) to the C++ libuv library and thread pool. 2) The Event Loop operates in distinct phases: Timers (setTimeout), Pending Callbacks, Poll (I/O events), Check (setImmediate), and Close callbacks, with process.nextTick and Promise microtasks running between phases."
    },
    {
      question: "When designing a secure RESTful API or backend service, how do you architect authentication, password hashing, and session management using JWTs or cookies?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: Passwords hashed with bcrypt or Argon2 using salt; short-lived access tokens (JWTs) paired with long-lived refresh tokens stored in secure, HTTP-only, SameSite cookies to protect against XSS and CSRF; token rotation and blacklisting/revocation mechanisms upon logout; and centralized auth middleware for route protection."
    },
    {
      question: "How would you optimize a slow database query in MongoDB or PostgreSQL? Walk me through indexing, query execution plans, and schema trade-offs.",
      options: [],
      correctOption: "",
      explanation: "Key concepts: Running EXPLAIN ANALYZE or explain('executionStats') to identify full table scans (COLLSCAN / Seq Scan); adding targeted single-field or compound indexes following the Equality-Sort-Range (ESR) rule; covering index queries; avoiding N+1 queries using joins or population; and denormalization/caching where appropriate."
    },
    {
      question: "What is database connection pooling, and why is it essential when scaling high-concurrency production backend applications?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: Establishing a new TCP and TLS handshake connection to a database has significant CPU, memory, and latency overhead. A connection pool maintains an active pool of open, reusable connections that worker processes check out and return, preventing database exhaustion and connection timeouts under traffic spikes."
    },
    {
      question: "Explain how you implement caching strategies using Redis in a backend application. How do you handle cache invalidation, cache stampedes, and TTL?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: Cache-aside (lazy loading) pattern where server checks Redis first, fetches from database on miss, and writes to Redis with a Time-To-Live (TTL). Cache invalidation upon writes/updates. Preventing cache stampedes using distributed locks (Redlock) or probabilistic early expiration."
    },
    {
      question: "How do you ensure data consistency, atomicity, and rollback capabilities during multi-step transactions in your database?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: ACID transactions using SQL BEGIN/COMMIT/ROLLBACK or MongoDB multi-document sessions with startTransaction(). In distributed systems, utilizing the Saga pattern (compensating transactions) or two-phase commit (2PC) to maintain eventual consistency without long-lived blocking locks."
    },
    {
      question: "How do you architect error handling, centralized logging, and rate limiting in Express.js or Node to protect production servers?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: Centralized error handling middleware capturing operational vs programmer errors; structured JSON logging with Winston or Pino; rate limiting with express-rate-limit backed by Redis to mitigate brute-force and DDoS; and helmet middleware for security headers."
    },
    {
      question: "Explain the difference between horizontal and vertical scaling, and describe how you would design a backend to handle a 10x traffic spike.",
      options: [],
      correctOption: "",
      explanation: "Key concepts: Vertical scaling adds CPU/RAM to a single machine (hardware limits, single point of failure); horizontal scaling adds stateless application server instances behind a load balancer (Nginx, AWS ALB). Stateless session management (JWTs/Redis), database read replicas, connection pooling, and background worker queues."
    }
  ],
  "Full Stack Developer": [
    {
      question: "Can you walk me through the end-to-end architecture of a full-stack application you built? How do the frontend, API layer, database, and background tasks communicate?",
      options: [],
      correctOption: "",
      explanation: "A strong candidate should articulate: Client UI architecture (React/Next.js), REST/GraphQL communication layer with centralized Axios/fetch clients, Node/Express or Python backend with MVC/controller-service-repository patterns, database models (Mongoose/Prisma/SQL), and background asynchronous job queues (BullMQ/Redis) for heavy tasks."
    },
    {
      question: "How do you handle file uploads (e.g. PDF resumes or images) end-to-end: from client input, multer processing, file validation, to secure cloud storage and text extraction?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: Client-side validation (file size and MIME type checks); server-side multipart/form-data parsing with Multer (memory storage buffer vs disk); magic byte validation to prevent malicious executables; offloading files to cloud object storage (AWS S3) or parsing buffers in memory (e.g. pdf-parse, mammoth); and handling memory cleanup and error edge cases."
    },
    {
      question: "How do WebSockets or Server-Sent Events (SSE) compare to traditional HTTP polling for real-time applications like live chat, interview streaming, or notifications?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: HTTP polling repeatedly opens TCP connections with heavy header overhead. SSE provides a unidirectional persistent HTTP stream from server to client, ideal for live tickers and notifications. WebSockets provide full-duplex, bidirectional, low-latency communication over a single persistent TCP connection, ideal for real-time collaborative editing, gaming, and interactive streaming."
    },
    {
      question: "How do you manage database schema migrations and zero-downtime deployments when changing data models in a live production environment?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: Expand-and-contract (two-phase) migration pattern: 1) Expand by adding new columns/fields that are backward-compatible. 2) Deploy new application code that writes to both old and new schemas. 3) Backfill historical data. 4) Contract by deprecating and dropping old columns. Blue/green or rolling deployments behind a load balancer."
    },
    {
      question: "What security checklist do you follow before taking a full-stack web application to production?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: HTTPS/TLS enforcement, Content Security Policy (CSP), CORS whitelisting, HTTP-only secure cookies, rate limiting on auth endpoints, input sanitization and parameter binding to stop SQL/NoSQL injection, environment secret protection (no keys in git), and automated dependency vulnerability scanning (npm audit / Snyk)."
    }
  ],
  "DSA": [
    {
      question: "Can you explain how a Hash Table works internally, how collisions are resolved (chaining vs open addressing), and why average lookup is O(1) while worst case is O(n)?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: A hash function maps keys to array bucket indices. Collisions occur when different keys produce identical indices, resolved via separate chaining (linked lists or self-balancing trees in Java 8+) or open addressing (linear probing, quadratic probing). Average lookup is O(1) when the load factor is low; worst case degrades to O(n) if all keys hash to the same bucket."
    },
    {
      question: "What is the difference between Depth-First Search (DFS) and Breadth-First Search (BFS) on a graph? When would you use BFS over DFS?",
      options: [],
      correctOption: "",
      explanation: "Key concepts: BFS explores neighbor nodes level by level using a Queue, guaranteeing the shortest path on unweighted graphs. DFS explores deeply down a branch using a Stack or recursion, ideal for topological sorting, cycle detection, pathfinding in mazes, and connected components."
    },
    {
      question: "Explain the Two Pointer technique and the Sliding Window technique with an example problem where they reduce time complexity from O(n²) to O(n).",
      options: [],
      correctOption: "",
      explanation: "Key concepts: Two Pointer uses two pointers converging or moving in parallel (e.g. finding pairs with target sum in sorted array). Sliding Window maintains a contiguous subarray window with start and end pointers (e.g. longest substring without repeating characters), dynamically expanding and contracting to process elements in a single O(n) pass."
    }
  ],
  "HR & Behavioral": [
    {
      question: "Can you tell me about yourself, your background in software engineering, and why you are interested in this position?",
      options: [],
      correctOption: "",
      explanation: "Candidate should deliver a structured 90-second elevator pitch: 1) Brief summary of current technical role and key focus areas, 2) 1-2 major impactful projects or achievements, and 3) Clear motivation for why this specific opportunity aligns with their career aspirations."
    },
    {
      question: "Describe a situation where you had a strong technical disagreement with a team member or product manager. How did you handle it and what was the outcome?",
      options: [],
      correctOption: "",
      explanation: "Uses STAR method (Situation, Task, Action, Result). Demonstrates empathy, active listening, reliance on objective data and user impact rather than ego, seeking consensus or committing to the team decision constructively."
    },
    {
      question: "Tell me about a time you worked on a project with vague or changing requirements under a tight deadline. How did you prioritize and deliver?",
      options: [],
      correctOption: "",
      explanation: "Uses STAR method. Shows proactive stakeholder communication, breaking down ambiguous goals into high-priority MVP milestones, managing technical debt trade-offs, and delivering on schedule."
    }
  ]
};

const callAI = async (prompt, timeoutMs = 12000) => {
  const model = process.env.OPENROUTER_MODEL || "openrouter/free";
  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "AI Mock Interview App",
        },
        timeout: timeoutMs,
        signal: AbortSignal.timeout(timeoutMs),
      }
    );

    if (
      !response.data ||
      !response.data.choices ||
      !response.data.choices[0] ||
      !response.data.choices[0].message
    ) {
      throw new Error("Invalid response format from OpenRouter AI");
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    const errorDetails = error.response?.data?.error?.message || error.message;
    console.error("OpenRouter API Error or Timeout:", errorDetails);
    throw new Error(`AI service error: ${errorDetails}`);
  }
};

// Helper: Ensure 4 properly formatted options (A, B, C, D) for MCQ mode
const formatOptions = (rawOptions) => {
  if (!Array.isArray(rawOptions) || rawOptions.length === 0) {
    return [
      "A) Standard implementation approach",
      "B) Optimized architectural pattern",
      "C) Alternative asynchronous method",
      "D) Default fallback configuration",
    ];
  }

  const letters = ["A", "B", "C", "D"];
  const formatted = [];

  for (let i = 0; i < 4; i++) {
    const raw = rawOptions[i] || `Alternative option ${i + 1}`;
    const cleaned = raw.replace(/^[A-Da-d][\)\.\:\-]\s*/, "").trim();
    formatted.push(`${letters[i]}) ${cleaned}`);
  }

  return formatted;
};

// 1. Generate questions (Supports both Conversational Open-Ended and MCQ Quiz modes)
export const generateQuestions = async (
  role,
  difficulty = "Medium",
  count = 10,
  mode = "open-ended"
) => {
  const safeCount = Math.min(Math.max(Number(count) || 10, 3), 20);
  const isOpenEnded = mode === "open-ended";

  let prompt = "";
  if (isOpenEnded) {
    prompt = `You are a senior technical interviewer at a tier-1 technology company conducting a realistic mock interview.
Generate exactly ${safeCount} realistic, open-ended technical interview questions for the role "${role}" at "${difficulty}" difficulty level.

CRITICAL RULES:
1. These are CONVERSATIONAL OPEN-ENDED INTERVIEW QUESTIONS (NO multiple choice options, NO A/B/C/D).
2. The candidate will speak or write their answer freely.
3. Each question should test deep architectural understanding, problem-solving, or production best practices.
4. For EACH question, provide an "explanation" containing the comprehensive model answer guide and key evaluation criteria.
5. "options" MUST be an empty array [].
6. "correctOption" MUST be "".

Return ONLY a valid JSON array of objects (no markdown, no backticks):
[
  {
    "question": "Clear, practical open-ended technical interview question?",
    "options": [],
    "correctOption": "",
    "explanation": "Expected key concepts and model answer: The candidate should explain..."
  }
]`;
  } else {
    prompt = `You are a world-class technical interviewer.
Generate exactly ${safeCount} multiple-choice interview questions for the role "${role}" at "${difficulty}" difficulty level.

Every single question MUST have exactly 4 distinct options (A, B, C, D), a specified correctOption ("A", "B", "C", or "D"), and a short high-yield explanation.

Return ONLY a valid JSON array of objects (no markdown, no backticks):
[
  {
    "question": "Clear question text?",
    "options": [
      "A) First option text",
      "B) Second option text",
      "C) Third option text",
      "D) Fourth option text"
    ],
    "correctOption": "A",
    "explanation": "Clear explanation of why this answer is correct."
  }
]`;
  }

  let aiQuestions = [];

  try {
    const text = await callAI(prompt, 12000);
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }

    const startIdx = jsonStr.indexOf("[");
    const endIdx = jsonStr.lastIndexOf("]");
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = jsonStr.substring(startIdx, endIdx + 1);
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        aiQuestions = parsed.map((item, idx) => {
          if (isOpenEnded) {
            return {
              question: item.question || `${role} Interview Question ${idx + 1}`,
              options: [],
              correctOption: "",
              explanation:
                item.explanation ||
                "Expected comprehensive technical answer covering architecture, best practices, and trade-offs.",
            };
          } else {
            const opts = formatOptions(item.options);
            let correct = (item.correctOption || "A").trim().toUpperCase().charAt(0);
            if (!["A", "B", "C", "D"].includes(correct)) correct = "A";
            return {
              question: item.question || `${role} Multiple Choice Question ${idx + 1}`,
              options: opts,
              correctOption: correct,
              explanation: item.explanation || "Correct choice based on industry standard best practices.",
            };
          }
        });
      }
    }
  } catch (err) {
    console.warn("AI Question generation returned error or timed out, utilizing intelligent bank fallback:", err.message);
  }

  if (aiQuestions.length >= safeCount) {
    return aiQuestions.slice(0, safeCount);
  }

  // Fallback lookup
  const normalizedRole =
    Object.keys(isOpenEnded ? FALLBACK_OPEN_ENDED_BANK : FALLBACK_QUESTION_BANK).find(
      (k) => k.toLowerCase() === role.toLowerCase()
    ) || "Frontend Developer";

  const bank = isOpenEnded
    ? FALLBACK_OPEN_ENDED_BANK[normalizedRole] || FALLBACK_OPEN_ENDED_BANK["Frontend Developer"]
    : FALLBACK_QUESTION_BANK[normalizedRole] || FALLBACK_QUESTION_BANK["Frontend Developer"];

  const shuffledBank = [...bank].sort(() => 0.5 - Math.random());
  const combined = [...aiQuestions];

  for (const q of shuffledBank) {
    if (combined.length >= safeCount) break;
    if (!combined.some((item) => item.question === q.question)) {
      combined.push({
        question: q.question,
        options: isOpenEnded ? [] : formatOptions(q.options),
        correctOption: isOpenEnded ? "" : q.correctOption,
        explanation: q.explanation,
      });
    }
  }

  while (combined.length < safeCount && bank.length > 0) {
    const q = bank[combined.length % bank.length];
    combined.push({
      question: `${q.question} (In-Depth Scenario)`,
      options: isOpenEnded ? [] : formatOptions(q.options),
      correctOption: isOpenEnded ? "" : q.correctOption,
      explanation: q.explanation,
    });
  }

  return combined.slice(0, safeCount);
};

// 1b. Generate interview questions directly tailored from uploaded Resume text
// Defaults to "open-ended" (no options) for a genuine mock interview experience!
export const generateResumeInterviewQuestions = async (
  resumeText,
  difficulty = "Adaptive",
  count = 5,
  mode = "open-ended"
) => {
  const safeCount = Math.min(Math.max(Number(count) || 5, 3), 20);
  const truncatedResume = (resumeText || "").slice(0, 6500);
  const isOpenEnded = mode === "open-ended";

  let prompt = "";
  if (isOpenEnded) {
    prompt = `You are an experienced HR Director and Senior Technical Hiring Manager conducting a realistic, spoken mock interview tailored strictly to a candidate's uploaded resume.

CANDIDATE'S RESUME CONTENT:
"""
${truncatedResume}
"""

YOUR INSTRUCTIONS:
1. Automatically analyze the resume to identify:
   - The candidate's target job title / role based on their experiences and skills (e.g. "Full Stack Developer", "Frontend Engineer", "Node.js Backend Developer", "Data Scientist", "DevOps Engineer", etc.)
   - The candidate's estimated seniority / experience level (e.g. "Fresher / Entry-Level", "Mid-Level", "Senior Engineer", "Lead Developer") based on their graduation year, total years of work experience, and complexity of projects.
   - All technologies, languages, frameworks, and databases explicitly mentioned (e.g. React, Node.js, Express, MongoDB, TypeScript, Docker, PostgreSQL, etc.)
   - Specific projects, architecture highlights, or achievements described in the resume.

2. Dynamically calibrate the interview depth and question complexity to naturally match the candidate's detected experience level on their resume (adaptive difficulty):
   - For Freshers/Junior: Focus on core fundamentals, their actual project implementations, edge-case debugging, and practical problem solving.
   - For Mid/Senior: Focus on system architecture, data flow, performance bottlenecks, trade-offs, security, and scalability under load.

3. Generate exactly ${safeCount} realistic, conversational interview questions that an HR & Tech Lead ask in an actual interview:
   CRITICAL RULES:
   - QUESTION 1 MUST BE A WARM INTRODUCTION / ICEBREAKER:
     Start by greeting the candidate warmly, referencing their role/background detected from their resume, and asking them to introduce themselves, walk through their engineering journey, and highlight key milestones from their resume.
     Example: "Hello! Welcome to your interview. I went through your resume and noticed your background in [Core Tech / Role]. To begin our conversation, could you please introduce yourself, walk me through your engineering journey, and highlight the key achievements from your resume?"
   - QUESTION 2 (PROJECT DEEP-DIVE):
     Deep-dive into a specific project from their resume:
     "In your resume, you highlighted [Project Name]. Can you walk me through the system architecture, your individual contribution, and how you designed the data flow?"
   - QUESTION 3 (REAL-WORLD BUG / BOTTLENECK / CHALLENGE):
     "While building [Project Name] or working with [Key Tech from resume], what was the most challenging technical hurdle, bug, or performance bottleneck you faced, and how did you resolve it?"
   - QUESTION 4 (PRACTICAL IMPLEMENTATION & BEST PRACTICES):
     "You listed [Skill 1] and [Skill 2] on your resume. How do you implement these in production environments, and what state management, security, or performance best practices do you follow?"
   - QUESTION 5 (BEHAVIORAL / SYSTEM DESIGN / SCALE SCENARIOS):
     Probe other specific skills, deployment/CI-CD, error handling, system scaling, and database optimizations mentioned on their resume.
   - These are REAL CONVERSATIONAL SPOKEN INTERVIEW QUESTIONS (NO multiple-choice options, NO A, B, C, D choices!). The candidate will speak their answer out loud into the microphone.
   - For EACH question, provide an "explanation" containing the core expected technical concepts and model answer guide that you will use to grade their spoken response.
   - Set "options": [] (empty array).
   - Set "correctOption": "" (empty string).

Return ONLY a valid JSON object (no markdown, no backticks):
{
  "detectedRole": "Detected Role based on resume",
  "detectedDifficulty": "Detected Seniority (e.g. Fresher / Entry-Level, Mid-Level, or Senior)",
  "extractedSkills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"],
  "identifiedProjects": ["Project name or highlight 1", "Project highlight 2"],
  "questions": [
    {
      "question": "Conversational question text?",
      "options": [],
      "correctOption": "",
      "explanation": "Expected key concepts and model answer: The candidate should explain..."
    }
  ]
}`;
  } else {
    prompt = `You are an elite technical interviewer conducting a mock interview tailored strictly to a candidate's uploaded resume.

CANDIDATE'S RESUME CONTENT:
"""
${truncatedResume}
"""

YOUR INSTRUCTIONS:
1. Automatically analyze the resume to identify target role, skills, and projects.
2. Generate exactly ${safeCount} multiple-choice interview questions (${difficulty} difficulty level) with 4 options (A, B, C, D) per question.

Return ONLY a valid JSON object (no markdown, no backticks):
{
  "detectedRole": "Candidate Role / Title based on resume",
  "extractedSkills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"],
  "identifiedProjects": ["Project name 1", "Project name 2"],
  "questions": [
    {
      "question": "Question text directly testing their resume?",
      "options": [
        "A) Option 1",
        "B) Option 2",
        "C) Option 3",
        "D) Option 4"
      ],
      "correctOption": "A",
      "explanation": "Clear explanation of why this answer is correct."
    }
  ]
}`;
  }

  let parsedResult = null;

  try {
    const text = await callAI(prompt, 14000);
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }

    const startIdx = jsonStr.indexOf("{");
    const endIdx = jsonStr.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = jsonStr.substring(startIdx, endIdx + 1);
      const parsed = JSON.parse(jsonStr);

      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        const validatedQuestions = parsed.questions.map((q, idx) => {
          if (isOpenEnded) {
            return {
              question: q.question || `Resume Technical Question ${idx + 1}`,
              options: [],
              correctOption: "",
              explanation:
                q.explanation ||
                "Expected answer should demonstrate practical experience, system design understanding, and clean code principles.",
            };
          } else {
            const opts = formatOptions(q.options);
            let correct = (q.correctOption || "A").trim().toUpperCase().charAt(0);
            if (!["A", "B", "C", "D"].includes(correct)) correct = "A";
            return {
              question: q.question || `Resume Technical Question ${idx + 1}`,
              options: opts,
              correctOption: correct,
              explanation: q.explanation || "Correct choice based on industry best practices.",
            };
          }
        });

        parsedResult = {
          detectedRole: parsed.detectedRole || "Resume Technical Profile",
          detectedDifficulty:
            parsed.detectedDifficulty || "Adaptive (Resume Analyzed)",
          extractedSkills: Array.isArray(parsed.extractedSkills)
            ? parsed.extractedSkills.slice(0, 10)
            : [],
          identifiedProjects: Array.isArray(parsed.identifiedProjects)
            ? parsed.identifiedProjects.slice(0, 5)
            : [],
          questions: validatedQuestions,
        };
      }
    }
  } catch (err) {
    console.warn(
      "AI Resume Question generation returned error or timed out, utilizing smart skill detection fallback:",
      err.message
    );
  }

  if (parsedResult && parsedResult.questions.length >= safeCount) {
    parsedResult.questions = parsedResult.questions.slice(0, safeCount);
    return parsedResult;
  }

  // Fallback: Detect skills and projects from resume text
  const detectedSkills = [];
  const commonTech = [
    "React",
    "Node.js",
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "MongoDB",
    "PostgreSQL",
    "SQL",
    "Docker",
    "AWS",
    "Git",
    "HTML",
    "CSS",
    "Express",
    "Redux",
    "Tailwind",
    "Next.js",
    "GraphQL",
    "Kubernetes",
    "Linux",
    "C++",
  ];
  const lowerText = truncatedResume.toLowerCase();
  for (const tech of commonTech) {
    if (lowerText.includes(tech.toLowerCase())) {
      detectedSkills.push(tech);
    }
  }

  // Detect role or title
  let detectedRole = "Full Stack Developer";
  if (lowerText.includes("frontend") || lowerText.includes("react developer")) {
    detectedRole = "Frontend Developer";
  } else if (
    lowerText.includes("backend") ||
    lowerText.includes("node") ||
    lowerText.includes("python")
  ) {
    detectedRole = "Backend Developer";
  } else if (lowerText.includes("data scientist") || lowerText.includes("machine learning")) {
    detectedRole = "Data Science & AI";
  } else if (lowerText.includes("devops") || lowerText.includes("cloud")) {
    detectedRole = "DevOps & Cloud Engineer";
  }

  // Detect project mentions
  const identifiedProjects = [];
  const projectRegex = /(?:project[s]?:?|developed|built|created)\s+([A-Z][A-Za-z0-9\s]{2,30})/gi;
  let match;
  while ((match = projectRegex.exec(truncatedResume)) !== null && identifiedProjects.length < 3) {
    const candidateName = match[1].trim();
    if (candidateName.length > 3 && !identifiedProjects.includes(candidateName)) {
      identifiedProjects.push(candidateName);
    }
  }
  if (identifiedProjects.length === 0) {
    identifiedProjects.push("Resume Projects & Work Experience");
  }

  // Generate fallback resume questions with HR Introduction flow
  const generatedFallbackQuestions = [];
  if (isOpenEnded) {
    // Question 1: Always the Warm HR Introduction / Elevator Pitch
    generatedFallbackQuestions.push({
      question: `Hello! Welcome to your interview. I have reviewed your resume and see you have experience as a ${detectedRole}${detectedSkills.length > 0 ? ` working with ${detectedSkills.slice(0, 3).join(", ")}` : ""}. To get started, could you please introduce yourself, walk me through your engineering journey, and highlight key projects from your resume?`,
      options: [],
      correctOption: "",
      explanation: `Candidate should deliver a structured 60-90 second introduction covering: 1) Who they are, 2) Their educational/technical background, 3) Key areas of expertise from their resume, and 4) Why they are passionate about this role.`,
    });

    // Question 2: Project Deep Dive
    if (identifiedProjects.length > 0 && identifiedProjects[0] !== "Resume Projects & Work Experience") {
      generatedFallbackQuestions.push({
        question: `In your resume, you highlighted your work on "${identifiedProjects[0]}". Can you walk me through the system architecture of this project, how you designed the data flow, and what the biggest technical challenge was?`,
        options: [],
        correctOption: "",
        explanation: `Candidate should structure their response covering: 1) High-level architecture and tech stack choices, 2) Data flow between frontend, backend, and database, 3) Specific bottleneck or bug faced and how it was systematically resolved.`,
      });
    }

    // Question 3 & 4: Core Tech Stack Deep Dives
    const sampleSkills = detectedSkills.length > 0 ? detectedSkills : ["React", "Node.js", "MongoDB", "SQL"];
    sampleSkills.forEach((skill) => {
      if (generatedFallbackQuestions.length < safeCount - 1) {
        generatedFallbackQuestions.push({
          question: `You listed ${skill} prominently on your resume. How do you implement ${skill} in production environments, and what state management, security, or performance best practices do you follow?`,
          options: [],
          correctOption: "",
          explanation: `Expected key concepts: Candidate should demonstrate hands-on production expertise with ${skill}, discussing error handling, performance optimization, caching, and maintainability.`,
        });
      }
    });

    // Question 5: Behavioral / Scenario Question
    if (generatedFallbackQuestions.length < safeCount) {
      generatedFallbackQuestions.push({
        question: `Tell me about a time in your past projects or work where you encountered an unexpected technical roadblock or tight deadline. How did you prioritize, debug, and deliver?`,
        options: [],
        correctOption: "",
        explanation: `Candidate should use the STAR method (Situation, Task, Action, Result) demonstrating problem solving, calm decision-making, and communication.`,
      });
    }

    // Fill remaining with standard open-ended questions for the detected role
    const roleQuestions = await generateQuestions(detectedRole, difficulty, safeCount, "open-ended");
    for (const q of roleQuestions) {
      if (generatedFallbackQuestions.length >= safeCount) break;
      if (!generatedFallbackQuestions.some((item) => item.question === q.question)) {
        generatedFallbackQuestions.push(q);
      }
    }
  } else {
    // MCQ fallback
    const bankQuestions = await generateQuestions(detectedRole, difficulty, safeCount, "mcq");
    generatedFallbackQuestions.push(...bankQuestions);
  }

  // Detect seniority level for fallback
  let fallbackDifficulty = "Mid-Level";
  if (
    lowerText.includes("senior") ||
    lowerText.includes("lead") ||
    lowerText.includes("architect") ||
    lowerText.includes("5+ years") ||
    lowerText.includes("6+ years")
  ) {
    fallbackDifficulty = "Senior Level";
  } else if (
    lowerText.includes("intern") ||
    lowerText.includes("fresher") ||
    lowerText.includes("student") ||
    lowerText.includes("b.tech") ||
    lowerText.includes("btech") ||
    lowerText.includes("2024") ||
    lowerText.includes("2025") ||
    lowerText.includes("2026")
  ) {
    fallbackDifficulty = "Entry-Level / Fresher";
  }

  const finalQuestions =
    parsedResult && parsedResult.questions.length > 0
      ? [...parsedResult.questions, ...generatedFallbackQuestions].slice(0, safeCount)
      : generatedFallbackQuestions.slice(0, safeCount);

  return {
    detectedRole:
      (parsedResult && parsedResult.detectedRole) ||
      `${detectedRole} (Resume-Tailored)`,
    detectedDifficulty:
      (parsedResult && parsedResult.detectedDifficulty) ||
      fallbackDifficulty,
    extractedSkills:
      parsedResult && parsedResult.extractedSkills && parsedResult.extractedSkills.length > 0
        ? parsedResult.extractedSkills
        : detectedSkills.length > 0
        ? detectedSkills
        : ["Core Software Engineering", "System Architecture", "API Design"],
    identifiedProjects:
      (parsedResult && parsedResult.identifiedProjects) || identifiedProjects,
    questions: finalQuestions,
  };
};

// 2. Evaluate answer (Handles both Open-Ended Conversational Spoken/Written Answers AND MCQ Options)
export const evaluateAnswer = async (questionData, answer = "", selectedOption = "") => {
  const { question, options = [], correctOption = "", explanation = "" } = questionData;
  const cleanAnswer = (answer || "").trim();

  // If question has no options OR candidate answered without choosing an option:
  // Evaluate as an Open-Ended conversational interview answer
  const isOpenEnded = (!options || options.length === 0) || !selectedOption;

  if (isOpenEnded) {
    if (!cleanAnswer) {
      return {
        score: 0,
        feedback: "No answer was provided. Please speak into your microphone or type your response to receive evaluation.",
        isCorrect: false,
        correctOption: "",
      };
    }

    try {
      const prompt = `You are an expert senior technical interviewer evaluating a candidate's answer in a realistic mock interview.

Technical Question: "${question}"
Core Expected Concepts & Model Answer Guide: "${explanation || "Accurate domain knowledge, production best practices, and clear technical explanation."}"
Candidate's Spoken / Written Answer: "${cleanAnswer}"

Evaluation Rubric (Score 0 to 10):
- 9-10: Exceptional mastery, clear structure, covers key concepts, edge-cases, and practical experience.
- 7-8: Strong, correct answer covering core points with good technical understanding.
- 5-6: Partially correct or foundational, but missed some important nuances or depth.
- 3-4: Very brief, vague, or contains noticeable misconceptions.
- 0-2: Completely off-topic, incorrect, or irrelevant.

Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "score": 8,
  "verdict": "Strong Answer",
  "feedback": "2-3 constructive sentences covering what the candidate explained well, what specific technical nuance was missing, and actionable advice.",
  "idealAnswer": "A concise 2-sentence summary of the ideal model answer."
}`;

      const aiResponse = await callAI(prompt, 9000);
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const score = Math.min(Math.max(Number(parsed.score) || 7, 0), 10);
        const feedbackCombined = `${parsed.feedback || ""}\n\n💡 Ideal Model Answer: ${parsed.idealAnswer || explanation}`;
        return {
          score,
          feedback: feedbackCombined.trim(),
          isCorrect: score >= 6,
          correctOption: "",
        };
      }
    } catch (err) {
      console.warn("AI open answer grading fallback:", err.message);
      // Smart fallback keyword and length grading
      const lowerAns = cleanAnswer.toLowerCase();
      const lowerExp = (explanation || "").toLowerCase();
      const expWords = lowerExp.split(/\s+/).filter((w) => w.length > 4);
      const matchCount = expWords.filter((w) => lowerAns.includes(w)).length;
      const wordCount = cleanAnswer.split(/\s+/).length;

      let score = 7;
      if (wordCount >= 35 && matchCount >= 3) score = 9;
      else if (wordCount >= 20 && matchCount >= 2) score = 8;
      else if (wordCount >= 10 || matchCount >= 1) score = 7;
      else if (wordCount >= 5) score = 6;
      else score = 5;

      return {
        score,
        feedback: `🗣️ Candidate Response Evaluated (${score}/10): Your explanation covers important foundational aspects.\n\n💡 Ideal Model Answer: ${explanation || "Practice expanding on production trade-offs, architecture, and edge-cases."}`,
        isCorrect: score >= 6,
        correctOption: "",
      };
    }
  }

  // Otherwise, evaluate 4-Option selection (fast MCQ evaluation)
  const targetCorrect = (correctOption || "A").trim().toUpperCase().charAt(0);
  const correctOptionText = options.find((o) => o.startsWith(targetCorrect)) || `Option ${targetCorrect}`;
  let userChoice = (selectedOption || "").trim().toUpperCase().charAt(0);

  if (!["A", "B", "C", "D"].includes(userChoice)) {
    const match = cleanAnswer.match(/^([A-D])[\)\.\:\-]/i);
    if (match) {
      userChoice = match[1].toUpperCase();
    } else {
      const idx = options.findIndex((opt) =>
        opt.toLowerCase().includes(cleanAnswer.toLowerCase())
      );
      if (idx !== -1) {
        userChoice = ["A", "B", "C", "D"][idx];
      }
    }
  }

  const isCorrect = userChoice && userChoice === targetCorrect;
  const baseScore = isCorrect ? 10 : 0;
  const userOptionText = options.find((o) => o.startsWith(userChoice)) || `Option ${userChoice || "None"}`;

  let feedbackText = "";
  if (isCorrect) {
    feedbackText = `🎯 Spot on! Option ${targetCorrect} is the correct answer.\n\n📖 Concept Insight: ${explanation}`;
  } else {
    feedbackText = `❌ Incorrect. You selected ${userOptionText}, but the correct answer is ${correctOptionText}.\n\n📖 Concept Insight: ${explanation}`;
  }

  if (cleanAnswer && cleanAnswer.length > 25 && !cleanAnswer.startsWith(userChoice)) {
    feedbackText += `\n\n💡 Candidate Reasoning: Good attempt at adding reasoning alongside your selection.`;
  }

  return {
    score: baseScore,
    feedback: feedbackText,
    isCorrect,
    correctOption: targetCorrect,
  };
};

// 3. Candidate asks AI for a hint or clarification during the interview
export const askAIClarification = async (question, userQuery = "") => {
  const prompt = `You are a helpful and polite technical interviewer.
Interview Question: "${question}"
Candidate's Clarification Request / Doubt: "${userQuery || "Can you give me a small hint without spoiling the full answer?"}"

Give a concise, encouraging 2-3 sentence hint or clarification to guide the candidate's thinking without directly giving away the final answer. Keep it clear and professional.`;

  try {
    const hint = await callAI(prompt, 6000);
    return hint.trim().replace(/\*\*/g, "");
  } catch (err) {
    return "💡 Interviewer Hint: Think about how this works under the hood in production environments—consider performance trade-offs, state lifecycles, and standard architectural patterns.";
  }
};

// 4. Final report
export const generateFinalReport = async (role, qaList) => {
  const total = qaList.length;
  const correctCount = qaList.filter((q) => (q.score ?? 0) >= 6).length;
  const avgScore = total > 0 ? (qaList.reduce((sum, q) => sum + (q.score ?? 0), 0) / total).toFixed(1) : 0;
  const accuracyPct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const summary = qaList
    .map(
      (q, i) =>
        `Q${i + 1}: ${q.question}\nCandidate Answer: ${q.answer || q.userSelectedOption || "N/A"}\nScore: ${q.score ?? 0}/10\nFeedback: ${q.feedback || "Evaluated"}`
    )
    .join("\n\n");

  const prompt = `You are a senior tech lead and interview coach. Based on this ${role} mock interview (${correctCount}/${total} strong answers, ${accuracyPct}% accuracy, ${avgScore}/10 average score):

${summary}

Write an encouraging yet insightful performance summary with:
1. Overall Performance Evaluation (${accuracyPct}% Accuracy, ${avgScore}/10 Average Score)
2. Top Key Strengths demonstrated
3. Recommended Topics to Review Before the Real Interview
4. Next Steps Action Plan

Keep it structured, clear, and under 180 words.`;

  try {
    const aiReport = await callAI(prompt, 7000);
    return aiReport.trim().replace(/\*\*/g, "");
  } catch (err) {
    console.warn("AI report generation using structured template:", err.message);
    return `🎯 Overall Assessment: You completed the ${role} mock interview with ${correctCount}/${total} strong answers (${accuracyPct}% accuracy) and an average score of ${avgScore}/10.

💪 Key Strengths:
- Solid conceptual grounding and ability to explain core principles.
- Clear technical articulation when addressing foundational topics.

🚀 Areas for Growth:
- Focus on reviewing the edge-cases, system architecture trade-offs, and deeper nuances for questions where points were missed.
- Practice explaining concepts out loud with concrete examples from your past projects.

🌟 Actionable Advice: Review each evaluated question in the breakdown below, revisit the recommended documentation, and take another mock sprint to consolidate your interview readiness!`;
  }
};