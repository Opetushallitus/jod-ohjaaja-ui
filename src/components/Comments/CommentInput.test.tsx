import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentInput } from './CommentInput';

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('CommentInput', () => {
  const mockProps = {
    userId: 'test-user-id',
    addComment: vi.fn(),
    addingComment: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders textarea and send button when not adding comment', () => {
    render(<CommentInput {...mockProps} />);
    expect(screen.getByPlaceholderText('comments.comment.placeholder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'comments.comment.send' })).toBeInTheDocument();
  });

  it('shows spinner when adding comment', () => {
    render(<CommentInput {...mockProps} addingComment={true} />);
    expect(screen.queryByPlaceholderText('comments.comment.placeholder')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('disables send button when textarea is empty', () => {
    render(<CommentInput {...mockProps} />);
    const button = screen.getByRole('button', { name: 'comments.comment.send' });
    expect(button).toBeDisabled();
  });

  it('enables send button when textarea has content', () => {
    render(<CommentInput {...mockProps} />);
    const textarea = screen.getByPlaceholderText('comments.comment.placeholder');
    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    const button = screen.getByRole('button', { name: 'comments.comment.send' });
    expect(button).toBeEnabled();
  });

  it('calls addComment with textarea value when send button clicked', async () => {
    render(<CommentInput {...mockProps} />);
    const textarea = screen.getByPlaceholderText('comments.comment.placeholder');
    const button = screen.getByRole('button', { name: 'comments.comment.send' });

    fireEvent.change(textarea, { target: { value: 'Test comment' } });
    fireEvent.click(button);

    expect(mockProps.addComment).toHaveBeenCalledWith('Test comment');
    expect(textarea).toHaveValue('');
  });
});
