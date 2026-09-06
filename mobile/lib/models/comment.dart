/// Model Komentar — disinkronkan dengan API backend COMIKA.
class CommentUser {
  final int id;
  final String name;
  final String? username;
  final String? avatarUrl;
  final bool isVvip;

  const CommentUser({
    required this.id,
    required this.name,
    this.username,
    this.avatarUrl,
    this.isVvip = false,
  });

  factory CommentUser.fromJson(Map<String, dynamic> json) {
    return CommentUser(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      username: json['username'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      isVvip: json['is_vvip'] as bool? ?? false,
    );
  }
}

class Comment {
  final int id;
  final int comicId;
  final int? episodeId;
  final int? parentId;
  final String content;
  final int likeCount;
  final CommentUser user;
  final DateTime? createdAt;
  final List<Comment> replies;
  final CommentParentUser? parentUser;

  const Comment({
    required this.id,
    required this.comicId,
    this.episodeId,
    this.parentId,
    required this.content,
    this.likeCount = 0,
    required this.user,
    this.createdAt,
    this.replies = const [],
    this.parentUser,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'] as int,
      comicId: json['comic_id'] as int,
      episodeId: json['episode_id'] as int?,
      parentId: json['parent_id'] as int?,
      content: json['content'] as String? ?? '',
      likeCount: (json['like_count'] as num?)?.toInt() ?? 0,
      user: CommentUser.fromJson(json['user'] as Map<String, dynamic>? ?? {}),
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
      replies: (json['replies'] as List<dynamic>? ?? const [])
          .map((r) => Comment.fromJson(r as Map<String, dynamic>))
          .toList(),
      parentUser: json['parent_user'] != null
          ? CommentParentUser.fromJson(json['parent_user'] as Map<String, dynamic>)
          : null,
    );
  }
}

class CommentParentUser {
  final int id;
  final String name;

  const CommentParentUser({required this.id, required this.name});

  factory CommentParentUser.fromJson(Map<String, dynamic> json) {
    return CommentParentUser(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
    );
  }
}
