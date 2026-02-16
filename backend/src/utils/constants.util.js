// API & Server
export const API_BASE = "/api";
export const PORT = 4000;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const IS_DEV = NODE_ENV === "development";
export const IS_PROD = NODE_ENV === "production";

// Database
export const DB_MAX_POOL_SIZE = 10;
export const DB_SERVER_SELECTION_TIMEOUT = 30000;
export const DB_SOCKET_TIMEOUT = 45000;
export const DB_CONNECT_TIMEOUT = 30000;

// File Upload
export const MAX_FILE_SIZE = 100 * 1024 * 1024;
export const MAX_FILE_SIZE_FOR_PARSING = 1024 * 1024;
export const UPLOAD_TIMEOUT = 300000;
export const GITHUB_TIMEOUT = 30000;
export const BATCH_SIZE = 100;
export const ALLOWED_FILE_TYPES = [".zip"];
export const GITHUB_BRANCHES = ["main", "master"];

// Search & Relevance
export const SEARCH_TOP_K = 5;
export const MIN_RELEVANCE_SCORE = 10;
export const CONTEXT_LINES = 3;
export const MAX_SNIPPETS_PER_FILE = 3;
export const KEYWORD_MIN_LENGTH = 3;

// History & Caching
export const MAX_HISTORY = 10;
export const HISTORY_LIMIT = 10;

// LLM / OpenRouter
export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const DEFAULT_MODEL = "openai/gpt-4o-mini";
export const LLM_MAX_TOKENS = 1500;
export const LLM_TEMPERATURE = 0.3;
export const LLM_TIMEOUT = 30000;

export const SYSTEM_PROMPT = `You are a helpful codebase assistant. Your task is to answer questions about a code repository.

GUIDELINES:
1. For general questions (overview, purpose, technologies):
   - Use README, package.json, and configuration files to describe the project
   - List the main technologies and frameworks detected
   - Describe the high-level structure and purpose
   - Be informative but concise

2. For specific technical questions:
   - Focus on the relevant code snippets provided
   - Explain what the code does and how it works
   - Cite file paths and line numbers
   - If the exact answer isn't in the snippets, use context to provide helpful information

3. For any question:
   - If you don't have enough information, be honest but suggest what to ask instead
   - Use the project context (README, tech stack, structure) to provide relevant information
   - NEVER invent code or functionality that isn't in the provided snippets
   - Keep answers clear and helpful

Remember: You have access to README files, configuration files, and code snippets. Use them all to provide the best answer possible.`;

// File Extensions
export const CODE_EXTENSIONS = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
  ".py", ".java", ".go", ".rb", ".php", ".c", ".cpp", ".h", ".hpp",
  ".cs", ".rs", ".kt", ".kts", ".swift", ".vue", ".svelte",
  ".r", ".scala", ".lua", ".sql", ".sh", ".bash", ".zsh",
  ".yaml", ".yml", ".json", ".md", ".html", ".css", ".scss", ".less",
]);

// Binary/Skip Patterns
export const BINARY_OR_SKIP_PATTERNS = [
  /node_modules/i,
  /\.git\//i,
  /dist\//i,
  /build\//i,
  /__pycache__/i,
  /\.next\//i,
  /\.nuxt\//i,
  /vendor\//i,
  /\.min\.(js|css)$/i,
];

// Important Files
export const IMPORTANT_FILES = {
  techStack: [
    "package.json",
    "requirements.txt",
    "go.mod",
    "go.sum",
    "pom.xml",
    "build.gradle",
    "Cargo.toml",
    "Gemfile",
    "composer.json",
    "pyproject.toml",
    "setup.py",
    "environment.yml",
  ],
  documentation: [
    "README.md",
    "README",
    "CONTRIBUTING.md",
    "docs/",
    "documentation/",
  ],
  config: [
    ".env.example",
    "config/",
    ".config/",
    "tsconfig.json",
    ".eslintrc",
    ".prettierrc",
    "vite.config.ts",
    "next.config.js",
    "webpack.config.js",
    "babel.config.js",
  ],
  entry: [
    "index.js", "index.ts", "main.js", "main.ts",
    "app.js", "app.ts", "server.js", "server.ts",
  ],
  source: [
    "src/", "lib/", "core/", "backend/", "frontend/", "server/", "client/",
  ],
};

// Question Patterns
export const QUESTION_PATTERNS = {
  techStack: [
    /what (tech|technology|stack|framework|library|language|dependencies).*(used|using)/i,
    /which (tech|technology|stack|framework|library|language)/i,
    /tech stack/i,
    /dependencies/i,
    /package\.json/i,
  ],
  overview: [
    /what (is|does).*(project|app|application|codebase).*(do|about)/i,
    /tell me about (this|the) project/i,
    /describe (this|the) project/i,
    /project (overview|summary|description)/i,
    /what is this/i,
  ],
  structure: [
    /how (is|are).*(structured|organized|architected)/i,
    /project structure/i,
    /folder structure/i,
    /directory structure/i,
    /architecture/i,
  ],
  features: [
    /what (features|functionality).*(does|has)/i,
    /main features/i,
    /key features/i,
    /what can (it|this) do/i,
    /capabilities/i,
  ],
  setup: [
    /how to (setup|install|run|start|configure)/i,
    /getting started/i,
    /installation/i,
    /prerequisites/i,
    /requirements/i,
  ],
  code: [
    /show me (the )?code/i,
    /where is (the )?(.+?) (defined|implemented|located)/i,
    /find (the )?(.+?) (function|class|method)/i,
    /how does (.+?) work/i,
    /(.+?) implementation/i,
  ],
};

// Tech Keywords
export const TECH_KEYWORDS = [
  "react", "vue", "angular", "express", "django", "flask",
  "spring", "mongodb", "postgres", "mysql", "redis",
  "docker", "aws", "azure", "graphql", "rest",
  "openrouter", "llm", "ai", "gpt", "auth", "api",
  "model", "controller", "service", "route", "middleware",
  "config", "test", "spec", "function", "class", "method",
];

// Stop Words
export const STOP_WORDS = new Set([
  "what", "where", "when", "why", "how", "who", "which",
  "the", "a", "an", "and", "or", "but", "in", "on", "at",
  "to", "for", "with", "by", "from", "of", "is", "are",
  "was", "were", "will", "would", "could", "should",
  "show", "tell", "give", "find", "get", "use", "using",
  "this", "that", "these", "those", "there", "their",
  "about", "into", "through", "during", "before", "after",
  "only", "just", "very", "too", "can", "please", "help",
  "tell", "me", "any", "all", "some", "any", "every",
]);

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Messages
export const ERROR_MESSAGES = {
  UPLOAD_FAILED: "Upload failed. Please try again.",
  INVALID_ZIP: "Invalid or corrupted zip file.",
  GITHUB_IMPORT_FAILED: "Failed to import from GitHub. Check the URL and try again.",
  NO_FILES: "No files found in this project.",
  NO_KEYWORDS: "Please ask a more specific question.",
  LLM_UNAVAILABLE: "LLM service unavailable. Check your API key.",
  PROJECT_NOT_FOUND: "Project not found.",
  INVALID_PROJECT_ID: "Invalid projectId",
  QUESTION_REQUIRED: "projectId and question are required",
  QUESTION_EMPTY: "Question cannot be empty",
  NO_FILES_UPLOADED: "No files uploaded for this project. Upload a repo or zip first.",
};

// Regular Expressions
export const REGEX = {
  GITHUB_URL: /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\/)?$/i,
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
};