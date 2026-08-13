/// Model User — disinkronkan dengan API backend COMIKA.
class User {
  final int id;
  final String name;
  final String username;
  final String email;
  final String? avatarUrl;
  final String role;
  final int coinBalance;
  final String createdAt;
  final bool isEmailVerified;

  const User({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    this.avatarUrl,
    required this.role,
    required this.coinBalance,
    required this.createdAt,
    this.isEmailVerified = false,
  });

  bool get isCreator => role == 'creator';
  bool get isAdmin => role == 'admin';

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      name: json['name'] as String,
      username: json['username'] as String? ?? '',
      email: json['email'] as String? ?? '',
      avatarUrl: json['avatar_url'] as String?,
      role: json['role'] as String? ?? 'reader',
      coinBalance: (json['coin_balance'] as num?)?.toInt() ?? 0,
      createdAt: json['created_at'] as String? ?? '',
      isEmailVerified: json['is_email_verified'] as bool? ?? false,
    );
  }
}
