import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Comment from './Comment';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('Comment', () => {
  const mockProps = {
    commentId: '123',
    author: 'Test Author',
    comment: 'Test comment content',
    timestamp: '2023-01-01T12:00:00',
    isOwnComment: false,
    deleteComment: vi.fn(),
    reportComment: vi.fn(),
  };

  it('renders comment with correct content', () => {
    render(<Comment {...mockProps} />);
    expect(screen.getByText('Test comment content')).toBeInTheDocument();
    expect(screen.getByText('01.01.2023 12:00')).toBeInTheDocument();
  });

  it('shows delete button for own comments', () => {
    render(<Comment {...mockProps} isOwnComment={true} />);
    expect(screen.getByText('01.01.2023 12:00 | comments.comment.own')).toBeInTheDocument();
    expect(screen.getByLabelText('comments.comment.delete.label')).toBeInTheDocument();
  });

  it('does not show delete button for others comments', () => {
    render(<Comment {...mockProps} isOwnComment={false} />);
    expect(screen.queryByLabelText('comments.comment.delete.label')).not.toBeInTheDocument();
  });

  it('calls deleteComment when delete is confirmed', async () => {
    const user = userEvent.setup();
    render(<Comment {...mockProps} isOwnComment={true} />);

    await user.click(screen.getByLabelText('comments.comment.delete.label'));
    await user.click(screen.getByText('comments.comment.delete.confirmText'));

    expect(mockProps.deleteComment).toHaveBeenCalledWith('123');
  });

  it('preserves whitespace in comment text', () => {
    const multilineComment = 'First line\nSecond line\nThird line';
    render(<Comment {...mockProps} comment={multilineComment} />);
    const commentElement = screen.getByText((_, element) => {
      return element?.textContent === multilineComment;
    });
    expect(commentElement).toHaveClass('whitespace-pre-line');
  });
});
