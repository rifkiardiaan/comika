{
  "blueprint_generator": {
    "name": "COMIKA Master Blueprint Generator",
    "version": "1.0.0",
    "purpose": "Menghasilkan master blueprint lengkap untuk pengembangan aplikasi komik/webtoon COMIKA menggunakan Laravel, React.js, Tailwind CSS, Flutter, dan MySQL.",
    "mode": "vibe_coding",
    "language": "id-ID",

    "project_context": {
      "project_name": "COMIKA",
      "project_type": "Digital Comic and Webtoon Platform",
      "project_description": "Platform digital untuk membaca, menerbitkan, mengelola, dan memonetisasi komik/webtoon.",
      "development_stage": "MVP development",
      "current_environment": "Local computer",
      "initial_production_environment": "Shared hosting",
      "future_environment": [
        "VPS",
        "Cloud Storage",
        "Object Storage"
      ]
    },

    "technology_stack": {
      "backend": {
        "framework": "Laravel",
        "language": "PHP",
        "architecture": "Modular Monolith REST API",
        "authentication": "Laravel Sanctum",
        "authorization": "Laravel Policies and Middleware",
        "validation": "Laravel Form Request",
        "api_response": "Laravel API Resources"
      },

      "database": {
        "engine": "MySQL",
        "migration": "Laravel Migration",
        "factory": "Laravel Factory",
        "seeder": "Laravel Seeder"
      },

      "web": {
        "framework": "React.js",
        "language": "TypeScript",
        "bundler": "Vite",
        "styling": "Tailwind CSS",
        "routing": "React Router",
        "http_client": "Axios",
        "icons": "Lucide React"
      },

      "mobile": {
        "framework": "Flutter",
        "language": "Dart",
        "architecture": "Feature Based Architecture",
        "communication": "REST API"
      }
    },

    "infrastructure_constraints": {
      "shared_hosting_first": true,
      "local_development_first": true,

      "required": [
        "PHP",
        "Laravel",
        "MySQL",
        "Apache",
        "React",
        "Vite",
        "Flutter"
      ],

      "not_required_for_mvp": [
        "VPS",
        "Docker",
        "Kubernetes",
        "Redis",
        "S3",
        "CloudFront",
        "Nginx",
        "Supervisor",
        "WebSocket",
        "Microservices"
      ],

      "storage": {
        "development": "Laravel local storage",
        "initial_production": "Shared hosting local/public storage",
        "future": "Object storage abstraction"
      },

      "architecture_rule": "Jangan membuat dependency MVP terhadap infrastructure yang belum tersedia."
    },

    "blueprint_output": {
      "goal": "Menghasilkan dokumen blueprint yang dapat digunakan AI coding agent sebagai sumber kebenaran utama proyek.",

      "sections": [
        "01_product_vision",
        "02_problem_statement",
        "03_target_market",
        "04_user_roles",
        "05_user_flows",
        "06_feature_map",
        "07_mvp_scope",
        "08_future_scope",
        "09_system_architecture",
        "10_folder_structure",
        "11_database_erd",
        "12_database_schema",
        "13_database_relationships",
        "14_api_architecture",
        "15_api_endpoint_map",
        "16_authentication_flow",
        "17_authorization_matrix",
        "18_web_architecture",
        "19_flutter_architecture",
        "20_ui_ux_system",
        "21_reader_system",
        "22_creator_system",
        "23_admin_system",
        "24_notification_system",
        "25_monetization_system",
        "26_gamification_system",
        "27_ai_system",
        "28_file_storage_system",
        "29_security_system",
        "30_validation_rules",
        "31_error_handling",
        "32_performance",
        "33_testing_strategy",
        "34_deployment_shared_hosting",
        "35_environment_configuration",
        "36_development_roadmap",
        "37_vibe_coding_rules",
        "38_definition_of_done",
        "39_risk_register",
        "40_future_scalability"
      ]
    },

    "product_blueprint": {
      "vision": "Menjadi platform komik digital yang memberikan pengalaman membaca modern sekaligus memberikan creator tools untuk menerbitkan dan mengembangkan komik mereka.",

      "primary_users": [
        "Reader",
        "Creator",
        "Admin"
      ],

      "reader_goals": [
        "Menemukan komik",
        "Membaca komik",
        "Menyimpan komik",
        "Mengikuti komik",
        "Memberikan like",
        "Memberikan rating",
        "Memberikan komentar",
        "Melanjutkan bacaan",
        "Mendapatkan rekomendasi"
      ],

      "creator_goals": [
        "Membuat profil creator",
        "Membuat komik",
        "Mengelola episode",
        "Mengupload halaman komik",
        "Menyimpan draft",
        "Mempublikasikan episode",
        "Melihat analytics",
        "Mendapatkan penghasilan"
      ],

      "admin_goals": [
        "Mengelola user",
        "Mengelola creator",
        "Memoderasi komik",
        "Memoderasi komentar",
        "Mengelola genre",
        "Menangani laporan",
        "Mengelola transaksi",
        "Mengelola platform"
      ]
    },

    "role_blueprint": {
      "user": {
        "permissions": [
          "read_comic",
          "search_comic",
          "bookmark_comic",
          "follow_comic",
          "like_comic",
          "rate_comic",
          "comment_comic",
          "view_history",
          "manage_profile",
          "view_notification",
          "purchase_coin",
          "unlock_episode"
        ]
      },

      "creator": {
        "inherits": "user",
        "permissions": [
          "manage_creator_profile",
          "create_comic",
          "update_own_comic",
          "delete_own_comic",
          "create_episode",
          "update_own_episode",
          "delete_own_episode",
          "upload_episode_pages",
          "publish_own_episode",
          "schedule_own_episode",
          "view_own_analytics",
          "view_own_earnings",
          "request_withdrawal"
        ]
      },

      "admin": {
        "permissions": [
          "manage_users",
          "manage_creators",
          "verify_creator",
          "manage_comics",
          "manage_episodes",
          "manage_genres",
          "manage_comments",
          "manage_reports",
          "manage_transactions",
          "manage_withdrawals",
          "manage_notifications",
          "manage_platform_settings"
        ]
      }
    },

    "feature_blueprint": {
      "reader": [
        "Authentication",
        "Homepage",
        "Discover",
        "Search",
        "Genre",
        "Trending",
        "Popular",
        "New Release",
        "Recommended",
        "Comic Detail",
        "Episode List",
        "Vertical Comic Reader",
        "Bookmark",
        "Reading History",
        "Follow",
        "Like",
        "Rating",
        "Comment",
        "Notification",
        "Profile"
      ],

      "creator": [
        "Creator Registration",
        "Creator Profile",
        "Creator Dashboard",
        "Comic Management",
        "Episode Management",
        "Page Upload",
        "Draft",
        "Publishing",
        "Scheduling",
        "Analytics",
        "Revenue",
        "Withdrawal"
      ],

      "admin": [
        "Admin Dashboard",
        "User Management",
        "Creator Management",
        "Comic Management",
        "Episode Management",
        "Genre Management",
        "Comment Moderation",
        "Report Management",
        "Transaction Management",
        "Withdrawal Management",
        "Notification Management",
        "Platform Settings"
      ],

      "monetization": [
        "Free Episode",
        "Premium Episode",
        "Coin",
        "Coin Package",
        "Episode Unlock",
        "Transaction",
        "Creator Earnings",
        "Withdrawal"
      ],

      "gamification": [
        "XP",
        "Level",
        "Achievement",
        "Badge",
        "Reading Streak",
        "Daily Mission"
      ],

      "ai": [
        "AI Title Generator",
        "AI Synopsis Generator",
        "AI Genre Suggestion",
        "AI Tag Generator",
        "AI Character Concept",
        "AI Episode Outline",
        "Recommendation Engine"
      ]
    },

    "mvp_scope": {
      "priority": "highest",

      "must_have": [
        "Authentication",
        "Role system",
        "Comic CRUD",
        "Genre",
        "Episode CRUD",
        "Comic page upload",
        "Comic reader",
        "Search",
        "Bookmark",
        "Reading history",
        "Follow",
        "Like",
        "Comment",
        "Creator dashboard",
        "Admin dashboard"
      ],

      "should_not_block_mvp": [
        "AI",
        "Payment gateway",
        "Advanced analytics",
        "Gamification",
        "Subscription",
        "Realtime chat",
        "Realtime notification"
      ]
    },

    "database_blueprint": {
      "tables": [
        "users",
        "creator_profiles",
        "comics",
        "genres",
        "comic_genres",
        "episodes",
        "episode_pages",
        "comments",
        "likes",
        "bookmarks",
        "reading_histories",
        "follows",
        "ratings",
        "notifications",
        "reports",
        "wallets",
        "coin_packages",
        "transactions",
        "episode_unlocks",
        "creator_earnings",
        "withdrawals",
        "user_xp",
        "achievements",
        "user_achievements",
        "reading_streaks"
      ],

      "rules": [
        "Gunakan foreign key.",
        "Gunakan index pada field yang sering dicari.",
        "Gunakan unique constraint jika diperlukan.",
        "Gunakan timestamps.",
        "Gunakan soft delete pada data yang membutuhkan recovery.",
        "Jangan menyimpan binary image di MySQL.",
        "Database hanya menyimpan path dan metadata file.",
        "Gunakan database transaction untuk operasi finansial.",
        "Gunakan database transaction untuk unlock premium episode."
      ]
    },

    "database_relationship_blueprint": {
      "users_to_creator_profiles": "one_to_one",
      "users_to_comics": "one_to_many",
      "comics_to_genres": "many_to_many",
      "comics_to_episodes": "one_to_many",
      "episodes_to_pages": "one_to_many",
      "users_to_comments": "one_to_many",
      "users_to_bookmarks": "one_to_many",
      "users_to_reading_histories": "one_to_many",
      "users_to_ratings": "one_to_many",
      "users_to_notifications": "one_to_many",
      "users_to_wallets": "one_to_one",
      "users_to_transactions": "one_to_many",
      "episodes_to_unlocks": "one_to_many"
    },

    "api_blueprint": {
      "prefix": "/api/v1",

      "modules": {
        "auth": [
          "register",
          "login",
          "logout",
          "me"
        ],

        "comics": [
          "list",
          "detail",
          "create",
          "update",
          "delete"
        ],

        "episodes": [
          "list",
          "detail",
          "create",
          "update",
          "delete",
          "publish"
        ],

        "reader": [
          "history",
          "bookmark",
          "like",
          "follow",
          "rating"
        ],

        "comments": [
          "list",
          "create",
          "update",
          "delete"
        ],

        "creator": [
          "dashboard",
          "comics",
          "episodes",
          "analytics",
          "earnings"
        ],

        "admin": [
          "dashboard",
          "users",
          "creators",
          "comics",
          "episodes",
          "reports",
          "transactions",
          "withdrawals"
        ]
      },

      "response_format": {
        "success": {
          "success": true,
          "message": "Success",
          "data": {}
        },

        "error": {
          "success": false,
          "message": "Error",
          "errors": {}
        }
      },

      "rules": [
        "Gunakan REST convention.",
        "Gunakan pagination.",
        "Gunakan API Resources.",
        "Gunakan Form Request validation.",
        "Gunakan Policy authorization.",
        "Jangan menaruh business logic kompleks di Controller.",
        "Gunakan Service jika business logic kompleks."
      ]
    },

    "web_blueprint": {
      "architecture": "React feature-based architecture",

      "folders": [
        "src/components",
        "src/pages",
        "src/layouts",
        "src/features",
        "src/services",
        "src/hooks",
        "src/utils",
        "src/types",
        "src/routes",
        "src/assets"
      ],

      "pages": [
        "Home",
        "Discover",
        "Search",
        "ComicDetail",
        "EpisodeReader",
        "Library",
        "History",
        "Profile",
        "Login",
        "Register",
        "CreatorDashboard",
        "CreatorComics",
        "CreatorEpisodes",
        "CreatorAnalytics",
        "CreatorEarnings",
        "AdminDashboard",
        "AdminUsers",
        "AdminCreators",
        "AdminComics",
        "AdminReports",
        "AdminTransactions"
      ]
    },

    "flutter_blueprint": {
      "architecture": "Feature Based Architecture",

      "folders": [
        "lib/core",
        "lib/features/auth",
        "lib/features/home",
        "lib/features/discover",
        "lib/features/comic",
        "lib/features/reader",
        "lib/features/library",
        "lib/features/history",
        "lib/features/profile",
        "lib/features/notification",
        "lib/shared",
        "lib/services",
        "lib/models",
        "lib/repositories"
      ],

      "primary_screens": [
        "Splash",
        "Onboarding",
        "Login",
        "Register",
        "Home",
        "Discover",
        "Comic Detail",
        "Episode List",
        "Reader",
        "Library",
        "History",
        "Profile",
        "Notifications"
      ]
    },

    "reader_blueprint": {
      "priority": "highest",

      "experience": [
        "Vertical scrolling",
        "Full width comic pages",
        "Lazy image loading",
        "Reading progress",
        "Episode navigation",
        "Previous episode",
        "Next episode",
        "Bookmark",
        "Like",
        "Comment",
        "Dark reader mode"
      ],

      "rules": [
        "Reader tidak boleh terasa seperti PDF viewer.",
        "Gunakan vertical webtoon reading experience.",
        "Optimalkan image loading.",
        "Jangan load seluruh episode secara berat jika tidak diperlukan."
      ]
    },

    "file_storage_blueprint": {
      "strategy": "local filesystem abstraction",

      "directories": {
        "comic_covers": "comic-covers",
        "comic_pages": "comic-pages",
        "avatars": "avatars",
        "creator_banners": "creator-banners"
      },

      "rules": [
        "Generate unique filenames.",
        "Validate MIME type.",
        "Validate extension.",
        "Validate file size.",
        "Never trust original filename.",
        "Store relative path in database.",
        "Never store binary image directly in MySQL."
      ]
    },

    "security_blueprint": {
      "authentication": "Laravel Sanctum",

      "rules": [
        "Password harus menggunakan Laravel hashing.",
        "Gunakan Form Request validation.",
        "Gunakan Policies.",
        "Gunakan Middleware untuk role.",
        "Jangan mempercayai role dari frontend.",
        "Creator hanya dapat mengubah data miliknya.",
        "Admin endpoint harus dilindungi.",
        "Validasi upload file.",
        "Gunakan rate limiting pada endpoint sensitif.",
        "Jangan expose .env.",
        "Jangan expose secret key.",
        "APP_DEBUG=false pada production."
      ]
    },

    "ui_ux_blueprint": {
      "style": [
        "Modern",
        "Clean",
        "Premium",
        "Mobile First",
        "Responsive",
        "Dark Mode",
        "Rounded Cards",
        "Strong Typography",
        "Comic Focused"
      ],

      "reader_navigation": [
        "Home",
        "Explore",
        "Library",
        "Profile"
      ],

      "desktop_navigation": [
        "Home",
        "Discover",
        "Genres",
        "Library",
        "Creator",
        "Profile"
      ],

      "states": [
        "Loading",
        "Empty",
        "Error",
        "Success",
        "Unauthorized",
        "Not Found"
      ]
    },

    "notification_blueprint": {
      "types": [
        "new_episode",
        "comic_update",
        "comment_reply",
        "creator_announcement",
        "transaction",
        "system"
      ],

      "mvp": {
        "delivery": "database notification",
        "realtime": false
      },

      "future": [
        "Push notification",
        "Firebase Cloud Messaging",
        "Web push"
      ]
    },

    "monetization_blueprint": {
      "mvp_architecture": "Internal coin system with payment provider abstraction.",

      "flow": [
        "User buys coin",
        "Transaction is created",
        "Payment is verified",
        "Coin balance increases",
        "User unlocks premium episode",
        "Creator earning is recorded"
      ],

      "financial_rules": [
        "Use database transaction.",
        "Use immutable transaction references.",
        "Prevent duplicate transaction processing.",
        "Never trust client-side balance.",
        "Server calculates final amounts."
      ]
    },

    "gamification_blueprint": {
      "xp_events": [
        "daily_login",
        "read_episode",
        "finish_comic",
        "comment",
        "like",
        "follow"
      ],

      "features": [
        "XP",
        "Level",
        "Achievement",
        "Badge",
        "Reading Streak"
      ],

      "priority": "post_mvp"
    },

    "ai_blueprint": {
      "priority": "post_mvp",

      "features": [
        "title_generation",
        "synopsis_generation",
        "genre_suggestion",
        "tag_generation",
        "character_concept",
        "episode_outline",
        "recommendation"
      ],

      "rule": "AI harus menjadi optional service dan tidak boleh membuat core comic platform bergantung pada AI."
    },

    "testing_blueprint": {
      "backend": [
        "Feature Tests",
        "Unit Tests",
        "Authentication Tests",
        "Authorization Tests",
        "API Tests",
        "Upload Tests",
        "Transaction Tests"
      ],

      "web": [
        "Component Tests",
        "Page Tests",
        "API Integration Tests"
      ],

      "flutter": [
        "Unit Tests",
        "Widget Tests",
        "Repository Tests"
      ],

      "manual_tests": [
        "Register",
        "Login",
        "Create comic",
        "Upload episode",
        "Publish episode",
        "Read episode",
        "Bookmark",
        "Comment",
        "Creator analytics",
        "Admin moderation"
      ]
    },

    "deployment_blueprint": {
      "environment": "Shared Hosting",

      "backend": [
        "Upload Laravel application",
        "Configure .env",
        "Configure MySQL",
        "Set APP_ENV=production",
        "Set APP_DEBUG=false",
        "Configure APP_URL",
        "Configure storage",
        "Run migrations carefully",
        "Optimize Laravel configuration"
      ],

      "web": [
        "Run npm install locally",
        "Run npm run build",
        "Upload production build",
        "Configure SPA routing"
      ],

      "flutter": [
        "Change API base URL",
        "Use HTTPS",
        "Build release APK/AAB"
      ],

      "rules": [
        "Jangan membutuhkan VPS.",
        "Jangan membutuhkan S3.",
        "Jangan membutuhkan Redis.",
        "Jangan membutuhkan Docker.",
        "Jangan expose .env.",
        "Gunakan HTTPS production."
      ]
    },

    "development_roadmap": {
      "phase_01": {
        "name": "Foundation",
        "tasks": [
          "Laravel setup",
          "React setup",
          "Flutter setup",
          "MySQL setup",
          "Environment configuration"
        ]
      },

      "phase_02": {
        "name": "Database",
        "tasks": [
          "Migrations",
          "Models",
          "Relationships",
          "Factories",
          "Seeders"
        ]
      },

      "phase_03": {
        "name": "Authentication",
        "tasks": [
          "Register",
          "Login",
          "Logout",
          "Profile",
          "Role system"
        ]
      },

      "phase_04": {
        "name": "Comic Core",
        "tasks": [
          "Comic CRUD",
          "Genre",
          "Episode CRUD",
          "Page upload"
        ]
      },

      "phase_05": {
        "name": "Reader",
        "tasks": [
          "Comic detail",
          "Episode reader",
          "Reading progress",
          "History"
        ]
      },

      "phase_06": {
        "name": "Community",
        "tasks": [
          "Bookmark",
          "Like",
          "Follow",
          "Rating",
          "Comment"
        ]
      },

      "phase_07": {
        "name": "Creator",
        "tasks": [
          "Creator dashboard",
          "Comic management",
          "Episode management",
          "Analytics"
        ]
      },

      "phase_08": {
        "name": "Admin",
        "tasks": [
          "Admin dashboard",
          "User management",
          "Creator management",
          "Content moderation",
          "Reports"
        ]
      },

      "phase_09": {
        "name": "Monetization",
        "tasks": [
          "Coin",
          "Premium episode",
          "Unlock",
          "Transactions",
          "Creator earnings"
        ]
      },

      "phase_10": {
        "name": "Mobile",
        "tasks": [
          "Flutter authentication",
          "Home",
          "Discover",
          "Comic detail",
          "Reader",
          "Library",
          "Profile"
        ]
      },

      "phase_11": {
        "name": "Post MVP",
        "tasks": [
          "Gamification",
          "AI assistant",
          "Recommendation engine",
          "Advanced analytics",
          "Push notification"
        ]
      },

      "phase_12": {
        "name": "Production",
        "tasks": [
          "Security audit",
          "Performance audit",
          "Database optimization",
          "Production build",
          "Shared hosting deployment",
          "Smoke testing"
        ]
      }
    },

    "vibe_coding_protocol": {
      "before_coding": [
        "Read MASTER_BLUEPRINT.json.",
        "Identify current phase.",
        "Inspect existing implementation.",
        "Do not recreate existing functionality.",
        "Identify affected files."
      ],

      "during_coding": [
        "Implement the smallest complete change.",
        "Keep architecture consistent.",
        "Use existing dependencies where possible.",
        "Do not add infrastructure unnecessarily.",
        "Do not change unrelated files."
      ],

      "after_coding": [
        "Run validation.",
        "Check imports.",
        "Check routes.",
        "Check database relationships.",
        "Check authorization.",
        "Check UI states.",
        "Check errors.",
        "Explain changed files."
      ],

      "response_format": [
        "Objective",
        "Plan",
        "Implementation",
        "Changed Files",
        "Testing",
        "Commands",
        "Known Issues",
        "Next Step"
      ]
    },

    "definition_of_done": {
      "feature": [
        "Database implemented if required.",
        "API implemented if required.",
        "Validation implemented.",
        "Authorization implemented.",
        "Frontend implemented.",
        "Loading state implemented.",
        "Empty state implemented.",
        "Error state implemented.",
        "Basic testing completed.",
        "No unrelated breaking changes."
      ],

      "mvp": [
        "Reader can register.",
        "Reader can login.",
        "Reader can discover comics.",
        "Reader can search.",
        "Reader can open comic.",
        "Reader can read episode.",
        "Reader can bookmark.",
        "Reader can view history.",
        "Reader can comment.",
        "Creator can create comic.",
        "Creator can create episode.",
        "Creator can upload pages.",
        "Creator can publish episode.",
        "Creator can view basic analytics.",
        "Admin can manage users.",
        "Admin can manage comics.",
        "Admin can moderate reports.",
        "Application can run locally.",
        "Application can be deployed to shared hosting."
      ]
    },

    "risk_register": {
      "image_storage_growth": {
        "risk": "Comic images can consume shared hosting storage quickly.",
        "mvp_solution": "Local/public storage with file validation and image optimization.",
        "future_solution": "Object storage."
      },

      "shared_hosting_limits": {
        "risk": "CPU, RAM, storage and execution limits.",
        "mvp_solution": "Pagination, optimized queries, no unnecessary background infrastructure."
      },

      "large_uploads": {
        "risk": "Large comic page uploads can fail.",
        "mvp_solution": "File size limits and frontend validation."
      },

      "financial_security": {
        "risk": "Manipulation of coin balance or transactions.",
        "mvp_solution": "Server-side transaction processing and database transactions."
      }
    },

    "future_scalability": {
      "principle": "Future scalability without premature complexity.",

      "migration_path": {
        "storage": {
          "current": "local",
          "future": "S3/R2/object storage"
        },

        "cache": {
          "current": "database/application cache",
          "future": "Redis"
        },

        "hosting": {
          "current": "shared hosting",
          "future": "VPS/cloud"
        },

        "processing": {
          "current": "synchronous",
          "future": "queue workers"
        },

        "realtime": {
          "current": "not required",
          "future": "WebSocket/push infrastructure"
        }
      }
    },

    "master_instruction": "Gunakan seluruh informasi dalam blueprint ini sebagai sumber kebenaran proyek. Bangun COMIKA secara incremental. Jangan melompati fase. Jangan membuat infrastructure yang belum dibutuhkan. Prioritaskan MVP yang stabil, aman, mudah dipahami, dan kompatibel dengan local development serta shared hosting."
  }
}