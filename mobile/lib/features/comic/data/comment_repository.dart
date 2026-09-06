import '../../../core/constants/api_constants.dart';
import '../../../models/comment.dart';
import '../../../services/api_service.dart';

/// Repository untuk mengambil dan mengirim komentar via API.
class CommentRepository {
  final ApiService _api = ApiService.instance;

  /// Ambil komentar sebuah komik (termasuk balasan), paginated.
  Future<CommentPageResult> fetchComments(int comicId, {int page = 1}) async {
    final res = await _api.get(
      ApiConstants.comicComments(comicId),
      {'page': page},
    );

    final data = (res['data'] as List<dynamic>? ?? const [])
        .map((c) => Comment.fromJson(c as Map<String, dynamic>))
        .toList();

    final meta = res['meta'] as Map<String, dynamic>? ?? {};
    final pagination = CommentPagination(
      currentPage: meta['current_page'] as int? ?? 1,
      lastPage: meta['last_page'] as int? ?? 1,
      total: meta['total'] as int? ?? 0,
    );

    return CommentPageResult(data: data, pagination: pagination);
  }

  /// Kirim komentar pada komik.
  Future<Comment> postComment(int comicId, {required String content, int? parentId}) async {
    final body = <String, dynamic>{
      'content': content,
    };
    if (parentId != null) {
      body['parent_id'] = parentId;
    }

    final res = await _api.post(ApiConstants.comicComments(comicId), body);
    return Comment.fromJson(res['data'] as Map<String, dynamic>);
  }

  /// Hapus komentar.
  Future<void> deleteComment(int commentId) async {
    await _api.delete('${ApiConstants.baseUrl}/comments/$commentId');
  }

  /// Toggle like pada komentar.
  Future<CommentLikeResult> toggleCommentLike(int commentId) async {
    final res = await _api.post('${ApiConstants.baseUrl}/comments/$commentId/like');
    final data = res['data'] as Map<String, dynamic>;
    return CommentLikeResult(
      liked: data['liked'] as bool? ?? false,
      likeCount: (data['like_count'] as num?)?.toInt() ?? 0,
    );
  }
}

class CommentPageResult {
  final List<Comment> data;
  final CommentPagination pagination;

  const CommentPageResult({required this.data, required this.pagination});
}

class CommentPagination {
  final int currentPage;
  final int lastPage;
  final int total;

  const CommentPagination({
    required this.currentPage,
    required this.lastPage,
    required this.total,
  });

  bool get hasMore => currentPage < lastPage;
}

class CommentLikeResult {
  final bool liked;
  final int likeCount;

  const CommentLikeResult({required this.liked, required this.likeCount});
}
