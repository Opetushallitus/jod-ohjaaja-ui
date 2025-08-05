import { addArtikkelinKommentti, deleteArtikkelinKommentti, getArtikkelinKommentit } from '@/api/artikkelinKommentit';
import { components } from '@/api/schema';
import { Spinner } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Comment from './Comment';
import { CommentInput } from './CommentInput';

interface CommentsProps {
  articleId: number;
  userId?: string; // Optional userId for determining if the comment is the user's own
}

const Comments = ({ articleId, userId }: CommentsProps) => {
  const { t } = useTranslation();

  const commentsRef = React.useRef<HTMLDivElement>(null);

  const [comments, setComments] = React.useState<components['schemas']['ArtikkelinKommenttiDto'][]>([]);
  const [page, setPage] = React.useState<number>(1);
  const [hasMore, setHasMore] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [addingComment, setAddingComment] = React.useState<boolean>(false);

  const observer = React.useRef<IntersectionObserver | null>(null);

  const lastPostElementRef = React.useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1);
          }
        },
        { threshold: 1.0 },
      );
      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  const fetchComments = React.useCallback(
    async (pageNum: number) => {
      setLoading(true);
      const commentsResponse = await getArtikkelinKommentit(articleId, pageNum - 1);
      if (pageNum === 1) {
        setComments(commentsResponse.sisalto);
      } else {
        setComments((prev) => [...prev, ...commentsResponse.sisalto]);
      }
      if (commentsResponse.sivuja <= pageNum) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setLoading(false);
      setAddingComment(false);
    },
    [articleId],
  );

  const addComment = async (comment: string) => {
    setAddingComment(true);
    try {
      await addArtikkelinKommentti(articleId, comment);

      if (page === 1) {
        fetchComments(1); // Refresh comments if on the first page
      } else {
        setPage(1); // Reset to first page to fetch new comments
      }
      commentsRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await deleteArtikkelinKommentti(commentId);
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  React.useEffect(() => {
    fetchComments(page);
  }, [fetchComments, page]);

  return (
    <div className="py-7">
      <h2 className="text-heading-2 pb-5">{t('comments.title')}</h2>
      <p className="text-body-lg pb-7">{t('comments.description')}</p>
      <div className="grid gap-4 pb-5 max-h-[450px] overflow-y-auto" ref={commentsRef}>
        {comments.length === 0 && !loading && (
          <div className="text-body-md text-primary-gray pt-3 pb-6">{t('comments.noComments')}</div>
        )}
        {comments.map((comment, index) => {
          if (comment.id && comment.luotu) {
            return (
              <Comment
                key={comment.id}
                commentId={comment.id}
                author={comment.ohjaajaId ?? 'Anonymous'}
                comment={comment.kommentti}
                timestamp={comment.luotu}
                isOwnComment={comment.ohjaajaId === userId}
                deleteComment={deleteComment}
                ref={index === comments.length - 1 ? lastPostElementRef : null}
              />
            );
          }
        })}
        {loading && (
          <div className="flex justify-center py-4">
            <Spinner size={16} color="accent" />
          </div>
        )}
      </div>
      {userId && <CommentInput userId={userId} addComment={addComment} addingComment={addingComment} />}
    </div>
  );
};

export default Comments;
