import { Button, Spinner, Textarea } from '@jod/design-system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PatternAvatar from '../PatternAvatar/PatternAvatar';
import { LIMITS } from './constants';

interface CommentInputProps {
  userId: string; // The ID of the user who is adding the comment
  addComment: (comment: string) => void; // Function to handle adding a comment
  addingComment: boolean; // State to indicate if a comment is being added
}

export const CommentInput = ({ userId, addComment, addingComment }: CommentInputProps) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [currentComment, setCurrentComment] = React.useState<string>('');

  const { t } = useTranslation();

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.overflow = 'hidden';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentComment]);

  return (
    <div className="flex gap-5 pt-7 pl-6 border-t-border-gray border-t" data-testid="comment-input">
      <div>
        <PatternAvatar seed={userId} size={32} />
      </div>
      {addingComment ? (
        <div className="grow flex justify-center" data-testid="comment-input-loading">
          <Spinner size={16} color="accent" />
        </div>
      ) : (
        <div className="flex grow">
          <Textarea
            className="mr-3"
            placeholder={t('comments.comment.placeholder')}
            maxLength={LIMITS.COMMENT_MAX_LENGTH}
            hideLabel
            rows={1}
            ref={textareaRef}
            onChange={(e) => {
              setCurrentComment(e.target.value);
            }}
            value={currentComment}
            data-testid="comment-input-textarea"
            ariaLabel={t('comments.comment.placeholder')}
          />

          <Button
            label={t('comments.comment.send')}
            variant="accent"
            serviceVariant="ohjaaja"
            disabled={currentComment.trim().length < 1}
            className="self-center mb-2"
            size="sm"
            onClick={() => {
              const comment = textareaRef.current?.value;
              if (comment) {
                addComment(comment);
                setCurrentComment('');
              }
            }}
            data-testid="comment-input-send"
          />
        </div>
      )}
    </div>
  );
};
