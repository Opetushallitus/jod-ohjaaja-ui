import { ConfirmDialog, IconButton } from '@jod/design-system';
import { JodBlock } from '@jod/design-system/icons';
import { type RefAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import PatternAvatar from '../PatternAvatar/PatternAvatar';

interface CommentProps extends RefAttributes<HTMLDivElement> {
  commentId: string;
  author: string;
  comment: string;
  timestamp: string;
  isOwnComment: boolean;
  deleteComment: (id: string) => void;
  reportComment: (id: string) => void;
}

const Comment = ({
  commentId,
  author,
  comment,
  timestamp,
  isOwnComment,
  deleteComment,
  reportComment,
  ref,
}: CommentProps) => {
  const { t } = useTranslation();

  const formattedTimestamp = new Date(timestamp)
    .toLocaleString('fi-FI', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    .replace(',', ' klo')
    .replace(/(\d{2})\.(\d{2})$/, '$1:$2');
  return (
    <div ref={ref} className="grid gap-2" data-testid={`comment-${commentId}`}>
      <div className="flex gap-3">
        <div className="">
          <PatternAvatar seed={author} size={32} />
        </div>
        <div className="rounded-lg bg-white flex-grow p-5 grid gap-2">
          <div className="text-button-sm text-secondary-gray" data-testid="comment-timestamp">
            {formattedTimestamp}
          </div>
          <div className="text-body-sm text-primary-gray whitespace-pre-line" data-testid="comment-text">
            {comment}
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        {isOwnComment ? (
          <ConfirmDialog
            title={t('comments.comment.delete.title')}
            description={t('comments.comment.delete.description')}
            onConfirm={() => deleteComment(commentId)}
            cancelText={t('comments.comment.delete.cancelText')}
            confirmText={t('comments.comment.delete.confirmText')}
          >
            {(showDeleteModal) => (
              <IconButton
                icon={<DeleteIcon />}
                bgColor="gray"
                onClick={showDeleteModal}
                label={t('comments.comment.delete.label')}
                data-testid="comment-delete"
              />
            )}
          </ConfirmDialog>
        ) : (
          <ConfirmDialog
            title={t('comments.comment.report.title')}
            description={t('comments.comment.report.description')}
            onConfirm={() => reportComment(commentId)}
            cancelText={t('comments.comment.report.cancelText')}
            confirmText={t('comments.comment.report.confirmText')}
          >
            {(showReportModal) => (
              <IconButton
                icon={<JodBlock />}
                bgColor="gray"
                onClick={showReportModal}
                label={t('comments.comment.report.label')}
                data-testid="comment-report"
              />
            )}
          </ConfirmDialog>
        )}
      </div>
    </div>
  );
};

const DeleteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"
      fill="currentColor"
    />
  </svg>
);

export default Comment;
