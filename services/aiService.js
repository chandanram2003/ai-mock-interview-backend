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

const callAI = async (prompt, timeoutMs = 5000) => {
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


// Helper: Ensure 4 properly formatted options (A, B, C, D)
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
    // Strip existing prefix if present like "A) " or "A. "
    const cleaned = raw.replace(/^[A-Da-d][\)\.\:\-]\s*/, "").trim();
    formatted.push(`${letters[i]}) ${cleaned}`);
  }

  return formatted;
};

// 1. Generate questions with 4 options
export const generateQuestions = async (role, difficulty = "Medium", count = 10) => {
  const prompt = `You are a world-class technical interviewer.
Generate exactly ${count} multiple-choice interview questions for the role "${role}" at "${difficulty}" difficulty level.

Every single question MUST have exactly 4 distinct options (A, B, C, D), a specified correctOption ("A", "B", "C", or "D"), and a short high-yield explanation.

CRITICAL: Return ONLY a valid JSON array of objects. Do not wrap in markdown or backticks if possible, just the raw JSON.
Format:
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
    "explanation": "Clear 1-2 sentence explanation of why this answer is correct."
  }
]`;

  let aiQuestions = [];

  try {
    const text = await callAI(prompt, 7000);


    // Try to extract JSON array
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }

    // Try to find array brackets
    const startIdx = jsonStr.indexOf("[");
    const endIdx = jsonStr.lastIndexOf("]");
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = jsonStr.substring(startIdx, endIdx + 1);
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        aiQuestions = parsed.map((item) => {
          const opts = formatOptions(item.options);
          let correct = (item.correctOption || "A").trim().toUpperCase();
          if (!["A", "B", "C", "D"].includes(correct.charAt(0))) {
            correct = "A";
          } else {
            correct = correct.charAt(0);
          }
          return {
            question: item.question || "Interview Question",
            options: opts,
            correctOption: correct,
            explanation: item.explanation || "Correct choice based on industry standard best practices.",
          };
        });
      }
    }
  } catch (err) {
    console.warn("AI Question generation returned error or timed out, utilizing intelligent question bank fallback:", err.message);
  }

  // If AI returned sufficient questions, return them
  if (aiQuestions.length >= count) {
    return aiQuestions.slice(0, count);
  }

  // Fallback bank lookup
  const normalizedRole = Object.keys(FALLBACK_QUESTION_BANK).find(
    (k) => k.toLowerCase() === role.toLowerCase()
  ) || "Frontend Developer";

  const bankQuestions = FALLBACK_QUESTION_BANK[normalizedRole] || FALLBACK_QUESTION_BANK["Frontend Developer"];

  // Shuffle and combine with any AI questions
  const shuffledBank = [...bankQuestions].sort(() => 0.5 - Math.random());
  const combined = [...aiQuestions];

  for (const q of shuffledBank) {
    if (combined.length >= count) break;
    if (!combined.some((item) => item.question === q.question)) {
      combined.push({
        question: q.question,
        options: formatOptions(q.options),
        correctOption: q.correctOption,
        explanation: q.explanation,
      });
    }
  }

  // If still fewer than count, duplicate or generate variations
  while (combined.length < count && bankQuestions.length > 0) {
    const q = bankQuestions[combined.length % bankQuestions.length];
    combined.push({
      question: `${q.question} (Advanced Practice)`,
      options: formatOptions(q.options),
      correctOption: q.correctOption,
      explanation: q.explanation,
    });
  }

  return combined.slice(0, count);
};

