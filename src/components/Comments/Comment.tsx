import { type RefAttributes } from 'react';
import { useTranslation } from 'react-i18next';

import { ConfirmDialog } from '@jod/design-system';
import { JodBlock } from '@jod/design-system/icons';

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

const Button = ({
  onClick,
  dataTestid,
  label,
  icon,
  danger = false,
}: {
  onClick: () => void;
  dataTestid: string;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
}) => (
  <button
    aria-label={label}
    type="button"
    onClick={onClick}
    className={`group flex min-h-7 cursor-pointer items-center gap-2 rounded-[30px] bg-bg-gray-2 px-5 text-button-sm outline-offset-2 select-none focus-visible:outline-secondary-1-dark disabled:cursor-not-allowed ${danger ? 'hover:text-underline text-alert-text-2' : 'text-secondary-gray hover:text-secondary-1-dark focus-visible:text-secondary-1-dark active:text-secondary-1-dark-2'} `}
    data-testid={dataTestid}
  >
    <div
      aria-hidden="true"
      className={`${danger ? 'text-[#E35750]' : 'text-secondary-gray group-hover:text-secondary-1-dark group-focus-visible:text-secondary-1-dark group-active:text-secondary-1-dark-2'}`}
    >
      {icon}
    </div>
    <span className="text-center group-hover:underline group-focus-visible:underline group-active:underline">
      {label}
    </span>
  </button>
);

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

  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const formattedTimestamp = `${day}.${month}.${year} ${hours}:${minutes}`;

  return (
    <div ref={ref} data-testid={`comment-${commentId}`}>
      <div className="grid grid-cols-[48px_1fr_48px] items-start">
        <div className="pt-3">{!isOwnComment && <PatternAvatar seed={author} size={32} />}</div>
        <div className="grid gap-3">
          <div className="grid grow gap-2 rounded-lg bg-white p-5">
            <div className="font-arial text-body-sm text-secondary-gray" data-testid="comment-timestamp">
              {formattedTimestamp} {isOwnComment ? `| ${t('comments.comment.own')}` : ''}
            </div>
            <div className="text-body-md whitespace-pre-line text-primary-gray" data-testid="comment-text">
              {comment}
            </div>
          </div>
          <div className="flex justify-end pr-4">
            {isOwnComment ? (
              <ConfirmDialog
                title={t('comments.comment.delete.title')}
                description={t('comments.comment.delete.description')}
                onConfirm={() => deleteComment(commentId)}
                cancelText={t('comments.comment.delete.cancelText')}
                confirmText={t('comments.comment.delete.confirmText')}
              >
                {(showDeleteModal) => (
                  <Button
                    icon={<DeleteIcon />}
                    onClick={showDeleteModal}
                    label={t('comments.comment.delete.label')}
                    dataTestid="comment-delete"
                    danger
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
                  <Button
                    icon={<JodBlock />}
                    onClick={showReportModal}
                    label={t('comments.comment.report.label')}
                    dataTestid="comment-report"
                  />
                )}
              </ConfirmDialog>
            )}
          </div>
        </div>
        <div className="flex justify-end pt-3">{isOwnComment && <PatternAvatar seed={author} size={32} />}</div>
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