// 2. Evaluate answer (Handles both Open-Ended Spoken/Written Answers AND 4-Option Selections)
export const evaluateAnswer = async (questionData, answer = "", selectedOption = "") => {
  const { question, options = [], correctOption = "A", explanation = "" } = questionData;
  const targetCorrect = (correctOption || "A").trim().toUpperCase().charAt(0);
  const correctOptionText = options.find((o) => o.startsWith(targetCorrect)) || `Option ${targetCorrect}`;

  // Clean answer string
  const cleanAnswer = (answer || "").trim();
  let userChoice = (selectedOption || "").trim().toUpperCase().charAt(0);

  // Check if answer is predominantly an open-ended descriptive answer (voice transcript or typed explanation)
  const isDescriptiveAnswer = cleanAnswer.length > 20 && !cleanAnswer.startsWith("A)") && !cleanAnswer.startsWith("B)") && !cleanAnswer.startsWith("C)") && !cleanAnswer.startsWith("D)");

  // If candidate wrote or spoke an open-ended descriptive answer, use AI to grade technical depth & accuracy
  if (isDescriptiveAnswer) {
    try {
      const prompt = `You are an expert technical interviewer evaluating a candidate's answer.
Technical Question: "${question}"
Core Expected Concept: "${explanation || "Accurate industry best practices"}"
Candidate's Spoken/Written Answer: "${cleanAnswer}"
${userChoice && ["A", "B", "C", "D"].includes(userChoice) ? `Candidate also picked Option: ${userChoice}` : ""}

Evaluate the candidate's answer fairly on a scale of 0 to 10 (10 = masterclass, 7-9 = strong answer, 4-6 = partially accurate, 0-3 = incorrect/vague).
Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "score": 8,
  "feedback": "2-3 constructive sentences covering candidate's strong points, any missed technical nuance, and the ideal model answer.",
  "isCorrect": true
}`;

      const aiResponse = await callAI(prompt, 6000);
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const score = Math.min(Math.max(Number(parsed.score) || 7, 0), 10);
        return {
          score,
          feedback: parsed.feedback || `Evaluated score: ${score}/10. ${explanation}`,
          isCorrect: score >= 6,
          correctOption: targetCorrect,
        };
      }
    } catch (err) {
      console.warn("AI open answer grading fallback:", err.message);
      // Fallback keyword intelligence
      const lowerAns = cleanAnswer.toLowerCase();
      const lowerExp = (explanation || "").toLowerCase();
      const expWords = lowerExp.split(/\s+/).filter((w) => w.length > 4);
      const matchCount = expWords.filter((w) => lowerAns.includes(w)).length;

      let fallbackScore = 7;
      if (matchCount >= 3) fallbackScore = 9;
      else if (matchCount >= 1) fallbackScore = 8;
      else if (cleanAnswer.length > 50) fallbackScore = 7;
      else fallbackScore = 5;

      return {
        score: fallbackScore,
        feedback: `🗣️ Voice/Text Response Evaluated: Your explanation covers important foundational aspects (${fallbackScore}/10). To refine further: ${explanation}`,
        isCorrect: fallbackScore >= 6,
        correctOption: targetCorrect,
      };
    }
  }

  // Otherwise, evaluate 4-Option selection (fast MCQ evaluation)
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
    const hint = await callAI(prompt, 5000);
    return hint.trim().replace(/\*\*/g, "");
  } catch (err) {
    return "💡 Interviewer Hint: Think about how this works under the hood in production environments—consider performance trade-offs, state lifecycles, and standard architectural patterns.";
  }
};

// 3. Final report
export const generateFinalReport = async (role, qaList) => {
  const total = qaList.length;
  const correctCount = qaList.filter((q) => (q.score ?? 0) >= 7).length;
  const avgScore = total > 0 ? (qaList.reduce((sum, q) => sum + (q.score ?? 0), 0) / total).toFixed(1) : 0;
  const accuracyPct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const summary = qaList
    .map(
      (q, i) =>
        `Q${i + 1}: ${q.question}\nSelected: ${q.userSelectedOption || q.answer || "N/A"} | Correct: ${q.correctOption || "N/A"} | Score: ${q.score ?? 0}/10`
    )
    .join("\n\n");

  const prompt = `You are a senior tech lead and interview coach. Based on this ${role} mock interview (${accuracyPct}% accuracy, ${avgScore}/10 average score):

${summary}

Write an encouraging yet insightful performance summary with:
1. Overall Performance Evaluation (${accuracyPct}% Accuracy)
2. Top Key Strengths demonstrated
3. Recommended Topics to Review Before the Real Interview
4. Next Steps Action Plan

Keep it structured, clear, and under 160 words.`;

  try {
    const aiReport = await callAI(prompt, 5000);
    return aiReport.trim().replace(/\*\*/g, "");
  } catch (err) {
    console.warn("AI report generation using structured template:", err.message);
    return `🎯 Overall Assessment: You completed the ${role} interview with ${correctCount}/${total} correct answers (${accuracyPct}% accuracy) and an average score of ${avgScore}/10.

💪 Key Strengths:
- Solid conceptual grounding on fundamental questions.
- Good pacing and ability to evaluate multiple choices under test conditions.

🚀 Areas for Growth:
- Focus on reviewing the edge-cases and deeper architecture nuances of the questions you missed.
- Practice explaining the underlying mechanisms out loud to build interview readiness.

🌟 Actionable Advice: Review each incorrect response in the breakdown below, revisit the documentation for missed concepts, and take another mock sprint to consolidate your skills!`;
  }
};